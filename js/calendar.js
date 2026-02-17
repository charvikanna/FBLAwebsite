// Calendar - all tutoring & workshop dates, dynamic so they always show
// FinanceForStudents

(function() {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Generate events for current month + next 2 months (always visible)
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
    for (let m = 0; m < 3; m++) {
      const month = new Date(today.getFullYear(), today.getMonth() + m, 1);
      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d += 2) {
        if (m === 0 && d < today.getDate()) continue;
        const idx = (id - 1) % titles.length;
        const dateKey = month.getFullYear() + '-' + String(month.getMonth() + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        events.push({
          id: 'e' + id,
          date: dateKey,
          title: titles[idx].t,
          type: titles[idx].type,
          time: titles[idx].time
        });
        id++;
      }
    }
    return events;
  }

  const EVENTS = buildEvents();
  const RSVP_KEY = 'ffs-rsvps';

  function getRsvps() {
    try { return JSON.parse(localStorage.getItem(RSVP_KEY) || '{}'); } catch (e) { return {}; }
  }
  function setRsvp(id, value) {
    const r = getRsvps(); r[id] = !!value; localStorage.setItem(RSVP_KEY, JSON.stringify(r));
  }
  function hasRsvp(id) { return !!getRsvps()[id]; }

  let currentDate = new Date();
  const gridEl = document.getElementById('calendar-grid');
  const monthEl = document.getElementById('calendar-month');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  const eventsPanel = document.getElementById('calendar-events-panel');
  const eventsTitle = document.getElementById('calendar-events-title');
  const eventsList = document.getElementById('calendar-events-list');

  if (!gridEl || !monthEl) return;

  function toDateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function getEventsByDate(dateKey) {
    return EVENTS.filter(function(e) { return e.date === dateKey; });
  }

  function getDateKeysWithEvents() {
    const s = new Set();
    EVENTS.forEach(function(e) { s.add(e.date); });
    return s;
  }

  function formatEventDate(dateKey) {
    const d = new Date(dateKey + 'T12:00:00');
    return dayNames[d.getDay()] + ', ' + monthNames[d.getMonth()] + ' ' + d.getDate() + ' · ';
  }

  function renderEventItem(evt) {
    const rsvped = hasRsvp(evt.id);
    return '<div class="calendar-event-item" data-id="' + evt.id + '">' +
      '<div><span class="session-type ' + evt.type + '">' + (evt.type === 'tutoring' ? '1-on-1 Tutoring' : 'Workshop') + '</span>' +
      '<strong style="display:block;margin-top:4px;">' + evt.title + '</strong>' +
      '<small style="color:var(--text-muted);">' + evt.time + '</small></div>' +
      '<button class="btn ' + (rsvped ? 'btn-rsvp rsvped' : 'btn-primary btn-rsvp') + '" data-id="' + evt.id + '">' +
      (rsvped ? '✓ RSVPed' : 'RSVP') + '</button></div>';
  }

  function showEventsForDate(dateKey) {
    const events = getEventsByDate(dateKey);
    if (!eventsPanel || !eventsList || !eventsTitle) return;
    if (events.length === 0) { eventsPanel.classList.remove('visible'); return; }
    const d = new Date(dateKey + 'T12:00:00');
    eventsTitle.textContent = 'Events on ' + monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    eventsList.innerHTML = events.map(renderEventItem).join('');
    eventsPanel.classList.add('visible');
    eventsList.querySelectorAll('.btn-rsvp').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        setRsvp(id, !hasRsvp(id));
        showEventsForDate(dateKey);
        updateSessionsList();
      });
    });
  }

  function updateSessionsList() {
    const list = document.getElementById('sessions-list');
    if (!list) return;
    const rsvps = getRsvps();
    list.querySelectorAll('.session-card').forEach(function(card) {
      const btn = card.querySelector('.btn-rsvp-session');
      const id = card.getAttribute('data-event-id');
      if (btn && id && rsvps[id]) {
        btn.textContent = '✓ RSVPed';
        btn.classList.add('rsvped');
        btn.classList.remove('btn-primary');
      }
    });
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateKeysWithEvents = getDateKeysWithEvents();
    monthEl.textContent = monthNames[month] + ' ' + year;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthLast = new Date(year, month, 0);
    const prevDays = prevMonthLast.getDate();
    const today = new Date();
    const todayKey = toDateKey(today);

    let html = '';
    for (let i = 0; i < 7; i++) html += '<div class="calendar-day-header">' + dayNames[i] + '</div>';

    for (let i = 0; i < startPad; i++) {
      const d = prevDays - startPad + i + 1;
      html += '<div class="calendar-day other-month">' + d + '</div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      let cls = 'calendar-day';
      if (dateKey === todayKey) cls += ' today';
      if (dateKeysWithEvents.has(dateKey)) cls += ' has-event';
      html += '<div class="' + cls + '" data-date="' + dateKey + '">' + d + '</div>';
    }

    const totalCells = startPad + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remaining; i++) html += '<div class="calendar-day other-month">' + (i + 1) + '</div>';

    gridEl.innerHTML = html;
    gridEl.querySelectorAll('.calendar-day.has-event').forEach(function(cell) {
      cell.addEventListener('click', function() { showEventsForDate(cell.getAttribute('data-date')); });
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    if (eventsPanel) eventsPanel.classList.remove('visible');
  });
  if (nextBtn) nextBtn.addEventListener('click', function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    if (eventsPanel) eventsPanel.classList.remove('visible');
  });

  renderCalendar();
  updateSessionsList();

  // Populate sessions list from EVENTS (upcoming only, sorted)
  const sessionsList = document.getElementById('sessions-list');
  if (sessionsList) {
    const todayKey = toDateKey(new Date());
    const upcoming = EVENTS.filter(function(e) { return e.date >= todayKey; }).slice(0, 12);
    sessionsList.innerHTML = upcoming.map(function(evt) {
      const rsvped = hasRsvp(evt.id);
      return '<div class="session-card" data-event-id="' + evt.id + '">' +
        '<div><span class="session-type ' + evt.type + '">' + (evt.type === 'tutoring' ? '1-on-1 Tutoring' : 'Workshop') + '</span>' +
        '<h4 style="margin:0.5rem 0;">' + evt.title + '</h4>' +
        '<p class="session-time">' + formatEventDate(evt.date) + evt.time + '</p></div>' +
        '<button class="btn ' + (rsvped ? 'btn-rsvp-session rsvped' : 'btn-primary btn-rsvp-session') + '" style="font-size:0.9rem;" data-event-id="' + evt.id + '">' +
        (rsvped ? '✓ RSVPed' : 'RSVP') + '</button></div>';
    }).join('');

    sessionsList.querySelectorAll('.btn-rsvp-session').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-event-id');
        const r = getRsvps();
        r[id] = !r[id];
        localStorage.setItem(RSVP_KEY, JSON.stringify(r));
        btn.textContent = r[id] ? '✓ RSVPed' : 'RSVP';
        btn.className = r[id] ? 'btn btn-rsvp-session rsvped' : 'btn btn-primary btn-rsvp-session';
      });
    });
  }
})();
