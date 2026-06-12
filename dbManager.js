const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Modifica questa parte: non cercare il file, leggi la variabile d'ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// ... il resto del tuo codice rimane uguale
// Funzioni di utilità
async function haDocumento(guildId, userId) {
    const doc = await db.collection('documenti').doc(`${guildId}_${userId}`).get();
    return doc.exists;
}

async function setPin(guildId, userId, pin) {
    await db.collection('telefoni').doc(`${guildId}_${userId}`).set({ pin }, { merge: true });
}

async function getPin(guildId, userId) {
    const doc = await db.collection('telefoni').doc(`${guildId}_${userId}`).get();
    return doc.exists ? doc.data().pin : null;
}

async function isPremium(guildId, userId) {
    const doc = await db.collection('documenti').doc(`${guildId}_${userId}`).get();
    // Verifica se il campo 'premium' esiste ed è true
    return doc.exists && doc.data().premium === true;
}

// Esportiamo solo le funzioni necessarie
module.exports = { 
    db, 
    haDocumento, 
    setPin, 
    getPin, 
    isPremium 
};
