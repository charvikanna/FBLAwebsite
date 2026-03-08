// App-wide utilities - Money Minds

(function() {
  const TOKEN_KEY = 'ffs_jwt_token';
  window.localStorage.removeItem('ffs_theme');
  document.documentElement.setAttribute('data-theme', 'light');
  window.AppTheme = {
    get: function() { return 'light'; },
    set: function() {}
  };

  const params = new URLSearchParams(window.location.search);
  const tokenFromQuery = params.get('token');

  // Persist OAuth token no matter which page receives the callback.
  if (tokenFromQuery) {
    window.localStorage.setItem(TOKEN_KEY, tokenFromQuery);
    params.delete('token');
    const cleanQuery = params.toString();
    const cleanUrl = window.location.pathname + (cleanQuery ? '?' + cleanQuery : '');
    window.history.replaceState({}, document.title, cleanUrl);

    // Normalize post-OAuth landing to profile.
    const current = window.location.pathname.split('/').pop() || 'index.html';
    if (current !== 'profile.html') {
      window.location.href = 'profile.html';
      return;
    }
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  const isResourcesPage = path === 'resources.html';
  const isLessonPage = /^lesson-\d+-/.test(path);
  const token = window.localStorage.getItem(TOKEN_KEY);

  // Toggle auth nav label globally.
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    const href = a.getAttribute('href') || '';
    if (href === 'profile.html' || href === 'login.html') {
      a.setAttribute('href', token ? 'profile.html' : 'login.html');
      a.textContent = token ? 'My Account' : 'Login';
    }
  });

  // Active nav link
  document.querySelectorAll('.nav-links a:not(.nav-dropdown-trigger)').forEach(function(a) {
    const href = a.getAttribute('href') || '';
    const isActive = (href === path || (path === '' && href === 'index.html')) && !isResourcesPage && !isLessonPage;
    a.classList.toggle('active', !!isActive);
  });

  // Resources dropdown trigger active when on resources or any lesson
  const trigger = document.querySelector('.nav-dropdown-trigger');
  if (trigger) {
    trigger.classList.toggle('active', isResourcesPage || isLessonPage);
  }
})();
