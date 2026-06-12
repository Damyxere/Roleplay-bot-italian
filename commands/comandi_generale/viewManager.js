async function inviaSchermo(interaction, tipo, contenuto = "📱 **SCORPION PHONE**") {
    // Sostituisci con i tuoi link reali dopo averli caricati
    const immagini = {
        'registrazione': 'LINK_IMMAGINE_REGISTRAZIONE',
        'verifica': 'LINK_IMMAGINE_VERIFICA_PIN',
        'home': 'LINK_IMMAGINE_HOME_SCREEN'
    };

    const embed = {
        color: 0x000000,
        title: 'SCORPION PHONE',
        description: contenuto,
        image: { url: immagini[tipo] }
    };

    // Se siamo nella home, aggiungiamo anche il menu delle App
    const components = [];
    if (tipo === 'home') {
        components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('menu_app')
                .setPlaceholder('Seleziona App')
                .addOptions([
                    { label: 'Rubrica', value: 'rubrica' },
                    { label: 'Whatita', value: 'whatita' },
                    { label: 'Banca', value: 'banca' }
                ])
        ));
    }

    if (interaction.deferred || interaction.replied) {
        return interaction.editReply({ embeds: [embed], components: components });
    } else {
        return interaction.reply({ embeds: [embed], components: components, ephemeral: true });
    }
}
