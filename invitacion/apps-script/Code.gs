// Código para Google Apps Script, vinculado a la hoja de cálculo de la boda.
// Pasos: en la hoja, Extensiones > Apps Script > pega este código > guarda.
// Luego: Configuración del proyecto > Propiedades del script > agrega
//   TOKEN_ADMIN = la clave que usarás para entrar al panel.
// Después: Implementar > Nueva implementación > Aplicación web
//   Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario
// Copia la URL que termina en /exec y pégala en ENDPOINT_RSVP
// (en invitacion/script.js y en invitacion/admin.html).

const HOJA = 'Respuestas';

// Invitados: guarda la confirmación que llega desde la invitación.
function doPost(e) {
  const datos = JSON.parse(e.postData.contents);
  obtenerHoja().appendRow([
    new Date(),
    datos.invitado || '',
    datos.nombre || '',
    datos.asiste ? 'Sí' : 'No',
    datos.personas || 0,
    datos.alergias || '',
    datos.mensaje || '',
  ]);
  return respuesta({ ok: true });
}

// Panel privado: devuelve todas las respuestas si la clave es correcta.
function doGet(e) {
  const tokenAdmin = PropertiesService.getScriptProperties().getProperty('TOKEN_ADMIN');
  if (!tokenAdmin || e.parameter.token !== tokenAdmin) {
    return respuesta({ error: 'no autorizado' });
  }
  const filas = obtenerHoja().getDataRange().getValues().slice(1);
  const respuestas = filas.map((f) => ({
    fecha: f[0],
    invitado: f[1],
    nombre: f[2],
    asiste: f[3] === 'Sí',
    personas: Number(f[4]),
    alergias: f[5],
    mensaje: f[6],
  }));
  return respuesta({ respuestas });
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA);
    hoja.appendRow(['Fecha', 'Invitado', 'Nombre', 'Asiste', 'Personas', 'Alergias', 'Mensaje']);
  }
  return hoja;
}

function respuesta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
