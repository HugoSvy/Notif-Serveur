const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Clés VAPID (à générer une seule fois)
const publicVapidKey = "BCZIuU20aeT9BB6zwh7f63v8w4V5-W6qvEvWoFBCMa3sDt1VFnXYyEsr7DEeQsjGWgg20Jhgowdf5cpYIWaqcpA";
const privateVapidKey = "ybdWIdcvdzC2gLH2bUM1HgNocs0g8pwn1UaCukIlQMQ";

webpush.setVapidDetails(
  "mailto:svy78200@gmail.com",
  publicVapidKey,
  privateVapidKey
);

// Stocker les abonnements des clients
let subscriptions = [];

// Route pour enregistrer un abonnement
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: "Abonnement enregistré !" });
});

// Route pour envoyer une notification
app.post("/send-notification", (req, res) => {
  const notificationPayload = JSON.stringify({
    title: "Nouvelle Notification",
    body: "Ceci est une notification push ! 🚀",
  });

  const sendNotifications = subscriptions.map(sub =>
    webpush.sendNotification(sub, notificationPayload).catch(err => console.error(err))
  );

  Promise.all(sendNotifications)
    .then(() => res.status(200).json({ message: "Notifications envoyées !" }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
