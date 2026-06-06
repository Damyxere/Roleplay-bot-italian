
// Aggiungi queste dipendenze in cima al file
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');

// Configurazione sessione (fondamentale per il login)
app.use(session({
    secret: 'super-segreto-random',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Definizione della rotta che ora ti dà errore
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/dashboard.html'); // Ti porta alla dashboard dopo il login
});
// 1. IMPORTAZIONI CORE
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./firebase'); 

// 2. SETUP SERVER WEB (EXPRESS)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Avviamo il server web
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
        const folderPath = path.join(__dirname, 'commands', folder);
        if (fs.lstatSync(folderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(path.join(folderPath, file));
                if (command.name) client.commands.set(command.name, command);
            }
        }
    }
}

// 5. EVENTI E LOG
client.on('guildCreate', async guild => {
    const LOG_CHANNEL_ID = '1512148848280080564';
    const channel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (channel) {
        const invite = await guild.channels.cache.find(c => c.permissionsFor(guild.members.me).has('CreateInstantInvite'))
            ?.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => null);
        const embed = new EmbedBuilder()
            .setTitle('🚀 Nuovo Server Scorpion OS')
            .setColor('#f1c40f')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '📛 Nome Server', value: guild.name, inline: true },
                { name: '🆔 ID Server', value: guild.id, inline: true },
                { name: '👤 Membri', value: `${guild.memberCount}`, inline: true },
                { name: '🔗 Link Invito', value: invite ? invite.url : 'Impossibile creare invito' }
            );
        await channel.send({ embeds: [embed] });
    }
});

// 6. GESTIONE INTERAZIONI
client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'admin_premium_menu') {
        const azione = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${azione}`).setTitle(azione.toUpperCase());
        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('user_id_input').setLabel('Inserisci ID Utente').setStyle(TextInputStyle.Short).setRequired(true)));
        await interaction.showModal(modal);
    }
    if (interaction.isModalSubmit()) {
        const userId = interaction.fields.getTextInputValue('user_id_input');
        if (interaction.customId === 'modal_add_prem') {
            await db.collection('premium_users').doc(userId).set({ scadenza: Date.now() + (30 * 24 * 60 * 60 * 1000), attivo: true });
            await interaction.reply({ content: `✅ Premium aggiunto a <@${userId}> per 30 giorni.`, ephemeral: true });
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
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);
    if (command) {
        try { await command.execute(message, args, db); } catch (err) { console.error(err); }
    }
});

client.login(process.env.DISCORD_TOKEN);
