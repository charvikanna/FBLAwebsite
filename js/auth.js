(function() {
  const API_BASE_URL_KEY = 'ffs_api_base_url';
  const API_CANDIDATES = ['http://localhost:5001'];
  const TOKEN_KEY = 'ffs_jwt_token';
  let apiBaseUrl = window.localStorage.getItem(API_BASE_URL_KEY) || API_CANDIDATES[0];

  async function isBackendReachable(baseUrl) {
    try {
      const res = await fetch(baseUrl + '/api/health', { method: 'GET' });
      return res.ok;
    } catch (error) {
      return false;
    }
  }

  async function resolveApiBaseUrl() {
    // 1) Try saved override first.
    if (apiBaseUrl && await isBackendReachable(apiBaseUrl)) {
      return apiBaseUrl;
    }

    // 2) Fall back to known local ports.
    for (const candidate of API_CANDIDATES) {
      if (await isBackendReachable(candidate)) {
        apiBaseUrl = candidate;
        window.localStorage.setItem(API_BASE_URL_KEY, candidate);
        return candidate;
      }
    }

    return null;
  }

  function setMessage(el, msg, isError) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'auth-message ' + (isError ? 'error' : 'success');
  }

  function storeToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  }

  function getTokenFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      storeToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = 'profile.html';
    }
  }

  async function initLoginPage() {
    const form = document.getElementById('auth-form');
    if (!form) return;

    getTokenFromQuery();

    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const submitBtn = document.getElementById('submit-btn');
    const msgEl = document.getElementById('auth-message');
    const googleBtn = document.getElementById('google-login-btn');
    const resolvedApi = await resolveApiBaseUrl();

    let mode = 'login';

    function setMode(nextMode) {
      mode = nextMode;
      submitBtn.textContent = mode === 'login' ? 'Login' : 'Create Account';
      tabLogin.classList.toggle('active', mode === 'login');
      tabSignup.classList.toggle('active', mode === 'signup');
      setMessage(msgEl, '', false);
    }

    tabLogin.addEventListener('click', function() { setMode('login'); });
    tabSignup.addEventListener('click', function() { setMode('signup'); });

    if (resolvedApi) {
      googleBtn.href = resolvedApi + '/api/auth/google';
    } else {
      googleBtn.href = '#';
      googleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setMessage(msgEl, 'Backend is not reachable on localhost:5001.', true);
      });
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        setMessage(msgEl, 'Email and password are required.', true);
        return;
      }

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';

      try {
        setMessage(msgEl, 'Please wait...', false);
        const liveApi = resolvedApi || await resolveApiBaseUrl();
        if (!liveApi) {
          setMessage(msgEl, 'Could not reach backend on localhost:5001.', true);
          return;
        }

        const res = await fetch(liveApi + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password })
        });
        const data = await res.json();

        if (!res.ok) {
          setMessage(msgEl, data.message || 'Authentication failed.', true);
          return;
        }

        storeToken(data.token);
        setMessage(msgEl, (mode === 'login' ? 'Login' : 'Signup') + ' successful. Redirecting...', false);
        setTimeout(function() {
          window.location.href = 'profile.html';
        }, 400);
      } catch (error) {
        setMessage(msgEl, 'Could not reach backend. Ensure backend is running and port matches Google callback/env config.', true);
      }
    });
  }

  async function initProfilePage() {
    const emailEl = document.getElementById('profile-email');
    if (!emailEl) return;

    const avatarEl = document.getElementById('profile-avatar');
    const token = localStorage.getItem(TOKEN_KEY);
    const logoutBtn = document.getElementById('logout-btn');

    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = 'login.html';
      });
    }

    const liveApi = await resolveApiBaseUrl();
    if (!liveApi) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = 'login.html';
      return;
    }

    fetch(liveApi + '/api/profile', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(async function(res) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unauthorized');
        return data;
      })
      .then(function(data) {
        const email = data.email || '';
        const name = email ? email.split('@')[0] : 'Student';
        const safeName = name.charAt(0).toUpperCase() + name.slice(1);

        document.getElementById('profile-name').textContent = safeName;
        document.getElementById('profile-email').textContent = email || 'No email';
        document.getElementById('disp-name').textContent = safeName;
        document.getElementById('disp-email').textContent = email || 'No email';

        if (avatarEl && data.profilePicture) {
          avatarEl.src = data.profilePicture;
        }
      })
      .catch(function() {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = 'login.html';
      });
  }

  initLoginPage();
  initProfilePage();
})();
