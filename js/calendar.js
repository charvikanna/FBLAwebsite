// Calendar - RSVP & Custom Events with Add/Remove
(function() {
  // hi 
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const RSVP_KEY = 'ffs-rsvps';
  const CUSTOM_KEY = 'ffs-custom-events';

  function buildEvents() {
    const today = new Date();
    const events = [];
    const titles = [
      { t: 'Introduction to Stock Valuation', type: 'tutoring', time: '3:00 PM - 4:00 PM' },
      { t: 'Financial Statements Deep Dive', type: 'workshop', time: '6:00 PM - 7:30 PM' },
      { t: 'Excel for Finance', type: 'tutoring', time: '2:00 PM - 3:00 PM' },
      { t: 'DCF & Valuation Models', type: 'workshop', time: '5:00 PM - 6:30 PM' },
      { t: 'Budgeting Basics Workshop', type: 'workshop', time: '4:00 PM - 5:00 PM' },
      { t: 'Stock Market Fundamentals', type: 'workshop', time: '5:00 PM - 6:00 PM' },
      { t: 'Financial Ratios & Analysis', type: 'tutoring', time: '2:00 PM - 3:00 PM' },
      { t: 'Personal Budgeting 101', type: 'workshop', time: '4:00 PM - 5:00 PM' }
    ];

    let id = 1;
    for (let m=0; m<3; m++) {
      const month = new Date(today.getFullYear(), today.getMonth() + m, 1);
      const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1,0).getDate();
      for (let d=1; d<=daysInMonth; d+=3) {
        if (m===0 && d<today.getDate()) continue;
        const idx = (id-1) % titles.length;
        const dateKey = month.getFullYear()+'-'+String(month.getMonth()+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        events.push({ id: 'e'+id, date: dateKey, title: titles[idx].t, type: titles[idx].type, time: titles[idx].time });
        id++;
      }
    }
    return events;
  }

  const EVENTS = buildEvents();

  // -----------------------------
  // RSVP STORAGE
  // -----------------------------
  function getRsvps() { try { return JSON.parse(localStorage.getItem(RSVP_KEY)||'{}'); } catch { return {}; } }
  function setRsvp(id,value){ const r=getRsvps(); r[id]=!!value; localStorage.setItem(RSVP_KEY,JSON.stringify(r)); }
  function hasRsvp(id){ return !!getRsvps()[id]; }
  function getRsvpedDates(){ const rsvps=getRsvps(); const set=new Set(); EVENTS.forEach(e=>{ if(rsvps[e.id]) set.add(e.date); }); getCustomEvents().forEach(e=>set.add(e.date)); return set; }

  // -----------------------------
  // CUSTOM USER EVENTS
  // -----------------------------
  function getCustomEvents() { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)||'[]'); } catch { return []; } }
  function addCustomEvent(event){ const arr=getCustomEvents(); arr.push(event); localStorage.setItem(CUSTOM_KEY,JSON.stringify(arr)); }
  function removeCustomEvent(id){ const arr=getCustomEvents().filter(e=>e.id!==id); localStorage.setItem(CUSTOM_KEY,JSON.stringify(arr)); }

  // -----------------------------
  // CALENDAR LOGIC
  // -----------------------------
  let currentDate = new Date();

  const gridEl = document.getElementById('calendar-grid');
  const monthEl = document.getElementById('calendar-month');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  const eventsPanel = document.getElementById('calendar-events-panel');
  const eventsTitle = document.getElementById('calendar-events-title');
  const eventsList = document.getElementById('calendar-events-list');
  const sessionsList = document.getElementById('sessions-list');
  const totalUpcomingEl = document.getElementById('schedule-total-upcoming');
  const totalRsvpedEl = document.getElementById('schedule-total-rsvped');
  const totalCustomEl = document.getElementById('schedule-total-custom');
  const fullscreenBtn = document.getElementById('calendar-fullscreen-toggle');
  const calendarWrapper = document.querySelector('.calendar-wrapper');

  if (!gridEl || !monthEl) return;
  function toDateKey(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function toDisplayDate(dateKey) {
    const d = new Date(dateKey + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return dateKey;
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(d);
  }
  function toDisplayTime(timeVal) {
    if (!timeVal) return '';
    if (timeVal.includes(' - ')) return timeVal;
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeVal);
    if (!match) return timeVal;
    const h = Number(match[1]);
    const m = match[2];
    const hour12 = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${hour12}:${m} ${ampm}`;
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const rsvpedDates = getRsvpedDates();
    monthEl.textContent = monthNames[month]+' '+year;

    const firstDay = new Date(year,month,1);
    const daysInMonth = new Date(year,month+1,0).getDate();
    const startPad = firstDay.getDay();
    const todayKey = toDateKey(new Date());
    let html = '';
    for (let i=0;i<7;i++) html += `<div class="calendar-day-header">${dayNames[i]}</div>`;
    for (let i=0;i<startPad;i++) html += `<div class="calendar-day other-month"></div>`;

    for (let d=1; d<=daysInMonth; d++){
      const dateKey = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      let cls = 'calendar-day';
      if(dateKey===todayKey) cls+=' today';
      if(rsvpedDates.has(dateKey)) cls+=' rsvped-day';

      const dayEvents = EVENTS.filter(e=>e.date===dateKey && hasRsvp(e.id))
        .concat(getCustomEvents().filter(e=>e.date===dateKey));

      let eventsHTML='';
      dayEvents.forEach(e=>{ eventsHTML+=`<span class="calendar-day-event ${e.type}">${e.title}</span>`; });

      html+=`<div class="${cls}" data-date="${dateKey}"><div class="calendar-day-number">${d}</div>${eventsHTML}</div>`;
    }

    gridEl.innerHTML=html;
    // Clicking works for RSVPed and custom events
    gridEl.querySelectorAll('.calendar-day').forEach(cell=>{
      cell.addEventListener('click',()=>{ showEventsForDate(cell.getAttribute('data-date')); });
    });
  }

  function showEventsForDate(dateKey) {
    const rsvps = getRsvps();
    const customEvents = getCustomEvents();
  
    // Combine RSVPed events + custom events for this date
    const events = EVENTS.filter(e => e.date === dateKey && rsvps[e.id])
                    .concat(customEvents.filter(e => e.date === dateKey));
  
    if (events.length === 0) {
      eventsPanel.classList.remove('visible');
      return;
    }
  
    const d = new Date(dateKey + 'T12:00:00');
    eventsTitle.textContent =
      monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  
    eventsList.innerHTML = events.map(e => `
      <div class="calendar-event-item" data-id="${e.id}">
        <div>
          <span class="session-type ${e.type}">
            ${e.type === 'tutoring' ? '1-on-1 Tutoring' : e.type==='workshop'?'Workshop':'Group Study'}
          </span>
          <strong>${e.title}</strong>
          <small>${toDisplayTime(e.time || '')}</small>
        </div>
        ${e.type==='custom' ? `<button class="btn btn-danger remove-custom-btn" data-id="${e.id}">Remove</button>` : ''}
      </div>
    `).join('');
  
    // Add remove button functionality
    eventsList.querySelectorAll('.remove-custom-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        removeCustomEvent(id);       // Remove from localStorage
        renderCalendar();            // Update calendar
        renderSessionsList();        // Update list
        showEventsForDate(dateKey);  // Refresh the panel for this date
      });
    });
  
    eventsPanel.classList.add('visible');
  }
  function renderSessionsList(){
    const todayKey = toDateKey(new Date());
    const upcoming = EVENTS.concat(getCustomEvents())
      .filter(e=>e.date>=todayKey)
      .sort((a,b)=>a.date.localeCompare(b.date));

    const rsvpedCount = upcoming.filter(e => e.type !== 'custom' && hasRsvp(e.id)).length;
    const customCount = upcoming.filter(e => e.type === 'custom').length;
    if (totalUpcomingEl) totalUpcomingEl.textContent = String(upcoming.length);
    if (totalRsvpedEl) totalRsvpedEl.textContent = String(rsvpedCount);
    if (totalCustomEl) totalCustomEl.textContent = String(customCount);

    sessionsList.innerHTML = upcoming.map((e, idx)=>{
      const rsvped = e.type!=='custom'?hasRsvp(e.id):true;
      const displayDate = toDisplayDate(e.date);
      const displayTime = toDisplayTime(e.time || '');
      return `
        <div class="session-card" data-id="${e.id||''}" style="animation-delay:${Math.min(idx * 0.03, 0.2)}s;">
          <div>
            <span class="session-type ${e.type}">${e.type==='tutoring'?'1-on-1 Tutoring': e.type==='workshop'?'Workshop':'Group Study'}</span>
            <h4>${e.title}</h4>
            <p class="session-meta">
              <span class="session-date-pill">${displayDate}</span>
              ${displayTime ? `<span class="session-time-text">· ${displayTime}</span>` : ''}
            </p>
          </div>
          ${e.type!=='custom'?`<button class="btn ${rsvped?'rsvped':'btn-primary'}" data-id="${e.id}">${rsvped?'✓ RSVPed':'RSVP'}</button>`:''}
        </div>
      `;
    }).join('');

    sessionsList.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id = btn.getAttribute('data-id');
        setRsvp(id,!hasRsvp(id));
        renderSessionsList();
        renderCalendar();
      });
    });
  }

  // -----------------------------
  // ADD CUSTOM EVENT FORM LOGIC
  // -----------------------------
  const addBtn = document.getElementById('add-custom-event-btn');
  if(addBtn){
    addBtn.addEventListener('click',()=>{
      const titleInput = document.getElementById('custom-event-title');
      const dateInput = document.getElementById('custom-event-date');
      const timeInput = document.getElementById('custom-event-time');

      const title = titleInput.value.trim();
      const date = dateInput.value;
      const time = timeInput.value;

      if(!title || !date) return alert('Please fill in both title and date');

      const event = { id:'custom-'+Date.now(), date:date, title:title, type:'custom', time:time };
      addCustomEvent(event);

      // Clear inputs but keep button
      titleInput.value=''; dateInput.value=''; timeInput.value='';

      renderCalendar();
      renderSessionsList();
    });
  }

  if(prevBtn) prevBtn.addEventListener('click',()=>{ currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); });
  if(nextBtn) nextBtn.addEventListener('click',()=>{ currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); });

  function updateFullscreenButtonLabel() {
    if (!fullscreenBtn) return;
    fullscreenBtn.textContent = document.fullscreenElement ? 'Exit Full Screen' : 'Full Screen';
  }

  if (fullscreenBtn && calendarWrapper && calendarWrapper.requestFullscreen) {
    fullscreenBtn.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await calendarWrapper.requestFullscreen();
        }
      } catch (err) {
        console.error('Fullscreen toggle failed:', err);
      }
      updateFullscreenButtonLabel();
    });

    document.addEventListener('fullscreenchange', updateFullscreenButtonLabel);
    updateFullscreenButtonLabel();
  } else if (fullscreenBtn) {
    fullscreenBtn.style.display = 'none';
  }

  renderCalendar();
  renderSessionsList();

})();
