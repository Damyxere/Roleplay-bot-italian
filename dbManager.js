const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Verifica variabile d'ambiente
if (!process.env.FIREBASE_CONFIG) {
    console.error("❌ ERRORE: FIREBASE_CONFIG non trovata su Render!");
    process.exit(1);
}

try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("✅ Firebase Inizializzato correttamente.");
} catch (e) {
    console.error("❌ ERRORE: Fallito parsing JSON Firebase:", e);
    process.exit(1);
}

const db = getFirestore();
console.log("✅ Connessione a Firestore stabilita.");

// Funzioni
async function haDocumento(guildId, userId) {
    console.log(`🔍 [DB] Controllo esistenza documento per: ${guildId}_${userId}`);
    const doc = await db.collection('documenti').doc(`${guildId}_${userId}`).get();
    return doc.exists;
}

async function setPin(guildId, userId, pin) {
    console.log(`💾 [DB] Salvataggio PIN per: ${guildId}_${userId}`);
    await db.collection('telefoni').doc(`${guildId}_${userId}`).set({ pin }, { merge: true });
}

async function getPin(guildId, userId) {
    console.log(`📖 [DB] Lettura PIN per: ${guildId}_${userId}`);
    const doc = await db.collection('telefoni').doc(`${guildId}_${userId}`).get();
    return doc.exists ? doc.data().pin : null;
}

async function isPremium(guildId, userId) {
    console.log(`💎 [DB] Controllo stato Premium per: ${guildId}_${userId}`);
    const doc = await db.collection('documenti').doc(`${guildId}_${userId}`).get();
    return doc.exists && doc.data().premium === true;
}

module.exports = { 
    db, 
    haDocumento, 
    setPin, 
    getPin, 
    isPremium 
};
