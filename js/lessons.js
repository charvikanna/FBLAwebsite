// Lesson config & progress - Money Minds

window.LESSONS = [
  { id: 1, title: 'Financial Statements', url: 'lesson-1-financial-statements.html' },
  { id: 2, title: 'Time Value of Money', url: 'lesson-2-time-value.html' },
  { id: 3, title: 'Budgeting & Saving', url: 'lesson-3-budgeting.html' },
  { id: 4, title: 'Credit & Debt Management', url: 'lesson-4-credit-debt.html' },
  { id: 5, title: 'Investing Basics', url: 'lesson-5-investing.html' },
  { id: 6, title: 'Stock Valuation Methods', url: 'lesson-6-stock-valuation.html' }
];

const STORAGE_KEY = 'financeForStudents_lessonProgress';
const QUIZ_SCORES_KEY = 'financeForStudents_quizScores';

function getProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { completed: [], lastLesson: null };
  } catch {
    return { completed: [], lastLesson: null };
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

window.LessonProgress = {
  getCompleted: function() {
    return getProgress().completed;
  },

  isCompleted: function(lessonId) {
    return getProgress().completed.includes(lessonId);
  },

  markComplete: function(lessonId) {
    const p = getProgress();
    if (!p.completed.includes(lessonId)) {
      p.completed.push(lessonId);
      p.completed.sort((a, b) => a - b);
      p.lastLesson = lessonId;
      saveProgress(p);
    }
  },

  getLastLesson: function() {
    return getProgress().lastLesson;
  },

  getCompletedCount: function() {
    return getProgress().completed.length;
  },

  isUnlocked: function(lessonId) {
    if (lessonId === 1) return true;
    return this.isCompleted(lessonId - 1);
  },

  getNextLesson: function() {
    const completed = this.getCompleted();
    for (let i = 1; i <= LESSONS.length; i++) {
      if (!completed.includes(i)) return i;
    }
    return null;
  },

  saveQuizScore: function(lessonId, score) {
    try {
      const data = JSON.parse(localStorage.getItem(QUIZ_SCORES_KEY) || '{}');
      data['lesson' + lessonId] = score;
      localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(data));
    } catch (e) {}
  },

  getQuizScores: function() {
    try {
      return JSON.parse(localStorage.getItem(QUIZ_SCORES_KEY) || '{}');
    } catch {
      return {};
    }
  },

  getAverageQuizScore: function() {
    const scores = this.getQuizScores();
    const vals = Object.values(scores).filter(function(n) { return typeof n === 'number'; });
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
};

// Populate Resources dropdown
(function() {
  function initDropdown() {
    const menu = document.getElementById('resources-dropdown-menu');
    if (!menu) return;

    const completed = LessonProgress.getCompleted();

    menu.innerHTML = LESSONS.map(function(l) {
      const done = completed.includes(l.id);
      const status = done ? '<span class="lesson-status">✓ Done</span>' : '';
      return '<a href="' + l.url + '">Lesson ' + l.id + ': ' + l.title + status + '</a>';
    }).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdown);
  } else {
    initDropdown();
  }
})();
