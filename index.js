// Aggiungi questo in cima al tuo index.js
const http = require('http');
http.createServer((req, res) => {
    res.write("Il bot e' online!");
    res.end();
}).listen(process.env.PORT || 3000);

// ... il resto del tuo codice (client.login, ecc.)

require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { inviaSchermo } = require('./utils/viewManager');
const { haDocumento, isPremium, getPin, setPin } = require('./dbManager');

// Inizializzazione client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Mappa per gestire gli stati dei PIN in memoria
const statiUtenti = new Map();

client.on('ready', () => {
    console.log(`Bot avviato come ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    // 1. GESTIONE COMANDI (Slash Commands)
    if (interaction.isChatInputCommand()) {
        // Assicurati di caricare i comandi correttamente
        if (interaction.commandName === 'telefono') {
            const { execute } = require('./commands/telefono');
            await execute(interaction);
        }
    }

    // 2. GESTIONE BOTTONI (Tastierino PIN)
    if (interaction.isButton() && interaction.customId.startsWith('btn_')) {
        const userId = interaction.user.id;
        let stato = statiUtenti.get(userId) || { fase: 'verifica', buffer: "" };
        const azione = interaction.customId.split('_')[1];

        if (azione === 'invia') {
            const pinSalvato = await getPin(interaction.guild.id, userId);
            if (stato.buffer === pinSalvato) {
                const premium = await isPremium(interaction.guild.id, userId);
                statiUtenti.delete(userId); // Pulizia memoria
                return await inviaSchermo(interaction, 'home', premium);
            }
            return interaction.reply({ content: "❌ PIN Errato!", ephemeral: true });
        } else if (azione === 'canc') {
            stato.buffer = stato.buffer.slice(0, -1);
        } else {
            if (stato.buffer.length < 4) stato.buffer += azione;
        }

        statiUtenti.set(userId, stato);
        return interaction.update({ content: `Inserimento: ${"*".repeat(stato.buffer.length)}` });
    }

    // 3. GESTIONE MENU APP
    if (interaction.isStringSelectMenu()) {
        const scelta = interaction.values[0];
        const premiumApps = ['insta', 'casino'];

        if (premiumApps.includes(scelta)) {
            const premium = await isPremium(interaction.guild.id, interaction.user.id);
            if (!premium) {
                return interaction.reply({ content: "🚫 **Accesso Negato:** Questa app è riservata ai membri Premium!", ephemeral: true });
            }
        }
        return interaction.reply({ content: `📱 Hai aperto: **${scelta.toUpperCase()}**`, ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
