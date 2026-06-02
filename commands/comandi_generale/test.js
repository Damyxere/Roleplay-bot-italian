const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../firebase'); // Sale di due cartelle per trovare il file firebase.js nella root

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('🚀 Verifica lo stato dello Scorpion OS e la connessione a Firebase'),

    async execute(interaction) {
        // Inviamo una risposta differita (loading) perché la lettura del database potrebbe richiedere qualche millisecondo
        await interaction.deferReply({ ephemeral: true });

        const creatorId = process.env.CREATOR_ID;
        const userId = interaction.user.id;
        
        // 1. Controllo se l'utente che esegue il comando sei tu (il Creatore supremo)
        const isCreator = (userId === creatorId) ? "SÌ 👑 (Bypass Attivo)" : "NO 👤 (Utente Standard)";

        try {
            // 2. Test rapido di lettura su Firebase Firestore per verificare la connessione
            const benchmarkRef = db.collection('servers').doc(interaction.guild.id);
            await benchmarkRef.get();

            // 3. Costruzione dell'Embed di diagnostica verde se tutto è stabile
            const embedTest = new EmbedBuilder()
                .setTitle('🚀 SCORPION OS • DIAGNOSTICA DI SISTEMA')
                .setColor('#2ecc71') // Verde splendente
                .setDescription('Il core del bot ha risposto correttamente all\'impulso di test ed è pronto all\'uso.')
                .addFields(
                    { name: '🟢 Stato Bot', value: '`ONLINE & OPERATIVO`', inline: true },
                    { name: '🔥 Connessione Firebase', value: '`STABILE (Master Config OK)`', inline: true },
                    { name: '👑 Riconoscimento Creatore', value: `\`${isCreator}\``, inline: false },
                    { name: '📡 Latenza API Discord', value: `\`${interaction.client.ws.ping}ms\``, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Scorpion OS • Sessione di Debug Autonoma' });

            await interaction.editReply({ embeds: [embedTest] });

        } catch (error) {
            console.error("❌ Errore durante il comando di test:", error);
            
            // Se Firebase fallisce l'autenticazione, l'embed diventa rosso e mostra il bug
            const embedErrore = new EmbedBuilder()
                .setTitle('⚠️ DIAGNOSTICA FALLITA • SCORPION OS')
                .setColor('#e74c3c') // Rosso errore
                .setDescription('Il bot è acceso ed è connesso a Discord, ma c\'è un problema di comunicazione con il database.')
                .addFields(
                    { name: '🟢 Stato Bot', value: '`ONLINE`', inline: true },
                    { name: '❌ Connessione Firebase', value: '`ERRORE DI COINVOLGIMENTO`', inline: true },
                    { name: '📝 Dettaglio Errore', value: `\`${error.message}\``, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embedErrore] });
        }
    }
};
