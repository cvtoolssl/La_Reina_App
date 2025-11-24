// --- FRASES DIVERTIDAS (Más variedad) ---
const PHRASES = {
  period: [
      "🩸 Alerta Roja: Si no traes chocolate, no entres.",
      "🚫 Cerrado por mantenimiento. Disculpen las molestias.",
      "👹 Hoy no soy yo, es mi útero hablando. Putón",
      "🛌 Mi estado civil: En una relación con mi cama. Ni te arrimes"
  ],
  follicular: [
      "✨ Te sientes la Beyoncé del barrio. Soy un putón berbenero",
      "💅 Energía de 'Bad Bitch' activada.",
      "🔋 Batería social al 100%. ¡A la calle!",
      "🦋 Estás más guapa que un filtro de Instagram."
  ],
  ovulation: [
      "🔥 Peligro: Miras a un poste y te enamoras. ",
      "👶 Fertilidad nivel: Solo con mirarme te embarazo. Hoy cochinadas no!",
      "🐆 Estás para comerte. Literalmente. Soy un zorrón!",
      "💋 Hoy atraes hasta el WiFi de los vecinos. Esto cachonda"
  ],
  luteal: [
      "💣 Cuenta atrás para la explosión...",
      "🍫 Dame comida y nadie saldrá herido.",
      "😭 Lloro con los anuncios de detergente. Es normal.",
      "🔪 Paciencia al 1%. No me pruebes."
  ]
};

const UI = {
  day: document.getElementById('dayNum'),
  phase: document.getElementById('phaseName'),
  msg: document.getElementById('dailyMessage'),
  panel: document.getElementById('settingsPanel'),
  notifStatus: document.getElementById('notifStatus'),
  inputs: {
      date: document.getElementById('lastPeriod'),
      cycle: document.getElementById('cycleDays'),
      phone: document.getElementById('phone')
  }
};

const STORAGE_KEY = 'choniCycle_v3';

// INICIO
window.onload = () => {
  // 1. Pedir permiso de notificación A SACO nada más entrar
  if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
          if (permission === "granted") {
              UI.notifStatus.innerText = "🔔 Avisos activos";
              checkDailyNotification(); // Comprobar ya
          } else {
              UI.notifStatus.innerText = "🔕 Avisos bloqueados (Actívalos en ajustes)";
          }
      });
  }

  // 2. Cargar datos
  const data = localStorage.getItem(STORAGE_KEY);
  if(data) {
      calculate(JSON.parse(data));
  } else {
      openSettings();
  }

  // 3. Registrar Service Worker (Vital para APK)
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
  }
};

// COMPROBACIÓN RECURRENTE (Cada minuto intenta avisar)
setInterval(() => {
  const data = localStorage.getItem(STORAGE_KEY);
  if(data) {
      const parsed = JSON.parse(data);
      // Recalcular día por si ha cambiado
      calculate(parsed); 
      checkDailyNotification();
  }
}, 60000); // Cada 60 segundos

function calculate(data) {
  const last = new Date(data.date);
  const today = new Date();
  
  if(isNaN(last.getTime())) return;

  const diffTime = Math.abs(today - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  let day = diffDays % parseInt(data.cycle);
  if (day === 0) day = parseInt(data.cycle);
  if (diffDays === 0) day = 1;

  updateUI(day);
}

function updateUI(day) {
  UI.day.innerText = day;
  let phase = "", key = "";

  if (day <= 5) { phase = "La Regla 🩸"; key = "period"; }
  else if (day <= 13) { phase = "Diva Mode ✨"; key = "follicular"; }
  else if (day <= 16) { phase = "Ovulación 🔥"; key = "ovulation"; }
  else { phase = "Dramas / SPM 🔮"; key = "luteal"; }

  UI.phase.innerText = phase;
  
  // Guardar la fase actual en local para usarla en la notificación
  localStorage.setItem('currentPhaseName', phase);
  
  // Elegir frase y guardarla para que no cambie al recargar el mismo día
  const todayStr = new Date().toDateString();
  const lastPhraseDate = localStorage.getItem('lastPhraseDate');
  
  if (lastPhraseDate !== todayStr) {
      const list = PHRASES[key];
      const randomPhrase = list[Math.floor(Math.random() * list.length)];
      localStorage.setItem('dailyPhrase', randomPhrase);
      localStorage.setItem('lastPhraseDate', todayStr);
      UI.msg.innerText = randomPhrase;
  } else {
      UI.msg.innerText = localStorage.getItem('dailyPhrase');
  }
}

// --- SISTEMA DE NOTIFICACIÓN DIARIA ---
function checkDailyNotification() {
  if (Notification.permission !== "granted") return;

  const todayStr = new Date().toDateString();
  const lastNotif = localStorage.getItem('lastNotificationSentDate');

  // Si la fecha guardada es distinta a hoy, enviamos aviso
  if (lastNotif !== todayStr) {
      const day = UI.day.innerText;
      const phase = localStorage.getItem('currentPhaseName') || "Ciclo";
      const phrase = localStorage.getItem('dailyPhrase') || "Entra a ver qué pasa hoy.";

      sendNotification(`Día ${day}: ${phase}`, phrase);
      
      // Marcamos hoy como "ya avisado"
      localStorage.setItem('lastNotificationSentDate', todayStr);
  }
}

function sendNotification(title, body) {
  // Intenta usar el Service Worker si está disponible (mejor para móviles)
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
          type: 'NOTIFY',
          title: title,
          body: body
      });
  } else {
      // Fallback clásico
      new Notification("💖 ChochoCycle", {
          body: `${title}\n${body}`,
          icon: "https://cdn-icons-png.flaticon.com/512/2913/2913564.png", // Icono corazón
          vibrate: [200, 100, 200]
      });
  }
}

// --- ACCIONES ---
function notifyBoyfriend() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if(!saved) return alert("Configura primero.");
  const data = JSON.parse(saved);
  const text = `💖 ChochoCycle Informe:\nEstoy en el día ${UI.day.innerText} (${UI.phase.innerText}).\nMood: "${UI.msg.innerText}"\n\nCompórtate.`;
  window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`);
}

function markPeriodToday() {
  if(confirm("¿Te ha bajado hoy? Resetearé el ciclo al día 1.")) {
      const today = new Date().toISOString().split('T')[0];
      let currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { cycle: 28, phone: "" };
      currentData.date = today;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      // Resetear notificación para que avise del cambio
      localStorage.removeItem('lastNotificationSentDate'); 
      calculate(currentData);
      alert("🩸 Ciclo reiniciado.");
  }
}

// --- AJUSTES ---
function saveSettings() {
  const date = UI.inputs.date.value;
  const cycle = UI.inputs.cycle.value;
  const phone = UI.inputs.phone.value;
  if(!date || !cycle || !phone) return alert("Rellena todo.");
  const userData = { date, cycle, phone };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  closeSettings();
  calculate(userData);
}

function openSettings() { 
  UI.panel.classList.add('active');
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) {
      const data = JSON.parse(saved);
      UI.inputs.date.value = data.date;
      UI.inputs.cycle.value = data.cycle;
      UI.inputs.phone.value = data.phone;
  }
}

function closeSettings() { UI.panel.classList.remove('active'); }

function fullReset() {
  if(confirm("¿Borrar todos los datos?")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('lastNotificationSentDate');
      location.reload();
  }
}