// Countdown timer with animated SVG circles
(function(){
 
  // dynamic targets: countdown to 76 days from now; live mode begins 1 day after that
  const now = new Date();
  const DAYS = 76; // dynamic length (days from now)
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const targetDate = new Date(now.getTime() + DAYS * MS_PER_DAY);
  const liveStart = new Date(targetDate.getTime() + MS_PER_DAY); // live mode starts 1 day after target

  // expose target text
  const targetText = document.getElementById('target-text');

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

    // Choose mode: countdown, waiting (between target and liveStart), or live (count-up since liveStart)
    if(now < targetDate){
      // Countdown mode to targetDate
      const diff = targetDate - now;
      let rem = diff;
      const days = Math.floor(rem / MS_PER_DAY); rem -= days * MS_PER_DAY;
      const hours = Math.floor(rem / (3600*1000)); rem -= hours * 3600*1000;
      const minutes = Math.floor(rem / (60*1000)); rem -= minutes * 60*1000;
      const seconds = Math.floor(rem / 1000);

      if(targetText) targetText.textContent = 'Countdown to: ' + targetDate.toLocaleString();

      // update numbers
      if(numberEls.days) numberEls.days.textContent = String(days).padStart(2,'0');
      if(numberEls.hours) numberEls.hours.textContent = String(hours).padStart(2,'0');
      if(numberEls.minutes) numberEls.minutes.textContent = String(minutes).padStart(2,'0');
      if(numberEls.seconds) numberEls.seconds.textContent = String(seconds).padStart(2,'0');

      // update progress: days fraction based on DAYS total
      fgCircles.forEach(c=>{
        const unit = c.dataset.unit;
        let fraction = 0;
        if(unit === 'days'){
          fraction = (units.days.max - days) / units.days.max;
        } else if(unit === 'hours'){
          fraction = (units.hours.max - hours) / units.hours.max;
        } else if(unit === 'minutes'){
          fraction = (units.minutes.max - minutes) / units.minutes.max;
        } else if(unit === 'seconds'){
          fraction = (units.seconds.max - seconds) / units.seconds.max;
        }
        fraction = Math.max(0, Math.min(1, fraction));
        const offset = c._circ * (1 - fraction);
        c.style.strokeDashoffset = offset;
      });

    } else if(now >= targetDate && now < liveStart){
      // Waiting period: show countdown to liveStart (1 day after target)
      const diff = liveStart - now;
      let rem = diff;
      const days = Math.floor(rem / MS_PER_DAY); rem -= days * MS_PER_DAY;
      const hours = Math.floor(rem / (3600*1000)); rem -= hours * 3600*1000;
      const minutes = Math.floor(rem / (60*1000)); rem -= minutes * 60*1000;
      const seconds = Math.floor(rem / 1000);

      if(targetText) targetText.textContent = 'Live mode starts: ' + liveStart.toLocaleString();

      if(numberEls.days) numberEls.days.textContent = String(days).padStart(2,'0');
      if(numberEls.hours) numberEls.hours.textContent = String(hours).padStart(2,'0');
      if(numberEls.minutes) numberEls.minutes.textContent = String(minutes).padStart(2,'0');
      if(numberEls.seconds) numberEls.seconds.textContent = String(seconds).padStart(2,'0');

      fgCircles.forEach(c=>{
        const unit = c.dataset.unit;
        let fraction = 0;
        // For this short period, treat days as 1-day max
        if(unit === 'days'){
          fraction = (1 - days) / 1;
        } else if(unit === 'hours'){
          fraction = (24 - hours) / 24;
        } else if(unit === 'minutes'){
          fraction = (60 - minutes) / 60;
        } else if(unit === 'seconds'){
          fraction = (60 - seconds) / 60;
        }
        fraction = Math.max(0, Math.min(1, fraction));
        const offset = c._circ * (1 - fraction);
        c.style.strokeDashoffset = offset;
      });

    } else {
      // Live mode: count up since liveStart
      const diff = now - liveStart; // ms elapsed since liveStart
      let rem = diff;
      const daysElapsed = Math.floor(rem / MS_PER_DAY); rem -= daysElapsed * MS_PER_DAY;
      const hours = Math.floor(rem / (3600*1000)); rem -= hours * 3600*1000;
      const minutes = Math.floor(rem / (60*1000)); rem -= minutes * 60*1000;
      const seconds = Math.floor(rem / 1000); const ms = rem % 1000;

      if(targetText) targetText.textContent = 'Live since: ' + liveStart.toLocaleString();

      if(numberEls.days) numberEls.days.textContent = String(daysElapsed).padStart(2,'0');
      if(numberEls.hours) numberEls.hours.textContent = String(hours).padStart(2,'0');
      if(numberEls.minutes) numberEls.minutes.textContent = String(minutes).padStart(2,'0');
      if(numberEls.seconds) numberEls.seconds.textContent = String(seconds).padStart(2,'0');

      // progress fractions reflect progress through current day/hour/minute/second
      const dayFraction = (hours*3600 + minutes*60 + seconds + ms/1000) / (24*3600);
      const hourFraction = (minutes*60 + seconds + ms/1000) / 3600;
      const minuteFraction = (seconds + ms/1000) / 60;
      const secondFraction = ms / 1000;

      const fractions = {days: dayFraction, hours: hourFraction, minutes: minuteFraction, seconds: secondFraction};

      fgCircles.forEach(c=>{
        const unit = c.dataset.unit;
        const frac = Math.max(0, Math.min(1, fractions[unit] || 0));
        const offset = c._circ * (1 - frac);
        c.style.strokeDashoffset = offset;
      });
    }
  }

  // run update immediately and frequently for smooth progress
  update();
  const timer = setInterval(update, 100);

})();
