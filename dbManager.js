const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Caricamento sicuro dalla variabile d'ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

module.exports = {
    db,
    haDocumento: async (g, u) => (await db.collection('documenti').doc(`${g}_${u}`).get()).exists,
    setPin: async (g, u, p) => await db.collection('telefoni').doc(`${g}_${u}`).set({ pin: p }, { merge: true }),
    getPin: async (g, u) => {
        const doc = await db.collection('telefoni').doc(`${g}_${u}`).get();
        return doc.exists ? doc.data().pin : null;
    },
    isPremium: async (g, u) => {
        const doc = await db.collection('documenti').doc(`${g}_${u}`).get();
        return doc.exists && doc.data().premium === true;
    }
};
