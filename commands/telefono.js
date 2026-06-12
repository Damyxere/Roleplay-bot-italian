const { SlashCommandBuilder } = require('discord.js');
const { haDocumento, getPin } = require('../dbManager');
const { inviaSchermo } = require('../utils/viewManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('telefono')
        .setDescription('Accedi allo ScorpionPhone'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        // 1. Controllo esistenza documento (Middleware di protezione)
        const registrato = await haDocumento(guildId, userId);
        if (!registrato) {
            return interaction.reply({ 
                content: "❌ **Accesso Negato:** Devi prima creare un documento RP con `/crea-documento`.", 
                ephemeral: true 
            });
        }

        // 2. Controllo se l'utente ha già un PIN
        const pinEsistente = await getPin(guildId, userId);

        // 3. Instradamento alla schermata corretta
        if (!pinEsistente) {
            // L'utente non ha un PIN -> Schermata di REGISTRAZIONE
            return await inviaSchermo(interaction, 'reg');
        } else {
            // L'utente ha già un PIN -> Schermata di VERIFICA/ACCESSO
            return await inviaSchermo(interaction, 'verifica');
        }
    }
};
