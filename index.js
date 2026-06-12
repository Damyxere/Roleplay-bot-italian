require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const { inviaSchermo } = require('./utils/viewManager');
const { isPremium, getPin, setPin } = require('./dbManager');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let statiUtenti = new Map(); 

client.on('interactionCreate', async interaction => {
    // 1. GESTIONE COMANDI SLASH (es. /telefono)
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) await command.execute(interaction);
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
            if (!(await isPremium(interaction.guild.id, interaction.user.id))) {
                return interaction.reply({ content: "🚫 App Premium!", ephemeral: true });
            }
        }
        // Qui carichi la logica dell'app scelta
        interaction.reply({ content: `Hai aperto: ${scelta}`, ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
