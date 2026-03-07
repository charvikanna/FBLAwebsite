// Quiz handlers - Money Minds

(function() {
  const quiz1 = {
    form: 'quiz-form-1',
    result: 'quiz-1-result',
    answers: { quiz1_q1: 'b', quiz1_q2: 'b', quiz1_q3: 'c' }
  };
  const quiz2 = {
    form: 'quiz-form-2',
    result: 'quiz-2-result',
    answers: { quiz2_q1: 'b', quiz2_q2: 'b', quiz2_q3: 'a' }
  };
  const quiz3 = {
    form: 'quiz-form-3',
    result: 'quiz-3-result',
    answers: { quiz3_q1: 'a', quiz3_q2: 'b', quiz3_q3: 'b' }
  };

  function scoreQuiz(config) {
    const form = document.getElementById(config.form);
    const resultEl = document.getElementById(config.result);
    if (!form || !resultEl) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      let correct = 0;
      const total = Object.keys(config.answers).length;
      for (const [name, expected] of Object.entries(config.answers)) {
        const selected = form.querySelector('input[name="' + name + '"]:checked');
        if (selected && selected.value === expected) correct++;
      }
      const pct = Math.round((correct / total) * 100);
      resultEl.textContent = 'Score: ' + correct + '/' + total + ' (' + pct + '%)';
      resultEl.style.color = pct >= 70 ? 'var(--success)' : 'var(--error)';
    });
  }

  scoreQuiz(quiz1);
  scoreQuiz(quiz2);
  scoreQuiz(quiz3);

  // Download resource placeholders (no real files)
  window.downloadResource = function(name) {
    const titles = { 'balance-sheet': 'Balance Sheet Cheat Sheet', 'ratios': 'Financial Ratios Worksheet', 'dcf': 'DCF Model Template' };
    const ext = name === 'balance-sheet' ? 'PDF' : 'Excel';
    alert('In a full implementation, "' + (titles[name] || name) + '" would download as a ' + ext + ' file. For this demo, the content would be generated on the server.');
  };
})();
