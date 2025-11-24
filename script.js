// --- FRASES CHOCHO CYCLE (VERSIÓN DIVERTIDA/INSULTANTE) ---
const PHRASES = {
  period: [
      "🩸 Ni me mires, cachoperri, que muerdo.",
      "🚫 Cerrado por obras. Circula, zorrón.",
      "👹 Mi útero está de fiesta rave y tú no estás invitada.",
      "🍫 Trae chocolate o lárgate, pedazo de vaga."
  ],
  follicular: [
      "✨ Estás hecha un putón verbenero, y lo sabes.",
      "💅 Guapa no, lo siguiente. Arrasas, zorra.",
      "🔋 Energía a tope para ser la reina del barrio.",
      "🦋 Hoy brillas más que el highlighter, petarda."
  ],
  ovulation: [
      "🔥 ¡Alerta! Tienes el chocho haciendo palmas.",
      "👶 Cierra las piernas, golfa, que te preñan con la mirada.",
      "🐆 Estás para mojar pan. Literalmente.",
      "💋 Vas provocando, lagarta. Disfrútalo."
  ],
  luteal: [
      "💣 Estoy hinchada como un globo, no me toques los cojones.",
      "😭 Odio a la humanidad, especialmente a ti, cachoperri.",
      "🔪 Tengo la mecha muy corta. Cuidado.",
      "🔮 Estoy dramática y qué pasa. ¡Cállate!"
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

const STORAGE_KEY = 'chochoCycle_v1';

// INICIO
window.onload = () => {
  // 1. Permisos
  if ("Notification" in window) {
      Notification.requestPermission().then(perm => {
          if (perm === "granted") {
              UI.notifStatus.innerText = "🔔 Alertas: ACTIVAS";
              checkDailyNotification();
          } else {
              UI.notifStatus.innerText = "🔕 Alertas: BLOQUEADAS";
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

  // 3. Service Worker
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
  }
};

// Chequeo constante por si dejas la app abierta
setInterval(() => {
  const data = localStorage.getItem(STORAGE_KEY);
  if(data) {
      calculate(JSON.parse(data)); 
      checkDailyNotification();
  }
}, 60000); 

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
  
  localStorage.setItem('currentPhaseName', phase);
  
  // Gestión de frase diaria (para que no cambie cada vez que recargas)
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

// --- NOTIFICACIONES ---
function checkDailyNotification() {
  if (Notification.permission !== "granted") return;

  const todayStr = new Date().toDateString();
  const lastNotif = localStorage.getItem('lastNotificationSentDate');

  if (lastNotif !== todayStr) {
      const day = UI.day.innerText;
      const phase = localStorage.getItem('currentPhaseName') || "Ciclo";
      const phrase = localStorage.getItem('dailyPhrase') || "Entra, petarda.";

      sendNotification(`Día ${day}: ${phase}`, phrase);
      localStorage.setItem('lastNotificationSentDate', todayStr);
  }
}

function sendNotification(title, body) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
          type: 'NOTIFY',
          title: title,
          body: body
      });
  } else {
      new Notification("🍑 ChochoCycle", {
          body: `${title}\n${body}`,
          icon: "https://cdn-icons-png.flaticon.com/512/3014/3014239.png", // Icono melocotón
          vibrate: [200, 100, 200]
      });
  }
}

// --- WHATSAPP (SOLUCIONADO ICONOS RAROS) ---
function notifyBoyfriend() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if(!saved) return alert("Configura primero, melón.");
  const data = JSON.parse(saved);
  
  const day = UI.day.innerText;
  const phase = UI.phase.innerText;
  const msg = UI.msg.innerText;

  const text = `🍑 ChochoCycle Informe:\n\nEstoy en el día ${day} (${phase}).\nMood: "${msg}"\n\nCompórtate o cobras.`;
  
  const url = `https://api.whatsapp.com/send?phone=${data.phone}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function markPeriodToday() {
  if(confirm("¿Te ha bajado hoy, zorrón?")) {
      const today = new Date().toISOString().split('T')[0];
      let currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { cycle: 28, phone: "" };
      currentData.date = today;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
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
  if(!date || !cycle || !phone) return alert("Rellena todo, vaga.");
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
  if(confirm("¿Borrar todo y empezar de cero?")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('lastNotificationSentDate');
      location.reload();
  }
}