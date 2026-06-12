const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

async function inviaSchermo(interaction, tipo, isPremium = false) {
    const immagini = {
        'reg': 'URL_REGISTRAZIONE',
        'verifica': 'URL_VERIFICA',
        'home_base': 'URL_HOME_BASE',
        'home_premium': 'URL_HOME_PREMIUM'
    };

    const img = (tipo === 'home') ? (isPremium ? immagini.home_premium : immagini.home_base) : immagini[tipo];

    const embed = new EmbedBuilder()
        .setTitle('📱 SCORPION PHONE')
        .setImage(img)
        .setColor(0x000000);

    const components = [];
    if (tipo === 'home') {
        components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('menu_app')
                .addOptions([
                    { label: 'Rubrica', value: 'rubrica' },
                    { label: 'Whatita', value: 'whatita' },
                    { label: 'Instaita', value: 'insta' },
                    { label: 'Casino', value: 'casino' }
                ])
        ));
    }

    return interaction.update({ embeds: [embed], components: components });
}

module.exports = { inviaSchermo };
