require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http'); // Serve per non far andare in timeout il servizio su Render

// Crea un server HTTP di base per tenere il bot "vivo"
http.createServer((req, res) => {
    res.write("Bot ScorpionPhone online!");
    res.end();
}).listen(process.env.PORT || 3000);

const { inviaSchermo } = require('./utils/viewManager');
const { haDocumento, isPremium, getPin, setPin } = require('./dbManager');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const statiUtenti = new Map();

client.once('ready', () => {
    console.log(`Bot avviato correttamente come ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    // Gestione Slash Commands
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'telefono') {
            const { execute } = require('./commands/telefono');
            await execute(interaction);
        }
    }

    // Gestione Bottoni
    if (interaction.isButton() && interaction.customId.startsWith('btn_')) {
        const userId = interaction.user.id;
        let stato = statiUtenti.get(userId) || { buffer: "" };
        const azione = interaction.customId.split('_')[1];

        if (azione === 'invia') {
            const pinSalvato = await getPin(interaction.guild.id, userId);
            if (stato.buffer === pinSalvato) {
                const premium = await isPremium(interaction.guild.id, userId);
                statiUtenti.delete(userId);
                return await inviaSchermo(interaction, 'home', premium);
            }
            return interaction.reply({ content: "❌ PIN Errato!", ephemeral: true });
        } else if (azione === 'canc') {
            stato.buffer = stato.buffer.slice(0, -1);
        } else if (stato.buffer.length < 4) {
            stato.buffer += azione;
        }

        statiUtenti.set(userId, stato);
        await interaction.update({ content: `Inserimento: ${"*".repeat(stato.buffer.length)}` }).catch(e => {});
    }

    // Gestione Menu
    if (interaction.isStringSelectMenu()) {
        const scelta = interaction.values[0];
        const premium = await isPremium(interaction.guild.id, interaction.user.id);
        
        if (['insta', 'casino'].includes(scelta) && !premium) {
            return interaction.reply({ content: "🚫 Accesso Negato: Richiesto Premium!", ephemeral: true });
        }
        await interaction.reply({ content: `📱 App ${scelta} in apertura...`, ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
