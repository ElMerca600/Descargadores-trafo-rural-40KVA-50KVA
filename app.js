// =============================================
//  SurgeSelector 13.2 kV — Lógica de selección
//  Carpeta: A.Documentos Mercadante /
//           37. Aplicaciones /
//           Descargadores de sobretensión /
//  Normas: IEC 60099-4 / IEEE C62.11
//  Sistema: 13,2 kV trifásico, 50 Hz
// =============================================

// ─── Tensión máxima de fase (Um fase-tierra) ─
// Um del sistema = 15 kV → Um fase-tierra = 8,66 kV

// ─── Base de datos de descargadores ──────────
// Uc  = Tensión de servicio continuo (kV ef)
// Un  = Tensión nominal (kV ef)
// Up  = Nivel de protección a impulso tipo rayo (kV pico)
// In  = Corriente nominal de descarga (kA pico)
// Imax= Corriente máxima de descarga (kA pico)
// clase = según IEC 60099-4
// norma = norma de referencia
// modelo = modelo/referencia comercial genérica

const db = {

  // ── SÓLIDO A TIERRA ──────────────────────────────────────────────────
  // COV = 1,0 → Uc mínima ≥ 8,66 kV → se usa 9 kV / Un = 10 kV
  solido: {
    bajo:     { modelo:"ABB PEXLIM P10-XH072 / Raychem RPG-10", Uc:9.0,  Un:10, Up:29, In:5,  Imax:10, clase:"D1",  norma:"IEC 60099-4 / IEEE C62.11" },
    medio:    { modelo:"Siemens 3EP3-550 / Cooper 10PBTM",       Uc:9.0,  Un:10, Up:29, In:10, Imax:20, clase:"C2",  norma:"IEC 60099-4" },
    alto:     { modelo:"Siemens 3EP3-550 / Hubbell OH10D",       Uc:9.0,  Un:10, Up:27, In:10, Imax:20, clase:"C2",  norma:"IEC 60099-4" },
    muy_alto: { modelo:"ABB PEXLIM R10 / Hubbell OH10D Heavy",   Uc:9.0,  Un:10, Up:26, In:20, Imax:40, clase:"C2H", norma:"IEC 60099-4" }
  },

  // ── IMPEDANCIA (resistivo o inductivo) ───────────────────────────────
  // COV = 1,5 → Uc mínima ≥ 13 kV → Un = 15 kV
  impedancia: {
    bajo:     { modelo:"ABB PEXLIM P15-XH096 / Cooper 15PBTM",  Uc:12.7, Un:15, Up:40, In:5,  Imax:10, clase:"D1",  norma:"IEC 60099-4 / IEEE C62.11" },
    medio:    { modelo:"Siemens 3EP3-700 / Raychem RPG-15",      Uc:12.7, Un:15, Up:38, In:10, Imax:20, clase:"C2",  norma:"IEC 60099-4" },
    alto:     { modelo:"Siemens 3EP3-700 / Hubbell OH15D",       Uc:12.7, Un:15, Up:36, In:10, Imax:20, clase:"C2",  norma:"IEC 60099-4" },
    muy_alto: { modelo:"ABB PEXLIM R15 / Hubbell OH15D Heavy",   Uc:12.7, Un:15, Up:34, In:20, Imax:40, clase:"C2H", norma:"IEC 60099-4" }
  },

  // ── AISLADO (sin conexión a tierra) ──────────────────────────────────
  // COV = √3 ≈ 1,73 → Uc mínima ≥ 15 kV → Un = 18 kV
  aislado: {
    bajo:     { modelo:"ABB PEXLIM P18-XH115 / Cooper 18PBTM",  Uc:15.3, Un:18, Up:50, In:5,  Imax:10, clase:"D1",  norma:"IEC 60099-4 / IEEE C62.11" },
    medio:    { modelo:"Siemens 3EP3-840 / Raychem RPG-18",      Uc:15.3, Un:18, Up:47, In:10, Imax:20, clase:"C2",  norma:"IEC 60099-4" },
    alto:     { modelo:"Siemens 3EP3-840 / Hubbell OH18D",       Uc:15.3, Un:18, Up:44, In:10, Imax:20, clase:"C2",  norma:"IEC 60099-4" },
    muy_alto: { modelo:"ABB PEXLIM R18 / Hubbell OH18D Heavy",   Uc:15.3, Un:18, Up:42, In:20, Imax:40, clase:"C2H", norma:"IEC 60099-4" }
  },

  // ── RESONANTE – BOBINA PETERSEN ───────────────────────────────────────
  // COV = 1,73 (igual que aislado) pero con compensación de la corriente capacitiva.
  // Se mantiene Un = 18 kV; se exige Imax más alta por la persistencia del arco.
  resonante: {
    bajo:     { modelo:"ABB PEXLIM P18-XH115 / Cooper 18PBTM",  Uc:15.3, Un:18, Up:50, In:10, Imax:20, clase:"C2",  norma:"IEC 60099-4" },
    medio:    { modelo:"Siemens 3EP3-840 / Raychem RPG-18",      Uc:15.3, Un:18, Up:47, In:10, Imax:20, clase:"C2",  norma:"IEC 60099-4" },
    alto:     { modelo:"ABB PEXLIM R18 / Hubbell OH18D Heavy",   Uc:15.3, Un:18, Up:44, In:20, Imax:40, clase:"C2H", norma:"IEC 60099-4" },
    muy_alto: { modelo:"ABB PEXLIM R18 HD / Hubbell OH18DH",     Uc:15.3, Un:18, Up:42, In:20, Imax:65, clase:"C2H", norma:"IEC 60099-4" }
  }
};

// ─── Justificaciones por tratamiento de neutro ─
const justNeutro = {
  solido:
    "Red con neutro sólido a tierra: la mayor falla monofásica eleva la tensión " +
    "de las otras fases solo al valor nominal de fase (COV ≈ 1,0 p.u.). " +
    "Se emplea Uc ≥ 9 kV y Un = 10 kV, suficiente para garantizar margen de protección " +
    "sin sobredimensionar el descargador.",
  impedancia:
    "Red con neutro aterrado por impedancia: durante una falla monofásica la tensión " +
    "de las fases sanas puede llegar a 1,5 × Uf (COV = 1,5 p.u.). " +
    "Se requiere Uc ≥ 12,7 kV y Un = 15 kV para que el descargador no conduzca " +
    "en régimen normal ni durante la falla.",
  aislado:
    "Red con neutro aislado: en falla monofásica las fases sanas alcanzan la tensión " +
    "de línea (COV = √3 ≈ 1,73 p.u.). Es obligatorio Uc ≥ 15,3 kV y Un = 18 kV. " +
    "La falla puede sostenerse varios segundos antes de ser despejada.",
  resonante:
    "Red con bobina Petersen: similar a neutro aislado en cuanto a sobretensión (COV = √3), " +
    "pero la compensación de la corriente capacitiva permite autoextinguir el arco. " +
    "Aun así, la falla puede persistir; se exige mayor Imax que en el caso aislado " +
    "para soportar eventos repetitivos de recebado del arco."
};

// ─── Justificaciones por nivel isoceráunico ───
const justIso = {
  bajo:     "Zona de baja actividad eléctrica (< 20 días tormenta/año): In = 5 kA pico y clase D1 son suficientes.",
  medio:    "Zona de actividad moderada (20–40 días/año): se adopta In = 10 kA y clase C2 para mayor energía absorbida.",
  alto:     "Zona de alta actividad (40–60 días/año): In = 10 kA, clase C2, con nivel de protección reducido (Up menor).",
  muy_alto: "Zona de actividad extrema (> 60 días/año): In = 20 kA y clase C2H (Heavy Duty) para soportar descargas repetidas de alta energía."
};

// ─── Función principal ─────────────────────────
function seleccionar() {
  const iso     = document.getElementById("isocerauno").value;
  const pot     = document.getElementById("potencia").value;
  const neutro  = document.getElementById("neutro").value;
  const seccion = document.getElementById("resultado");
  const ficha   = document.getElementById("ficha");
  const just    = document.getElementById("justificacion");

  // Validación
  if (!iso || !pot || !neutro) {
    seccion.style.display = "block";
    ficha.innerHTML = `<div class="alerta">⚠ Completá los tres campos antes de continuar.</div>`;
    just.innerHTML  = "";
    return;
  }

  const d = db[neutro][iso];

  // ── Construcción de la ficha ──────────────────
  ficha.innerHTML = `
    <div class="param destacado">
      <div class="label">Modelo / Referencia</div>
      <div class="value">${d.modelo}</div>
    </div>
    <div class="param">
      <div class="label">Uc – Tensión continua de servicio</div>
      <div class="value">${d.Uc.toFixed(1)} kV ef</div>
    </div>
    <div class="param">
      <div class="label">Un – Tensión nominal</div>
      <div class="value">${d.Un} kV ef</div>
    </div>
    <div class="param">
      <div class="label">Up – Nivel de protección (rayo)</div>
      <div class="value">${d.Up} kV pico</div>
    </div>
    <div class="param">
      <div class="label">In – Corriente nominal de descarga</div>
      <div class="value">${d.In} kA pico (8/20 µs)</div>
    </div>
    <div class="param">
      <div class="label">Imax – Corriente máxima de descarga</div>
      <div class="value">${d.Imax} kA pico (8/20 µs)</div>
    </div>
    <div class="param">
      <div class="label">Clase (IEC 60099-4)</div>
      <div class="value">${d.clase}</div>
    </div>
    <div class="param">
      <div class="label">Norma de referencia</div>
      <div class="value">${d.norma}</div>
    </div>
    <div class="param">
      <div class="label">Nivel de Aislación Trafo (BIL)</div>
      <div class="value">95 kV pico (1,2/50 µs)</div>
    </div>
    <div class="param">
      <div class="label">Margen de Protección</div>
      <div class="value">${(((95 - d.Up) / 95) * 100).toFixed(1)} %</div>
    </div>
    <div class="param">
      <div class="label">Aplicación</div>
      <div class="value">Trafo rural ${pot} kVA · 13,2 kV</div>
    </div>
    <div class="param">
      <div class="label">Cantidad requerida</div>
      <div class="value">3 unidades (una por fase)</div>
    </div>
  `;

  // ── Justificación ─────────────────────────────
  just.innerHTML = `
    <strong>📌 Justificación técnica</strong>
    ${justNeutro[neutro]}<br><br>
    ${justIso[iso]}
  `;

  seccion.style.display = "block";
  seccion.scrollIntoView({ behavior: "smooth", block: "start" });

}

if (typeof module !== 'undefined' && module.exports) { module.exports = { seleccionar, db, justNeutro, justIso }; }
