
const admin = require('firebase-admin');

// ⚠️ Inserisci qui le tue credenziali reali quando le scaricherai dalla console di Firebase!
const serviceAccount = {
  "type": "service_account",
  "project_id": "roleplay-bot-italian",
  "private_key_id": "03807ac2e9095831d98c58177d2e54ae2b10f825",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNb5JXQKDSgEld\nQQRFJpx6/GeXl2t2xjnfr8qqqN4J66S+gBvFHo+8gFuc8nqjMUPbZalDIH/dazAS\nTVYqShXiPROOHw7lbqI+/fckoxN4iJwwoOnkYi8K1ZG7v55OW4tNuYPU1Q8HHtrV\n6wPqDCiNy4xnrUv2S+9ctsHse3jgci7Gen42J2qqsTqXtZRnysglg0whE6XrT0e3\nqBHCI/GNMfywPjQ73Irp3wfA0VqVWybtCSO0cw3DF+EerzSm71hHyJJ4hRB4VGB9\n2i5AvYLATqHFAzCtEzv0A4tazCxLoleze3sPRHQlv6XRn8sr5atfU5apBS2wwqTf\nBWG0fjNTAgMBAAECggEARWhSqwP80eHh543V4X8gEzU/0qmn9yMV3otID8yp5/Qj\nXvFtcHXY3jkHusj5wjUc1f1M6I8MZESYozZZzEPnjN5RwwyfPcjZLCsl2sz2AR02\nl/9lxnGdry1k5WfiFls7f3EUJ04sm51DFk8mrWaaNP32W/ji1z3kixB8CGfW+Q0/\ntDDHejH8fJKXvreABjt48tmE3FIakLuW9B01qoo4UA/S9ASbsaXMj4SZWPFO57+d\nTXXQ7eWOE+3V11rjcLweXNOKZlgSt8UEY8blq0yZj6ukqjsMS7J4nYn286mpVKOJ\npd9SThaxlZb2d8WD1bny9w8LkWyDai4GKCivKTw9YQKBgQDxItnB6TZKIHdZbAfx\nBst+5N5Xl1gV9gbIFnzebZ5ic+VQzg823yycrF40F2c8oun3w5foqK1TCbSzpXKt\nt34Lujy6TUQoPXbINrs0tGHOOXDQKnr7el527n4euJpAV76HPAXjEN1aFhoaYyga\n46DUT+eJqrzIMOC6wfIlapGoyQKBgQDaGV31c1VEWgwjPgwK87izG6odd+qbvc7l\nVH1KmGPzYdApsz965X3Xv76OdWEN6QZdX4+528MvpHYwEqEPC2F+NhI/O0u3dt/E\nP95T9XOJGQoG55sd4YirZpBPUTuNfWUp6kGWRC2HM1249AF8Zuj2Z24OJN/7+qbI\nrMce8i1lOwKBgQCpI0ncowlqi0VL2uPjI2H/mud+RvEJTm3JUUS6++bZpfNWb4Lq\neTYgmyLkpPnL5XX5TR+zmQUiNq+iRs2enhNyhGpuPx4sn5g+rW04dcIY1d+UlAd5\nd4blIzohsFi6AxHoZ6i1cbHhq5kZoy2RVtMLuRRuUu1h+i7XsIx5xDtxSQKBgHcm\nvKpH5CF/gHoQf8vL8vAHAR0wUj/bppirW/fQ4Wop2euuPdQKZIHmA1kYz3kmAZAp\nkP/dC/mPQ/Jnew4ZDZ5CNB3Pa0JD82Pn8LK1ufUAdPXoulnMyTm6wsRSgNJ/2zDX\nBhXuEWF3spBE3jr0jflv8DRR+PxUp6GiovZJIHvZAoGBAIh2O4PGZ8ia6anuFfSn\nKJqVkeQ4Cnp3Xw7yOeGHj/Ta0TPZKHAisAU3idHgQdayJ3CqP+EULplLYnzZ2yKv\nilGinrMmrM4681UmWkKzlUY8P/DvoTcUrYWqCaK2oIr/S4MII2vknnwEwtPUByTH\n3Vjv/SDBS3GBPWWyMOq5CKZy\n-----END PRIVATE KEY-----\n",
  
};

let db;

// CONTROLLO REALE CHIAVI
if (serviceAccount.project_id === "progetto-placeholder") {
    console.log("⚠️ MODALITÀ PROVVISORIA ATTIVA: Chiavi Firebase non inserite.");
    console.log("🤖 ATTIVAZIONE SIMULATORE DATABASE EMULATO PER EVITARE IL CRASH.");
    
    // Creiamo un oggetto finto (Mock) che risponde ai comandi senza crashare
    db = {
        collection: () => ({
            doc: () => ({
                get: async () => ({ exists: false, data: () => ({}) }),
                set: async () => true,
                update: async () => true
            })
        })
    };
} else {
    // Se le chiavi sono state cambiate, avvia Firebase vero
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        db = admin.firestore();
        console.log("🔥 Connessione reale a Firebase stabilita con successo!");
    } catch (error) {
        console.error("❌ Errore durante l'inizializzazione dei servizi Firebase:", error);
    }
}

module.exports = db;
