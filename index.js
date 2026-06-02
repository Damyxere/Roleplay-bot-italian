const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('⚡ Scorpion OS Online!'));
app.listen(port, () => console.log(`🌍 [Scorpion OS] Server web di keep-alive attivo sulla porta ${port}`));

// DA QUI IN POI LASCIA IL TUO VECCHIO CODICE DI INDEX.JS
const fs = require('node:fs');
const path = require('node:path');
// ... tutto il resto del codice che avevi prima ...
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Carica le variabili locali se presenti, altrimenti usa Render

// 1. Inizializzazione del Client di Discord con i permessi (Intent) necessari
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Creiamo una collezione per memorizzare i comandi caricati
client.commands = new Collection();

// 2. SCANSIONE AUTOMATICA DELLE SOTTO-CARTELLE DEI COMANDI
const foldersPath = path.join(__dirname, 'commands');

if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(foldersPath, folder);
        
        // Verifichiamo che sia effettivamente una cartella e non un file volante
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                // Verifichiamo che il comando abbia la struttura corretta prima di caricarlo
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    console.log(`📡 [Scorpion OS] Comando caricato con successo: /${command.data.name} (da ${folder})`);
                } else {
                    console.warn(`⚠️ [ATTENZIONE] Il comando in ${filePath} non ha le proprietà "data" o "execute" richieste.`);
                }
            }
        }
    }
} else {
    console.error("❌ [ERRORE CRITICO] La cartella 'commands' non esiste nella root del progetto!");
}

// 3. EVENTO: ACCENSIONE DEL BOT
client.once('ready', () => {
    console.log(`🟢 [Scorpion OS] ONLINE! Autenticato come: ${client.user.tag}`);
    
    // Impostiamo uno status personalizzato ed elegante per il bot
    client.user.setActivity('Scorpion OS v2.0 • In ascolto', { type: 3 }); // Type 3 = Watching
});

// 4. EVENTO CENTRALE: GESTIONE DELLE INTERAZIONI (Comandi, Menu, Modal)
client.on('interactionCreate', async interaction => {
    
    // CASO A: ESECUZIONE DEI COMANDI SLASH (/)
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            return interaction.reply({ content: '❌ Questo comando non è registrato nel core dello Scorpion OS.', ephemeral: true });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Errore durante l'esecuzione di /${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Si è verificato un errore interno durante l\'elaborazione del comando.', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Si è verificato un errore interno durante l\'elaborazione del comando.', ephemeral: true });
            }
        }
    }

    // CASO B: GESTIONE DEI MENU A TENDINA (Select Menus)
    else if (interaction.isStringSelectMenu()) {
        // Qui intercettiamo le selezioni dei menu dinamici di /attivita o /database_polizia
        console.log(`🎛️ Menu cliccato: ${interaction.customId} | Valore selezionato: ${interaction.values[0]}`);
        
        // I controlli specifici per aprire i Modal verranno iniettati o gestiti qui
    }

    // CASO C: GESTIONE DEI MODAL SUBMIT (Invio dei Moduli Pop-up)
    else if (interaction.isModalSubmit()) {
        // Qui gestiamo i dati inviati dai player (es. dati immatricolazione auto, multe, patenti)
        console.log(`📩 Modal inviato: ${interaction.customId}`);
        
        // La logica di scrittura dei dati su Firebase andrà qui
    }
});

// 5. AUTENTICAZIONE FINALE TRAMITE VARIABILE D'AMBIENTE DI RENDER
const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
    console.error("❌ [ERRORE CRITICO] Il DISCORD_TOKEN non è configurato nelle variabili d'ambiente!");
    process.exit(1);
}

client.login(TOKEN);
