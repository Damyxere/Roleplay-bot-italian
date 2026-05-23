const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../firebase'); // Agganciamo Firebase per leggere i ruoli abilitati

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('👑 Apre la Dashboard Amministrativa Suprema dello Staff (Scorpion Engine)'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const ownerId = interaction.guild.ownerId; // ID del vero CEO/Proprietario del server Discord

        await interaction.deferReply({ ephemeral: true });

        try {
            // Scarichiamo le impostazioni del server salvate su Firebase
            const serverDoc = await db.collection('servers').doc(guildId).get();
            let ruoloStaffId = null;

            if (serverDoc.exists && serverDoc.data().impostazioni) {
                ruoloStaffId = serverDoc.data().impostazioni.ruolo_staff_id;
            }

            // --- FILTRO DI SICUREZZA DOPPIO (PROPRIETARIO O RUOLO STAFF) ---
            const isCEO = (userId === ownerId);
            const hasStaffRole = ruoloStaffId ? interaction.member.roles.cache.has(ruoloStaffId) : false;
            const hasDiscordAdmin = interaction.member.permissions.has('Administrator');

            // Se non sei il proprietario, non hai il ruolo registrato e non sei admin di Discord, vieni cacciato
            if (!isCEO && !hasStaffRole && !hasDiscordAdmin) {
                return interaction.editReply({ content: '❌ **ACCESSO NEGATO:** Questo terminale è protetto da crittografia. Solo il CEO o i membri certificati dello Staff possono accedere.' });
            }

            // Se superi il controllo, il bot ti dà il benvenuto nel pannello
            const embed = new EmbedBuilder()
                .setTitle('⚙️ TERMINALE CENTRALIZZATO STAFF — ROLEPLAY BOT ITALIA')
                .setColor('#ff0055')
                .setDescription(`Autenticazione completata. Benvenuto Operatore **${interaction.user.username}**.\nStai manipolando i blocchi dati su Firebase in tempo reale.`)
                .addFields(
                    { name: '👤 Modulo Cittadini', value: 'Modifica portafogli dei player, azzeramenti per FailRP e account.', inline: true },
                    { name: '💼 Modulo Gerarchie', value: 'Promozione immediata dei dipendenti o licenziamenti di massa.', inline: true },
                    { name: '⚠️ Log di Audit', value: 'Ogni azione eseguita tramite questo pannello viene registrata nel database dello Scorpion OS.', inline: false }
                )
                .setThumbnail(interaction.guild.iconURL())
                .setFooter({ text: `Scorpion OS • Livello di Accesso: ${isCEO ? 'PROPRIETARIO SUPREMO' : 'STAFF COMPILATORE'}` });

            // Prima fila di bottoni (Modifiche dirette sull'utente)
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('staff_set_money')
                    .setLabel('💸 Modifica Denaro')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('staff_set_job')
                    .setLabel('💼 Imposta Lavoro')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('staff_wipe_user')
                    .setLabel('⚠️ Wipe Account')
                    .setStyle(ButtonStyle.Danger)
            );

            // Seconda fila di bottoni (Logistica e iniezione oggetti)
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('staff_spawn_item')
                    .setLabel('📦 Inietta Oggetto Custom')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({ embeds: [embed], components: [row1, row2] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Errore critico durante l\'avvio del sistema di sicurezza del pannello.' });
        }
    }
};
