require('dotenv').config(); // Carica le variabili d'ambiente
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const { db } = require('./firebase'); // Importa il database dal tuo file firebase.js

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

// Caricamento comandi (scansiona la cartella commands)
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`🚀 Bot online come ${client.user.tag}!`);
});

// Gestione Comandi Slash
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Errore nell\'esecuzione del comando.', ephemeral: true });
        }
    } 
    
    // Gestione Invio Form (Modal)
    else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_crea_documento') {
            const numeroDoc = 'DOC-' + Math.floor(1000 + Math.random() * 9000);
            
            const docData = {
                nome: interaction.fields.getTextInputValue('nome'),
                cognome: interaction.fields.getTextInputValue('cognome'),
                data: interaction.fields.getTextInputValue('data'),
                altezza: interaction.fields.getTextInputValue('altezza'),
                peso: interaction.fields.getTextInputValue('peso'),
                capelli: interaction.fields.getTextInputValue('capelli'),
                occhi: interaction.fields.getTextInputValue('occhi'),
                tatuaggi: interaction.fields.getTextInputValue('tatuaggi'),
                numero_doc: numeroDoc,
                creato_il: new Date().toLocaleDateString()
            };

            // Salvataggio nel database sotto il server specifico
            await db.ref(`server/${interaction.guild.id}/utenti/${interaction.user.id}/documento`).set(docData);

            await interaction.reply({ 
                content: `✅ Documento creato con successo! Il tuo numero ID è: **${numeroDoc}**`, 
                ephemeral: true 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
