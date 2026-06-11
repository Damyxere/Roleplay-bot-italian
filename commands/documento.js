const { getDocumento } = require('../dbManager');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'documento',
    description: 'Visualizza il tuo documento o quello di un altro utente',
    async execute(interaction) {
        // Se c'è un utente menzionato, prendi lui, altrimenti l'autore del comando
        const target = interaction.options.getUser('utente') || interaction.user;
        
        // Recuperiamo i dati dal nostro manager Firestore
        const doc = await getDocumento(interaction.guild.id, target.id);

        if (!doc) {
            return interaction.reply({ content: "❌ Nessun documento trovato per questo utente.", ephemeral: true });
        }

        // Creiamo l'Embed di visualizzazione
        const embed = new EmbedBuilder()
            .setTitle(`Documento di ${doc.nome} ${doc.cognome}`)
            .setColor(0x0099FF)
            .addFields(
                { name: 'Numero Doc', value: doc.numero_doc, inline: true },
                { name: 'Data di Nascita', value: doc.data, inline: true },
                { name: 'Fisico', value: `Altezza: ${doc.altezza}cm | Peso: ${doc.peso}kg`, inline: false },
                { name: 'Segni particolari', value: `Occhi: ${doc.occhi} | Capelli: ${doc.capelli} | Tatuaggi: ${doc.tatuaggi}`, inline: false }
            )
            .setFooter({ text: `Creato il: ${doc.creato_il}` });

        await interaction.reply({ embeds: [embed] });
    }
};
