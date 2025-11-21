// --- FRASES CHONI-ZEN (PAZ PERO DIVA) ---
const PHRASES = {
  period: [
      "🩸 Detox emocional. Hoy sofá, mascarilla y que el mundo espere.",
      "✨ Alineando chakras desde la cama. No molestar.",
      "🧘‍♀️ Fluyendo con la marea roja. Tráeme chocolate y nadie saldrá herido.",
      "🚫 Cerrado por limpieza de aura. Vuelva usted mañana."
  ],
  follicular: [
      "🦋 Saliendo del capullo. Hoy te sientes bichota.",
      "💅 Manifestando abundancia y pelazo. Estás radiante.",
      "✨ Energía de Diosa Suprema. Sube esa selfie ya.",
      "🔋 Batería social al 100%. A brillar, mi ciela."
  ],
  ovulation: [
      "🔥 Fertilidad a tope. Eres un imán de atracción masiva.",
      "👶 Universo fértil. Cuidado con lo que deseas (y con lo que haces).",
      "🐆 Estás magnética. Hoy consigues lo que quieras.",
      "💋 Labios rojos y ovarios trabajando. Precaución, amiga."
  ],
  luteal: [
      "⛈️ Mercurio retrógrado en mi útero. Paciencia conmigo.",
      "🔮 Intución a tope y aguante bajo cero. No me pruebes.",
      "🍫 Necesito mimos o un atraco a la pastelería.",
      "💣 Fase sensible. Si lloras es normal, si gritas también."
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

// CLAVE ÚNICA PARA GUARDAR DATOS
const STORAGE_KEY = 'pinkyApp_v1';

window.onload = () => {
  console.log("Iniciando App...");
  
  // Intentar cargar datos
  const data = localStorage.getItem(STORAGE_KEY);
  
  if(data) {
      console.log("Datos encontrados:", data);
      calculate(JSON.parse(data));
  } else {
      console.log("No hay datos. Abriendo ajustes.");
      openSettings();
  }
};

function calculate(data) {
  const last = new Date(data.date);
  const today = new Date();
  
  // Validar fecha
  if(isNaN(last.getTime())) {
      alert("Error en la fecha. Por favor configura de nuevo.");
      openSettings();
      return;
  }

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
  else { phase = "SPM / Dramas 🔮"; key = "luteal"; }

  UI.phase.innerText = phase;
  const list = PHRASES[key];
  UI.msg.innerText = list[Math.floor(Math.random() * list.length)];
}

// --- FUNCIONES DE GUARDADO ROBUSTO ---

function saveSettings() {
  const date = UI.inputs.date.value;
  const cycle = UI.inputs.cycle.value;
  const phone = UI.inputs.phone.value;

  if(!date || !cycle || !phone) {
      alert("¡Reina! Tienes que rellenar todo para que funcione la magia.");
      return;
  }

  const userData = { date, cycle, phone };
  
  // Guardar en LocalStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  
  alert("✅ ¡Datos guardados! Tu ciclo está bajo control.");
  closeSettings();
  calculate(userData);
}

function openSettings() { 
  UI.panel.classList.add('active');
  
  // Al abrir, rellenamos los inputs con lo que ya había (para que no parezca que se borró)
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) {
      const data = JSON.parse(saved);
      UI.inputs.date.value = data.date;
      UI.inputs.cycle.value = data.cycle;
      UI.inputs.phone.value = data.phone;
  }
}

function closeSettings() { 
  // Solo dejamos cerrar si ya hay datos guardados
  if(localStorage.getItem(STORAGE_KEY)) {
      UI.panel.classList.remove('active'); 
  } else {
      alert("Guarda primero, porfa.");
  }
}

function markPeriodToday() {
  if(confirm("¿Te ha bajado hoy? Vamos a resetear el ciclo al Día 1.")) {
      const today = new Date().toISOString().split('T')[0];
      
      // Recuperar datos viejos para no perder el teléfono
      let currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { cycle: 28, phone: "" };
      
      currentData.date = today; // Actualizamos fecha
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      calculate(currentData);
      alert("🩸 Ciclo reiniciado. Cuídate mucho hoy.");
  }
}

function notifyBoyfriend() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if(!saved) return alert("Configura los ajustes primero.");
  
  const data = JSON.parse(saved);
  const text = `💖 Hola. Update de mi ciclo:\nEstoy en el día ${UI.day.innerText} (${UI.phase.innerText}).\nMood: "${UI.msg.innerText}"\n\nTrátame como a una reina. Besis.`;
  
  window.open(`https://wa.me/${data.phone}?text=${encodeURIComponent(text)}`);
}