// Rendi landing v2 — reveal on scroll
(function(){
  const els = Array.from(document.querySelectorAll('.reveal'));
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('isVisible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('isVisible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => io.observe(el));
})();

(function(){
  const progressBar = document.getElementById('scrollProgressBar');
  if(!progressBar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
})();

/* ===========================
   RENDI iMAC FILM (stepper)
   =========================== */
(() => {
  const films = document.querySelectorAll('[data-rendi-film]');
  if (!films.length) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nf = new Intl.NumberFormat('nl-NL');

  function eur(n){
    const sign = n < 0 ? '−' : '';
    const abs = Math.abs(Math.round(n));
    return `€ ${sign}${nf.format(abs)}`;
  }

  function setActiveNav(ui, step){
    ui.querySelectorAll('[data-nav]').forEach(el => {
      const idx = Number(el.getAttribute('data-nav'));
      el.classList.toggle('is-active', idx === step);
    });
  }

  function setPanel(ui, step){
    ui.setAttribute('data-step', String(step));
    setActiveNav(ui, step);
  }

  function setStatus(ui, key, text){
    const el = ui.querySelector(`[data-status="${key}"]`);
    if (el) el.textContent = text;
  }

  function setProgress(ui, key, pct){
    const el = ui.querySelector(`[data-progress="${key}"]`);
    if (!el) return;
    el.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }

  function setMetric(ui, key, value){
    const el = ui.querySelector(`[data-metric="${key}"]`);
    if (el) el.textContent = value;
  }

  function animateCountCells(ui){
    const cells = ui.querySelectorAll('[data-count][data-val]');
    const duration = 780;
    const t0 = performance.now();

    // store targets once per run
    const targets = Array.from(cells).map(el => ({
      el,
      target: Number(el.getAttribute('data-val')) || 0
    }));

    function tick(now){
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);

      for (const c of targets){
        const v = c.target * eased;
        c.el.textContent = eur(v);
      }
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function moveCursor(ui, xPct, yPct, click = false){
    const cur = ui.querySelector('.rendiCursor');
    if (!cur) return;

    cur.style.left = `${xPct}%`;
    cur.style.top = `${yPct}%`;

    if (click){
      cur.classList.add('is-click');
      window.setTimeout(() => cur.classList.remove('is-click'), 140);
    }
  }

  function runFilm(root){
    const ui = root.querySelector('.rendiUI');
    if (!ui) return;

    if (prefersReduced){
      // Static “best” frame: Toerekening
      setPanel(ui, 2);
      setMetric(ui, 'result', eur(35480));
      setMetric(ui, 'taxable', eur(33680));
      setMetric(ui, 'tax', eur(12124));
      setProgress(ui, 'import', 100);
      setProgress(ui, 'export', 100);
      setStatus(ui, 'import', 'Gereed');
      setStatus(ui, 'export', 'Gereed');
      return;
    }

    let step = 0;
    let timer = null;
    let running = false;

    const steps = [
      {
        id: 0,
        ms: 2600,
        enter(){
          setPanel(ui, 0);
          moveCursor(ui, 36, 46, true);

          setProgress(ui, 'import', 0);
          setStatus(ui, 'import', 'Importeren…');

          setMetric(ui, 'result', '—');
          setMetric(ui, 'taxable', '—');
          setMetric(ui, 'tax', '—');

          // restart progress cleanly
          requestAnimationFrame(() => {
            setProgress(ui, 'import', 100);
          });

          window.setTimeout(() => setStatus(ui, 'import', 'Parsing velden…'), 540);
          window.setTimeout(() => setStatus(ui, 'import', 'Velden gemapt'), 1450);
          window.setTimeout(() => setStatus(ui, 'import', 'Gereed'), 2250);
        }
      },
      {
        id: 1,
        ms: 3200,
        enter(){
          setPanel(ui, 1);
          moveCursor(ui, 62, 42, true);

          // summary starts showing meaningful numbers
          setMetric(ui, 'result', eur(35480));
          setMetric(ui, 'taxable', eur(33680));
          setMetric(ui, 'tax', eur(12124));
        }
      },
      {
        id: 2,
        ms: 3400,
        enter(){
          setPanel(ui, 2);
          moveCursor(ui, 58, 62, true);
          animateCountCells(ui);

          // keep summary stable
          setMetric(ui, 'result', eur(35480));
          setMetric(ui, 'taxable', eur(33680));
          setMetric(ui, 'tax', eur(12124));
        }
      },
      {
        id: 3,
        ms: 3000,
        enter(){
          setPanel(ui, 3);
          moveCursor(ui, 37, 63, true);

          setMetric(ui, 'result', eur(35480));
          setMetric(ui, 'taxable', eur(33680));
          setMetric(ui, 'tax', eur(12124));
        }
      },
      {
        id: 4,
        ms: 2800,
        enter(){
          setPanel(ui, 4);
          moveCursor(ui, 74, 47, true);

          setProgress(ui, 'export', 0);
          setStatus(ui, 'export', 'Genereren…');

          requestAnimationFrame(() => {
            setProgress(ui, 'export', 100);
          });

          window.setTimeout(() => setStatus(ui, 'export', 'Export gereed'), 2200);

          setMetric(ui, 'result', eur(35480));
          setMetric(ui, 'taxable', eur(33680));
          setMetric(ui, 'tax', eur(12124));
        }
      }
    ];

    function next(){
      const s = steps[step % steps.length];
      s.enter();

      timer = window.setTimeout(() => {
        step = (step + 1) % steps.length;
        next();
      }, s.ms);
    }

    function start(){
      if (running) return;
      running = true;
      step = 0;
      next();
    }

    function stop(){
      running = false;
      if (timer) window.clearTimeout(timer);
      timer = null;
    }

    // Start when in view (smoother on scroll pages)
    const io = new IntersectionObserver((entries) => {
      for (const e of entries){
        if (e.isIntersecting){
          start();
        } else {
          stop();
        }
      }
    }, { threshold: 0.35 });

    io.observe(root);
  }

  films.forEach(runFilm);
})();
