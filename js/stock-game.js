// Stock Market Game - $10,000 simulation + portfolio graph
// FinanceForStudents

(function() {
  const INITIAL_CASH = 10000;

  const stocks = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: 185.50, change: 0.02 },
    { ticker: 'GOOGL', name: 'Alphabet (Google)', price: 142.30, change: -0.01 },
    { ticker: 'MSFT', name: 'Microsoft', price: 415.20, change: 0.015 },
    { ticker: 'AMZN', name: 'Amazon', price: 178.90, change: -0.008 },
    { ticker: 'NVDA', name: 'NVIDIA', price: 875.00, change: 0.03 },
    { ticker: 'TSLA', name: 'Tesla', price: 248.50, change: -0.02 }
  ];

  let cash = INITIAL_CASH;
  const holdings = {};
  const portfolioHistory = [INITIAL_CASH];
  let chart = null;

  function formatMoney(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function updatePrices() {
    stocks.forEach(function(s) {
      const r = (Math.random() - 0.48) * 0.04;
      s.price = Math.max(1, s.price * (1 + r));
      s.change = r;
    });
  }

  function portfolioValue() {
    let val = cash;
    for (const ticker of Object.keys(holdings)) {
      const s = stocks.find(function(x) { return x.ticker === ticker; });
      if (s) val += holdings[ticker] * s.price;
    }
    return val;
  }

  function recordPortfolioValue() {
    portfolioHistory.push(portfolioValue());
    if (portfolioHistory.length > 30) portfolioHistory.shift();
  }

  function initChart() {
    const ctx = document.getElementById('portfolio-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    const labels = portfolioHistory.map(function(_, i) { return (i + 1).toString(); });

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Portfolio Value ($)',
          data: portfolioHistory,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(v) { return '$' + v.toLocaleString(); }
            }
          }
        }
      }
    });
  }

  function updateChart() {
    recordPortfolioValue();
    if (chart) {
      const labels = portfolioHistory.map(function(_, i) { return (i + 1).toString(); });
      chart.data.labels = labels;
      chart.data.datasets[0].data = portfolioHistory;
      chart.update('none');
    }
  }

  function renderMarket() {
    const list = document.getElementById('market-list');
    if (!list) return;
    list.innerHTML = stocks.map(function(s) {
      const pct = (s.change * 100).toFixed(2);
      const cls = s.change >= 0 ? 'positive' : 'negative';
      return '<li><span class="stock-ticker">' + s.ticker + '</span> <span class="stock-price">' + formatMoney(s.price) + '</span> <span class="stock-change ' + cls + '">' + (s.change >= 0 ? '+' : '') + pct + '%</span></li>';
    }).join('');
  }

  function renderHoldings() {
    const list = document.getElementById('holdings-list');
    if (!list) return;
    const entries = Object.entries(holdings).filter(function([_, q]) { return q > 0; });
    if (entries.length === 0) {
      list.innerHTML = '<li style="color: var(--text-muted);">No positions yet. Buy stocks below!</li>';
      return;
    }
    list.innerHTML = entries.map(function([ticker, qty]) {
      const s = stocks.find(function(x) { return x.ticker === ticker; });
      if (!s) return '';
      const val = qty * s.price;
      return '<li><span class="stock-ticker">' + ticker + '</span> ' + qty + ' @ ' + formatMoney(s.price) + ' = ' + formatMoney(val) + '</li>';
    }).join('');
  }

  function renderBalance() {
    const valEl = document.getElementById('portfolio-value');
    const cashEl = document.getElementById('cash-balance');
    if (valEl) {
      const val = portfolioValue();
      valEl.textContent = formatMoney(val);
      valEl.className = 'stock-balance' + (val < INITIAL_CASH ? ' negative' : '');
    }
    if (cashEl) cashEl.textContent = formatMoney(cash);
  }

  function initTradeForm() {
    const form = document.getElementById('trade-form');
    const tickerSelect = document.getElementById('trade-ticker');
    const actionSelect = document.getElementById('trade-action');
    const sharesInput = document.getElementById('trade-shares');
    const previewEl = document.getElementById('trade-preview');

    if (!form || !tickerSelect) return;

    tickerSelect.innerHTML = '<option value="">Select stock</option>' + stocks.map(function(s) {
      return '<option value="' + s.ticker + '">' + s.ticker + ' - ' + s.name + '</option>';
    }).join('');

    function updatePreview() {
      const ticker = tickerSelect.value;
      const shares = parseInt(sharesInput.value, 10) || 0;
      const action = actionSelect.value;
      const s = stocks.find(function(x) { return x.ticker === ticker; });
      if (!ticker || !s || shares <= 0) {
        if (previewEl) previewEl.textContent = '';
        return;
      }
      const cost = shares * s.price;
      if (action === 'buy') {
        previewEl.textContent = 'Cost: ' + formatMoney(cost) + (cost > cash ? ' (insufficient funds)' : '');
      } else {
        const owned = holdings[ticker] || 0;
        previewEl.textContent = 'You own ' + owned + ' shares. Proceeds: ' + formatMoney(cost);
      }
    }

    tickerSelect.addEventListener('change', updatePreview);
    actionSelect.addEventListener('change', updatePreview);
    sharesInput.addEventListener('input', updatePreview);

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const ticker = tickerSelect.value;
      const shares = parseInt(sharesInput.value, 10);
      const action = actionSelect.value;
      const s = stocks.find(function(x) { return x.ticker === ticker; });
      if (!ticker || !s || shares <= 0) return;

      if (action === 'buy') {
        const cost = shares * s.price;
        if (cost > cash) { alert('Insufficient funds.'); return; }
        cash -= cost;
        holdings[ticker] = (holdings[ticker] || 0) + shares;
      } else {
        const owned = holdings[ticker] || 0;
        if (shares > owned) { alert("You don't have that many shares."); return; }
        cash += shares * s.price;
        holdings[ticker] = owned - shares;
        if (holdings[ticker] <= 0) delete holdings[ticker];
      }

      renderHoldings();
      renderBalance();
      updateChart();
      sharesInput.value = '';
      if (previewEl) previewEl.textContent = '';
    });
  }

  function tick() {
    updatePrices();
    renderMarket();
    renderHoldings();
    renderBalance();
    updateChart();
  }

  renderMarket();
  renderHoldings();
  renderBalance();
  initChart();
  initTradeForm();

  setInterval(tick, 5000);
})();
