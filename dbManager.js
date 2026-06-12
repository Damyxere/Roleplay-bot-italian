const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

module.exports = {
    // Legge il PIN dell'utente specifico nel server specifico
    getPin: async (g, u) => {
        const doc = await db.collection('telefoni').doc(`${g}_${u}`).get();
        return doc.exists ? doc.data().pin : null;
    },
    // Controlla se l'utente ha un documento attivo
    haDocumento: async (g, u) => (await db.collection('documenti').doc(`${g}_${u}`).get()).exists,
    // Controlla se è premium
    isPremium: async (g, u) => {
        const doc = await db.collection('documenti').doc(`${g}_${u}`).get();
        return doc.exists && doc.data().premium === true;
    }
};
