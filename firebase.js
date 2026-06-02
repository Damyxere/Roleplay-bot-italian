const admin = require('firebase-admin');

try {
    // Verifichiamo che la variabile del blocco unico sia configurata su Render
    if (!process.env.FIREBASE_MASTER_CONFIG) {
        throw new Error("La variabile d'ambiente FIREBASE_MASTER_CONFIG è vuota o mancante!");
    }

    // Decodifichiamo l'intero blocco JSON della configurazione master
    const serviceAccount = JSON.parse(process.env.FIREBASE_MASTER_CONFIG);

    // Inizializziamo l'SDK di Firebase con le credenziali decodificate
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log("🔥 [Scorpion OS] Connessione a Firebase Firestore stabilita con successo via Master Config!");
} catch (error) {
    console.error("❌ [ERRORE CRITICO FIREBASE] Impossibile connettersi al database:");
    console.error(`📝 Dettaglio: ${error.message}`);
    // Non blocchiamo il processo del bot, ma segnaliamo l'errore nei log di Render
}

const db = admin.firestore();

// Esportiamo il database in modo che possa essere importato comodamente dagli altri comandi
module.exports = db;
