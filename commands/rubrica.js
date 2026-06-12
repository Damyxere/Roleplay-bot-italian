const { SlashCommandBuilder } = require('discord.js');
const { aggiungiContatto } = require('../dbManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rubrica')
        .setDescription('Gestisci i tuoi contatti')
        .addSubcommand(sub => sub.setName('aggiungi')
            .addStringOption(o => o.setName('nome').setRequired(true))
            .addStringOption(o => o.setName('numero').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        if (sub === 'aggiungi') {
            const nome = interaction.options.getString('nome');
            const numero = interaction.options.getString('numero');
            
            const esito = await aggiungiContatto(interaction.guild.id, interaction.user.id, nome, numero);
            
            if (esito === "NON_ESISTE") {
                return interaction.reply({ content: "❌ Numero non trovato in questo server!", ephemeral: true });
            }
            await interaction.reply({ content: `✅ Contatto **${nome}** salvato!`, ephemeral: true });
        }
    }
};
