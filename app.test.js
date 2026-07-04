/**
 * @jest-environment jsdom
 */

const { seleccionar, db, justNeutro, justIso } = require('./app.js');

describe('SurgeSelector 13.2 kV', () => {
  let isocerauno, potencia, neutro, resultado, ficha, justificacion;

  beforeEach(() => {
    // Set up our document body to mimic index.html
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
        <div id="ficha"></div>
        <div class="justificacion" id="justificacion"></div>
      </section>
    `;

    // Grab elements for assertions
    isocerauno = document.getElementById("isocerauno");
    potencia = document.getElementById("potencia");
    neutro = document.getElementById("neutro");
    resultado = document.getElementById("resultado");
    ficha = document.getElementById("ficha");
    justificacion = document.getElementById("justificacion");

    // Mock scrollIntoView, which is not implemented in JSDOM
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Shows a warning when inputs are missing', () => {
    // Simulate user clicking "Seleccionar descargador" without filling the form
    seleccionar();

    // Verify warning is shown
    expect(resultado.style.display).toBe('block');
    expect(ficha.innerHTML).toContain('Completá los tres campos antes de continuar');
    expect(justificacion.innerHTML).toBe('');

    // scrollIntoView should not have been called because function returned early
    expect(window.HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  test('Populates the ficha and justificacion correctly with valid inputs', () => {
    // Simulate valid inputs
    isocerauno.value = 'bajo';
    potencia.value = '40';
    neutro.value = 'solido';

    // Call the function
    seleccionar();

    // Verify UI is visible
    expect(resultado.style.display).toBe('block');

    // Verify correct model string is present in ficha
    expect(ficha.innerHTML).toContain('ABB PEXLIM P10-XH072 / Raychem RPG-10');
    // Verify Un value
    expect(ficha.innerHTML).toContain('9.0 kV ef'); // Note: it displays toFixed(1)
    expect(ficha.innerHTML).toContain('10 kV ef');

    // Verify justificacion is properly populated
    expect(justificacion.textContent).toContain(justNeutro.solido);
    expect(justificacion.textContent).toContain(justIso.bajo);

    // Verify scrollIntoView was called
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });

  test('Correctly handles an edge case (aislado, muy_alto)', () => {
    // Simulate edge case inputs
    isocerauno.value = 'muy_alto';
    potencia.value = '50';
    neutro.value = 'aislado';

    // Call the function
    seleccionar();

    // Verify model and Un
    expect(ficha.innerHTML).toContain('ABB PEXLIM R18 / Hubbell OH18D Heavy');
    expect(ficha.innerHTML).toContain('15.3 kV ef');
    expect(ficha.innerHTML).toContain('18 kV ef');

    // Verify justificacion
    expect(justificacion.textContent).toContain(justNeutro.aislado);
    expect(justificacion.textContent).toContain(justIso.muy_alto);
  });
});
