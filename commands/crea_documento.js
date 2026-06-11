const { SlashCommandBuilder } = require('discord.js');
const { saveDocumento } = require('../dbManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crea-documento')
        .setDescription('Registra la tua identità ufficiale')
        .addStringOption(option => option.setName('nome').setDescription('Il tuo nome').setRequired(true))
        .addStringOption(option => option.setName('cognome').setDescription('Il tuo cognome').setRequired(true))
        .addStringOption(option => option.setName('data-nascita').setDescription('Data (GG/MM/AAAA)').setRequired(true))
        .addStringOption(option => option.setName('altezza').setDescription('Altezza in cm').setRequired(true))
        .addStringOption(option => option.setName('peso').setDescription('Peso in kg').setRequired(true))
        .addStringOption(option => option.setName('occhi').setDescription('Colore occhi').setRequired(true))
        .addStringOption(option => option.setName('capelli').setDescription('Colore capelli').setRequired(true))
        .addStringOption(option => option.setName('tatuaggi').setDescription('Tatuaggi (si/no)').setRequired(true)),

    async execute(interaction) {
        // Recupero i dati inseriti dall'utente
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

        // Salvo su Firestore usando il manager
        const successo = await saveDocumento(interaction.guild.id, interaction.user.id, docData);

        if (successo) {
            await interaction.reply({ 
                content: `✅ Documento creato con successo! ID: **${docData.numero_doc}**`, 
                ephemeral: true 
            });
        } else {
            await interaction.reply({ content: "❌ Errore durante il salvataggio.", ephemeral: true });
        }
    }
};
