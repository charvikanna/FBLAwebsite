// Advanced Stock Market Simulator - Money Minds
(function() {
  const INITIAL_CASH = 10000;
  const TICK_MS = 2500;
  const STORAGE_KEY = 'ffs_trading_state_v2';
  const RANGE_POINTS = { '1D': 24, '1W': 72, '1M': 144, '1Y': 252 };

  const STOCKS = [
    { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Tech', price: 189.25, drift: 0.00035, volatility: 0.011 },
    { ticker: 'MSFT', name: 'Microsoft', sector: 'Tech', price: 418.1, drift: 0.0003, volatility: 0.0105 },
    { ticker: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors', price: 902.45, drift: 0.00055, volatility: 0.017 },
    { ticker: 'AMZN', name: 'Amazon', sector: 'E-Commerce', price: 183.5, drift: 0.00028, volatility: 0.0125 },
    { ticker: 'GOOGL', name: 'Alphabet', sector: 'Tech', price: 149.35, drift: 0.00031, volatility: 0.0108 },
    { ticker: 'TSLA', name: 'Tesla', sector: 'Auto', price: 261.2, drift: 0.0004, volatility: 0.018 }
  ];

  const achievementDefinitions = [
    { id: 'first_trade', title: 'First Trade', description: 'Execute your first order.' },
    { id: 'diversified', title: 'Diversified', description: 'Hold at least 3 tickers.' },
    { id: 'green_portfolio', title: 'In The Green', description: 'Reach +5% total return.' },
    { id: 'active_trader', title: 'Active Trader', description: 'Complete 10 trades.' },
    { id: 'long_game', title: 'Long Game', description: 'Complete 40 market ticks.' }
  ];

  const leaderboardSeed = [
    { name: 'Avery Capital', returnPct: 0.164 },
    { name: 'Northstar Alpha', returnPct: 0.113 },
    { name: 'Quant Sparrow', returnPct: 0.092 },
    { name: 'BlueBelt Macro', returnPct: 0.051 }
  ];

  const state = {
    cash: INITIAL_CASH,
    holdings: {},
    transactions: [],
    achievements: {},
    portfolioHistory: [],
    priceHistory: {},
    market: {},
    tick: 0,
    selectedRange: '1D',
    selectedTicker: 'AAPL'
  };

  let priceChart = null;
  let allocationChart = null;

  const elements = {
    marketStatus: document.getElementById('market-status'),
    marketBody: document.querySelector('#market-table tbody'),
    tradeForm: document.getElementById('trade-form'),
    tradeTicker: document.getElementById('trade-ticker'),
    tradeAction: document.getElementById('trade-action'),
    tradeShares: document.getElementById('trade-shares'),
    tradePreview: document.getElementById('trade-preview'),
    chartTicker: document.getElementById('chart-ticker'),
    chartTitle: document.getElementById('price-chart-title'),
    portfolioValue: document.getElementById('portfolio-value'),
    cashBalance: document.getElementById('cash-balance'),
    totalPl: document.getElementById('total-pl'),
    totalPlPct: document.getElementById('total-pl-percent'),
    holdingsList: document.getElementById('holdings-list'),
    transactionsBody: document.querySelector('#transactions-table tbody'),
    leaderboardBody: document.querySelector('#leaderboard-table tbody'),
    achievementGrid: document.getElementById('achievement-grid'),
    loading: document.getElementById('trading-loading'),
    resetBtn: document.getElementById('reset-game-btn')
  };

  if (!elements.tradeForm || typeof Chart === 'undefined') return;

  function formatMoney(value) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatPct(value) {
    const prefix = value >= 0 ? '+' : '';
    return prefix + (value * 100).toFixed(2) + '%';
  }

  function formatDate(ts) {
    const date = new Date(ts);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function randomNormal() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function seedFromStocks() {
    STOCKS.forEach(function(stock) {
      state.market[stock.ticker] = {
        name: stock.name,
        sector: stock.sector,
        price: stock.price,
        change: 0,
        drift: stock.drift,
        volatility: stock.volatility
      };
      const history = [];
      let p = stock.price;
      for (let i = 0; i < RANGE_POINTS['1Y']; i++) {
        const shock = randomNormal() * stock.volatility * 0.4 + stock.drift;
        p = Math.max(8, p * (1 + shock));
        history.push(p);
      }
      state.priceHistory[stock.ticker] = history;
    });
  }

  function createInitialState() {
    state.cash = INITIAL_CASH;
    state.holdings = {};
    state.transactions = [];
    state.achievements = {};
    state.portfolioHistory = [];
    state.priceHistory = {};
    state.market = {};
    state.tick = 0;
    state.selectedRange = '1D';
    state.selectedTicker = STOCKS[0].ticker;
    seedFromStocks();
    state.portfolioHistory.push(INITIAL_CASH);
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      createInitialState();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      createInitialState();
      state.cash = typeof parsed.cash === 'number' ? parsed.cash : INITIAL_CASH;
      state.holdings = parsed.holdings || {};
      state.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
      state.achievements = parsed.achievements || {};
      state.portfolioHistory = Array.isArray(parsed.portfolioHistory) && parsed.portfolioHistory.length
        ? parsed.portfolioHistory
        : [INITIAL_CASH];
      state.priceHistory = parsed.priceHistory && Object.keys(parsed.priceHistory).length
        ? parsed.priceHistory
        : state.priceHistory;
      state.market = parsed.market && Object.keys(parsed.market).length ? parsed.market : state.market;
      state.tick = typeof parsed.tick === 'number' ? parsed.tick : 0;
      state.selectedRange = parsed.selectedRange || '1D';
      state.selectedTicker = parsed.selectedTicker || STOCKS[0].ticker;
    } catch (_) {
      createInitialState();
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cash: state.cash,
        holdings: state.holdings,
        transactions: state.transactions,
        achievements: state.achievements,
        portfolioHistory: state.portfolioHistory,
        priceHistory: state.priceHistory,
        market: state.market,
        tick: state.tick,
        selectedRange: state.selectedRange,
        selectedTicker: state.selectedTicker
      })
    );
  }

  function totalPortfolioValue() {
    let total = state.cash;
    Object.keys(state.holdings).forEach(function(ticker) {
      const holding = state.holdings[ticker];
      const marketPrice = state.market[ticker] ? state.market[ticker].price : 0;
      total += holding.shares * marketPrice;
    });
    return total;
  }

  function totalReturn() {
    const value = totalPortfolioValue();
    const pnl = value - INITIAL_CASH;
    return {
      pnl: pnl,
      pct: pnl / INITIAL_CASH
    };
  }

  function getNyTimeParts() {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(new Date());
    const map = {};
    parts.forEach(function(part) {
      if (part.type !== 'literal') map[part.type] = part.value;
    });

    return {
      weekday: map.weekday,
      hour: Number(map.hour),
      minute: Number(map.minute)
    };
  }

  function getMarketStatus() {
    const now = getNyTimeParts();
    const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 };
    const day = weekdayMap[now.weekday] || 0;
    const mins = now.hour * 60 + now.minute;
    const open = day > 0 && mins >= (9 * 60 + 30) && mins < 16 * 60;
    return {
      isOpen: open,
      label: open ? 'Market Open (NYSE hours, ET)' : 'Market Closed (opens 9:30 AM ET weekdays)'
    };
  }

  function updatePrices() {
    Object.keys(state.market).forEach(function(ticker) {
      const item = state.market[ticker];
      const shock = randomNormal() * item.volatility + item.drift;
      const cappedShock = Math.max(-0.08, Math.min(0.08, shock));
      const nextPrice = Math.max(8, item.price * (1 + cappedShock));
      item.change = (nextPrice - item.price) / item.price;
      item.price = nextPrice;
      state.priceHistory[ticker].push(nextPrice);
      if (state.priceHistory[ticker].length > RANGE_POINTS['1Y']) {
        state.priceHistory[ticker].shift();
      }
    });
  }

  function recordPortfolioPoint() {
    state.portfolioHistory.push(totalPortfolioValue());
    if (state.portfolioHistory.length > RANGE_POINTS['1Y']) state.portfolioHistory.shift();
  }

  function renderMarketStatus() {
    const status = getMarketStatus();
    elements.marketStatus.textContent = status.label;
    elements.marketStatus.className = 'market-status ' + (status.isOpen ? 'open' : 'closed');
    return status;
  }

  function renderMarketTable() {
    elements.marketBody.innerHTML = Object.keys(state.market).map(function(ticker) {
      const item = state.market[ticker];
      const cls = item.change >= 0 ? 'change-up' : 'change-down';
      const pct = (item.change * 100).toFixed(2) + '%';
      return (
        '<tr data-ticker="' + ticker + '">' +
          '<td><strong>' + ticker + '</strong></td>' +
          '<td>' + item.name + '</td>' +
          '<td>' + formatMoney(item.price) + '</td>' +
          '<td class="' + cls + '">' + (item.change >= 0 ? '+' : '') + pct + '</td>' +
        '</tr>'
      );
    }).join('');

    elements.marketBody.querySelectorAll('tr').forEach(function(row) {
      row.addEventListener('click', function() {
        const ticker = row.getAttribute('data-ticker');
        state.selectedTicker = ticker;
        elements.tradeTicker.value = ticker;
        elements.chartTicker.value = ticker;
        renderTradePreview();
        renderPriceChart();
        saveState();
      });
    });
  }

  function renderKpis() {
    const value = totalPortfolioValue();
    const ret = totalReturn();
    elements.portfolioValue.textContent = formatMoney(value);
    elements.cashBalance.textContent = formatMoney(state.cash);
    elements.totalPl.textContent = (ret.pnl >= 0 ? '+' : '') + formatMoney(ret.pnl);
    elements.totalPl.className = ret.pnl >= 0 ? 'positive' : 'negative';
    elements.totalPlPct.textContent = formatPct(ret.pct);
    elements.totalPlPct.className = ret.pct >= 0 ? 'positive' : 'negative';
  }

  function renderHoldings() {
    const keys = Object.keys(state.holdings).filter(function(ticker) {
      return state.holdings[ticker].shares > 0;
    });

    if (!keys.length) {
      elements.holdingsList.innerHTML = '<p style="color: var(--text-muted);">No holdings yet. Place your first trade.</p>';
      return;
    }

    elements.holdingsList.innerHTML = keys.map(function(ticker) {
      const h = state.holdings[ticker];
      const marketPrice = state.market[ticker].price;
      const positionValue = h.shares * marketPrice;
      const positionPnl = (marketPrice - h.avgCost) * h.shares;
      return (
        '<div class="holding-item">' +
          '<div><strong>' + ticker + '</strong><br><span>' + h.shares + ' shares @ ' + formatMoney(h.avgCost) + '</span></div>' +
          '<div style="text-align:right;"><strong>' + formatMoney(positionValue) + '</strong><br><span class="' + (positionPnl >= 0 ? 'change-up' : 'change-down') + '">' + (positionPnl >= 0 ? '+' : '') + formatMoney(positionPnl) + '</span></div>' +
        '</div>'
      );
    }).join('');
  }

  function renderTransactions() {
    if (!state.transactions.length) {
      elements.transactionsBody.innerHTML = '<tr><td colspan="6" style="color: var(--text-muted);">No transactions yet.</td></tr>';
      return;
    }

    const latest = state.transactions.slice(-20).reverse();
    elements.transactionsBody.innerHTML = latest.map(function(tx) {
      return (
        '<tr>' +
          '<td>' + formatDate(tx.time) + '</td>' +
          '<td>' + tx.ticker + '</td>' +
          '<td class="' + (tx.action === 'buy' ? 'change-up' : 'change-down') + '">' + tx.action.toUpperCase() + '</td>' +
          '<td>' + tx.shares + '</td>' +
          '<td>' + formatMoney(tx.price) + '</td>' +
          '<td>' + formatMoney(tx.total) + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderLeaderboard() {
    const userReturn = totalReturn().pct;
    const competitors = leaderboardSeed.map(function(item) {
      const jitter = (Math.random() - 0.5) * 0.02;
      return {
        name: item.name,
        returnPct: item.returnPct + jitter,
        value: INITIAL_CASH * (1 + item.returnPct + jitter)
      };
    });

    competitors.push({
      name: 'You',
      returnPct: userReturn,
      value: totalPortfolioValue(),
      isUser: true
    });

    competitors.sort(function(a, b) { return b.value - a.value; });

    elements.leaderboardBody.innerHTML = competitors.map(function(item, idx) {
      return (
        '<tr>' +
          '<td>#' + (idx + 1) + '</td>' +
          '<td>' + (item.isUser ? '<strong>You</strong>' : item.name) + '</td>' +
          '<td>' + formatMoney(item.value) + '</td>' +
          '<td class="' + (item.returnPct >= 0 ? 'change-up' : 'change-down') + '">' + formatPct(item.returnPct) + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function unlockAchievements() {
    const heldTickers = Object.keys(state.holdings).filter(function(t) { return state.holdings[t].shares > 0; }).length;
    const trades = state.transactions.length;
    const ret = totalReturn().pct;

    if (trades >= 1) state.achievements.first_trade = true;
    if (heldTickers >= 3) state.achievements.diversified = true;
    if (ret >= 0.05) state.achievements.green_portfolio = true;
    if (trades >= 10) state.achievements.active_trader = true;
    if (state.tick >= 40) state.achievements.long_game = true;
  }

  function renderAchievements() {
    unlockAchievements();
    elements.achievementGrid.innerHTML = achievementDefinitions.map(function(item) {
      const unlocked = !!state.achievements[item.id];
      return (
        '<div class="achievement-badge ' + (unlocked ? 'unlocked' : '') + '">' +
          '<strong>' + (unlocked ? '🏆 ' : '🔒 ') + item.title + '</strong>' +
          '<span>' + item.description + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function getThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      text: styles.getPropertyValue('--text-secondary').trim() || '#64748b',
      border: styles.getPropertyValue('--border-subtle').trim() || 'rgba(0,0,0,0.1)',
      line: styles.getPropertyValue('--emerald').trim() || '#059669',
      fill: styles.getPropertyValue('--emerald-pale').trim() || 'rgba(5,150,105,0.18)'
    };
  }

  function buildTradeMarkerData(selectedTicker, startIndex) {
    const buys = [];
    const sells = [];
    state.transactions.forEach(function(tx) {
      if (tx.ticker !== selectedTicker) return;
      if (tx.tickIndex < startIndex) return;
      const point = { x: tx.tickIndex - startIndex, y: tx.price };
      if (tx.action === 'buy') buys.push(point);
      else sells.push(point);
    });
    return { buys: buys, sells: sells };
  }

  function renderPriceChart() {
    const ticker = state.selectedTicker;
    const history = state.priceHistory[ticker] || [];
    const rangePoints = RANGE_POINTS[state.selectedRange] || RANGE_POINTS['1D'];
    const sliced = history.slice(-rangePoints);
    const startIndex = Math.max(0, history.length - rangePoints);
    const markers = buildTradeMarkerData(ticker, startIndex);

    elements.chartTitle.textContent = ticker + ' Price Trend';

    const lineData = sliced.map(function(price, idx) { return { x: idx, y: price }; });
    const colors = getThemeColors();

    if (!priceChart) {
      priceChart = new Chart(document.getElementById('price-chart'), {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Price',
              data: lineData,
              borderColor: colors.line,
              backgroundColor: colors.fill,
              fill: true,
              tension: 0.3,
              pointRadius: 0
            },
            {
              type: 'scatter',
              label: 'Buy',
              data: markers.buys,
              pointBackgroundColor: '#10b981',
              pointBorderColor: '#10b981',
              pointRadius: 4,
              pointStyle: 'triangle'
            },
            {
              type: 'scatter',
              label: 'Sell',
              data: markers.sells,
              pointBackgroundColor: '#ef4444',
              pointBorderColor: '#ef4444',
              pointRadius: 4,
              pointStyle: 'rectRot'
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          animation: { duration: 350 },
          plugins: {
            legend: { labels: { color: colors.text } }
          },
          scales: {
            x: {
              type: 'linear',
              ticks: { display: false },
              grid: { color: colors.border }
            },
            y: {
              ticks: {
                color: colors.text,
                callback: function(v) { return '$' + Number(v).toFixed(0); }
              },
              grid: { color: colors.border }
            }
          }
        }
      });
      return;
    }

    priceChart.data.datasets[0].data = lineData;
    priceChart.data.datasets[1].data = markers.buys;
    priceChart.data.datasets[2].data = markers.sells;
    priceChart.data.datasets[0].borderColor = colors.line;
    priceChart.data.datasets[0].backgroundColor = colors.fill;
    priceChart.options.plugins.legend.labels.color = colors.text;
    priceChart.options.scales.x.grid.color = colors.border;
    priceChart.options.scales.y.grid.color = colors.border;
    priceChart.options.scales.y.ticks.color = colors.text;
    priceChart.update('none');
  }

  function renderAllocationChart() {
    const labels = [];
    const data = [];

    Object.keys(state.holdings).forEach(function(ticker) {
      const h = state.holdings[ticker];
      if (h.shares <= 0) return;
      labels.push(ticker);
      data.push(h.shares * state.market[ticker].price);
    });

    labels.push('Cash');
    data.push(state.cash);

    if (!allocationChart) {
      allocationChart = new Chart(document.getElementById('allocation-chart'), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#94a3b8']
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: getThemeColors().text } }
          }
        }
      });
      return;
    }

    allocationChart.data.labels = labels;
    allocationChart.data.datasets[0].data = data;
    allocationChart.options.plugins.legend.labels.color = getThemeColors().text;
    allocationChart.update('none');
  }

  function renderTradePreview() {
    const ticker = elements.tradeTicker.value;
    const action = elements.tradeAction.value;
    const shares = Number(elements.tradeShares.value || 0);

    if (!ticker || shares <= 0) {
      elements.tradePreview.textContent = '';
      return;
    }

    const price = state.market[ticker].price;
    const total = price * shares;

    if (action === 'buy') {
      elements.tradePreview.textContent = 'Estimated cost: ' + formatMoney(total) + (total > state.cash ? ' (insufficient cash)' : '');
      return;
    }

    const owned = state.holdings[ticker] ? state.holdings[ticker].shares : 0;
    elements.tradePreview.textContent = 'Estimated proceeds: ' + formatMoney(total) + ' (owned: ' + owned + ' shares)';
  }

  function placeTrade(ticker, action, shares) {
    const status = getMarketStatus();
    if (!status.isOpen) {
      alert('Market is currently closed. Trading opens at 9:30 AM ET on weekdays.');
      return;
    }

    const price = state.market[ticker].price;
    const total = price * shares;

    if (action === 'buy') {
      if (total > state.cash) {
        alert('Insufficient cash balance for this order.');
        return;
      }

      state.cash -= total;
      const current = state.holdings[ticker] || { shares: 0, avgCost: 0 };
      const nextShares = current.shares + shares;
      const nextAvg = ((current.shares * current.avgCost) + total) / nextShares;
      state.holdings[ticker] = { shares: nextShares, avgCost: nextAvg };
    } else {
      const currentSell = state.holdings[ticker] || { shares: 0, avgCost: 0 };
      if (shares > currentSell.shares) {
        alert('Cannot sell more shares than you own.');
        return;
      }

      state.cash += total;
      const remaining = currentSell.shares - shares;
      if (remaining <= 0) delete state.holdings[ticker];
      else state.holdings[ticker] = { shares: remaining, avgCost: currentSell.avgCost };
    }

    state.transactions.push({
      time: Date.now(),
      ticker: ticker,
      action: action,
      shares: shares,
      price: price,
      total: total,
      tickIndex: state.tick
    });

    renderAll();
    saveState();
  }

  function initInputs() {
    const options = Object.keys(state.market).map(function(ticker) {
      return '<option value="' + ticker + '">' + ticker + ' - ' + state.market[ticker].name + '</option>';
    }).join('');

    elements.tradeTicker.innerHTML = options;
    elements.chartTicker.innerHTML = options;

    if (!state.market[state.selectedTicker]) state.selectedTicker = Object.keys(state.market)[0];

    elements.tradeTicker.value = state.selectedTicker;
    elements.chartTicker.value = state.selectedTicker;

    elements.tradeTicker.addEventListener('change', function() {
      state.selectedTicker = elements.tradeTicker.value;
      elements.chartTicker.value = state.selectedTicker;
      renderTradePreview();
      renderPriceChart();
      saveState();
    });

    elements.chartTicker.addEventListener('change', function() {
      state.selectedTicker = elements.chartTicker.value;
      elements.tradeTicker.value = state.selectedTicker;
      renderPriceChart();
      saveState();
    });

    elements.tradeAction.addEventListener('change', renderTradePreview);
    elements.tradeShares.addEventListener('input', renderTradePreview);

    elements.tradeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const ticker = elements.tradeTicker.value;
      const action = elements.tradeAction.value;
      const shares = Number(elements.tradeShares.value || 0);
      if (!ticker || shares <= 0) return;
      placeTrade(ticker, action, shares);
      elements.tradeShares.value = '';
      renderTradePreview();
    });

    document.querySelectorAll('.time-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.time-filter-btn').forEach(function(node) {
          node.classList.remove('active');
        });
        btn.classList.add('active');
        state.selectedRange = btn.getAttribute('data-range');
        renderPriceChart();
        saveState();
      });
    });

    const active = document.querySelector('.time-filter-btn[data-range="' + state.selectedRange + '"]');
    if (active) {
      document.querySelectorAll('.time-filter-btn').forEach(function(node) { node.classList.remove('active'); });
      active.classList.add('active');
    }

    elements.resetBtn.addEventListener('click', function() {
      if (!window.confirm('Reset portfolio, trades, and leaderboard progress?')) return;
      localStorage.removeItem(STORAGE_KEY);
      createInitialState();
      initInputs();
      renderAll();
      saveState();
    });
  }

  function renderAll() {
    renderMarketStatus();
    renderMarketTable();
    renderKpis();
    renderHoldings();
    renderTransactions();
    renderLeaderboard();
    renderAchievements();
    renderPriceChart();
    renderAllocationChart();
  }

  function tick() {
    const status = renderMarketStatus();
    if (status.isOpen) {
      state.tick += 1;
      updatePrices();
      recordPortfolioPoint();
      renderAll();
      saveState();
    } else {
      renderLeaderboard();
    }
  }

  loadState();
  initInputs();
  renderAll();
  saveState();

  setInterval(tick, TICK_MS);

  setTimeout(function() {
    if (elements.loading) elements.loading.classList.add('hidden');
  }, 850);
})();
