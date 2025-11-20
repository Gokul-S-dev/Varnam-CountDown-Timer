// Countdown timer with animated SVG circles
(function(){
 
  // Simple countdown: start now, countdown for 76 days
  const DAYS = 76;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const STORAGE_KEY = 'countdownTarget';

  // Persistent target date: read from localStorage or create on first load
  let targetDate;
  (function initTarget(){
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved){
      const parsed = new Date(saved);
      if(!isNaN(parsed)){
        targetDate = parsed;
      } else {
        targetDate = new Date(Date.now() + DAYS * MS_PER_DAY);
        localStorage.setItem(STORAGE_KEY, targetDate.toISOString());
      }
    } else {
      targetDate = new Date(Date.now() + DAYS * MS_PER_DAY);
      localStorage.setItem(STORAGE_KEY, targetDate.toISOString());
    }
  })();

  const targetText = document.getElementById('target-text');
  if(targetText) targetText.textContent = targetDate.toLocaleString();

  const units = {
    days: {secs: 24*3600, max: DAYS},
    hours: {secs: 3600, max:24},
    minutes: {secs: 60, max:60},
    seconds: {secs: 1, max:60}
  };

  // prepare circles
  const fgCircles = Array.from(document.querySelectorAll('.fg'));
  const numberEls = {};
  Array.from(document.querySelectorAll('[data-value]')).forEach(el=>{
    numberEls[el.dataset.value] = el;
  });

  // compute circumference
  fgCircles.forEach(c=>{
    const r = c.getAttribute('r');
    const circumference = 2*Math.PI* r;
    c.style.strokeDasharray = circumference;
    c.style.strokeDashoffset = circumference;
    c._circ = circumference;
  });

  function update(){
    const now = new Date();
    let diff = Math.max(0, targetDate - now);

    const days = Math.floor(diff / MS_PER_DAY); diff -= days * MS_PER_DAY;
    const hours = Math.floor(diff / (3600*1000)); diff -= hours * 3600*1000;
    const minutes = Math.floor(diff / (60*1000)); diff -= minutes * 60*1000;
    const seconds = Math.floor(diff / 1000);

    if(targetText) targetText.textContent = 'Target: ' + targetDate.toLocaleString();

    if(numberEls.days) numberEls.days.textContent = String(days).padStart(2,'0');
    if(numberEls.hours) numberEls.hours.textContent = String(hours).padStart(2,'0');
    if(numberEls.minutes) numberEls.minutes.textContent = String(minutes).padStart(2,'0');
    if(numberEls.seconds) numberEls.seconds.textContent = String(seconds).padStart(2,'0');

    // update progress circles using units.max
    fgCircles.forEach(c=>{
      const unit = c.dataset.unit;
      let v = 0, max = 1;
      if(unit === 'days'){ v = days; max = units.days.max; }
      else if(unit === 'hours'){ v = hours; max = units.hours.max; }
      else if(unit === 'minutes'){ v = minutes; max = units.minutes.max; }
      else if(unit === 'seconds'){ v = seconds; max = units.seconds.max; }
      const fraction = Math.max(0, Math.min(1, (max - v) / max));
      const offset = c._circ * (1 - fraction);
      c.style.strokeDashoffset = offset;
    });

    // stop when finished
    if(targetDate - now <= 0){
      clearInterval(timer);
    }
  }

  // run update immediately and every 500ms for sync
  update();
  let timer = setInterval(update, 500);

// initial cracker/firework blast: create particles and a bright center, then remove
(function(){
  try{
    const overlay = document.getElementById('blast-overlay');
    if(!overlay) return;

    // mark blasting state so we can hide non-timer UI
    document.documentElement.classList.add('blasting');

    // bright center
    const center = document.createElement('div');
    center.className = 'blast-center';
    overlay.appendChild(center);

    // create particle pieces - more particles and some spark variants for cracker-like effect
    const particleCount = 44;
    for(let i=0;i<particleCount;i++){
      const p = document.createElement('div');
      p.className = 'blast-particle';
      // decide if this is a spark (bigger, longer)
      const isSpark = Math.random() > 0.72;
      if(isSpark) p.classList.add('spark');

      // random angle and distance (sparks go farther)
      const angle = Math.round(Math.random()*360);
      const dist = (isSpark ? 220 + Math.round(Math.random()*360) : 120 + Math.round(Math.random()*260));
      p.style.setProperty('--angle', angle + 'deg');
      p.style.setProperty('--dist', dist + 'px');

      // random size and color tint
      const size = (isSpark ? 8 + Math.round(Math.random()*24) : 5 + Math.round(Math.random()*10));
      p.style.width = size + 'px'; p.style.height = size + 'px';

      // color tint using HSL hue spread for rainbow pieces
      const hue = Math.round(Math.random()*360);
      const light = isSpark ? '88%' : '92%';
      const baseColor = `hsl(${hue} 100% ${light})`;
      // set CSS var for trail and fallback background
      p.style.setProperty('--trail-color', `hsla(${hue},100%,${isSpark?70:78}%,0.95)`);
      p.style.background = `radial-gradient(circle, ${baseColor} 0%, hsl(${hue} 90% 65%) 30%, transparent 60%)`;

      const dur = isSpark ? (900 + Math.round(Math.random()*1400)) : (600 + Math.round(Math.random()*800));
      p.style.animationDuration = dur + 'ms';
      p.style.animationDelay = (Math.random()*160) + 'ms';
      overlay.appendChild(p);
    }

    // fade overlay after the burst and clear blasting state when done
    setTimeout(()=>{
      overlay.classList.add('blast-fade');
    }, 1100);
    // remove from DOM a little later and remove blasting class so rest of UI returns
    setTimeout(()=>{
      if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.documentElement.classList.remove('blasting');
    }, 2300);
  }catch(e){console.error(e)}
})();

})();
