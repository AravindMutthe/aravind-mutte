/* Shared interactions: nav, hamburger, reveal on scroll, counters, contact form */
(function(){
  var nav = document.getElementById('nav');
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  var ham = document.getElementById('hamburger'), links = document.getElementById('navLinks');
  if(ham && links){
    ham.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ links.classList.remove('open'); ham.classList.remove('open'); });
    });
  }

  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.1, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; cio.unobserve(e.target);
      var el = e.target, to = parseFloat(el.dataset.to),
          dec = parseInt(el.dataset.dec || '0', 10), t0 = null, dur = 1400;
      function tick(t){
        if(!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3), v = to * ease;
        el.textContent = dec ? v.toFixed(dec) : Math.round(v).toString();
        if(p < 1) requestAnimationFrame(tick); else el.textContent = dec ? to.toFixed(dec) : to.toString();
      }
      requestAnimationFrame(tick);
    });
  }, {threshold:.5});
  document.querySelectorAll('.count').forEach(function(el){ cio.observe(el); });

  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var n = document.getElementById('cf-name').value.trim(),
          em = document.getElementById('cf-email').value.trim(),
          s = document.getElementById('cf-subject').value.trim() || 'Website inquiry',
          m = document.getElementById('cf-msg').value.trim();
      var body = encodeURIComponent('Name: ' + n + '\nEmail: ' + em + '\n\n' + m);
      window.location.href = 'mailto:mutthe.aravind@gmail.com?subject='
        + encodeURIComponent('[Website] ' + s) + '&body=' + body;
    });
  }
})();
