(() => {
  // Marca que hay JavaScript: solo entonces se ocultan los bloques antes de revelarlos
  document.documentElement.classList.add('js');

  // ---------- Cuenta regresiva ----------
  // La fecha aún no está confirmada: cambia FECHA_BODA cuando se defina.
  const FECHA_BODA = new Date('2027-03-14T16:00:00-03:00');
  const celdas = {
    dias: document.querySelector('[data-k="dias"]'),
    horas: document.querySelector('[data-k="horas"]'),
    minutos: document.querySelector('[data-k="minutos"]'),
    segundos: document.querySelector('[data-k="segundos"]'),
  };
  const dos = (n) => String(n).padStart(2, '0');

  function actualizarCuenta() {
    const seg = Math.floor(Math.max(0, FECHA_BODA - new Date()) / 1000);
    const valores = {
      dias: dos(Math.floor(seg / 86400)),
      horas: dos(Math.floor((seg % 86400) / 3600)),
      minutos: dos(Math.floor((seg % 3600) / 60)),
      segundos: dos(seg % 60),
    };
    Object.entries(valores).forEach(([k, v]) => {
      if (celdas[k].textContent !== v) {
        celdas[k].textContent = v;
        // Pequeño tic cuando cambia el número
        celdas[k].classList.add('tick');
        setTimeout(() => celdas[k].classList.remove('tick'), 250);
      }
    });
  }
  actualizarCuenta();
  setInterval(actualizarCuenta, 1000);

  // ---------- Revelado al hacer scroll ----------
  const elementos = document.querySelectorAll('.reveal');
  // Los pasos del itinerario entran uno tras otro
  document.querySelectorAll('.itinerario li').forEach((li, i) => li.style.setProperty('--i', i));

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observador.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    elementos.forEach((el) => observador.observe(el));
  } else {
    elementos.forEach((el) => el.classList.add('is-visible'));
  }
})();
