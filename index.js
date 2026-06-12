require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const http = require('http');
const { setPin } = require('./dbManager');

// 1. Server HTTP per mantenere attivo il bot su Render
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot online!');
}).listen(port, () => console.log(`🚀 Server di mantenimento attivo sulla porta ${port}`));

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

client.commands = new Collection();

// Caricamento comandi
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
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
        console.error("❌ Errore durante la registrazione comandi:", error);
    }
});

// 3. Gestione interazioni (Slash Commands, Bottoni e Modal)
client.on('interactionCreate', async interaction => {
    
    // Gestione Pulsante "Crea PIN"
    if (interaction.isButton() && interaction.customId === 'setup_pin') {
        const modal = new ModalBuilder()
            .setCustomId('modal_pin')
            .setTitle('Crea il tuo PIN');
        
        const input = new TextInputBuilder()
            .setCustomId('pin_val')
            .setLabel('Inserisci 4 cifre')
            .setStyle(TextInputStyle.Short)
            .setMinLength(4)
            .setMaxLength(4)
            .setRequired(true);
            
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return await interaction.showModal(modal);
    }

    // Gestione Invio PIN dal Modal
    if (interaction.isModalSubmit() && interaction.customId === 'modal_pin') {
        const pin = interaction.fields.getTextInputValue('pin_val');
        await setPin(interaction.guild.id, interaction.user.id, pin);
        return await interaction.reply({ content: "✅ PIN creato! Ora puoi usare il telefono.", ephemeral: true });
    }

    // Gestione Slash Commands
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (e) {
        console.error("❌ Errore durante l'esecuzione del comando:", e);
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: '❌ Errore durante l\'esecuzione.' });
        } else {
            await interaction.reply({ content: '❌ Errore durante l\'esecuzione.', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
