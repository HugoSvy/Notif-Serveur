## Envoyer une notification en JavaScript via une API sur un serveur Node.js

1. **Créer un serveur Node.js avec Express**
2. **Créer une route API pour envoyer des notifications**
3. **Utiliser Web Push API ou WebSockets pour transmettre la notification aux clients**
4. **Afficher la notification côté client**

---

### 📌 **Exemple avec Web Push API**
Ce système utilise **Service Workers** et **Push API** pour envoyer des notifications aux clients.

#### 1️⃣ Installer les dépendances
Dans ton projet Node.js, installe les modules nécessaires :

```sh
npm install express web-push body-parser cors
```

#### 2️⃣ Configurer le serveur Node.js (`server.js`)

```javascript
const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Clés VAPID (à générer une seule fois)
const publicVapidKey = "TA_CLE_PUBLIQUE";
const privateVapidKey = "TA_CLE_PRIVEE";

webpush.setVapidDetails(
  "mailto:ton@email.com",
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
```

---

### 📌 **Côté Client (JavaScript)**
Dans ton fichier HTML/JS, ajoute un **Service Worker** pour recevoir les notifications.

#### 1️⃣ Service Worker (`sw.js`)
```javascript
self.addEventListener("push", event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon.png",
  });
});
```

#### 2️⃣ Enregistrer le Service Worker (`client.js`)
```javascript
const publicVapidKey = "TA_CLE_PUBLIQUE";

// Convertir la clé VAPID en Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

// S'enregistrer pour recevoir des notifications
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const register = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    await fetch("http://localhost:5000/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: { "Content-Type": "application/json" },
    });

    console.log("Abonné aux notifications !");
  } else {
    console.error("Service Worker non supporté !");
  }
}

// Lancer l'inscription
registerServiceWorker();
```

---

### 📌 **Tester l'Envoi de Notification**
Tu peux maintenant envoyer une notification en exécutant cette commande sur ton serveur :

```sh
curl -X POST http://localhost:5000/send-notification
```

---

### 📌 **Alternative : WebSockets pour des notifications en temps réel**
Si tu veux un système de notifications en **temps réel**, tu peux utiliser **WebSockets** avec `socket.io`.
