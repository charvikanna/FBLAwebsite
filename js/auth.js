(function() {
  const API_BASE_URL = window.localStorage.getItem('ffs_api_base_url') || 'http://localhost:5001';
  const TOKEN_KEY = 'ffs_jwt_token';

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

  function initLoginPage() {
    const form = document.getElementById('auth-form');
    if (!form) return;

    getTokenFromQuery();

    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const submitBtn = document.getElementById('submit-btn');
    const msgEl = document.getElementById('auth-message');
    const googleBtn = document.getElementById('google-login-btn');

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

    googleBtn.href = API_BASE_URL + '/api/auth/google';

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
        const res = await fetch(API_BASE_URL + endpoint, {
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
        setMessage(msgEl, 'Could not reach backend. Is it running on ' + API_BASE_URL + '?', true);
      }
    });
  }

  function initProfilePage() {
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

    fetch(API_BASE_URL + '/api/profile', {
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
