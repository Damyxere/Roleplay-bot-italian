const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Caricamento configurazione Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_MASTER_CONFIG);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

/** --- GESTIONE DOCUMENTI E SICUREZZA --- **/
async function saveDocumento(guildId, userId, data) {
    try {
        // Salva info server
        const serverRef = db.collection('server_info').doc(guildId);
        await serverRef.set({ creato_il: new Date().toISOString() }, { merge: true });

        // Salva documento utente
        const docRef = db.collection('documenti').doc(`${guildId}_${userId}`);
        await docRef.set(data);
        return true;
    } catch (e) {
        console.error("❌ Errore saveDocumento:", e);
        return false;
    }
}

async function haDocumento(guildId, userId) {
    try {
        const doc = await db.collection('documenti').doc(`${guildId}_${userId}`).get();
        return doc.exists;
    } catch (e) {
        console.error("❌ Errore haDocumento:", e);
        return false;
    }
}

/** --- GESTIONE TELEFONO E PIN --- **/
async function setPin(guildId, userId, pin) {
    try {
        // Genera numero univoco a 5 cifre
        const numero = Math.floor(10000 + Math.random() * 89999).toString();
        await db.collection('telefoni').doc(`${guildId}_${userId}`).set({
            pin: pin,
            numero: numero,
            contatti: []
        }, { merge: true });
        return numero;
    } catch (e) {
        console.error("❌ Errore setPin:", e);
        return null;
    }
}

async function getPin(guildId, userId) {
    const doc = await db.collection('telefoni').doc(`${guildId}_${userId}`).get();
    return doc.exists ? doc.data().pin : null;
}

/** --- GESTIONE RUBRICA --- **/
async function aggiungiContatto(guildId, userId, nome, numeroTarget) {
    try {
        // Verifica se il numeroTarget esiste in quel server
        const snapshot = await db.collection('telefoni')
            .where('numero', '==', numeroTarget).get();
        
        if (snapshot.empty) return "NON_ESISTE";
        
        const docRef = db.collection('telefoni').doc(`${guildId}_${userId}`);
        await docRef.update({
            contatti: FieldValue.arrayUnion({ nome, numero: numeroTarget })
        });
        return "OK";
    } catch (e) {
        console.error("❌ Errore aggiungiContatto:", e);
        return "ERRORE";
    }
}

module.exports = { 
    saveDocumento, 
    haDocumento, 
    setPin, 
    getPin, 
    aggiungiContatto 
};
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

async function isPremium(guildId, userId) {
    const doc = await db.collection('documenti').doc(`${guildId}_${userId}`).get();
    return doc.exists && doc.data().premium === true;
}

// Esporta anche isPremium insieme alle altre funzioni
module.exports = { haDocumento, setPin, getPin, isPremium };
