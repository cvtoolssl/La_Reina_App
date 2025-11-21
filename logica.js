// FRASES AUTOMÁTICAS (ESTILO DIVA)
const PHRASES = {
  period: ["No estoy para nadie. Mándame Bizum y chocolate. 🩸", "Cerrado por mantenimiento uterino.", "Hoy la Reina necesita descanso absoluto."],
  follicular: ["Estás brillando, nena. Cómete el mundo. ✨", "Energía de Bad Bitch activada.", "Ponte guapa que hoy se lía."],
  ovulation: ["⚠️ ALERTA: Fertilidad máxima. Cuidado con el heredero.", "Estás magnética. Atraes miradas (y problemas). 🔥"],
  luteal: ["Tengo la mecha corta. Que no me respiren. 💣", "Fase Dramas: Odiando al mundo en 3, 2, 1...", "Estoy hinchada de tanto aguantar tonterías."]
};

// ELEMENTOS
const UI = {
  day: document.getElementById('dayNum'),
  phase: document.getElementById('phaseName'),
  msg: document.getElementById('dailyMessage'),
  panel: document.getElementById('settingsPanel')
};

// INICIAR
window.onload = () => {
  // Pedir permiso de notificación NADA MÁS ENTRAR
  if (Notification.permission !== "granted") {
      Notification.requestPermission();
  }
  
  loadData();
};

function loadData() {
  const data = localStorage.getItem('reinaData');
  if (data) {
      calculate(JSON.parse(data));
      UI.panel.classList.remove('active');
  } else {
      UI.panel.classList.add('active');
  }
}

function calculate(data) {
  const last = new Date(data.date);
  const today = new Date();
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const day = (diff % parseInt(data.cycle)) + 1;

  updateUI(day, data);
  
  // LÓGICA DE NOTIFICACIÓN AUTOMÁTICA
  // Si es un día clave, intentamos lanzar la notificación
  checkAndNotify(day);
}

function updateUI(day, data) {
  UI.day.innerText = day;
  let phase = "", key = "";

  if (day <= 5) { phase = "LA REGLA"; key = "period"; }
  else if (day <= 13) { phase = "DIVA MODE"; key = "follicular"; }
  else if (day <= 16) { phase = "OVULACIÓN"; key = "ovulation"; }
  else { phase = "DRAMAS (SPM)"; key = "luteal"; }

  UI.phase.innerText = phase;
  
  // Frase aleatoria
  const list = PHRASES[key];
  UI.msg.innerText = list[Math.floor(Math.random() * list.length)];
}

function checkAndNotify(day) {
  // Días en los que queremos aviso sí o sí
  const triggerDays = [1, 6, 14, 18, 25];
  
  if (triggerDays.includes(day)) {
      sendLocalNotification(`Día ${day}: ${UI.phase.innerText}`, UI.msg.innerText);
  }
}

function sendLocalNotification(title, body) {
  if (Notification.permission === "granted") {
      new Notification("👑 AVISO DE LA REINA", {
          body: body,
          icon: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
          vibrate: [200, 100, 200]
      });
  }
}

// BOTONES
function notifyBoyfriend() {
  const data = JSON.parse(localStorage.getItem('reinaData'));
  if (!data) return alert("Configura primero, reina.");
  const text = `👑 COMUNICADO OFICIAL: Estoy en mi día ${UI.day.innerText} (${UI.phase.innerText}). Estado: ${UI.msg.innerText}. Actúa en consecuencia.`;
  window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`);
}

function saveSettings() {
  const date = document.getElementById('lastPeriod').value;
  const cycle = document.getElementById('cycleDays').value;
  const phone = document.getElementById('phone').value;
  
  if (!date || !phone) return alert("Rellena todo.");
  
  const data = { date, cycle, phone };
  localStorage.setItem('reinaData', JSON.stringify(data));
  loadData();
}

function openSettings() { UI.panel.classList.add('active'); }

function testNotification() {
  Notification.requestPermission().then(perm => {
      if(perm === "granted") {
          new Notification("👑 Prueba Exitosa", { body: "Así te avisaré, guapa." });
      } else {
          alert("Tienes las notificaciones bloqueadas en el móvil. Actívalas en ajustes.");
      }
  });
}