// Lesson step navigation - Content → Activity → Video → Quiz
(function() {
  const STEP_NAMES = ['Content', 'Activity', 'Video', 'Quiz'];
  const TOTAL_STEPS = 4;

  window.LessonSteps = {
    init: function(config) {
      this.lessonId = config.lessonId;
      this.nextLessonUrl = config.nextLessonUrl;
      this.nextLessonTitle = config.nextLessonTitle;
      this.isLastLesson = config.isLastLesson;
      this.isLocked = config.isLocked || false;

      const container = document.getElementById('lesson-steps-container');
      if (!container) return;

      const panels = container.querySelectorAll('[data-step]');
      const navEl = document.getElementById('lesson-step-nav');
      const indicatorEl = document.getElementById('lesson-step-indicator');

      let currentStep = 0;

      function showStep(n) {
        currentStep = n;
        panels.forEach(function(p, i) {
          p.style.display = i === n ? 'block' : 'none';
        });
        if (indicatorEl) indicatorEl.textContent = (n + 1) + ' / ' + TOTAL_STEPS + ': ' + STEP_NAMES[n];
        updateButtons();
      }

      function updateButtons() {
        const backBtn = document.getElementById('lesson-back-btn');
        const nextBtn = document.getElementById('lesson-next-btn');
        if (backBtn) backBtn.style.visibility = currentStep > 0 ? 'visible' : 'hidden';
        if (nextBtn) {
          nextBtn.textContent = currentStep === TOTAL_STEPS - 1 ? 'Go to Quiz' : 'Next';
          nextBtn.style.display = currentStep < TOTAL_STEPS - 1 ? 'inline-flex' : 'none';
        }
      }

      const backBtn = document.getElementById('lesson-back-btn');
      const nextBtn = document.getElementById('lesson-next-btn');
      if (backBtn) backBtn.onclick = function() { if (currentStep > 0) showStep(currentStep - 1); };
      if (nextBtn) nextBtn.onclick = function() {
        if (currentStep < TOTAL_STEPS - 1) showStep(currentStep + 1);
      };

      showStep(0);
    },

    showCompletionModal: function() {
      const nextNum = this.lessonId + 1;
      const msg = this.isLastLesson
        ? 'Congratulations on completing all 6 lessons! You\'ve finished the Financial Literacy course.'
        : 'Congratulations on completing Lesson ' + this.lessonId + '! You have now unlocked Lesson ' + nextNum + ': ' + (this.nextLessonTitle || '') + '.';
      const btnText = this.isLastLesson ? 'View Dashboard' : 'Continue to Lesson ' + nextNum;
      const btnHref = this.isLastLesson ? 'dashboard.html' : this.nextLessonUrl;

      const overlay = document.createElement('div');
      overlay.className = 'lesson-modal-overlay';
      overlay.innerHTML =
        '<div class="lesson-modal">' +
        '<h2>🎉 Lesson Complete!</h2>' +
        '<p>' + msg + '</p>' +
        '<a href="' + btnHref + '" class="btn btn-primary">' + btnText + '</a>' +
        '</div>';
      overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
      overlay.querySelector('.lesson-modal').onclick = function(e) { e.stopPropagation(); };
      document.body.appendChild(overlay);
    }
  };
})();
