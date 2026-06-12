const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Caricamento configurazione Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_MASTER_CONFIG);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

/** --- GESTIONE DOCUMENTI --- **/
async function saveDocumento(guildId, userId, data) {
    try {
        const docRef = db.collection('documenti').doc(`${guildId}_${userId}`);
        await docRef.set(data);
        return true;
    } catch (error) {
        console.error("❌ ERRORE SALVATAGGIO DOCUMENTO:", error);
        return false;
    }
}

async function getDocumento(guildId, userId) {
    try {
        const docRef = db.collection('documenti').doc(`${guildId}_${userId}`);
        const doc = await docRef.get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error("❌ ERRORE RECUPERO DOCUMENTO:", error);
        return null;
    }
}

/** --- GESTIONE TELEFONO (PIN) --- **/
async function setPin(guildId, userId, pin) {
    try {
        await db.collection('telefoni').doc(`${guildId}_${userId}`).set({ pin: pin }, { merge: true });
        return true;
    } catch (error) {
        console.error("❌ ERRORE SALVATAGGIO PIN:", error);
        return false;
    }
}

async function getPin(guildId, userId) {
    try {
        const doc = await db.collection('telefoni').doc(`${guildId}_${userId}`).get();
        return doc.exists ? doc.data().pin : null;
    } catch (error) {
        console.error("❌ ERRORE RECUPERO PIN:", error);
        return null;
    }
}

module.exports = { saveDocumento, getDocumento, setPin, getPin };
