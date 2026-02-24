/**
 * AI Chatbot - FinanceForStudents
 * Tries Google Gemini API first; falls back to rule-based when API fails.
 * (Browser CORS often blocks direct Gemini calls - use a backend proxy for real AI.)
 */
(function() {
  const CONTAINER_ID = 'chatbot-container';

  const API_KEY = 'AIzaSyCG2IkEeoL-wCmWD9pTtMN2vPyUXZfyQOc';
<<<<<<< HEAD
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + API_KEY;
=======
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY;
>>>>>>> 655306876a48b6aefc55374061d33e9448c1f1fb

  const SYSTEM_PROMPT = `You are a friendly finance study assistant for FinanceForStudents. Explain finance concepts clearly: income statements, balance sheets, cash flow, DCF, NPV, P/E, stocks, valuation, budgeting. Be concise and helpful. No investment advice.`;

  // Thorough rule-based fallback when API fails (CORS, rate limit, etc.)
  const FALLBACK = {
    income: "The Income Statement (P&L) shows revenue and expenses over a period. Key line items: Revenue → COGS → Gross Profit → Operating Expenses → Operating Income → Net Income. It answers: How profitable is the company?",
    balance: "The Balance Sheet shows the financial position at a point in time. Assets = Liabilities + Equity. Assets: cash, receivables, inventory, property. Liabilities: debt, payables. Equity: owners' stake.",
    cashflow: "The Cash Flow Statement has 3 sections: (1) Operating—cash from daily business; (2) Investing—capEx, acquisitions; (3) Financing—debt, equity, dividends. Shows where cash comes from and goes.",
    dcf: "DCF (Discounted Cash Flow) estimates company value by projecting future free cash flows and discounting them to today using WACC. Formula: Value = Σ (FCF / (1+WACC)^t). Used for intrinsic valuation.",
    npv: "NPV (Net Present Value) = Σ (Cash Flow / (1+r)^t) - Initial Investment. NPV > 0 means the project adds value. It accounts for time value of money.",
    tvm: "Time Value of Money: A dollar today > a dollar tomorrow. PV = FV/(1+r)^n. FV = PV×(1+r)^n. r = discount rate, n = periods.",
    pe: "P/E (Price-to-Earnings) = Stock Price ÷ EPS. Shows how much investors pay per dollar of earnings. High P/E often means growth expectations; low P/E can mean undervalued or risky.",
    stock: "Stocks = ownership in a company. You profit from price appreciation and dividends. Diversification (spreading across many stocks) reduces risk. Never invest more than you can afford to lose.",
    dividend: "Dividends are cash payments from companies to shareholders, often quarterly. Dividend yield = Annual Dividend ÷ Stock Price. Some companies pay; others reinvest in growth.",
    budget: "Budgeting means planning income vs expenses. 50/30/20 rule: 50% needs, 30% wants, 20% savings. Track spending, set goals, build an emergency fund.",
    hello: "Hi! I'm your finance study assistant. Ask me about income statements, balance sheets, DCF, NPV, stocks, budgeting, or any finance concept. I'm here to help!",
    default: "I can help with finance topics like financial statements, DCF, NPV, P/E ratio, stocks, dividends, budgeting, and valuation. Try asking something like 'What is an income statement?' or 'Explain DCF.'"
  };

  const TRIGGERS = [
    [/income statement|revenue|expense|profit|net income|p&l/i, 'income'],
    [/balance sheet|assets|liabilit|equity/i, 'balance'],
    [/cash flow|cashflow|operating|investing|financing/i, 'cashflow'],
    [/dcf|discounted cash flow|valuation/i, 'dcf'],
    [/npv|net present value/i, 'npv'],
    [/time value|tvm|present value|future value|pv\b|fv\b/i, 'tvm'],
    [/p\/e|price to earnings|price-to-earnings|pe ratio/i, 'pe'],
    [/stock|shares|equity|invest/i, 'stock'],
    [/dividend/i, 'dividend'],
    [/budget|saving|expense/i, 'budget'],
    [/^(hi|hey|hello)\s*!?$/i, 'hello']
  ];

  function getFallbackResponse(text) {
    const t = (text || '').trim();
    if (!t) return FALLBACK.hello;
    for (let i = 0; i < TRIGGERS.length; i++) {
      if (TRIGGERS[i][0].test(t)) return FALLBACK[TRIGGERS[i][1]];
    }
    return FALLBACK.default;
  }

  async function callGemini(userMessage, history) {
    const contents = [];
    history.forEach(function(m) {
      contents.push({ role: m.isUser ? 'user' : 'model', parts: [{ text: m.text }] });
    });
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error('API: ' + res.status);
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response');
    return text.trim();
  }

  function createChatbot() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    const chatHistory = [];
    const div = document.createElement('div');
    div.innerHTML = `
      <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Open chat">💬</button>
      <div class="chatbot-window" id="chatbot-window" style="display: none;">
        <div class="chatbot-header" style="display:flex;justify-content:space-between;align-items:center;">🤖 Finance Study Assistant <button id="chatbot-close" style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem;" aria-label="Close">×</button></div>
        <div class="chatbot-messages" id="chat-messages"></div>
        <div class="chatbot-input-area">
          <input type="text" id="chat-input" placeholder="Ask about finance..." autocomplete="off">
          <button id="chat-send">Send</button>
        </div>
      </div>
    `;
    container.appendChild(div);

    const toggle = document.getElementById('chatbot-toggle');
    const windowEl = document.getElementById('chatbot-window');
    const messagesEl = document.getElementById('chat-messages');
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    function addMsg(text, isUser) {
      const p = document.createElement('div');
      p.className = 'chat-msg ' + (isUser ? 'user' : 'bot');
      p.textContent = text;
      messagesEl.appendChild(p);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setTyping(show) {
      let el = document.getElementById('chat-typing');
      if (show) {
        if (!el) { el = document.createElement('div'); el.id = 'chat-typing'; el.className = 'chat-msg bot chat-typing'; el.textContent = 'Thinking...'; messagesEl.appendChild(el); }
        el.style.display = 'block';
      } else if (el) el.style.display = 'none';
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function openChat() {
      windowEl.style.display = 'flex';
      toggle.style.display = 'none';
      if (messagesEl.children.length === 0) {
        addMsg("Hi! I'm your finance study assistant. Ask me about financial statements, DCF, stocks, valuation, budgeting, or any finance concept!", false);
      }
    }

    function closeChat() {
      windowEl.style.display = 'none';
      toggle.style.display = 'block';
    }

    async function send() {
      const text = inputEl.value.trim();
      if (!text) return;

      inputEl.disabled = true;
      sendBtn.disabled = true;
      addMsg(text, true);
      chatHistory.push({ text: text, isUser: true });
      inputEl.value = '';
      setTyping(true);

      let reply;
      try {
        reply = await callGemini(text, chatHistory);
      } catch (err) {
        // API failed (CORS, 403, 429, network) - use rule-based fallback
        reply = getFallbackResponse(text);
      }

      setTyping(false);
      addMsg(reply, false);
      chatHistory.push({ text: reply, isUser: false });
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }

    const closeBtn = document.getElementById('chatbot-close');
    if (toggle) toggle.addEventListener('click', openChat);
    if (closeBtn) closeBtn.addEventListener('click', closeChat);
    if (sendBtn) sendBtn.addEventListener('click', send);
    if (inputEl) inputEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') send(); });
    window.openChatbot = openChat;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbot);
  } else {
    createChatbot();
  }
})();
