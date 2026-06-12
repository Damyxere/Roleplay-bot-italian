const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { getPin } = require('../dbManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('telefono')
        .setDescription('Accedi al tuo telefono'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const pinEsistente = await getPin(interaction.guild.id, interaction.user.id);
        
        if (!pinEsistente) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('setup_pin')
                    .setLabel('Crea PIN')
                    .setStyle(ButtonStyle.Primary)
            );
            return interaction.editReply({ 
                content: "Non hai ancora un PIN. Clicca qui per crearlo e accedere al tuo telefono.", 
                components: [row] 
            });
        }

        // Se il PIN esiste, mostra il menu del telefono
        await interaction.editReply({ 
            content: "📱 **Telefono Sbloccato**\nInserisci un comando per usare il telefono." 
        });
    }
};
