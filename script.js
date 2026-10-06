(function(){
  "use strict";

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  var burger = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');
  if(burger && links){
    burger.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a:not(.mega-toggle)').forEach(function(a){
      a.addEventListener('click', function(){ links.classList.remove('open'); burger.classList.remove('open'); });
    });

    /* mega menu toggle (accordion on mobile, click-toggle on desktop) */
    var megaToggle = document.getElementById('megaToggle');
    if(megaToggle){
      megaToggle.addEventListener('click', function(ev){
        ev.preventDefault();
        var wrap = megaToggle.closest('.has-mega');
        var open = wrap.classList.toggle('open');
        megaToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  /* ---------- floating contact widget ---------- */
  var fabBtn = document.getElementById('fabBtn');
  var fabWrap = document.getElementById('fabWrap');
  if(fabBtn && fabWrap){
    fabBtn.addEventListener('click', function(ev){
      ev.stopPropagation();
      var open = fabWrap.classList.toggle('open');
      fabBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function(ev){
      if(!fabWrap.contains(ev.target)){ fabWrap.classList.remove('open'); fabBtn.setAttribute('aria-expanded','false'); }
    });
  }

  /* ---------- smooth page transitions ---------- */
  document.querySelectorAll('a[href$=".html"]').forEach(function(a){
    a.addEventListener('click', function(ev){
      var href = a.getAttribute('href');
      if(!href || href.charAt(0) === '#') return;
      ev.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(function(){ window.location.href = href; }, 320);
    });
  });

  /* ---------- scroll progress bar ---------- */
  var prog = document.getElementById('progress');
  function onProg(){
    if(!prog) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onProg, {passive:true}); onProg();

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-scale').forEach(function(el){ io.observe(el); });

  /* ---------- animated counters ---------- */
  function animateCount(el){
    var to = parseFloat(el.getAttribute('data-to'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var t0 = null, dur = 1600;
    function fmt(v){ return dec ? v.toFixed(dec) : Math.round(v).toString(); }
    function step(ts){
      if(!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      el.textContent = fmt(to * e);
      if(p < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
    }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); } });
  }, {threshold:.5});
  document.querySelectorAll('.count').forEach(function(el){ cio.observe(el); });

  /* ---------- seamless ticker: duplicate content ---------- */
  var track = document.getElementById('tickerTrack');
  if(track){ track.innerHTML += track.innerHTML; }

  /* ---------- 3D tilt on cards ---------- */
  var fine = window.matchMedia('(pointer:fine)').matches;
  if(fine){
    document.querySelectorAll('.tilt').forEach(function(card){
      card.addEventListener('mousemove', function(ev){
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x*100)+'%');
        card.style.setProperty('--my', (y*100)+'%');
        card.style.transform = 'perspective(900px) rotateX('+((.5-y)*7).toFixed(2)+'deg) rotateY('+((x-.5)*9).toFixed(2)+'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    });
  }

  /* ---------- subtle parallax ---------- */
  var pEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;
  function parallax(){
    ticking = false;
    var vh = window.innerHeight;
    pEls.forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.bottom < 0 || r.top > vh) return;
      var off = (r.top + r.height/2 - vh/2) / vh; /* -0.5..0.5 */
      el.style.transform = 'translateY(' + (off * -46).toFixed(1) + 'px)';
    });
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(parallax); } }, {passive:true});
  parallax();

  /* ---------- hire form: Supabase + email + WhatsApp ---------- */
  var WA_NUMBER = '919885189951';
  var EMAIL = 'mutthe.aravind@gmail.com';
  var AXON_API = 'https://axon-api-246396716039.us-central1.run.app';
  var RECAPTCHA_KEY = '6LeEg-EtAAAAAP_YI5QwbY2dYINLYWjDSxv48YoL';
  var form = document.getElementById('hireForm');
  if(form){
    var btn = document.getElementById('hireBtn');
    var btnLabel = btn.querySelector('.btn-label');
    var status = document.getElementById('formStatus');

    function showStatus(ok, html){
      status.className = 'form-status ' + (ok ? 'ok' : 'err');
      status.innerHTML = html;
      status.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
    function channelButtons(summary){
      var wa = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(summary);
      var sms = 'sms:+91' + WA_NUMBER.slice(2) + '?&body=' + encodeURIComponent(summary);
      var mail = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Project enquiry — ' + document.getElementById('cf-name').value.trim()) + '&body=' + encodeURIComponent(summary);
      return '<div class="channel-row">' +
        '<a class="ch-btn wa" target="_blank" rel="noopener" href="' + wa + '"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z"/></svg>WhatsApp</a>' +
        '<a class="ch-btn sms" href="' + sms + '"><svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>SMS</a>' +
        '<a class="ch-btn mail" href="' + mail + '"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>Email app</a>' +
        '</div>';
    }

    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var name = document.getElementById('cf-name').value.trim();
      var email = document.getElementById('cf-email').value.trim();
      var phone = document.getElementById('cf-phone').value.trim();
      var budget = document.getElementById('cf-budget').value;
      var msg = document.getElementById('cf-msg').value.trim();

      if(!name || !email || !msg || !/^\S+@\S+\.\S+$/.test(email)){
        showStatus(false, '<strong>Almost there.</strong> Please add your name, a valid email, and a few words about the project.');
        return;
      }

      var summary = 'New project enquiry — aravind-mutte site\n' +
        'Name: ' + name + '\nEmail: ' + email +
        (phone ? '\nPhone: ' + phone : '') +
        (budget ? '\nBudget: ' + budget : '') +
        '\n\n' + msg;

      /* normalize phone to 10-digit Indian mobile for the API (optional field) */
      var digits = phone.replace(/\D/g, '');
      if(digits.length === 12 && digits.indexOf('91') === 0) digits = digits.slice(2);
      if(digits.length === 11 && digits.charAt(0) === '0') digits = digits.slice(1);
      var cleanPhone = /^[6-9]\d{9}$/.test(digits) ? digits : null;

      btn.disabled = true;
      btn.classList.add('loading');
      btnLabel.textContent = 'Sending…';

      /* 1) save to Supabase via the Axon lead API (bot-checked with reCAPTCHA) */
      var apiPromise = new Promise(function(resolve){
        function postLead(token){
          fetch(AXON_API + '/api/leads', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              fullName: name,
              email: email,
              phone: cleanPhone || undefined,
              message: (budget ? 'Budget: ' + budget + '\n\n' : '') + msg,
              source: 'portfolio',
              recaptchaToken: token
            })
          }).then(function(r){ return r.json().then(function(j){ resolve(r.ok && j.ok === true); }); })
            .catch(function(){ resolve(false); });
        }
        if(window.grecaptcha && grecaptcha.enterprise){
          grecaptcha.enterprise.ready(function(){
            grecaptcha.enterprise.execute(RECAPTCHA_KEY, {action: 'lead_submit'})
              .then(postLead, function(){ resolve(false); });
          });
        } else { resolve(false); }
      });

      /* 2) email straight to his inbox (free FormSubmit relay) — instant notify */
      var emailPromise = fetch('https://formsubmit.co/ajax/' + EMAIL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify({
          name: name, email: email, phone: phone, budget: budget, message: msg,
          _subject: 'New project enquiry from ' + name,
          _template: 'table',
          _honey: form.querySelector('[name="_honey"]').value
        })
      }).then(function(){ return true; }).catch(function(){ return false; });

      Promise.all([apiPromise, emailPromise]).then(function(res){
        var apiOk = res[0], emailOk = res[1];
        /* 3) open WhatsApp with the enquiry pre-filled — one tap sends it to him */
        window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(summary), '_blank');
        btn.disabled = false;
        btn.classList.remove('loading');
        btnLabel.textContent = 'Send Enquiry →';
        var bits = [];
        if(apiOk) bits.push('saved');
        if(emailOk) bits.push('emailed to me');
        showStatus(true,
          '<strong>Done!</strong> Your enquiry was ' +
          (bits.length ? bits.join(' and ') : 'received') +
          '. I opened <strong>WhatsApp</strong> with everything pre-filled: just press send there and it lands straight on my phone.' +
          channelButtons(summary) +
          '<div style="margin-top:12px;font-size:13px;opacity:.75">Prefer another way? Use SMS or your email app above.</div>');
        form.reset();
      });
    });
  }
})();
