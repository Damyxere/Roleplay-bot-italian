const { SlashCommandBuilder } = require('discord.js');
const { saveDocumento } = require('../dbManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crea-documento')
        .setDescription('Registra la tua identità ufficiale')
        .addStringOption(option => option.setName('nome').setDescription('Nome').setRequired(true))
        .addStringOption(option => option.setName('cognome').setDescription('Cognome').setRequired(true))
        .addStringOption(option => option.setName('data-nascita').setDescription('GG/MM/AAAA').setRequired(true))
        .addStringOption(option => option.setName('altezza').setDescription('Altezza (cm)').setRequired(true))
        .addStringOption(option => option.setName('peso').setDescription('Peso (kg)').setRequired(true))
        .addStringOption(option => option.setName('occhi').setDescription('Colore occhi').setRequired(true))
        .addStringOption(option => option.setName('capelli').setDescription('Colore capelli').setRequired(true))
        .addStringOption(option => option.setName('tatuaggi').setDescription('Tatuaggi (si/no)').setRequired(true)),

    async execute(interaction) {
        // 1. Diciamo a Discord di aspettare
        await interaction.deferReply({ ephemeral: true });

        try {
            const docData = {
                nome: interaction.options.getString('nome'),
                cognome: interaction.options.getString('cognome'),
                data: interaction.options.getString('data-nascita'),
                altezza: interaction.options.getString('altezza'),
                peso: interaction.options.getString('peso'),
                occhi: interaction.options.getString('occhi'),
                capelli: interaction.options.getString('capelli'),
                tatuaggi: interaction.options.getString('tatuaggi'),
                numero_doc: 'DOC-' + Math.floor(1000 + Math.random() * 9000),
                creato_il: new Date().toLocaleDateString()
            };

            const successo = await saveDocumento(interaction.guild.id, interaction.user.id, docData);

            // 2. Rispondiamo dopo che il database ha finito
            if (successo) {
                await interaction.editReply(`✅ Documento creato! ID: **${docData.numero_doc}**`);
            } else {
                await interaction.editReply("❌ Errore durante il salvataggio nel database.");
            }
        } catch (e) {
            console.error(e);
            await interaction.editReply("❌ Si è verificato un errore critico.");
        }
    }
};
