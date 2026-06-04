const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'panel_premium',
    async execute(message, args, db) {
        if (message.author.id !== process.env.CREATOR_ID) return;
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('admin_premium_menu')
                .setPlaceholder('Scegli azione...')
                .addOptions([
                    { label: '➕ Aggiungi Premium', value: 'add_prem' },
                    { label: '➖ Rimuovi Premium', value: 'rem_prem' },
                    { label: '🔍 Controlla Premium', value: 'check_prem' }
                ])
        );
        await message.reply({ content: '👑 Pannello Admin:', components: [row] });
    }
};
