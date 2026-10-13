(() => {
  // ---------- CONFIGURACIÓN: cambia aquí todos los datos ----------
  const CONFIG = {
    novios: 'Camila & Matías',
    fechaBoda: '2027-03-14T17:00:00-03:00',
    fechaTexto: 'Sábado 14 · Marzo 2027',
    vuelo: 'VUELO 2027',
    // Paradas del vuelo, en orden: primero la ceremonia y luego la fiesta
    escalas: [
      {
        nombre: 'Ceremonia',
        hora: '17:00 hrs',
        lugar: 'Iglesia San Francisco',
        mapa: 'https://maps.google.com/?q=Iglesia+San+Francisco',
        foto: 'fotos/ceremonia.jpg',
        frase: 'Aquí nos dijimos que sí, frente a las personas que más queremos.',
      },
      {
        nombre: 'Fiesta',
        hora: '19:00 hrs',
        lugar: 'Viña Los Olivos',
        mapa: 'https://maps.google.com/?q=Viña+Los+Olivos',
        foto: 'fotos/fiesta.jpg',
        frase: 'Y después, a bailar hasta que el vuelo se haga de madrugada.',
      },
    ],
    // Sellos: cada uno es un recuerdo con foto propia en fotos/
    sellos: [
      {
        ciudad: 'Kioto, 2019',
        foto: 'fotos/viaje-1.jpg',
        texto: 'Nos perdimos entre templos y terminamos riéndonos en la misma calle que nunca encontramos.',
        sorpresa: 'Primer sello: la aventura siempre empieza con un "¿y si nos perdemos?".',
      },
      {
        ciudad: 'Patagonia, 2023',
        foto: 'fotos/viaje-2.jpg',
        texto: 'Tres días de viento, cerros y un atardecer que no queríamos que terminara.',
        sorpresa: 'Segundo sello: hay viajes que se miden en silencios cómodos.',
      },
      {
        ciudad: 'Frente al mar, 2026',
        foto: 'fotos/viaje-3.jpg',
        texto: 'Matías le preguntó a Camila al atardecer, y ella dijo que sí antes de que terminara la frase.',
        sorpresa: 'Tercer sello: el viaje que ahora queremos compartir contigo.',
      },
    ],
    // Mensaje secreto al completar todos los sellos
    mensajeSecreto: 'Lo que viene no es una boda sola: es el primer capítulo de un viaje que queremos hacer con ustedes.',
  };

  const CLAVE_RSVP = 'pasaporte-boda-rsvp';
  const CLAVE_SELLOS = 'pasaporte-boda-sellos';

  const $ = (id) => document.getElementById(id);
  const tapa = $('tapa');
  const viaje = $('viaje');
  const abrirBtn = $('abrirPasaporte');
  const inputNombre = $('inputNombre');
  const listaSellos = $('listaSellos');
  const progreso = $('progreso');
  const avion = $('avion');
  const vueloTexto = $('vueloTexto');
  const destinoRevelado = $('destinoRevelado');
  const embarque = $('embarque');
  const tarjeta = $('tarjeta');
  const sorpresa = $('sorpresa');

  // ---------- Estado (solo en este navegador) ----------
  function leer(clave, valorPorDefecto) {
    try { return JSON.parse(localStorage.getItem(clave)) ?? valorPorDefecto; }
    catch (_) { return valorPorDefecto; }
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (_) {}
  }
  let sellados = new Set(leer(CLAVE_SELLOS, []));
  let nombreViajero = '';

  // ---------- Textos base ----------
  const [ceremonia, fiesta] = CONFIG.escalas;
  $('destinoTexto').textContent = CONFIG.escalas.map((e) => e.nombre).join(' → ');
  $('salidaTexto').textContent = CONFIG.fechaTexto;
  $('rutaParada1').textContent = ceremonia.nombre;
  $('rutaParada2').textContent = fiesta.nombre;
  $('tarjetaVuelo').textContent = CONFIG.vuelo;
  $('tarjetaFecha').textContent = CONFIG.fechaTexto;
  $('tarjetaParada1').textContent = `${ceremonia.nombre} · ${ceremonia.hora}`;
  $('tarjetaParada2').textContent = `${fiesta.nombre} · ${fiesta.hora}`;
  $('comoLlegar1').href = ceremonia.mapa;
  $('comoLlegar2').href = fiesta.mapa;

  // ---------- 1. Abrir pasaporte ----------
  abrirBtn.addEventListener('click', () => {
    tapa.classList.add('is-saliendo');
    viaje.hidden = false;
    setTimeout(() => { tapa.hidden = true; }, 900);
    try { sessionStorage.setItem('pasaporte-abierto', '1'); } catch (_) {}
    inputNombre.focus({ preventScroll: true });
  });

  try {
    if (sessionStorage.getItem('pasaporte-abierto') === '1') {
      tapa.hidden = true;
      viaje.hidden = false;
    }
  } catch (_) {}

  // ---------- 2. Nombre del viajero ----------
  inputNombre.addEventListener('input', () => {
    nombreViajero = inputNombre.value.trim();
    $('nombreViajero').textContent = nombreViajero || 'Escribe tu nombre';
    $('tarjetaNombre') && ($('tarjetaNombre').textContent = nombreViajero || '—');
    form.nombre.value = nombreViajero;
  });

  // ---------- 3. Sellos ----------
  function renderSellos() {
    listaSellos.innerHTML = '';
    CONFIG.sellos.forEach((s, i) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'sello';
      boton.dataset.indice = i;
      const estaSellado = sellados.has(i);
      if (estaSellado) boton.classList.add('is-sellado');
      boton.setAttribute('aria-expanded', 'false');
      boton.innerHTML = `
        <span class="sello__foto"><img src="${s.foto}" alt="${s.ciudad}" onerror="this.parentElement.classList.add('sin-foto')"></span>
        <span class="sello__info">
          <small>Sello ${i + 1}</small>
          <strong>${s.ciudad}</strong>
          <span class="sello__texto">${s.texto}</span>
        </span>
        <span class="sello__marca" aria-hidden="true">Sellado</span>`;
      listaSellos.appendChild(boton);
    });
    actualizarProgreso();
  }

  listaSellos.addEventListener('click', (e) => {
    const boton = e.target.closest('.sello');
    if (!boton) return;
    const i = Number(boton.dataset.indice);
    const abierto = boton.classList.toggle('is-abierto');
    boton.setAttribute('aria-expanded', String(abierto));

    if (!sellados.has(i)) {
      sellados.add(i);
      guardar(CLAVE_SELLOS, [...sellados]);
      boton.classList.add('is-sellado');
      boton.classList.add('is-sacudido');
      setTimeout(() => boton.classList.remove('is-sacudido'), 450);
      lanzarConfeti(18);
      actualizarProgreso();
      mostrarSorpresaDeSello(i);
    }
  });

  function mostrarSorpresaDeSello(i) {
    // Un solo mensaje breve; el secreto final aparece al completar todo
    const toast = document.createElement('p');
    toast.className = 'instruccion';
    toast.textContent = CONFIG.sellos[i].sorpresa;
    toast.style.marginTop = '12px';
    listaSellos.after(toast);
    setTimeout(() => toast.remove(), 4200);

    if (sellados.size === CONFIG.sellos.length) {
      setTimeout(() => {
        $('sorpresaTexto').textContent = CONFIG.mensajeSecreto;
        sorpresa.hidden = false;
        lanzarConfeti(90);
        desbloquearVuelo();
      }, 1200);
    }
  }

  function actualizarProgreso() {
    const total = CONFIG.sellos.length;
    const n = sellados.size;
    progreso.textContent = n === total
      ? '¡Pasaporte completo! Ahora despega el vuelo.'
      : `Sellos: ${n} de ${total}`;
    if (n === total) desbloquearVuelo();
  }

  $('cerrarSorpresa').addEventListener('click', () => { sorpresa.hidden = true; });

  // ---------- 4. Vuelo ----------
  let vuelo = { despegado: false, llegado: false };

  function desbloquearVuelo() {
    avion.disabled = false;
    vueloTexto.textContent = 'Toca el avión para despegar.';
  }

  avion.addEventListener('click', () => {
    if (vuelo.despegado) return;
    vuelo.despegado = true;
    avion.disabled = true;
    volarA(0);
  });

  // Vuela a la parada i; al aterrizar muestra su tarjeta y sigue con la siguiente
  function volarA(i) {
    const escala = CONFIG.escalas[i];
    vueloTexto.textContent = `Rumbo a ${escala.nombre}…`;
    avion.classList.add('is-volando');
    avion.style.left = i === 0 ? '50%' : '100%';

    setTimeout(() => {
      avion.classList.remove('is-volando');
      revelarEscala(i);
      if (i + 1 < CONFIG.escalas.length) {
        setTimeout(() => volarA(i + 1), 1200);
      } else {
        avion.classList.add('is-llegado');
        mostrarInvitacion();
      }
    }, 2300);
  }

  function revelarEscala(i) {
    const e = CONFIG.escalas[i];
    vueloTexto.textContent = `¡Llegamos a ${e.nombre}!`;
    const tarjetaEscala = document.createElement('div');
    tarjetaEscala.className = 'destino';
    tarjetaEscala.innerHTML = `
      <div class="destino__foto"><img src="${e.foto}" alt="${e.nombre}" onerror="this.parentElement.classList.add('sin-foto')"></div>
      <p class="destino__frase"><strong>${e.nombre}</strong> · ${e.hora} · ${e.lugar}<br>${e.frase}</p>`;
    destinoRevelado.appendChild(tarjetaEscala);
  }

  function mostrarInvitacion() {
    embarque.hidden = false;
    tarjeta.hidden = true;
    embarque.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- 5. Pregunta final ----------
  function aceptar() {
    tarjeta.hidden = false;
    lanzarConfeti(120);
    $('tarjetaNombre').textContent = nombreViajero || '—';
    form.nombre.value = nombreViajero;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('siQuiero').addEventListener('click', aceptar);
  $('conGusto').addEventListener('click', aceptar);

  // Recordatorio de fecha (.ics)
  $('agendar').addEventListener('click', () => {
    const inicio = new Date(CONFIG.fechaBoda);
    const fin = new Date(inicio.getTime() + 6 * 3600 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pasaporte Boda//ES',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(inicio)}`, `DTEND:${fmt(fin)}`,
      `SUMMARY:Boda de ${CONFIG.novios}`,
      `LOCATION:${ceremonia.lugar}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boda.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // ---------- Cuenta regresiva ----------
  const celdas = {
    dias: document.querySelector('[data-k="dias"]'),
    horas: document.querySelector('[data-k="horas"]'),
    minutos: document.querySelector('[data-k="minutos"]'),
    segundos: document.querySelector('[data-k="segundos"]'),
  };
  const dos = (n) => String(n).padStart(2, '0');
  const fechaBoda = new Date(CONFIG.fechaBoda);
  function actualizarCuenta() {
    const seg = Math.floor(Math.max(0, fechaBoda - new Date()) / 1000);
    celdas.dias.textContent = dos(Math.floor(seg / 86400));
    celdas.horas.textContent = dos(Math.floor((seg % 86400) / 3600));
    celdas.minutos.textContent = dos(Math.floor((seg % 3600) / 60));
    celdas.segundos.textContent = dos(seg % 60);
  }
  actualizarCuenta();
  setInterval(actualizarCuenta, 1000);

  // ---------- RSVP ----------
  const form = $('rsvp');
  const errorEl = $('rsvpError');
  const campoPersonas = $('campoPersonas');

  form.addEventListener('change', (e) => {
    if (e.target.name === 'asiste') campoPersonas.hidden = form.asiste.value !== 'si';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = new FormData(form);
    const nombre = (datos.get('nombre') || '').toString().trim();
    const asiste = datos.get('asiste');
    if (!nombre) return mostrarError('Escribe tu nombre para tu pasaporte.');
    if (!asiste) return mostrarError('Cuéntanos si viajas con nosotros.');
    errorEl.hidden = true;

    const respuesta = {
      nombre,
      asiste: asiste === 'si',
      personas: asiste === 'si' ? Number(datos.get('personas')) : 0,
      alergias: (datos.get('alergias') || '').toString().trim(),
      fecha: new Date().toISOString(),
    };
    // Demostración: se guarda solo en este navegador. Para recibir las
    // respuestas de los invitados se necesita un backend o un servicio de formularios.
    const previas = leer(CLAVE_RSVP, []);
    previas.push(respuesta);
    guardar(CLAVE_RSVP, previas);

    $('graciasTexto').textContent = respuesta.asiste
      ? `Tu lugar está reservado, ${nombre}. Te esperamos en la ceremonia y después en la fiesta.`
      : `Gracias por avisarnos, ${nombre}. Te llevaremos en el recuerdo.`;
    form.hidden = true;
    $('gracias').hidden = false;
    if (respuesta.asiste) lanzarConfeti(90);
  });

  function mostrarError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  // ---------- Confeti ----------
  const colores = ['#c9a45c', '#e8d19a', '#a8432f', '#2e4170', '#f6efe1'];
  function lanzarConfeti(cantidad) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < cantidad; i++) {
      const p = document.createElement('span');
      p.className = 'confeti';
      p.style.left = `${Math.random() * 100}vw`;
      p.style.background = colores[i % colores.length];
      p.style.animationDuration = `${2 + Math.random() * 2}s`;
      p.style.animationDelay = `${Math.random() * 0.4}s`;
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  // ---------- Inicio ----------
  renderSellos();
  // Restaura el estado de los sellos ya sellados (y el vuelo si estaba completo)
  if (sellados.size === CONFIG.sellos.length) desbloquearVuelo();
  else avion.disabled = true;
})();
