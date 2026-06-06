// 1. IMPORTAZIONI CORE
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./firebase'); 

// 2. SETUP SERVER WEB (Leggero e senza errori)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌍 [Scorpion OS] Server web attivo sulla porta ${PORT}`);
});

// 3. SETUP CLIENT DISCORD
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const PREFIX = '!';
client.commands = new Collection();

// 4. CARICAMENTO COMANDI
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);
    for (const folder of commandFolders) {
        const folderPath = path.join(foldersPath, folder);
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(path.join(folderPath, file));
                if (command.name) client.commands.set(command.name, command);
            }
        }
    }
}

// 5. EVENTI
client.on('guildCreate', async guild => {
    const LOG_CHANNEL_ID = '1512148848280080564';
    const channel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (channel) {
        const embed = new EmbedBuilder()
            .setTitle('🚀 Nuovo Server Scorpion OS')
            .setColor('#f1c40f')
            .addFields(
                { name: '📛 Nome', value: guild.name, inline: true },
                { name: '🆔 ID', value: guild.id, inline: true }
            );
        await channel.send({ embeds: [embed] });
    }
});

// 6. GESTIONE INTERAZIONI (Modali Premium)
client.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit()) {
        const userId = interaction.fields.getTextInputValue('user_id_input');
        // ... logica database ...
        await interaction.reply({ content: `✅ Operazione completata per <@${userId}>`, ephemeral: true });
    }
});

// 7. GESTIONE COMANDI
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);
    if (command) {
        try { await command.execute(message, args, db); } catch (err) { console.error(err); }
    }
});

client.login(process.env.DISCORD_TOKEN);
// Esempio: Modifica stato moduli
app.post('/api/settings/toggle', (req, res) => {
    const { module, status } = req.body;
    // Logica per salvare in Firebase o in memoria che il modulo X è ON/OFF
    // Esempio: db.collection('settings').doc('bot').update({ [module]: status });
    res.json({ success: true, message: `Modulo ${module} impostato su ${status}` });
});
// Rotta protetta per la dashboard
app.get('/dashboard', (req, res) => {
    // 1. Recupera l'ID dell'utente che sta tentando di accedere
    // NOTA: Assicurati che quando l'utente fa il login, tu passi il suo ID in qualche modo, 
    // qui assumiamo che arrivi tramite un parametro (es. ?uid=...)
    const userAttemptingAccess = req.query.uid; 

    // 2. Confronto diretto con la variabile CREATORE_ID di Render
    const adminId = process.env.CREATORE_ID;

    if (userAttemptingAccess && userAttemptingAccess === adminId) {
        // Accesso consentito
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        // Accesso negato
        res.status(403).send(`
            <body style="background:black; color:#ca8a04; font-family:sans-serif; text-align:center; padding-top:50px;">
                <h1>❌ ACCESSO NEGATO</h1>
                <p>Solo il Creatore (${adminId}) può accedere a questo pannello.</p>
            </body>
        `);
    }
});
