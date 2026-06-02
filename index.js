// 1. DISINNESCO PORT TIMEOUT (Keep-alive per Render Web Service)
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('⚡ Scorpion OS Online!'));
app.listen(port, () => console.log(`🌍 [Scorpion OS] Server web di keep-alive attivo sulla porta ${port}`));

// 2. IMPORTAZIONI CORE DI DISCORD E NODE
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
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

// Collezione centrale per memorizzare i comandi
client.commands = new Collection();

// 4. CARICAMENTO AUTOMATICO DEI COMANDI DALLE SOTTO-CARTELLE
const foldersPath = path.join(__dirname, 'commands');

if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(foldersPath, folder);
        
        // Controlla che sia effettivamente una cartella
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    console.log(`📡 [Scorpion OS] Comando caricato: /${command.data.name} (Categoria: ${folder})`);
                } else {
                    console.warn(`⚠️ [ATTENZIONE] Il file ${file} in ${folder} non ha la struttura corretta.`);
                }
            }
        }
    }
} else {
    console.error("❌ [ERRORE] La cartella 'commands' non esiste nella root!");
}

// 5. EVENTO: ACCENSIONE DEL BOT
client.once('ready', () => {
    console.log(`🟢 [Scorpion OS] PRONTO! Autenticato come: ${client.user.tag}`);
    client.user.setActivity('Scorpion OS v2.0', { type: 3 }); // In ascolto
});

// 6. GESTIONE CENTRALE DELLE INTERAZIONI (Comandi, Menu, Modal)
client.on('interactionCreate', async interaction => {
    
    // GESTIONE COMANDI SLASH (/)
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            return interaction.reply({ content: '❌ Comando non trovato.', ephemeral: true });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Errore su /${interaction.commandName}:`, error);
            const errorMessage = { content: '❌ Si è verificato un errore durante l\'esecuzione.', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }

    // GESTIONE MENU A TENDINA (Select Menus)
    else if (interaction.isStringSelectMenu()) {
        console.log(`🎛️ Menu cliccato: ${interaction.customId} | Scelta: ${interaction.values[0]}`);
        // Logica smistamento menu per concessionario/polizia
    }

    // GESTIONE MODAL SUBMIT (Invio moduli pop-up)
    else if (interaction.isModalSubmit()) {
        console.log(`📩 Modal ricevuto: ${interaction.customId}`);
        // Logica scrittura dati ricevuti su Firebase
    }
});

// 7. LOGIN SICURO CON CONTROLLO VARIABILE
const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
    console.error("❌ [ERRORE] DISCORD_TOKEN mancante nelle variabili d'ambiente di Render!");
    process.exit(1);
}

client.login(TOKEN);
