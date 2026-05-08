const API = 'https://web-production-b707.up.railway.app';

// If already logged in, go straight to dashboard
if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
}

function showTab(tab) {
    document.getElementById('login-form').style.display  = tab === 'login'  ? 'block' : 'none';
    document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
    document.querySelectorAll('.auth-tab').forEach((t, i) => {
        t.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'signup' && i === 1));
    });
    clearAlert();
}

function showAlert(message, type = 'error') {
    document.getElementById('alert-box').innerHTML =
        `<div class="alert alert-${type}">${message}</div>`;
}

function clearAlert() {
    document.getElementById('alert-box').innerHTML = '';
}

async function login() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) return showAlert('Please fill in all fields');

    try {
        const res  = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showAlert(data.message || 'Login failed');
        } else {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user',  JSON.stringify({ name: data.name, email: data.email, role: data.role }));
            window.location.href = 'dashboard.html';
        }
    } catch (err) {
        showAlert('Cannot connect to server. Is Spring Boot running?');
    }
}

async function signup() {
    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) return showAlert('Please fill in all fields');
    if (password.length < 6) return showAlert('Password must be at least 6 characters');

    try {
        const res  = await fetch(`${API}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            showAlert(data.message || 'Signup failed');
        } else {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user',  JSON.stringify({ name: data.name, email: data.email, role: data.role }));
            window.location.href = 'dashboard.html';
        }
    } catch (err) {
        showAlert('Cannot connect to server. Is Spring Boot running?');
    }
}

// Allow pressing Enter to submit
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const isLogin = document.getElementById('login-form').style.display !== 'none';
        isLogin ? login() : signup();
    }
});