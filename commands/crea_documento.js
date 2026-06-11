const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'crea_documento',
        description: 'Registra la tua identità ufficiale',
    },
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_crea_documento')
            .setTitle('Registrazione Documento');

        // Campi del form
        const fields = [
            { id: 'nome', label: 'Nome' },
            { id: 'cognome', label: 'Cognome' },
            { id: 'data', label: 'Data di Nascita (GG/MM/AAAA)' },
            { id: 'altezza', label: 'Altezza (cm)' },
            { id: 'peso', label: 'Peso (kg)' },
            { id: 'capelli', label: 'Colore Capelli' },
            { id: 'occhi', label: 'Colore Occhi' },
            { id: 'tatuaggi', label: 'Tatuaggi (Sì/No)' }
        ];

        const rows = fields.map(field => {
            return new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId(field.id)
                    .setLabel(field.label)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            );
        });

        modal.addComponents(...rows);
        await interaction.showModal(modal);
    }
};
