// 1. DISINNESCO TIMEOUT DI RENDER
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('⚡ Scorpion OS Core Online!'));
app.listen(port, () => console.log(`🌍 [Scorpion OS] Server web attivo sulla porta ${port}`));

// 2. IMPORTAZIONI CORE
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./firebase'); 
// --- CONTROLLO INVITO (Entrata nel server) ---
client.on('guildCreate', async guild => {
    // Se sei TU a invitare il bot (SCORPION_ID), il bot entra ovunque ignorando i limiti
    if (guild.ownerId === SCORPION_ID || client.users.cache.get(SCORPION_ID)?.id === SCORPION_ID) {
        console.log(`👑 [Scorpion OS] Entrato nel server ${guild.name} grazie al bypass del creatore.`);
        return;
    }

    // Controllo membri per i server "comuni"
    if (guild.memberCount < 30) {
        console.log(`🚫 [Scorpion OS] Uscita forzata dal server ${guild.name} (Membri: ${guild.memberCount})`);
        
        // Manda un messaggio nel canale principale se possibile
        const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
        if (channel) {
            await channel.send("🚫 **Scorpion OS**: Questo server non soddisfa il requisito minimo di **30 membri**. Il bot uscirà automaticamente.").catch(() => {});
        }

        // Il bot esce dal server
        await guild.leave();
    } else {
        console.log(`✅ [Scorpion OS] Entrato nel server ${guild.name} (Membri: ${guild.memberCount})`);
    }
});

// 3. SETUP CLIENT
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const PREFIX = '!';
const SCORPION_ID = process.env.CREATOR_ID;

client.commands = new Collection();
client.premiumCache = new Set();

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
                if (command.name && command.execute) client.commands.set(command.name, command);
            }
        }
    }
}

// 5. FUNZIONE CONTROLLO REQUISITI E BLACKLIST
async function checkServerRequirements(messageOrInteraction) {
    if (!messageOrInteraction.guild) return true;
    
    // Controllo Blacklist
    const snap = await db.collection('blacklist').doc(messageOrInteraction.guild.id).get();
    if (snap.exists && snap.data().banned) return false;

    // Controllo Membri
    if (messageOrInteraction.guild.memberCount < 30) {
        const embed = new EmbedBuilder().setTitle('🚫 Requisito Minimo').setDescription('Servono almeno 30 membri per usare Scorpion OS.').setColor('#e67e22');
        if (messageOrInteraction.reply) messageOrInteraction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
        return false;
    }
    return true;
}

// 6. EVENTO READY
client.once('ready', async () => {
    console.log(`🟢 [Scorpion OS] ONLINE: ${client.user.tag}`);
    const snap = await db.collection('premium_servers').where('isPremium', '==', true).get();
    snap.forEach(doc => client.premiumCache.add(doc.id));
});

// 7. GESTIONE MESSAGGI
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    if (!(await checkServerRequirements(message))) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    // Comandi supremi
    if (message.author.id === SCORPION_ID) {
        if (cmdName === 'setpremium') {
            const id = args[0] || message.guild.id;
            await db.collection('premium_servers').doc(id).set({isPremium: true}, {merge: true});
            client.premiumCache.add(id);
            return message.reply(`💎 Premium attivato per: ${id}`);
        }
        if (cmdName === 'blacklist') {
            await db.collection('blacklist').doc(args[0] || message.guild.id).set({banned: true});
            return message.reply('⛔ Server in blacklist.');
        }
    }

    const command = client.commands.get(cmdName);
    if (!command) return;

    // Controllo Premium
    if (command.premium && !client.premiumCache.has(message.guild.id)) {
        return message.reply('💎 Questo comando è Premium.');
    }

    try { await command.execute(message, args, db, client.premiumCache.has(message.guild.id)); } 
    catch (err) { console.error(err); }
});

client.login(process.env.DISCORD_TOKEN);
