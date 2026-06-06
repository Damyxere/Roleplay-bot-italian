const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// --- ROTTE WEB ---

// 1. Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Callback (Sbloccato per il Creatore)
app.get('/callback', async (req, res) => {
    // Forziamo il riconoscimento dell'utente come il CREATORE_ID configurato su Render
    const myId = process.env.CREATORE_ID;
    
    // Redirect diretto alla dashboard con il tuo ID validato
    res.redirect('/dashboard?uid=' + myId);
});

// 3. Dashboard (Accessibile solo se l'ID nel link è uguale al CREATORE_ID)
app.get('/dashboard', (req, res) => {
    const userUid = req.query.uid;
    
    if (userUid && userUid === process.env.CREATORE_ID) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.status(403).send("<h1>❌ ACCESSO NEGATO: Solo il creatore può accedere.</h1>");
    }
});

app.listen(PORT, () => {
    console.log(`🌍 [Scorpion OS] Server Web online sulla porta ${PORT}`);
});

// --- CLIENT DISCORD ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

client.login(process.env.DISCORD_TOKEN);
