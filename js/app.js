/**
 * SPIRIXTOTAL 2.0 — APP.JS (V4)
 * Motor Multi-Disciplina Completo (10 disciplinas oficiales), Cotizador y Modales
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Catálogo Completo de Disciplinas (Basado estrictamente en sportsRegistry.js)
  const disciplineData = {
    itf: {
      title: "Taekwon-Do ITF (Unión)",
      desc: "Reglamentación internacional con evaluación por criterios de Exactitud Técnica (40%), Ritmo (30%) y Potencia (30%). En combate: rounds de 2 minutos con tiempo médico centralizado y desempate automático.",
      specs: [
        "1 Punto: Puño al cuerpo o cabeza / Patada al cuerpo",
        "2 Puntos: Patada a la cabeza / Puño saltando",
        "3 Puntos: Patada saltando a la cabeza / Giro aéreo",
        "Formas / Tules por criterios o banderas 1vs1 oficial"
      ],
      preset: { rounds: "2 Rounds de 2:00 min", areas: "Hasta 12 Áreas", jueces: "4 o 5 Jueces + Mesa", formato: "Criterios / Banderas" }
    },
    citi: {
      title: "Taekwondo ITF (Weller / Citi)",
      desc: "Sistema oficial de Formas y Combate basado en escala 10.0 con deducciones precisas de faltas menores (-0.2) y faltas graves de estabilidad (-0.5).",
      specs: [
        "Base 10.0 con tabulación electrónica automática",
        "Deducciones instantáneas de precisión técnica (-0.2 / -0.5)",
        "Combate continuo con advertencias y puntos de descuento",
        "Cálculo de promedio y desempate de jueces"
      ],
      preset: { rounds: "1 Round de 2:00 min", areas: "Hasta 8 Áreas", jueces: "3 o 5 Jueces", formato: "Deducciones Base 10" }
    },
    tradicional: {
      title: "Taekwon-Do ITF Tradicional (Chang Hon)",
      desc: "Reglamento clásico Chang Hon con puntuación diferenciada por patadas voladoras y giros complejos, y evaluación de Tules por banderas directas.",
      specs: [
        "1 Pt Puño • 2 Pts Patada • 3 Pts Cabeza o Salto Cuerpo",
        "4 Pts Patada saltando a la cabeza • 5 Pts Giro salto a la cabeza",
        "Sistema de banderas directas azul/roja para formas",
        "Gam-jeom con deducción directa de punto"
      ],
      preset: { rounds: "2 Rounds de 2:00 min", areas: "Hasta 10 Tatamis", jueces: "4 Jueces de Esquina", formato: "Banderas Directas" }
    },
    wt: {
      title: "World Taekwondo (WT / Olímpico)",
      desc: "Formato olímpico al mejor de 3 rounds (Best of 3). Puntuación para peto y cabeza con bonificación por giros técnicos, y sistema de Gam-jeom que otorga punto al rival.",
      specs: [
        "Peto: 1 pt Puño, 2 pts Patada, 4 pts Giro",
        "Cabeza: 3 pts Patada, 5 pts Giro a la cabeza",
        "Gam-jeom otorga automáticamente +1 punto al oponente",
        "Poomsae WT con deducciones de 0.1 y 0.3 sobre base 10.0"
      ],
      preset: { rounds: "Mejor de 3 Rounds (2:00)", areas: "Hasta 12 Áreas", jueces: "3 Jueces + Árbitro Central", formato: "Best of 3 WT" }
    },
    kombat: {
      title: "Kombat Taekwondo (Pro / Full Contact)",
      desc: "Circuito profesional de combate total: asaltos intensos, puntuación de derribos, golpes en el suelo, control de conteos de protección y reloj de asalto sincronizado a TV.",
      specs: [
        "Puntuación en tiempo real para combate de pie y suelo",
        "Control de conteos de protección de 10 segundos",
        "Soporte de transmisión con reloj de asalto sincronizado a TV",
        "Evaluación Round por Round profesional (10-9)"
      ],
      preset: { rounds: "3 Asaltos de 3:00 min", areas: "Jaula o Ring Central", jueces: "3 Jueces Evaluadores", formato: "Round x Round 10-9" }
    },
    karate: {
      title: "Karate WKF (Kumite & Kata)",
      desc: "Kumite deportivo oficial con esquemas de Yuko (1 pt), Waza-Ari (2 pts) e Ippon (3 pts), control de Senshu (primer punto sin réplica), penalizaciones C1/C2 y Kata técnico.",
      specs: [
        "Yuko (1 Pt) • Waza-Ari (2 Pts) • Ippon (3 Pts)",
        "Senshu automático (ventaja de primer punto)",
        "Diferencia de 8 puntos (Mercy Rule) con parada inmediata",
        "Kata WKF: 70% Desempeño Técnico + 30% Desempeño Atlético"
      ],
      preset: { rounds: "1 Round de 3:00 min", areas: "Hasta 8 Tatamis", jueces: "4 Jueces + Árbitro", formato: "Senshu Activo" }
    },
    point: {
      title: "Point Fighting (Stop Match)",
      desc: "Combate al punto de alta velocidad con interrupción inmediata tras cada impacto válido. Registro de consenso mayoritario de jueces de esquina.",
      specs: [
        "Parada inmediata tras impacto confirmado",
        "Consenso mayoritario de jueces en pantalla",
        "Diferencia máxima de 10 puntos con victoria anticipada",
        "Formas musicales y creativas con puntuación abierta"
      ],
      preset: { rounds: "2 Rounds de 2:00 min", areas: "Hasta 10 Áreas", jueces: "3 Jueces de Puntuación", formato: "Stop Match" }
    },
    kickboxing: {
      title: "Kickboxing & Deportes de Ring",
      desc: "Modalidades de Point Fighting, Light Contact, Kick Light y Full Contact con tabulación continua de impactos válidos y control de advertencias.",
      specs: [
        "Puños y Low Kicks (1 pt) • Patadas medias/rodilla (2 pts)",
        "Patadas a la cabeza (3 pts)",
        "Cómputo continuo de impactos sin interrupción",
        "Control de salidas de área y amonestaciones"
      ],
      preset: { rounds: "3 Asaltos de 2:00 min", areas: "Ring o Tatami", jueces: "3 Jueces Laterales", formato: "Continuo / Rounds" }
    },
    judo: {
      title: "Judo & Brazilian Jiu-Jitsu (BJJ)",
      desc: "Cronometraje de suelo, control de inmovilizaciones (Osaekomi / Tatami Time), tabulación de Ippon / Waza-Ari y gestión de Golden Score / sumisiones.",
      specs: [
        "Control de tiempo de inmovilización en suelo",
        "Puntos por derribos, pasajes de guardia y montadas",
        "Golden Score (tiempo extra sin límite)",
        "Cálculo de penalizaciones por pasividad"
      ],
      preset: { rounds: "1 Asalto de 4:00 o 5:00 min", areas: "Hasta 8 Zonas", jueces: "Mesa + Árbitro", formato: "Ippon / Ventajas" }
    },
    custom: {
      title: "Usted lo propone, Spirix lo Crea (100% Configurable)",
      desc: "El corazón de SpirixTotal es su motor universal: si su federación o copa privada utiliza un reglamento propio, tiempos especiales o escalas de puntos únicas, SpirixTotal se programa a su medida exacta.",
      specs: [
        "Defina tiempos de combate, descansos y tiempos médicos a gusto",
        "Configure el valor de cada técnica (1 a 10 puntos por botón)",
        "Establezca esquemas de penalización personalizados",
        "Personalice logotipos de su federación en todas las pantallas"
      ],
      preset: { rounds: "Totalmente Personalizable", areas: "De 1 a 12 Áreas", jueces: "Configurable de 2 a 5", formato: "Su Reglamento Propio" }
    }
  };

  const tabButtons = document.querySelectorAll('.tab-btn');
  const detailsBox = document.getElementById('discipline-details-box');
  const presetBox = document.getElementById('discipline-preset-box');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const disc = btn.getAttribute('data-discipline');
      renderDiscipline(disc);
    });
  });

  function renderDiscipline(key) {
    const data = disciplineData[key];
    if (!data || !detailsBox || !presetBox) return;

    detailsBox.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.desc}</p>
      <ul class="discipline-specs-list">
        ${data.specs.map(s => `<li><span class="spec-icon">✓</span>${s}</li>`).join('')}
      </ul>
    `;

    presetBox.innerHTML = `
      <div class="preset-title">Configuración Automática en SpirixTotal</div>
      <div class="preset-features-grid">
        <div class="preset-feature-item">
          <h5>Duración Asaltos</h5>
          <p>${data.preset.rounds}</p>
        </div>
        <div class="preset-feature-item">
          <h5>Capacidad Simultánea</h5>
          <p>${data.preset.areas}</p>
        </div>
        <div class="preset-feature-item">
          <h5>Panel de Jueces</h5>
          <p>${data.preset.jueces}</p>
        </div>
        <div class="preset-feature-item">
          <h5>Modalidad Voto</h5>
          <p>${data.preset.formato}</p>
        </div>
      </div>
    `;
  }

  // 2. Cotizador Interactivo para Organizadores
  const sliderAreas = document.getElementById('calc-areas-slider');
  const badgeAreas = document.getElementById('calc-areas-val');
  const selectModality = document.getElementById('calc-modality');
  const selectDays = document.getElementById('calc-days');
  const btnEmail = document.getElementById('btn-email-quote');
  
  function updateEmailLink() {
    if (!sliderAreas || !btnEmail) return;
    const areas = sliderAreas.value;
    if (badgeAreas) badgeAreas.textContent = areas;

    const mod = selectModality ? selectModality.value : 'Combate y Formas';
    const days = selectDays ? selectDays.value : '1 D\u00eda';

    const msg = `Hola SpirixTotal,%0A%0AEstoy organizando un torneo y deseo solicitar datos y presupuesto para mi evento con los siguientes requerimientos:%0A%0A` +
                `- \u00c1reas de Tatami simult\u00e1neas: ${areas}%0A` +
                `- Disciplina/Modalidad: ${mod}%0A` +
                `- Duraci\u00f3n estimada: ${days}%0A%0A` +
                `\u00bfPodr\u00edan brindarme informaci\u00f3n y disponibilidad de licencias? Muchas gracias.`;

    btnEmail.href = `mailto:spirixtotal@gmail.com?subject=Solicitud de Datos y Presupuesto&body=${msg}`;
  }

  if (sliderAreas) {
    sliderAreas.addEventListener('input', updateEmailLink);
  }
  if (selectModality) {
    selectModality.addEventListener('change', updateEmailLink);
  }
  if (selectDays) {
    selectDays.addEventListener('change', updateEmailLink);
  }
  updateEmailLink();

  // 3. Menú Móvil
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      navMenu.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '80px';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = 'rgba(5, 8, 17, 0.98)';
        navMenu.style.padding = '24px';
        navMenu.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      }
    });
  }

  // 4. Header Scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(5, 8, 17, 0.96)';
      header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.7)';
    } else {
      header.style.background = 'rgba(5, 8, 17, 0.88)';
      header.style.boxShadow = 'none';
    }
  });

  // Modal informativo para acceso a SpirixCloud
  window.openCloudModal = function(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('cloud-access-modal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeCloudModal = function() {
    const modal = document.getElementById('cloud-access-modal');
    if (modal) modal.style.display = 'none';
  };
});

// Mobile Navigation Toggle
function toggleNav() {
  const menu = document.querySelector('.nav-menu');
  menu.classList.toggle('active');
}