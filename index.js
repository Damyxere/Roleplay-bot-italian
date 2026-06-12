require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const http = require('http');
const { haDocumento, setPin } = require('./dbManager');

// Server di mantenimento (Render)
const port = process.env.PORT || 10000;
http.createServer((req, res) => res.end('Bot Online')).listen(port);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
let inputUtenti = new Map(); // Cache per tastiera PIN

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

client.on('interactionCreate', async interaction => {
    // 1. GESTIONE BOTTONI TASTIERA PIN
    if (interaction.isButton() && interaction.customId.startsWith('btn_')) {
        let pin = inputUtenti.get(interaction.user.id) || "";
        const azione = interaction.customId.split('_')[1];

        if (azione === 'canc') {
            pin = pin.slice(0, -1);
        } else if (azione === 'invia') {
            if (pin.length === 4) {
                await setPin(interaction.guild.id, interaction.user.id, pin);
                inputUtenti.delete(interaction.user.id);
                return interaction.update({ content: "✅ PIN impostato correttamente!", components: [] });
            }
            return interaction.reply({ content: "❌ Il PIN deve essere di 4 cifre!", ephemeral: true });
        } else {
            if (pin.length < 4) pin += azione;
        }
        inputUtenti.set(interaction.user.id, pin);
        return interaction.update({ content: `📱 **Inserisci PIN:**\n\`${"*".repeat(pin.length) + "_".repeat(4 - pin.length)}\`` });
    }

    // 2. CONTROLLO DOCUMENTO (Middleware di sicurezza)
    if (interaction.isChatInputCommand()) {
        const isAdmin = interaction.member.permissions.has('Administrator');
        
        // Se non è l'admin e non è il comando di creazione, blocchiamo tutto
        if (interaction.commandName !== 'crea-documento' && !isAdmin) {
            const registrato = await haDocumento(interaction.guild.id, interaction.user.id);
            if (!registrato) {
                return interaction.reply({ 
                    content: "❌ **Accesso Negato:** Devi prima creare un documento RP con `/crea-documento` per iniziare.", 
                    ephemeral: true 
                });
            }
        }

        // 3. ESECUZIONE COMANDO
        const command = client.commands.get(interaction.commandName);
        if (command) {
            try {
                await command.execute(interaction);
            } catch (e) {
                console.error(e);
                await interaction.reply({ content: 'Errore durante l\'esecuzione.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
