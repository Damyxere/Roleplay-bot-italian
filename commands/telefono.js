const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    execute: async (interaction) => {
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_1').setLabel('1').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_2').setLabel('2').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_3').setLabel('3').setStyle(ButtonStyle.Secondary),
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_invia').setLabel('INVIA').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('btn_canc').setLabel('CANC').setStyle(ButtonStyle.Danger),
        );

        await interaction.reply({ 
            content: "📱 **ScorpionPhone**\nInserisci il PIN:", 
            components: [row1, row2], 
            ephemeral: true 
        });
    }
};
