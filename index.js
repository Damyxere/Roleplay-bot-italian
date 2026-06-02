// 1. DISINNESCO PORT TIMEOUT (Keep-alive per Render Web Service)
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('⚡ Scorpion OS Online!'));
app.listen(port, () => console.log(`🌍 [Scorpion OS] Server web di keep-alive attivo sulla porta ${port}`));

// 2. IMPORTAZIONI CORE DI DISCORD E NODE
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

// 3. INIZIALIZZAZIONE CLIENT DISCORD
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const deployCommandsArray = []; 

// 4. CARICAMENTO AUTOMATICO DEI COMANDI DALLE SOTTO-CARTELLE
const foldersPath = path.join(__dirname, 'commands');

if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(foldersPath, folder);
        
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    deployCommandsArray.push(command.data.toJSON()); 
                    console.log(`📡 [Scorpion OS] Comando caricato: /${command.data.name} (Categoria: ${folder})`);
                }
            }
        }
    }
}

// 5. EVENTO: ACCENSIONE DEL BOT + AUTO DEPLOY GLOBALE INTERNO
client.once('ready', async () => {
    console.log(`🟢 [Scorpion OS] PRONTO! Autenticato come: ${client.user.tag}`);
    client.user.setActivity('Scorpion OS v2.0', { type: 3 });

    // --- AUTO DEPLOY GLOBALE DA RENDER ---
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;

    if (token && clientId) {
        try {
            console.log(`⏳ [Auto-Deploy Globale] Sincronizzazione di ${deployCommandsArray.length} comandi in corso a livello globale...`);
            const rest = new REST().setToken(token);
            
            // AGGIORNAMENTO GLOBALE (Valido per tutti i server)
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: deployCommandsArray },
            );
            console.log('✅ [Auto-Deploy Globale] Tutti i comandi Slash sono stati registrati GLOBALMENTE!');
        } catch (deployError) {
            console.error('❌ [Auto-Deploy Errore] Impossibile registrare i comandi globali:', deployError);
        }
    } else {
        console.warn('⚠️ [Auto-Deploy] Saltato: Mancano DISCORD_TOKEN o CLIENT_ID nelle impostazioni di Render.');
    }
});

// 6. GESTIONE CENTRALE DELLE INTERAZIONI
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Errore su /${interaction.commandName}:`, error);
        }
    }
});

// 7. LOGIN
const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
    console.error("❌ [ERRORE] DISCORD_TOKEN mancante!");
    process.exit(1);
}
client.login(TOKEN);
