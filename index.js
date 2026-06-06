const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware per file statici
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTTE WEB ---

// 1. Home Page (Login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Callback Discord (Riceve il codice, controlla l'identità)
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Errore: Nessun codice ricevuto.");

    // NOTA: Qui dovresti usare una libreria come 'axios' per scambiare il code con l'ID utente.
    // Per ora, simuliamo il passaggio dell'ID che riceveresti dalle API di Discord:
    const discordUserId = "INSERISCI_QUI_IL_TUO_ID_REALE"; 

    if (discordUserId === process.env.CREATORE_ID) {
        res.redirect('/dashboard?uid=' + discordUserId);
    } else {
        res.status(403).send("<h1>❌ ACCESSO NEGATO: Non sei il creatore.</h1>");
    }
});

// 3. Dashboard Protetta
app.get('/dashboard', (req, res) => {
    const userUid = req.query.uid;
    if (userUid && userUid === process.env.CREATORE_ID) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.status(403).send("<h1>❌ ACCESSO NEGATO: Autenticazione fallita.</h1>");
    }
});

// Avvio Server Web
app.listen(PORT, () => {
    console.log(`🌍 [Scorpion OS] Server Web online sulla porta ${PORT}`);
});

// --- CLIENT DISCORD ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// Evento Ready
client.once('ready', () => {
    console.log(`🤖 [Scorpion OS] Bot connesso come ${client.user.tag}`);
});

// Login del Bot
client.login(process.env.DISCORD_TOKEN);
