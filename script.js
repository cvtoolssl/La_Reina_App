// --- FRASES DIVAS ---
const PHRASES = {
  period: [
      "🩸 Modo avión. No estoy para nadie.",
      "✨ Alineando chakras desde la cama. Modo putón OFF",
      "🧘‍♀️ Fluyendo con la marea. Tráeme chocolate churri.",
      "🚫 Cerrado por limpieza de aura. Chocho cerrado"
  ],
  follicular: [
      "🦋 Saliendo del capullo, guapa.",
      "💅 Manifestando abundancia y pelazo. Putón a la vista",
      "✨ Energía de Diosa Suprema.",
      "🔋 Batería social al 100%. "
  ],
  ovulation: [
      "🔥 Fertilidad a tope. Cuidado ahí. Apta para preñaje",
      "👶 Universo fértil. Ojo con lo que deseas. ",
      "🐆 Estás magnética. Consigues lo que quieras. Me voy de fiestuqui zorronas",
      "💋 Labios rojos y ovarios trabajando. Susto total en el cuerpo"
  ],
  luteal: [
      "⛈️ Mercurio retrógrado en mi útero. No me molestres tronco",
      "🔮 Intuición a tope, paciencia cero. Ni me mires. Mamón",
      "🍫 Necesito mimos o un atraco a la nevera.",
      "💣 Fase sensible. Si grito es normal."
  ]
};

const UI = {
  day: document.getElementById('dayNum'),
  phase: document.getElementById('phaseName'),
  msg: document.getElementById('dailyMessage'),
  panel: document.getElementById('settingsPanel'),
  inputs: {
      date: document.getElementById('lastPeriod'),
      cycle: document.getElementById('cycleDays'),
      phone: document.getElementById('phone')
  }
};

const STORAGE_KEY = 'choniCycle_v2';

// --- INICIO ---
window.onload = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if(data) {
      calculate(JSON.parse(data));
  } else {
      openSettings();
  }
};

// --- CÁLCULOS ---
function calculate(data) {
  const last = new Date(data.date);
  const today = new Date();
  
  // Validación básica
  if(isNaN(last.getTime())) return openSettings();

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
  const list = PHRASES[key];
  UI.msg.innerText = list[Math.floor(Math.random() * list.length)];
}

// --- NUEVO ENFOQUE: CALENDARIO (.ICS) ---
function addToCalendar() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if(!saved) return alert("Configura tus fechas primero, reina.");
  
  const data = JSON.parse(saved);
  const lastPeriod = new Date(data.date);
  const cycleLen = parseInt(data.cycle);
  
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ChoniCycle//NONSGML v1.0//EN\n";
  
  // Generar las próximas 6 reglas
  for(let i = 0; i < 6; i++) {
      // Calcular fecha estimada (última + (ciclo * veces))
      // Si i=0 es la actual/pasada, empezamos en i=1 para la futura si la actual ya pasó
      // Vamos a proyectar desde la última fecha guardada
      let nextDate = new Date(lastPeriod);
      nextDate.setDate(lastPeriod.getDate() + (cycleLen * (i + 1)));
      
      // Formato YYYYMMDD
      const startStr = nextDate.toISOString().replace(/-|:|\.\d\d\d/g,"").substring(0,8);
      
      // Asumimos que dura 5 días la alerta
      let endDate = new Date(nextDate);
      endDate.setDate(nextDate.getDate() + 5);
      const endStr = endDate.toISOString().replace(/-|:|\.\d\d\d/g,"").substring(0,8);

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `DTSTART;VALUE=DATE:${startStr}\n`;
      icsContent += `DTEND;VALUE=DATE:${endStr}\n`;
      icsContent += "SUMMARY:🩸 Alerta ChoniCycle\n";
      icsContent += "DESCRIPTION:Prepárate chocolate y mimos.\n";
      icsContent += "END:VEVENT\n";
  }
  
  icsContent += "END:VCALENDAR";

  // Crear archivo y descargar
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'mis_reglas.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- ACCIONES ---
function notifyBoyfriend() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if(!saved) return alert("Configura primero.");
  const data = JSON.parse(saved);
  const text = `💖 Hola. Update: Estoy en el día ${UI.day.innerText} (${UI.phase.innerText}). Mood: "${UI.msg.innerText}" Trátame bien.`;
  window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`);
}

function markPeriodToday() {
  if(confirm("¿Te ha bajado hoy? Resetearé el ciclo al día 1.")) {
      const today = new Date().toISOString().split('T')[0];
      let currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { cycle: 28, phone: "" };
      currentData.date = today;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      calculate(currentData);
      alert("🩸 Ciclo reiniciado. Cuídate.");
  }
}

// --- GESTIÓN DE AJUSTES ---
function saveSettings() {
  const date = UI.inputs.date.value;
  const cycle = UI.inputs.cycle.value;
  const phone = UI.inputs.phone.value;

  if(!date || !cycle || !phone) return alert("Rellena todo, porfi.");

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
  if(confirm("¿Seguro que quieres borrar todos los datos?")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
  }
}