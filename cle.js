const webPush = require('web-push');

// Génère une nouvelle paire de clés VAPID
const vapidKeys = webPush.generateVAPIDKeys();

// Affiche la clé publique et la clé privée
console.log(vapidKeys);