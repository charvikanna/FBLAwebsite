// App-wide utilities - FinanceForStudents

(function() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const isResourcesPage = path === 'resources.html';
  const isLessonPage = /^lesson-\d+-/.test(path);

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
