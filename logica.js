// --- FRASES GLAM ---
const PHRASES = {
  period: ["Modo avión ✈️. No existo para nadie.", "Cerrado por reformas uterinas.", "Ni me mires, ni me hables, solo trae chocolate.", "Soy un dragón, aviso. 🔥"],
  follicular: ["Estás brillando más que tu iluminador. ✨", "Energía de Diosa. Sube foto ya.", "Hoy te comes el mundo, guapa.", "Piel perfecta, pelo perfecto, actitud perfecta."],
  ovulation: ["⚠️ ALERTA DE BEBÉ. Eres súper fértil ahora.", "Estás magnética. Cuidado con lo que atraes.", "O usas protección o compras pañales. Tú verás."],
  luteal: ["Tengo la mecha muy corta hoy. 💣", "Fase Dramas: Odiando a la humanidad.", "Estoy hinchada y tengo hambre. No preguntes.", "Si respires fuerte te muerdo."]
};

const UI = {
  day: document.getElementById('dayNum'),
  phase: document.getElementById('phaseName'),
  msg: document.getElementById('dailyMessage'),
  panel: document.getElementById('settingsPanel')
};

window.onload = () => {
  // Cargar datos o pedir configuración
  if(localStorage.getItem('reinaData')) {
      loadData();
  } else {
      openSettings();
  }
  
  // Pedir permisos notificaciones (silencioso)
  if(Notification.permission !== "granted") Notification.requestPermission();
};

function loadData() {
  const data = JSON.parse(localStorage.getItem('reinaData'));
  calculate(data);
}

function calculate(data) {
  const last = new Date(data.date);
  const today = new Date();
  
  // Diferencia en días
  const diffTime = Math.abs(today - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  // Calcular día del ciclo actual
  // Si diffDays es 0 (hoy), es día 1.
  // El resto (%) nos da la posición en el ciclo.
  let day = diffDays % parseInt(data.cycle);
  if (day === 0) day = parseInt(data.cycle); 
  
  // Pequeño ajuste si la fecha es hoy mismo
  if(diffDays === 0) day = 1;

  updateUI(day);
}

function updateUI(day) {
  UI.day.innerText = day;
  let phase = "", key = "";

  if (day <= 5) { phase = "LA REGLA 🩸"; key = "period"; }
  else if (day <= 13) { phase = "DIVA MODE ✨"; key = "follicular"; }
  else if (day <= 16) { phase = "OVULACIÓN 🔥"; key = "ovulation"; }
  else { phase = "DRAMAS (SPM) 💣"; key = "luteal"; }

  UI.phase.innerText = phase;
  
  // Frase aleatoria (solo cambia al recargar para no marear)
  const list = PHRASES[key];
  UI.msg.innerText = list[Math.floor(Math.random() * list.length)];
}

// --- FUNCIONES DE ACCIÓN ---

// 1. RESETEAR REGLA (El botón nuevo)
function markPeriodToday() {
  if(confirm("¿Te ha bajado hoy? Esto reiniciará el ciclo al día 1.")) {
      const today = new Date().toISOString().split('T')[0];
      
      // Recuperamos datos viejos para no perder el número de teléfono
      let data = JSON.parse(localStorage.getItem('reinaData')) || { cycle: 28, phone: "" };
      
      // Actualizamos solo la fecha
      data.date = today;
      
      localStorage.setItem('reinaData', JSON.stringify(data));
      loadData(); // Recargar
      alert("¡Ciclo actualizado, reina! Hoy es tu Día 1.");
  }
}

// 2. ENVIAR WHATSAPP
function notifyBoyfriend() {
  const data = JSON.parse(localStorage.getItem('reinaData'));
  if(!data || !data.phone) return alert("Guarda primero el teléfono en ajustes.");
  
  const text = `👑 AVISO: Estoy en el día ${UI.day.innerText} (${UI.phase.innerText}). Estado: "${UI.msg.innerText}". Compórtate.`;
  window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`);
}

// 3. GUARDAR AJUSTES
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