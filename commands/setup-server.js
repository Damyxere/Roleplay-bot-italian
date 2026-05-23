const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../firebase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-server')
        .setDescription('⚙️ Inizializza da zero il database di Roleplay Bot Italia per questo server')
        .addStringOption(option =>
            option.setName('città')
                .setDescription('Il nome della tua città RP (es: Roma Underground)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('valuta')
                .setDescription('Il simbolo della moneta economica (es: ₳, €, $)')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('ruolo-staff')
                .setDescription('Il ruolo Discord che potrà usare il pannello amministrativo')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const ownerId = interaction.guild.ownerId; // ID del CEO del server

        // Controllo di sicurezza imperiale
        if (userId !== ownerId && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Accesso negato. Solo il CEO reale del server può inizializzare il sistema.', ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const nomeCitta = interaction.options.getString('città').trim();
        const valuta = interaction.options.getString('valuta').trim();
        const ruoloStaff = interaction.options.getRole('ruolo-staff');

        await interaction.deferReply({ ephemeral: true });

        try {
            // Creiamo il blocco zero del server su Firebase
            await db.collection('servers').doc(guildId).set({
                impostazioni: {
                    nome_citta: nomeCitta,
                    valuta_locale: valuta,
                    ruolo_staff_id: ruoloStaff.id,
                    stato_sistema: 'ONLINE',
                    data_creazione: new Date().toLocaleDateString('it-IT')
                }
            });

            const embed = new EmbedBuilder()
                .setTitle('🤖 SCORPION ENGINE — STATO INIZIALIZZATO')
                .setColor('#00ffcc')
                .setDescription(`Il server è stato collegato a Firebase con successo. Le fondamenta sono pronte.`)
                .addFields(
                    { name: '📍 Località Ambientazione', value: `**${nomeCitta}**`, inline: true },
                    { name: '🪙 Moneta Unica', value: `\`${valuta}\``, inline: true },
                    { name: '👑 Ruolo Staff Autorizzato', value: `<@&${ruoloStaff.id}>`, inline: false }
                )
                .setFooter({ text: 'Roleplay Bot Italia • Struttura Azzerata' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Errore critico durante la scrittura del blocco zero su Firebase.' });
        }
    }
};
