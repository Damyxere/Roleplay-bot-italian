module.exports = {
    name: 'test',
    async execute(message, args, db, isPremium) {
        message.reply(`🚀 Scorpion OS è attivo! Premium in questo server: ${isPremium ? '💎 SI' : '👤 NO'}`);
    }
};
