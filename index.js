// Countdown timer with animated SVG circles
(function(){
  // By default target is 7 days from now; change `targetDate` if you want a specific date
  const now = new Date();
  const defaultTarget = new Date(now.getTime() + 76*24*60*60*1000);
  let targetDate = defaultTarget;

  // expose target text
  const targetText = document.getElementById('target-text');
  if(targetText){
    targetText.textContent = targetDate.toLocaleString();
  }

  const units = {
    days: {secs: 24*3600, max:null},
    hours: {secs: 3600, max:24},
    minutes: {secs: 60, max:60},
    seconds: {secs: 1, max:60}
  };

  // initial total days used to compute day fraction so it smoothly animates
  const initialTotalMs = targetDate - Date.now();
  const initialTotalDays = Math.max(1, Math.ceil(initialTotalMs / (24*3600*1000)));
  units.days.max = initialTotalDays;

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

    const days = Math.floor(diff / (24*3600*1000));
    diff -= days * 24*3600*1000;
    const hours = Math.floor(diff / (3600*1000));
    diff -= hours*3600*1000;
    const minutes = Math.floor(diff / (60*1000));
    diff -= minutes*60*1000;
    const seconds = Math.floor(diff / 1000);

    const values = {days,hours,minutes,seconds};

    // update numbers
    Object.keys(values).forEach(k=>{
      if(numberEls[k]) numberEls[k].textContent = String(values[k]).padStart(2,'0');
    });

    // update progress circles
    fgCircles.forEach(c=>{
      const unit = c.dataset.unit;
      const v = values[unit];
      const max = units[unit].max;
      let fraction = 0;
      if(unit === 'days'){
        fraction = (units.days.max - v) / units.days.max; // show elapsed of total days
      } else {
        fraction = (max - v) / max;
      }
      fraction = Math.max(0, Math.min(1, fraction));
      const offset = c._circ * (1 - fraction);
      c.style.strokeDashoffset = offset;
    });

    // if finished, stop
    if(targetDate - now <= 0){
      clearInterval(timer);
      // final set to zero
      Object.keys(values).forEach(k=>{ if(numberEls[k]) numberEls[k].textContent='00';});
    }
  }

  // run update immediately
  update();
  const timer = setInterval(update, 250);

})();
