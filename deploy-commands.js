const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config(); // Carica le credenziali dal tuo file .env locale per il test

const commands = [];

// 1. Specifichiamo il percorso della cartella dei comandi
const foldersPath = path.join(__dirname, 'commands');

if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    // 2. Scansioniamo tutte le sotto-cartelle (comandi_generale, comandi_polizia, ecc.)
    for (const folder of commandFolders) {
        const folderPath = path.join(foldersPath, folder);
        
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                }
            }
        }
    }
} else {
    console.error("❌ [ERRORE] Impossibile eseguire il deploy: la cartella 'commands' non esiste!");
    process.exit(1);
}

// 3. Prepariamo il client REST per inviare i comandi alle API di Discord
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
    console.warn("⚠️ [ATTENZIONE] Mancano i dati nel file .env locale (DISCORD_TOKEN, CLIENT_ID o GUILD_ID).");
    console.warn("Se stai eseguendo questo script localmente per i test, assicurati di aver creato il file .env sul tuo PC.");
}

const rest = new REST().setToken(token);

// 4. Lanciamo la sincronizzazione immediata sul server di test
(async () => {
    try {
        console.log(`⏳ [Scorpion OS] Inizializzazione sincronizzazione di ${commands.length} comandi Slash...`);

        // Routes.applicationGuildCommands aggiorna i comandi INSTANTANEAMENTE sul server specificato
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`✅ [Scorpion OS] Successo! ${data.length} comandi registrati e pronti sul server di test.`);
    } catch (error) {
        console.error("❌ Errore durante il deploy dei comandi:");
        console.error(error);
    }
})();
