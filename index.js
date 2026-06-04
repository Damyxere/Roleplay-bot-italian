// 1. DISINNESCO TIMEOUT RENDER
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('⚡ Scorpion OS Core Online!'));
app.listen(port, () => console.log(`🌍 [Scorpion OS] Server web attivo sulla porta ${port}`));

// 2. IMPORTAZIONI CORE
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./firebase'); 

// 3. SETUP CLIENT
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const PREFIX = '!';
const SCORPION_ID = process.env.CREATOR_ID;
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

// 5. FUNZIONE REQUISITI (Blacklist + 30 Membri)
async function checkRequirements(messageOrInteraction) {
    if (!messageOrInteraction.guild) return true;
    const snap = await db.collection('blacklist').doc(messageOrInteraction.guild.id).get();
    if (snap.exists && snap.data().banned) return false;
    if (messageOrInteraction.guild.memberCount < 30) {
        if (messageOrInteraction.reply) messageOrInteraction.reply({ content: '🚫 Requisito minimo: 30 membri richiesti.', ephemeral: true }).catch(() => {});
        return false;
    }
    return true;
}

// 6. GESTIONE INTERAZIONI (Pannello Admin + Modali)
client.on('interactionCreate', async interaction => {
    // Menu Admin
    if (interaction.isStringSelectMenu() && interaction.customId === 'admin_premium_menu') {
        const azione = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${azione}`).setTitle(azione.toUpperCase());
        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('user_id_input').setLabel('Inserisci ID Utente').setStyle(TextInputStyle.Short).setRequired(true)));
        await interaction.showModal(modal);
    }
    // Invio Modale
    if (interaction.isModalSubmit()) {
        const userId = interaction.fields.getTextInputValue('user_id_input');
        if (interaction.customId === 'modal_add_prem') {
            await db.collection('premium_users').doc(userId).set({ scadenza: Date.now() + (30 * 24 * 60 * 60 * 1000), attivo: true });
            await interaction.reply({ content: `✅ Premium aggiunto a <@${userId}>.`, ephemeral: true });
        } else if (interaction.customId === 'modal_rem_prem') {
            await db.collection('premium_users').doc(userId).delete();
            await interaction.reply({ content: `🗑️ Premium rimosso da <@${userId}>.`, ephemeral: true });
        } else if (interaction.customId === 'modal_check_prem') {
            const doc = await db.collection('premium_users').doc(userId).get();
            const info = doc.exists ? `📅 Scadenza: ${new Date(doc.data().scadenza).toLocaleDateString()}` : "❌ Nessun Premium attivo.";
            await interaction.reply({ content: info, ephemeral: true });
        }
    }
});

// 7. GESTIONE COMANDI
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    if (!(await checkRequirements(message))) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);

    if (command) {
        try { await command.execute(message, args, db); } catch (err) { console.error(err); }
    }
});

client.login(process.env.DISCORD_TOKEN);
