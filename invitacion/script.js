(() => {
  // Fecha de la boda (zona horaria de Chile)
  const FECHA_BODA = new Date('2027-03-14T17:00:00-03:00');
  const CLAVE_RSVP = 'invitacion-boda-rsvp';

  const sobre = document.getElementById('sobre');
  const abrir = document.getElementById('abrirSobre');
  const invitacion = document.getElementById('invitacion');

  // ---------- Abrir sobre ----------
  function abrirInvitacion() {
    abrir.setAttribute('aria-expanded', 'true');
    sobre.classList.add('is-abierto');
    invitacion.hidden = false;
    setTimeout(() => { sobre.hidden = true; }, 900);
    observarHistoria();
    lanzarConfeti(60);
  }

  abrir.addEventListener('click', abrirInvitacion);

  // Si la invitación ya fue abierta, mostrarla de inmediato sin animación de sobre
  // (esto es solo una comodidad local; no almacena datos personales)
  try {
    if (sessionStorage.getItem('invitacion-abierta') === '1') {
      sobre.hidden = true;
      invitacion.hidden = false;
      observarHistoria();
    }
  } catch (_) { /* storage bloqueado: se muestra el sobre normal */ }

  abrir.addEventListener('click', () => {
    try { sessionStorage.setItem('invitacion-abierta', '1'); } catch (_) {}
  });

  // ---------- Cuenta regresiva ----------
  const celdas = {
    dias: document.querySelector('[data-k="dias"]'),
    horas: document.querySelector('[data-k="horas"]'),
    minutos: document.querySelector('[data-k="minutos"]'),
    segundos: document.querySelector('[data-k="segundos"]'),
  };
  const dosDigitos = (n) => String(n).padStart(2, '0');

  function actualizarCuenta() {
    const diff = Math.max(0, FECHA_BODA - new Date());
    const seg = Math.floor(diff / 1000);
    celdas.dias.textContent = dosDigitos(Math.floor(seg / 86400));
    celdas.horas.textContent = dosDigitos(Math.floor((seg % 86400) / 3600));
    celdas.minutos.textContent = dosDigitos(Math.floor((seg % 3600) / 60));
    celdas.segundos.textContent = dosDigitos(seg % 60);
  }
  actualizarCuenta();
  setInterval(actualizarCuenta, 1000);

  // ---------- Historia: aparece al hacer scroll ----------
  let historiaObservada = false;
  function observarHistoria() {
    if (historiaObservada) return;
    historiaObservada = true;
    const items = document.querySelectorAll('.historia__item');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    items.forEach((el, i) => {
      el.style.transitionDelay = `${i * 150}ms`;
      io.observe(el);
    });
  }

  // ---------- Guardar fecha (archivo .ics) ----------
  document.getElementById('agendar').addEventListener('click', () => {
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const fin = new Date(FECHA_BODA.getTime() + 6 * 3600 * 1000);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Invitacion Boda//ES',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(FECHA_BODA)}`,
      `DTEND:${fmt(fin)}`,
      'SUMMARY:Boda de Camila y Matías',
      'LOCATION:Iglesia San Francisco',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boda-camila-matias.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // ---------- RSVP ----------
  const form = document.getElementById('rsvp');
  const errorEl = document.getElementById('rsvpError');
  const gracias = document.getElementById('gracias');
  const graciasTexto = document.getElementById('graciasTexto');
  const campoPersonas = document.getElementById('campoPersonas');

  // Mostrar número de personas solo si asistirá
  form.addEventListener('change', (e) => {
    if (e.target.name === 'asiste') {
      const asiste = form.asiste.value === 'si';
      campoPersonas.hidden = !asiste;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = new FormData(form);
    const nombre = (datos.get('nombre') || '').toString().trim();
    const asiste = datos.get('asiste');

    if (!nombre) return mostrarError('Por favor escribe tu nombre.');
    if (!asiste) return mostrarError('Cuéntanos si podrás acompañarnos.');
    errorEl.hidden = true;

    const respuesta = {
      nombre,
      asiste: asiste === 'si',
      personas: asiste === 'si' ? Number(datos.get('personas')) : 0,
      alergias: (datos.get('alergias') || '').toString().trim(),
      fecha: new Date().toISOString(),
    };

    // Guardado local de demostración. Para recibir las respuestas de los
    // invitados se necesita un backend (ver README).
    try {
      const previas = JSON.parse(localStorage.getItem(CLAVE_RSVP) || '[]');
      previas.push(respuesta);
      localStorage.setItem(CLAVE_RSVP, JSON.stringify(previas));
    } catch (_) { /* almacenamiento bloqueado: igual mostramos la confirmación */ }

    graciasTexto.textContent = respuesta.asiste
      ? `Nos alegra que nos acompañes, ${nombre}. Te esperamos el 14 de marzo.`
      : `Gracias por avisarnos, ${nombre}. Te echaremos de menos.`;
    form.hidden = true;
    gracias.hidden = false;
    if (respuesta.asiste) lanzarConfeti(90);
  });

  function mostrarError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  // ---------- Confeti ----------
  const colores = ['#8a9a7b', '#d9b3a4', '#f1ebe3', '#c5d1b8', '#e8c9a0'];
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
})();
