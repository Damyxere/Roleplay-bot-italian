require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const http = require('http');
const { saveDocumento } = require('./dbManager');

// 1. Server per mantenere attivo il bot su Render
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot online!');
}).listen(port, () => console.log(`🚀 Server di mantenimento attivo sulla porta ${port}`));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

// Caricamento comandi
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    commands.push(command.data.toJSON());
}

// 2. Registrazione comandi all'avvio
client.once('ready', async () => {
    console.log(`🚀 Bot online come ${client.user.tag}!`);
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('✅ Comandi registrati globalmente!');
    } catch (error) {
        console.error(error);
    }
});

// 3. Gestione interazioni
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: '❌ Errore.', ephemeral: true });
        }
    } 
    else if (interaction.isModalSubmit() && interaction.customId === 'modal_crea_documento') {
        const docData = {
            nome: interaction.fields.getTextInputValue('nome'),
            cognome: interaction.fields.getTextInputValue('cognome'),
            data: interaction.fields.getTextInputValue('data'),
            altezza: interaction.fields.getTextInputValue('altezza'),
            peso: interaction.fields.getTextInputValue('peso'),
            capelli: interaction.fields.getTextInputValue('capelli'),
            occhi: interaction.fields.getTextInputValue('occhi'),
            tatuaggi: interaction.fields.getTextInputValue('tatuaggi'),
            numero_doc: 'DOC-' + Math.floor(1000 + Math.random() * 9000),
            creato_il: new Date().toLocaleDateString()
        };

        const successo = await saveDocumento(interaction.guild.id, interaction.user.id, docData);
        await interaction.reply({ 
            content: successo ? `✅ Documento creato! ID: **${docData.numero_doc}**` : "❌ Errore DB.", 
            ephemeral: true 
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
