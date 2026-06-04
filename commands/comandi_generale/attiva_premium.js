module.exports = {
    name: 'attiva_premium',
    async execute(message, args, db) {
        const userDoc = await db.collection('premium_users').doc(message.author.id).get();
        if (!userDoc.exists || userDoc.data().scadenza < Date.now()) {
            return message.reply("❌ Il tuo Premium è scaduto o non esiste.");
        }
        await db.collection('premium_servers').doc(message.guild.id).set({
            ownerId: message.author.id,
            isPremium: true,
            scadenza: userDoc.data().scadenza
        });
        message.reply("✅ **Premium attivato su questo server!**");
    }
};
