(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Barra superior con fondo al hacer scroll
  const top = $("#top");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Filtros de categoría
  const chips = $$(".chip");
  const clips = $$(".clip");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    const f = chip.dataset.filter;
    clips.forEach((c) => { c.hidden = !(f === "Todos" || c.dataset.cat === f); });
    $("#track").scrollTo({ left: 0 });
  }));

  // Progreso horizontal de la franja de trabajos
  const track = $("#track"), bar = $("#bar");
  const updateBar = () => {
    const max = track.scrollWidth - track.clientWidth;
    bar.style.width = max > 0 ? (track.scrollLeft / max) * 100 + "%" : "0%";
  };
  track.addEventListener("scroll", updateBar, { passive: true });
  addEventListener("resize", updateBar);
  updateBar();
  // Arrastre con el mouse en escritorio
  let down = false, startX = 0, startLeft = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; startX = e.clientX; startLeft = track.scrollLeft; track.style.scrollSnapType = "none";
  });
  addEventListener("pointerup", () => { if (down) { down = false; track.style.scrollSnapType = ""; } });
  track.addEventListener("pointermove", (e) => {
    if (!down) return;
    track.scrollLeft = startLeft - (e.clientX - startX);
  });

  // Previews: al pasar el cursor (escritorio) o al verse en pantalla (móvil)
  const play = (c) => {
    const v = $("video.preview", c);
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };
  const stop = (c) => {
    const v = $("video.preview", c);
    if (!v) return;
    v.pause();
    v.classList.remove("is-on");
  };
  $$("video.preview").forEach((v) => v.addEventListener("playing", () => v.classList.add("is-on")));
  if (!reduce && fine) {
    clips.forEach((c) => {
      c.addEventListener("mouseenter", () => play(c));
      c.addEventListener("mouseleave", () => stop(c));
    });
  } else if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? play(en.target) : stop(en.target)));
    }, { threshold: 0.6 });
    clips.forEach((c) => io.observe(c));
  }

  // Timecode del visor principal (24 fps, como una línea de tiempo de edición)
  const heroV = $(".hero-video"), tc = $("#tc");
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (t) => {
    const f = Math.floor((t % 1) * 24);
    const s = Math.floor(t);
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}:${pad(f)}`;
  };
  const tick = () => {
    tc.textContent = fmt(heroV.currentTime || 0);
    requestAnimationFrame(tick);
  };
  if (!reduce) requestAnimationFrame(tick); else tc.textContent = fmt(0);

  // Sonido del visor principal (requiere gesto del usuario)
  const soundBtn = $(".sound");
  soundBtn.addEventListener("click", () => {
    heroV.muted = !heroV.muted;
    const on = !heroV.muted;
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.textContent = on ? "Silenciar" : "Sonido";
    if (on) heroV.play().catch(() => {});
  });

  // Modal de video
  const modal = $("#modal"), mv = $("#mv");
  const openVideo = (c) => {
    mv.src = "media/videos/" + c.dataset.id + ".mp4";
    mv.poster = $("img.poster", c).src;
    $("#mcat").textContent = [c.dataset.cat, c.dataset.dur, c.dataset.orient].join(" · ");
    $("#mtitle").textContent = $(".meta b", c).textContent;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    mv.play().catch(() => {});
  };
  clips.forEach((c) => c.addEventListener("click", () => openVideo(c)));

  // Modal de fotos e historias
  const pmodal = $("#pmodal"), pimg = $("#pimg");
  $$(".ph, .story").forEach((b) => b.addEventListener("click", () => {
    pimg.src = $("img", b).src;
    pmodal.hidden = false;
    document.body.style.overflow = "hidden";
  }));

  const closeAll = () => {
    mv.pause(); mv.removeAttribute("src"); mv.load();
    modal.hidden = true; pmodal.hidden = true;
    document.body.style.overflow = "";
  };
  $$(".close").forEach((b) => b.addEventListener("click", closeAll));
  [modal, pmodal].forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) closeAll(); }));
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  $$("#modal a").forEach((a) => a.addEventListener("click", closeAll));
})();
