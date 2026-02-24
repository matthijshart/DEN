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