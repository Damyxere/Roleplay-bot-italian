const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Carica la configurazione dal JSON salvato nelle variabili d'ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_MASTER_CONFIG);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

/**
 * Salva un documento nella collezione 'documenti'
 */
async function saveDocumento(guildId, userId, data) {
    try {
        // Creiamo una chiave univoca composta da server e utente
        const docRef = db.collection('documenti').doc(`${guildId}_${userId}`);
        await docRef.set(data);
        console.log(`✅ Documento salvato con successo per l'utente ${userId}`);
        return true;
    } catch (error) {
        console.error("❌ ERRORE CRITICO FIREBASE:", error);
        return false;
    }
}

/**
 * Recupera un documento dalla collezione 'documenti'
 */
async function getDocumento(guildId, userId) {
    try {
        const docRef = db.collection('documenti').doc(`${guildId}_${userId}`);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return null;
        }
        return doc.data();
    } catch (error) {
        console.error("❌ ERRORE RECUPERO FIREBASE:", error);
        return null;
    }
}

module.exports = { saveDocumento, getDocumento };
