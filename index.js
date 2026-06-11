require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const http = require('http');
const { saveDocumento } = require('./dbManager'); 

// 1. Server HTTP per mantenere il bot attivo su Render
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Il bot e online e attivo!');
}).listen(port, () => {
    console.log(`🚀 Server di mantenimento attivo sulla porta ${port}`);
});

// 2. Setup Bot
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

// 3. Gestione Interazioni
client.on('interactionCreate', async interaction => {
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

            const successo = await saveDocumento(interaction.guild.id, interaction.user.id, docData);

            if (successo) {
                await interaction.reply({ 
                    content: `✅ Documento creato con successo! Il tuo numero ID è: **${numeroDoc}**`, 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ content: "❌ Errore durante il salvataggio su Firestore.", ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
