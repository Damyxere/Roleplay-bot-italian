const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDocumento } = require('../dbManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('documento')
        .setDescription('Visualizza il tuo documento o quello di un altro utente')
        .addUserOption(option => 
            option.setName('utente')
            .setDescription('L\'utente di cui vuoi vedere il documento')),

    async execute(interaction) {
        const target = interaction.options.getUser('utente') || interaction.user;
        const doc = await getDocumento(interaction.guild.id, target.id);

        if (!doc) {
            return interaction.reply({ content: "❌ Nessun documento trovato per questo utente.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Documento di ${doc.nome} ${doc.cognome}`)
            .setColor(0x0099FF)
            .addFields(
                { name: 'ID Documento', value: doc.numero_doc, inline: true },
                { name: 'Data Nascita', value: doc.data, inline: true },
                { name: 'Fisico', value: `Altezza: ${doc.altezza}cm | Peso: ${doc.peso}kg`, inline: false },
                { name: 'Segni particolari', value: `Occhi: ${doc.occhi} | Capelli: ${doc.capelli} | Tatuaggi: ${doc.tatuaggi}`, inline: false }
            )
            .setFooter({ text: `Creato il: ${doc.creato_il}` });

        await interaction.reply({ embeds: [embed] });
    }
};
