const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    // Ora usiamo SlashCommandBuilder che ha il metodo .toJSON()
    data: new SlashCommandBuilder()
        .setName('crea_documento')
        .setDescription('Registra la tua identità ufficiale'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_crea_documento')
            .setTitle('Registrazione Documento');

        // Creazione dei campi del form (ActionRows)
        const fields = [
            { id: 'nome', label: 'Nome' },
            { id: 'cognome', label: 'Cognome' },
            { id: 'data', label: 'Data di Nascita (GG/MM/AAAA)' },
            { id: 'altezza', label: 'Altezza (cm)' }
        ];

        const rows = fields.map(field => {
            const input = new TextInputBuilder()
                .setCustomId(field.id)
                .setLabel(field.label)
                .setStyle(TextInputStyle.Short);
            return new ActionRowBuilder().addComponents(input);
        });

        modal.addComponents(...rows);

        await interaction.showModal(modal);
    }
};
