/**
 * @jest-environment jsdom
 */

const { seleccionar } = require('./app.js');

describe('SurgeSelector Form Validation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <select id="isocerauno">
        <option value="">-- Seleccionar --</option>
        <option value="bajo">Bajo</option>
      </select>
      <select id="potencia">
        <option value="">-- Seleccionar --</option>
        <option value="40">40</option>
      </select>
      <select id="neutro">
        <option value="">-- Seleccionar --</option>
        <option value="solido">Solido</option>
      </select>

      <div id="resultado" style="display:none;">
        <div id="ficha"></div>
        <div id="justificacion"></div>
      </div>
    `;

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should show warning message when form is incomplete', () => {
    // Act
    seleccionar();

    // Assert
    const seccion = document.getElementById('resultado');
    const ficha = document.getElementById('ficha');
    const just = document.getElementById('justificacion');

    expect(seccion.style.display).toBe('block');
    expect(ficha.innerHTML).toContain('Completá los tres campos antes de continuar');
    expect(just.innerHTML).toBe('');
  });

  test('should clear warning message and display results when form is complete', () => {
    // Arrange
    document.getElementById('isocerauno').value = 'bajo';
    document.getElementById('potencia').value = '40';
    document.getElementById('neutro').value = 'solido';

    // Act
    seleccionar();

    // Assert
    const seccion = document.getElementById('resultado');
    const ficha = document.getElementById('ficha');
    const just = document.getElementById('justificacion');

    expect(seccion.style.display).toBe('block');
    expect(ficha.innerHTML).not.toContain('Completá los tres campos antes de continuar');
    expect(ficha.innerHTML).toContain('ABB PEXLIM P10-XH072');
    expect(just.innerHTML).toContain('Justificación técnica');
  });
});
