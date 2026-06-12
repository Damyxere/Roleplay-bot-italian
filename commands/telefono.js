const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('telefono')
        .setDescription('Apri la tastiera del telefono'),

    async execute(interaction) {
        // Creazione tastiera
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_1').setLabel('1').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_2').setLabel('2').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_3').setLabel('3').setStyle(ButtonStyle.Secondary),
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_4').setLabel('4').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_5').setLabel('5').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_6').setLabel('6').setStyle(ButtonStyle.Secondary),
        );
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_7').setLabel('7').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_8').setLabel('8').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_9').setLabel('9').setStyle(ButtonStyle.Secondary),
        );
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_canc').setLabel('<').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('btn_0').setLabel('0').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_invia').setLabel('>').setStyle(ButtonStyle.Success),
        );

        await interaction.reply({ 
            content: "📱 **Imposta il tuo PIN di 4 cifre:**\n`____`", 
            components: [row1, row2, row3, row4], 
            ephemeral: true 
        });
    }
};
