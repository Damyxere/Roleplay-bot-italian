const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Controllo di sicurezza: se la variabile non c'è, il bot ti avvisa subito
if (!process.env.FIREBASE_CONFIG) {
    console.error("ERRORE: La variabile d'ambiente FIREBASE_CONFIG non è impostata su Render!");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
// ... resto del codice

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
