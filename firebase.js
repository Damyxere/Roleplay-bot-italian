const admin = require('firebase-admin');
let db;

try {
    const firebaseConfigRaw = process.env.FIREBASE_CONFIG;
    if (!firebaseConfigRaw) throw new Error("Manca FIREBASE_CONFIG su Render");

    const serviceAccount = JSON.parse(firebaseConfigRaw);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    db = admin.firestore();
    console.log("🔥 Firebase connesso tramite Variabili d'Ambiente!");
} catch (error) {
    console.error(error.message);
    db = {
        collection: () => ({
            doc: () => ({
                get: async () => ({ exists: false, data: () => ({}) }),
                set: async () => true,
                update: async () => true
            })
        })
    };
}

module.exports = db;
