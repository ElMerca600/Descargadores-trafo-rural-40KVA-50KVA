/**
 * @jest-environment jsdom
 */

const { seleccionar, db, justNeutro, justIso } = require('./app');

describe('seleccionar function', () => {
  beforeEach(() => {
    // Set up our document body
    document.body.innerHTML = `
      <select id="isocerauno">
        <option value="">-- Seleccionar --</option>
        <option value="bajo">Bajo (0 – 20 días/año)</option>
        <option value="medio">Medio (20 – 40 días/año)</option>
        <option value="alto">Alto (40 – 60 días/año)</option>
        <option value="muy_alto">Muy Alto (&gt; 60 días/año)</option>
      </select>

      <select id="potencia">
        <option value="">-- Seleccionar --</option>
        <option value="40">40 kVA</option>
        <option value="50">50 kVA</option>
      </select>

      <select id="neutro">
        <option value="">-- Seleccionar --</option>
        <option value="solido">Sólido a tierra</option>
        <option value="impedancia">Impedancia (resistivo o inductivo)</option>
        <option value="aislado">Aislado (sin conexión a tierra)</option>
        <option value="resonante">Resonante (bobina Petersen)</option>
      </select>

      <section class="result-card" id="resultado" style="display:none;">
        <h2>📄 Descargador recomendado</h2>
        <div id="ficha"></div>
        <div class="justificacion" id="justificacion"></div>
      </section>
    `;

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('shows an alert when inputs are missing', () => {
    // Run with default empty inputs
    seleccionar();

    const seccion = document.getElementById("resultado");
    const ficha = document.getElementById("ficha");
    const just = document.getElementById("justificacion");

    expect(seccion.style.display).toBe('block');
    expect(ficha.innerHTML).toContain('⚠ Completá los tres campos antes de continuar.');
    expect(just.innerHTML).toBe('');
  });

  it('populates ficha and justificacion correctly when inputs are valid (bajo, 40, solido)', () => {
    // Set inputs
    document.getElementById("isocerauno").value = "bajo";
    document.getElementById("potencia").value = "40";
    document.getElementById("neutro").value = "solido";

    // Run the function
    seleccionar();

    const seccion = document.getElementById("resultado");
    const ficha = document.getElementById("ficha");
    const just = document.getElementById("justificacion");

    // Check visibility
    expect(seccion.style.display).toBe('block');

    // Check scrollIntoView called
    expect(seccion.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    // Check ficha content
    const d = db["solido"]["bajo"];
    expect(ficha.innerHTML).toContain(d.modelo);
    expect(ficha.innerHTML).toContain(`${d.Uc.toFixed(1)} kV ef`);
    expect(ficha.innerHTML).toContain(`${d.Un} kV ef`);
    expect(ficha.innerHTML).toContain(`${d.Up} kV pico`);
    expect(ficha.innerHTML).toContain(`${d.In} kA pico`);
    expect(ficha.innerHTML).toContain(`${d.Imax} kA pico`);
    expect(ficha.innerHTML).toContain(d.clase);
    expect(ficha.innerHTML).toContain(d.norma);
    expect(ficha.innerHTML).toContain(`Trafo rural 40 kVA · 13,2 kV`);

    // Check justificacion content
    expect(just.innerHTML).toContain(justNeutro["solido"]);
    // JSDOM escapes < and > inside innerHTML
    expect(just.innerHTML).toContain(justIso["bajo"].replace('<', '&lt;').replace('>', '&gt;'));
  });

  it('populates ficha and justificacion correctly when inputs are valid (muy_alto, 50, aislado)', () => {
    // Set inputs
    document.getElementById("isocerauno").value = "muy_alto";
    document.getElementById("potencia").value = "50";
    document.getElementById("neutro").value = "aislado";

    // Run the function
    seleccionar();

    const seccion = document.getElementById("resultado");
    const ficha = document.getElementById("ficha");
    const just = document.getElementById("justificacion");

    // Check visibility
    expect(seccion.style.display).toBe('block');

    // Check scrollIntoView called
    expect(seccion.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    // Check ficha content
    const d = db["aislado"]["muy_alto"];
    expect(ficha.innerHTML).toContain(d.modelo);
    expect(ficha.innerHTML).toContain(`${d.Uc.toFixed(1)} kV ef`);
    expect(ficha.innerHTML).toContain(`${d.Un} kV ef`);
    expect(ficha.innerHTML).toContain(`${d.Up} kV pico`);
    expect(ficha.innerHTML).toContain(`${d.In} kA pico`);
    expect(ficha.innerHTML).toContain(`${d.Imax} kA pico`);
    expect(ficha.innerHTML).toContain(d.clase);
    expect(ficha.innerHTML).toContain(d.norma);
    expect(ficha.innerHTML).toContain(`Trafo rural 50 kVA · 13,2 kV`);

    // Check justificacion content
    expect(just.innerHTML).toContain(justNeutro["aislado"]);
    expect(just.innerHTML).toContain(justIso["muy_alto"].replace('<', '&lt;').replace('>', '&gt;'));
  });
});
