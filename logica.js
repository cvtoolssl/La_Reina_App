// --- FRASES CV TOOLS (SEÑALIZACIÓN VIAL + CHONI) ---
const PHRASES = {
  period: [
      "⛔ STOP. CALZADA CORTADA POR DERRUMBES. Ni se te ocurra pasar.",
      "🛑 PROHIBIDO EL PASO. Zona catastrófica. Trae Ibuprofeno o da media vuelta.",
      "🚧 OBRAS EN LA VÍA. Pavimento sangriento. Circule con precaución.",
      "⛔ ACCESO DENEGADO. La Reina está de mantenimiento. Volveremos pronto."
  ],
  follicular: [
      "🚀 AUTOPISTA HACIA EL CIELO. Vía libre y sin radares, guapa.",
      "✅ PRIORIDAD ABSOLUTA. Tienes el semáforo en verde. Acelera.",
      "✨ FIRME EN BUEN ESTADO. Estás para que te multen por exceso de belleza.",
      "🔵 OBLIGATORIO DIVERTIRSE. Circulación fluida y buen rollo."
  ],
  ovulation: [
      "⚠️ PELIGRO: CURVAS PELIGROSAS. Riesgo de accidente (bebé a bordo).",
      "⚠️ ATENCIÓN: FIRME FÉRTIL. Se derrapa fácil. Usa cadenas (o condón).",
      "🔥 ALTA VELOCIDAD. Radares activados. Eres un peligro público ahora mismo.",
      "⚠️ CEDA EL PASO. Tienes la prioridad biológica. Cuidadito con el choque."
  ],
  luteal: [
      "🚧 CALZADA DEFORMADA (SPM). Pavimento deslizante y mucha mala hostia.",
      "⛈️ PELIGRO POR NIEBLA Y DRAMAS. Visibilidad reducida. No me hables.",
      "🛑 RETENCIONES IMPORTANTES. Estoy hinchada como un camión de 8 ejes.",
      "⚠️ ANIMALES SUELTOS. Muerdo si te acercas. Mantén la distancia de seguridad."
  ]
};

const UI = {
  day: document.getElementById('dayNum'),
  phase: document.getElementById('phaseName'),
  msg: document.getElementById('dailyMessage'),
  panel: document.getElementById('settingsPanel'),
  signRing: document.getElementById('cycleRing') // Para cambiar el color del borde
};

window.onload = () => {
  if(Notification.permission !== "granted") Notification.requestPermission();
  if(localStorage.getItem('cvData')) loadData();
  else openSettings();
};

function loadData() {
  const data = JSON.parse(localStorage.getItem('cvData'));
  calculate(data);
}

function calculate(data) {
  const last = new Date(data.date);
  const today = new Date();
  const diffTime = Math.abs(today - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  let day = diffDays % parseInt(data.cycle);
  if (day === 0) day = parseInt(data.cycle); 
  if (diffDays === 0) day = 1;

  updateUI(day);
  scheduleNotification(day);
}

function updateUI(day) {
  UI.day.innerText = day;
  let phase = "", key = "", color = "";

  if (day <= 5) { 
      phase = "⛔ STOP / REGLA"; 
      key = "period"; 
      color = "#cc0000"; // Rojo Stop
  } else if (day <= 13) { 
      phase = "✅ VÍA LIBRE"; 
      key = "follicular"; 
      color = "#0055a4"; // Azul Obligación
  } else if (day <= 16) { 
      phase = "⚠️ PELIGRO"; 
      key = "ovulation"; 
      color = "#ffcc00"; // Amarillo Peligro
      UI.signRing.style.borderColor = color; // Borde amarillo en peligro
  } else { 
      phase = "🚧 OBRAS (SPM)"; 
      key = "luteal"; 
      color = "#ff6600"; // Naranja Obras
  }

  // Si no es peligro, el borde vuelve a rojo estándar de prohibición
  if (key !== 'ovulation' && key !== 'luteal') {
      UI.signRing.style.borderColor = "#cc0000";
  } else if (key === 'luteal') {
      UI.signRing.style.borderColor = "#ff6600";
  }

  UI.phase.innerText = phase;
  const list = PHRASES[key];
  UI.msg.innerText = list[Math.floor(Math.random() * list.length)];
}

// --- NOTIFICACIONES Y WHATSAPP VIAL ---

function scheduleNotification(currentDay) {
  const triggerDays = [1, 14, 25];
  if (triggerDays.includes(currentDay)) {
      const lastNotif = localStorage.getItem('lastNotifDate');
      const todayStr = new Date().toDateString();
      if (lastNotif !== todayStr) {
          sendNotification(`🚧 CV TOOLS INFORMA: DÍA ${currentDay}`, UI.msg.innerText);
          localStorage.setItem('lastNotifDate', todayStr);
      }
  }
}

function sendNotification(title, body) {
  if (Notification.permission === "granted") {
      new Notification(title, {
          body: body,
          icon: "https://cdn-icons-png.flaticon.com/512/3097/3097180.png", // Icono cono
          vibrate: [200, 100, 200, 100, 200]
      });
  }
}

function markPeriodToday() {
  if(confirm("🛑 ¿DETENEMOS EL TRÁFICO? ¿Te ha bajado hoy?")) {
      const today = new Date().toISOString().split('T')[0];
      let data = JSON.parse(localStorage.getItem('cvData')) || { cycle: 28, phone: "" };
      data.date = today;
      localStorage.setItem('cvData', JSON.stringify(data));
      loadData();
      alert("✅ TRÁFICO RESTABLECIDO. Día 1.");
  }
}

function notifyBoyfriend() {
  const data = JSON.parse(localStorage.getItem('cvData'));
  if(!data || !data.phone) return alert("⚠️ Rellena el parte de accidente en ajustes primero.");
  
  const text = `🚧 CV TOOLS INFORMA: Parte de situación vial.\nDía: ${UI.day.innerText} (${UI.phase.innerText})\nEstado de la vía: "${UI.msg.innerText}"\n\nRespete las señales. Circule con precaución.`;
  window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`);
}

function saveSettings() {
  const date = document.getElementById('lastPeriod').value;
  const cycle = document.getElementById('cycleDays').value;
  const phone = document.getElementById('phone').value;
  if(!date || !phone) return alert("⚠️ Faltan datos en el atestado.");
  const data = { date, cycle, phone };
  localStorage.setItem('cvData', JSON.stringify(data));
  closeSettings();
  loadData();
}

function openSettings() { UI.panel.classList.add('active'); }
function closeSettings() { UI.panel.classList.remove('active'); }