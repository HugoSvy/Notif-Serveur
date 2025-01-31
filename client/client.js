const publicVapidKey = "BCZIuU20aeT9BB6zwh7f63v8w4V5-W6qvEvWoFBCMa3sDt1VFnXYyEsr7DEeQsjGWgg20Jhgowdf5cpYIWaqcpA";

// Convertir la clé VAPID en Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

// S'enregistrer pour recevoir des notifications
async function registerServiceWorker() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      // Enregistrer le service worker
      const register = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      console.log("Service Worker enregistré !");

      // Attendre que le service worker soit actif
      await navigator.serviceWorker.ready;

      // Demander l'autorisation pour les notifications
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.error("L'utilisateur a refusé les notifications.");
        return;
      }

      // S'abonner aux notifications push
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // Envoyer l'abonnement au serveur
      await fetch("http://localhost:5000/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" },
      });

      console.log("Abonné aux notifications !");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du service worker ou de l'abonnement :", err);
    }
  } else {
    console.error("Service Worker ou Push Manager non supporté !");
  }
}

// Appeler la fonction pour enregistrer le Service Worker et s'abonner
registerServiceWorker();

