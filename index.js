require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { haDocumento, isPremium } = require('./dbManager');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Registrazione comandi all'avvio
const commands = [{ name: 'telefono', description: 'Avvia il telefono' }];
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log(`✅ Bot pronto e comandi registrati: ${client.user.tag}`);
    } catch (e) { console.error("❌ Errore registrazione:", e); }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'telefono') {
        // Uso deferReply per evitare il timeout di Discord
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const presente = await haDocumento(interaction.guild.id, interaction.user.id);
            if (presente) {
                await interaction.editReply("📱 Telefono avviato con successo!");
            } else {
                await interaction.editReply("❌ Nessun documento trovato nel database.");
            }
        } catch (e) {
            await interaction.editReply("⚠️ Errore durante la connessione al database.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
