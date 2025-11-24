// --- FRASES DIVAS ---
const PHRASES = {
  period: [
      "🩸 Alerta Roja: Si no traes chocolate, no entres. Ni te arrimes",
      "🚫 Chocho cerrado. Disculpen las molestias. ",
      "👹 Hoy no soy yo, es mi útero hablando.",
      "🛌 Mi estado civil: En una relación con mi cama. Tráeme chocolate ya!"
  ],
  follicular: [
      "✨ Te sientes la Beyoncé del barrio. Súper Perri!!",
      "💅 Energía de 'Bad Bitch' activada. Soy un putón!",
      "🔋 Batería social al 100%. ¡A la calle! Al mamoneo se ha dicho",
      "🦋 Estás más guapa que un filtro de Instagram. Zorronas al poder!"
  ],
  ovulation: [
      "🔥 Peligro: Miras a un poste y te enamoras.Soy una diva colega!",
      "👶 Fertilidad nivel: Solo con mirarme te embarazo. Ya sabes... Ni te arrimes hoy",
      "🐆 Estás para comerte. Literalmente. Churri I love You",
      "💋 Hoy atraes hasta el WiFi de los vecinos. Soy un bicho zorrón"
  ],
  luteal: [
      "💣 Cuenta atrás para la explosión... Ni me mires",
      "🍫 Dame comida y nadie saldrá herido. Cuidao!",
      "😭 Lloro con los anuncios de detergente. Es normal. Si me dices algo te rebiento",
      "🔪 Paciencia al 1%. No me pruebes. Vete un par de días de casa"
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
  // 1. Pedir permiso de notificación
  if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
          if (permission === "granted") {
              UI.notifStatus.innerText = "🔔 Avisos activos";
              checkDailyNotification();
          } else {
              UI.notifStatus.innerText = "🔕 Avisos bloqueados";
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

  // 3. Registrar Service Worker
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
  }
};

// COMPROBACIÓN RECURRENTE
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
      const phrase = localStorage.getItem('dailyPhrase') || "Entra a ver qué pasa hoy.";

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
      new Notification("💖 ChoniCycle", {
          body: `${title}\n${body}`,
          icon: "https://cdn-icons-png.flaticon.com/512/2913/2913564.png",
          vibrate: [200, 100, 200]
      });
  }
}

// --- ACCIONES (WHATSAPP ARREGLADO) ---
function notifyBoyfriend() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if(!saved) return alert("Configura primero.");
  const data = JSON.parse(saved);
  
  const day = UI.day.innerText;
  const phase = UI.phase.innerText;
  const msg = UI.msg.innerText;

  // Texto limpio con emojis estándar
  const text = `💖 ChoniCycle Informe:\n\nEstoy en el día ${day} (${phase}).\nMood: "${msg}"\n\nCompórtate.`;
  
  // Usamos api.whatsapp.com en lugar de wa.me porque maneja mejor la codificación
  const url = `https://api.whatsapp.com/send?phone=${data.phone}&text=${encodeURIComponent(text)}`;
  
  window.open(url, '_blank');
}

function markPeriodToday() {
  if(confirm("¿Te ha bajado hoy? Resetearé el ciclo al día 1.")) {
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