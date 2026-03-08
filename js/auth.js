(function() {
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyChFafPLnRzLIDg-bi6Dqsm8CAaD4RQcWQ",
    authDomain: "money-minds-9e43a.firebaseapp.com",
    projectId: "money-minds-9e43a",
    storageBucket: "money-minds-9e43a.firebasestorage.app",
    messagingSenderId: "592462072367",
    appId: "1:592462072367:web:9f825337c053e5c1b054da",
    measurementId: "G-FQD2XGM7TB"
  };

  // Load Firebase from CDN and initialize
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function setMessage(el, msg, isError) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'auth-message ' + (isError ? 'error' : 'success');
  }

  async function initFirebase() {
    // Load Firebase SDKs from CDN
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js');

    firebase.initializeApp(firebaseConfig);
    return firebase.auth();
  }

  async function initLoginPage() {
    const form = document.getElementById('auth-form');
    if (!form) return;

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

    let auth;
    try {
      auth = await initFirebase();
    } catch (err) {
      setMessage(msgEl, 'Failed to load authentication. Check your internet connection.', true);
      return;
    }

    // Check if already logged in
    auth.onAuthStateChanged(function(user) {
      if (user) {
        window.location.href = 'profile.html';
      }
    });

    // Google login
    googleBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        await auth.signInWithPopup(provider);
        window.location.href = 'profile.html';
      } catch (err) {
        setMessage(msgEl, 'Google sign-in failed: ' + err.message, true);
      }
    });

    // Email/password login or signup
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        setMessage(msgEl, 'Email and password are required.', true);
        return;
      }

      setMessage(msgEl, 'Please wait...', false);
      submitBtn.disabled = true;

      try {
        if (mode === 'login') {
          await auth.signInWithEmailAndPassword(email, password);
        } else {
          await auth.createUserWithEmailAndPassword(email, password);
        }
        setMessage(msgEl, (mode === 'login' ? 'Login' : 'Signup') + ' successful! Redirecting...', false);
        setTimeout(function() {
          window.location.href = 'profile.html';
        }, 400);
      } catch (err) {
        let msg = err.message;
        if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
        if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
        if (err.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
        if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
        if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
        setMessage(msgEl, msg, true);
        submitBtn.disabled = false;
      }
    });
  }

  async function initProfilePage() {
    const emailEl = document.getElementById('profile-email');
    if (!emailEl) return;

    let auth;
    try {
      auth = await initFirebase();
    } catch (err) {
      window.location.href = 'login.html';
      return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function() {
        await auth.signOut();
        window.location.href = 'login.html';
      });
    }

    auth.onAuthStateChanged(function(user) {
      if (!user) {
        window.location.href = 'login.html';
        return;
      }

      const email = user.email || '';
      const name = user.displayName || (email ? email.split('@')[0] : 'Student');
      const safeName = name.charAt(0).toUpperCase() + name.slice(1);

      const nameEl = document.getElementById('profile-name');
      const dispNameEl = document.getElementById('disp-name');
      const dispEmailEl = document.getElementById('disp-email');
      const avatarEl = document.getElementById('profile-avatar');

      if (nameEl) nameEl.textContent = safeName;
      if (emailEl) emailEl.textContent = email || 'No email';
      if (dispNameEl) dispNameEl.textContent = safeName;
      if (dispEmailEl) dispEmailEl.textContent = email || 'No email';
      if (avatarEl && user.photoURL) avatarEl.src = user.photoURL;
    });
  }

  initLoginPage();
  initProfilePage();
})();