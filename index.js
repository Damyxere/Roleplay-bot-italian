const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();
require('dotenv').config();

// Gestore API Premium
app.post('/api/premium', async (req, res) => {
    const { type, id } = req.body;
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    
    // Logica di comando avanzata
    try {
        switch(type) {
            case 'ban':
                await guild.members.ban(id, { reason: 'Dashboard Premium Command' });
                logToSystem(`User ${id} bannato da Web Panel`);
                break;
            case 'kick':
                await guild.members.kick(id);
                break;
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Funzione logger interna
function logToSystem(msg) {
    console.log(`[PREMIUM-LOG] ${new Date().toISOString()}: ${msg}`);
}

// Inizializzazione Bot con tutti gli intenti necessari per la gestione
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages]
});

client.login(process.env.DISCORD_TOKEN);
app.listen(process.env.PORT || 3000);
