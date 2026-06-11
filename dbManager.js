const { db } = require('./firebase'); // Importa l'istanza che abbiamo preparato

async function saveDocumento(guildId, userId, data) {
    try {
        await db.collection('servers').doc(guildId)
                .collection('utenti').doc(userId)
                .set({ documento: data }, { merge: true });
        return true;
    } catch (error) {
        console.error("Errore salvataggio DB:", error);
        return false;
    }
}

async function getDocumento(guildId, userId) {
    const docRef = await db.collection('servers').doc(guildId)
                           .collection('utenti').doc(userId).get();
    return docRef.exists ? docRef.data().documento : null;
}

module.exports = { saveDocumento, getDocumento };
