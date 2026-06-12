require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const http = require('http');
const { getPin } = require('./dbManager');

// Server per Render
http.createServer((req, res) => res.end("Bot Online")).listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const bufferPin = new Map(); // Tiene in memoria i tasti premuti

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { 
        body: [{ name: 'telefono', description: 'Avvia il telefono' }] 
    });
    console.log(`✅ Bot pronto: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'telefono') {
        return require('./commands/telefono').execute(interaction);
    }

    if (interaction.isButton()) {
        const userId = interaction.user.id;
        let input = bufferPin.get(userId) || "";

        if (interaction.customId === 'btn_invia') {
            const pinCorretto = await getPin(interaction.guild.id, userId);
            if (input === pinCorretto) {
                await interaction.update({ content: "✅ PIN Corretto! Telefono sbloccato.", components: [] });
            } else {
                await interaction.reply({ content: "❌ PIN Errato!", ephemeral: true });
            }
            bufferPin.delete(userId);
        } else if (interaction.customId === 'btn_canc') {
            bufferPin.delete(userId);
            await interaction.update({ content: "📱 PIN resettato. Inserisci nuovamente:", components: interaction.message.components });
        } else {
            const numero = interaction.customId.split('_')[1];
            input += numero;
            bufferPin.set(userId, input);
            await interaction.update({ content: `📱 Inserimento: ${"*".repeat(input.length)}`, components: interaction.message.components });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
