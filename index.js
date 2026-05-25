const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http'); // Modulo nativo per sbloccare la porta di Render
const db = require('./firebase'); // Connessione nativa a Firebase

// Inizializzazione del Client Discord con i permessi corretti
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Collection();

// 📂 CARICAMENTO AUTOMATICO DEI COMANDI SLASH DALLA CARTELLA 'COMMANDS'
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commandsJSON = [];
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsJSON.push(command.data.toJSON());
    }
}

// 🟢 EVENTO: BOT ONLINE E REGISTRAZIONE COMANDI SU DISCORD
client.once('ready', async () => {
    console.log(`🤖 Scorpion OS Online! Autenticato come: ${client.user.tag}`);
    
    // Recupera il Token sicuro impostato nella sezione Environment di Render
    const TOKEN = process.env.TOKEN; 
    if (!TOKEN) {
        console.error("❌ ERRORE CRITICO: Variabile 'TOKEN' non trovata su Render!");
        return;
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log('🔄 Sincronizzazione dei comandi dell\'applicazione in corso...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commandsJSON },
        );
        console.log('✅ Tutti i comandi Slash sono stati mappati e registrati globalmente!');
    } catch (error) {
        console.error('❌ Errore durante il caricamento dei comandi Slash:', error);
    }
});

// ⚡ INTERCETTORE LOGICO DELLE INTERAZIONI (Comandi, Bottoni e Pop-up)
client.on('interactionCreate', async (interaction) => {
    
    // 1. GESTIONE ESECUZIONE COMANDI SLASH
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errMsg = { content: '❌ Si è verificato un errore interno durante l\'elaborazione del comando.', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errMsg);
            } else {
                await interaction.reply(errMsg);
            }
        }
    }

    // 2. GESTIONE PRESSIONE BOTTONI DEL PANNELLO STAFF (/panel)
    if (interaction.isButton()) {
        const guildId = interaction.guild.id;

        // Cliccando sul Bottone "Modifica Denaro"
        if (interaction.customId === 'staff_modifica_soldi') {
            const modal = new ModalBuilder()
                .setCustomId('modal_staff_portafoglio')
                .setTitle('💸 Modifica Bilancio Economico');

            const targetInput = new TextInputBuilder()
                .setCustomId('target_id')
                .setLabel('ID DISCORD DEL GIOCATORE')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Incolla l\'ID utente del cittadino')
                .setRequired(true);

            const tipoInput = new TextInputBuilder()
                .setCustomId('tipo_conto')
                .setLabel('BANCA O CONTANTI?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Scrivi: banca oppure contanti')
                .setRequired(true);

            const ammontareInput = new TextInputBuilder()
                .setCustomId('quantita')
                .setLabel('QUANTITÀ (Usa il meno - per togliere)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Es: 25000 o -5000')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(targetInput),
                new ActionRowBuilder().addComponents(tipoInput),
                new ActionRowBuilder().addComponents(ammontareInput)
            );

            await interaction.showModal(modal);
        }
    }

    // 3. ELABORAZIONE DATI INVIATI DAI MODAL POP-UP
    if (interaction.isModalSubmit()) {
        
        if (interaction.customId === 'modal_staff_portafoglio') {
            const guildId = interaction.guild.id;
            const targetId = interaction.fields.getTextInputValue('target_id').trim();
            const tipoConto = interaction.fields.getTextInputValue('tipo_conto').toLowerCase().trim();
            const quantita = parseInt(interaction.fields.getTextInputValue('quantita').trim());

            await interaction.deferReply({ ephemeral: true });

            // Controlli di integrità sui dati inseriti dallo staffer
            if (isNaN(quantita)) {
                return interaction.editReply({ content: '❌ Valore inserito errato: la quantità deve essere un numero intero.' });
            }
            if (tipoConto !== 'banca' && tipoConto !== 'contanti') {
                return interaction.editReply({ content: '❌ Campo errato: devi digitare esattamente `banca` o `contanti`.' });
            }

            try {
                // Lettura dei dati della città su Firebase
                const serverDoc = await db.collection('servers').doc(guildId).get();
                const valuta = serverDoc.exists ? serverDoc.data().impostazioni.valuta_locale : '₳';

                // Riferimento al profilo del cittadino su Firebase
                const cittadinoRef = db.collection('servers').doc(guildId).collection('cittadini').doc(targetId);
                const doc = await cittadinoRef.get();

                if (!doc.exists) {
                    return interaction.editReply({ content: `❌ Il cittadino con ID \`${targetId}\` non è registrato o non esiste in questo server.` });
                }

                const datiAttuali = doc.data();
                let vecchioSaldo = datiAttuali[tipoConto] || 0;
                let nuovoSaldo = vecchioSaldo + quantita;
                if (nuovoSaldo < 0) nuovoSaldo = 0; // Impedisce i conti in rosso sotto zero nel DB

                // Aggiornamento effettivo dei valori su Firebase
                await cittadinoRef.update({
                    [tipoConto]: nuovoSaldo
                });

                // Embed di tracciamento dell'azione eseguita (Audit Log)
                const logEmbed = new EmbedBuilder()
                    .setTitle('⚖️ REGISTRO AUDIT: ACCOUNT MODIFICATO')
                    .setColor('#00ff66')
                    .addFields(
                        { name: '👑 Operatore Staff', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '👤 Cittadino', value: `<@${targetId}>`, inline: true },
                        { name: '🗂️ Tipo Conto', value: `\`${tipoConto.toUpperCase()}\``, inline: true },
                        { name: '📉 Flusso Finanziario', value: `\`${quantita > 0 ? '+' : ''}${quantita.toLocaleString('it-IT')} ${valuta}\``, inline: true },
                        { name: '💰 Nuovo Saldo', value: `**${nuovoSaldo.toLocaleString('it-IT')} ${valuta}**`, inline: true }
                    )
                    .setFooter({ text: 'Scorpion OS • Modifiche Dirette Database' });

                await interaction.editReply({ embeds: [logEmbed] });

            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: '❌ Errore di connessione a Firebase durante la sovrascrittura.' });
            }
        }
    }
});

// 📡 APERTURA PORTA WEB FINTA PER ENGAGEMENT DI RENDER (Previene il Port Scan Timeout)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Scorpion OS Engine — Online & Running\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`📡 Ping Web Server attivo sulla porta di Render: ${PORT}`);
});

// ACCENSIONE IN SICUREZZA
client.login(process.env.TOKEN);
