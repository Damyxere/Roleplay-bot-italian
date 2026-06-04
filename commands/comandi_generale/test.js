const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'test',
    premium: false, // È un comando FREE, tutti possono usarlo
    async execute(message, args, db, isPremium) {
        
        // Creazione dell'embed di diagnostica
        const embed = new EmbedBuilder()
            .setTitle('🚀 SCORPION OS • SYSTEM CHECK')
            .setColor('#2ecc71') // Verde operativo
            .setDescription('Il sistema ha risposto all\'impulso di test.')
            .addFields(
                { name: '📡 Stato Connessione', value: '`ONLINE`', inline: true },
                { name: '💎 Stato Premium', value: isPremium ? '`ATTIVO`' : '`DISATTIVATO`', inline: true },
                { name: '👥 Membri Server', value: `\`${message.guild.memberCount}\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Scorpion OS • Core Test' });

        // Invio della risposta
        await message.reply({ embeds: [embed] });
    }
};
