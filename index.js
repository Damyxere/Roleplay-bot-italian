require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const http = require('http');
const { setPin } = require('./dbManager');

// Server per mantenere attivo il bot su Render
const port = process.env.PORT || 10000;
http.createServer((req, res) => res.end('Bot Online')).listen(port);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Cache temporanea per gli input dei PIN
let inputUtenti = new Map();

// Caricamento comandi
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.once('ready', async () => {
    console.log(`🚀 Bot online: ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
});

// Gestione Interazioni (Bottoni e Comandi)
client.on('interactionCreate', async interaction => {
    
    // 1. GESTIONE TASTIERA NUMERICA (BOTTONI)
    if (interaction.isButton() && interaction.customId.startsWith('btn_')) {
        let pin = inputUtenti.get(interaction.user.id) || "";
        const azione = interaction.customId.split('_')[1];

        if (azione === 'canc') {
            pin = pin.slice(0, -1);
        } else if (azione === 'invia') {
            if (pin.length === 4) {
                await setPin(interaction.guild.id, interaction.user.id, pin);
                inputUtenti.delete(interaction.user.id);
                return interaction.update({ content: "✅ PIN impostato con successo!", components: [] });
            } else {
                return interaction.reply({ content: "❌ Il PIN deve essere di 4 cifre!", ephemeral: true });
            }
        } else {
            if (pin.length < 4) pin += azione;
        }

        inputUtenti.set(interaction.user.id, pin);
        return interaction.update({ 
            content: `📱 **Inserisci PIN:**\n\`${"*".repeat(pin.length) + "_".repeat(4 - pin.length)}\`` 
        });
    }

    // 2. GESTIONE SLASH COMMANDS
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction);
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: 'Errore esecuzione comando.', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
