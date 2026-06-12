require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const http = require('http');

// Mantiene il servizio Live su Render
http.createServer((req, res) => res.end("Bot Online")).listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 1. DEFINIZIONE DEI COMANDI
const commands = [
    {
        name: 'telefono',
        description: 'Avvia il telefono',
    },
];

// 2. REGISTRAZIONE DEI COMANDI (Eseguita all'avvio)
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
    try {
        console.log('🔄 Registrazione comandi in corso...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // CLIENT_ID richiesto nelle variabili Render
            { body: commands },
        );
        console.log('✅ Comandi registrati con successo!');
    } catch (error) {
        console.error('❌ Errore registrazione:', error);
    }
}

// 3. LOGICA BOT
client.once('ready', async () => {
    console.log(`🚀 Bot avviato: ${client.user.tag}`);
    await registerCommands(); // Registra i comandi appena il bot è pronto
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'telefono') {
        // Importazione dinamica per evitare cicli di dipendenza
        const { execute } = require('./commands/telefono');
        await execute(interaction);
    }
});

client.login(process.env.DISCORD_TOKEN);
