require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const { saveDocumento } = require('./dbManager'); // Importa il manager per il DB

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();

// Caricamento comandi
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`🚀 Bot online e connesso a Firestore!`);
});

client.on('interactionCreate', async interaction => {
    // Gestione Slash Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Errore interno.', ephemeral: true });
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

            // Utilizziamo il manager per salvare su Firestore
            const successo = await saveDocumento(interaction.guild.id, interaction.user.id, docData);

            if (successo) {
                await interaction.reply({ 
                    content: `✅ Documento creato con successo! Il tuo numero ID è: **${numeroDoc}**`, 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ content: "❌ Errore durante il salvataggio nel database.", ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
