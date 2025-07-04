import express from 'express';
import admin from 'firebase-admin';

const app = express();
app.use(express.json());

// Firebase bağlantısı (Environment'tan değer çekiyoruz)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();

// Katılım API'si
app.post('/join', async (req, res) => {
  const { username, ip } = req.body;

  if (!username || !ip) {
    return res.status(400).json({ error: 'Eksik bilgi' });
  }

  const ipKey = ip.replace(/\./g, '-');
  const ipRef = db.ref('ips/' + ipKey);
  const snapshot = await ipRef.get();

  if (snapshot.exists()) {
    return res.status(400).json({ error: 'Bu IP ile zaten katılım yapılmış' });
  }

  await ipRef.set(true);
  await db.ref('participants').push({ username, ip });

  res.json({ success: true, message: 'Katıldınız!' });
});

// Server başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda ${new Date().toLocaleTimeString()}'de çalışıyor`);
});
