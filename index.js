require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const { haDocumento, setPin, getPin } = require('./dbManager');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let statiUtenti = new Map(); // Gestisce la fase di registrazione/accesso

client.on('interactionCreate', async interaction => {
    // 1. BLOCCO DI SICUREZZA (Middleware)
    if (interaction.isChatInputCommand() && interaction.commandName !== 'crea-documento') {
        if (!(await haDocumento(interaction.guild.id, interaction.user.id))) {
            return interaction.reply({ content: "❌ Devi prima creare un documento RP!", ephemeral: true });
        }
    }

    // 2. GESTIONE TASTIERA (PIN E ACCESSO)
    if (interaction.isButton() && interaction.customId.startsWith('btn_')) {
        const userId = interaction.user.id;
        let stato = statiUtenti.get(userId) || { fase: 'reg_1', pin1: "", pin2: "", buffer: "" };
        const azione = interaction.customId.split('_')[1];

        if (azione === 'canc') {
            stato.buffer = stato.buffer.slice(0, -1);
        } else if (azione === 'invia') {
            // LOGICA REGISTRAZIONE
            if (stato.fase === 'reg_1') {
                stato.pin1 = stato.buffer;
                stato.buffer = "";
                stato.fase = 'reg_2';
                return interaction.update({ content: "📱 **Ripeti il PIN per confermare:**" });
            } else if (stato.fase === 'reg_2') {
                if (stato.buffer === stato.pin1) {
                    await setPin(interaction.guild.id, userId, stato.buffer);
                    statiUtenti.delete(userId);
                    return interaction.update({ content: "✅ **Telefono configurato con successo!**", components: [] });
                }
                return interaction.reply({ content: "❌ I PIN non corrispondono!", ephemeral: true });
            } 
            // LOGICA ACCESSO
            else if (stato.fase === 'accesso') {
                const salvato = await getPin(interaction.guild.id, userId);
                if (stato.buffer === salvato) {
                    return mostraMenuApp(interaction);
                }
                return interaction.reply({ content: "❌ PIN errato!", ephemeral: true });
            }
        } else {
            if (stato.buffer.length < 4) stato.buffer += azione;
        }

        statiUtenti.set(userId, stato);
        return interaction.update({ content: `📱 **Inserisci PIN:**\n\`${"*".repeat(stato.buffer.length)}\`` });
    }
});

// Funzione per mostrare il menu (ScorpionPhone)
async function mostraMenuApp(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('📱 SCORPION PHONE')
        .setImage('URL_IMMAGINE_TELEFONO_CHE_ABBIAMO_CREATO')
        .setDescription('Seleziona un\'app dal menu:');

    const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_app')
            .setOptions([
                { label: 'Rubrica', value: 'rubrica' },
                { label: 'Whatita', value: 'whatita' },
                { label: 'Banca', value: 'banca' },
                { label: 'Calcolatrice', value: 'calc' }
            ])
    );
    return interaction.update({ embeds: [embed], components: [menu] });
}

client.login(process.env.DISCORD_TOKEN);
