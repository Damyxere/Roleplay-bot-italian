const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const path = require('node:path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// --- CLIENT DISCORD ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// --- API BACKEND (Comandi Bot) ---
app.post('/api/bot/comando', async (req, res) => {
    const { azione, target } = req.body;
    const guild = client.guilds.cache.get(process.env.GUILD_ID); // Usa l'ID del server dalle variabili

    try {
        if (azione === 'annuncio') {
            const channel = guild.channels.cache.find(c => c.type === 0); // Primo canale testo trovato
            await channel.send(`📢 **COMANDO DASHBOARD:** ${target}`);
            return res.json({ success: true });
        }
        if (azione === 'ban') {
            await guild.members.ban(target);
            return res.json({ success: true });
        }
        res.status(400).json({ error: "Azione non valida" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// --- ROTTE WEB ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/callback', (req, res) => {
    // Reindirizzamento diretto con il tuo ID protetto
    res.redirect('/dashboard?uid=' + process.env.CREATORE_ID);
});

app.get('/dashboard', (req, res) => {
    if (req.query.uid === process.env.CREATORE_ID) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.status(403).send("<h1>Accesso Negato</h1>");
    }
});

// --- AVVIO ---
client.once('ready', () => console.log(`🚀 Bot online: ${client.user.tag}`));
client.login(process.env.DISCORD_TOKEN);

app.listen(PORT, () => console.log(`🌍 Server web attivo su porta ${PORT}`));
