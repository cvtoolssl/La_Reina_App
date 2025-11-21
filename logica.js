// --- FRASES GLAM ---
const PHRASES = {
  period: ["Modo avión ✈️. No existo para nadie.", "Cerrado por reformas uterinas.", "Ni me mires, ni me hables. Solo trae chocolate.", "Soy un dragón, aviso. 🔥"],
  follicular: ["Estás brillando más que tu iluminador. ✨", "Energía de Diosa. Sube foto ya.", "Hoy te comes el mundo, guapa.", "Piel perfecta, pelo perfecto, actitud perfecta."],
  ovulation: ["⚠️ ALERTA DE BEBÉ. Eres súper fértil ahora.", "Estás magnética. Cuidado con lo que atraes.", "O usas protección o compras pañales. Tú verás."],
  luteal: ["Tengo la mecha muy corta hoy. 💣", "Fase Dramas: Odiando a la humanidad.", "Estoy hinchada y tengo hambre.", "Si respiras fuerte te muerdo."]
};

const UI = {
  day: document.getElementById('dayNum'),
  phase: document.getElementById('phaseName'),
  msg: document.getElementById('dailyMessage'),
  panel: document.getElementById('settingsPanel')
};

window.onload = () => {
  // 1. Comprobar permisos al inicio
  if(Notification.permission !== "granted") {
      Notification.requestPermission();
  }

  // 2. Cargar datos
  if(localStorage.getItem('reinaData')) {
      loadData();
  } else {
      openSettings();
  }
};

function loadData() {
  const data = JSON.parse(localStorage.getItem('reinaData'));
  calculate(data);
}

function calculate(data) {
  const last = new Date(data.date);
  const today = new Date();
  
  const diffTime = Math.abs(today - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  let day = diffDays % parseInt(data.cycle);
  if (day === 0) day = parseInt(data.cycle); 
  if(diffDays === 0) day = 1;

  updateUI(day);
  
  // INTENTO DE PROGRAMAR NOTIFICACIÓN FUTURA
  scheduleNotification(day);
}

function updateUI(day) {
  UI.day.innerText = day;
  let phase = "", key = "";

  if (day <= 5) { phase = "LA REGLA 🩸"; key = "period"; }
  else if (day <= 13) { phase = "DIVA MODE ✨"; key = "follicular"; }
  else if (day <= 16) { phase = "OVULACIÓN 🔥"; key = "ovulation"; }
  else { phase = "DRAMAS (SPM) 💣"; key = "luteal"; }

  UI.phase.innerText = phase;
  const list = PHRASES[key];
  UI.msg.innerText = list[Math.floor(Math.random() * list.length)];
}

// --- SISTEMA DE NOTIFICACIONES ---

function scheduleNotification(currentDay) {
  // Solo queremos notificar si hoy es un día clave
  const triggerDays = [1, 14, 25]; // Día 1 (Regla), 14 (Ovulación), 25 (SPM fuerte)
  
  if (triggerDays.includes(currentDay)) {
      // Comprobamos si ya hemos avisado hoy para no ser pesados
      const lastNotif = localStorage.getItem('lastNotifDate');
      const todayStr = new Date().toDateString();

      if (lastNotif !== todayStr) {
          sendNotification(`👑 DÍA ${currentDay}: ${UI.phase.innerText}`, UI.msg.innerText);
          localStorage.setItem('lastNotifDate', todayStr);
      }
  }
}

function sendNotification(title, body) {
  if (Notification.permission === "granted") {
      // Opción 1: Notificación estándar
      new Notification(title, {
          body: body,
          icon: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
          vibrate: [200, 100, 200],
          tag: 'reina-daily' // Para no acumular muchas
      });
  }
}

// --- ACCIONES USUARIO ---

function markPeriodToday() {
  if(confirm("¿Te ha bajado hoy? Esto reiniciará el ciclo al día 1.")) {
      const today = new Date().toISOString().split('T')[0];
      let data = JSON.parse(localStorage.getItem('reinaData')) || { cycle: 28, phone: "" };
      data.date = today;
      localStorage.setItem('reinaData', JSON.stringify(data));
      loadData();
      alert("¡Ciclo actualizado, reina! Hoy es tu Día 1.");
  }
}

function notifyBoyfriend() {
  const data = JSON.parse(localStorage.getItem('reinaData'));
  if(!data || !data.phone) return alert("Guarda primero el teléfono en ajustes.");
  const text = `👑 AVISO: Estoy en el día ${UI.day.innerText} (${UI.phase.innerText}). Estado: "${UI.msg.innerText}". Compórtate.`;
  window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`);
}

function saveSettings() {
  const date = document.getElementById('lastPeriod').value;
  const cycle = document.getElementById('cycleDays').value;
  const phone = document.getElementById('phone').value;
  if(!date || !phone) return alert("Rellena todo, porfa.");
  const data = { date, cycle, phone };
  localStorage.setItem('reinaData', JSON.stringify(data));
  closeSettings();
  loadData();
}

function openSettings() { UI.panel.classList.add('active'); }
function closeSettings() { UI.panel.classList.remove('active'); }