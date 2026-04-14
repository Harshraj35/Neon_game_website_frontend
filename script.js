document.addEventListener('DOMContentLoaded', () => {
    // 1. Loader Removal
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 1500);

    // 2. Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link, .switch-page, .play-now-btn');
    const pages = document.querySelectorAll('.page');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navDashboard = document.getElementById('nav-dashboard');
    const navLogout = document.getElementById('nav-logout');

    function navigateTo(targetId) {
        pages.forEach(page => page.classList.remove('active'));
        document.querySelectorAll('.navbar .nav-link').forEach(link => link.classList.remove('active'));
        
        const targetPage = document.getElementById(targetId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Update active state on navbar if applicable
            const activeLink = document.querySelector(`.navbar .nav-link[data-target="${targetId}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.id === 'logout-btn') return; // Handled separately
            
            let target = link.dataset.target;
            
            if(!target && link.classList.contains('play-now-btn')) {
                // Check if user logged in
                target = localStorage.getItem('gta_user') ? 'dashboard-page' : 'login-page';
            }
            if (target) {
                e.preventDefault();
                navigateTo(target);
            }
        });
    });

    // 3. Audio Toggle
    const musicToggle = document.querySelector('.music-toggle');
    const musicIcon = document.getElementById('music-icon');
    const bgMusic = document.getElementById('bg-music');
    let musicPlaying = false;

    // We set the volume slightly lower so it's not ear-piercing default 1.0
    if (bgMusic) bgMusic.volume = 0.4;

    musicToggle.addEventListener('click', () => {
        if (musicPlaying) {
            bgMusic.pause();
            musicIcon.textContent = '🎵 MUSIC: OFF';
            musicIcon.style.color = 'var(--neon-purple)';
        } else {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
            musicIcon.textContent = '🎵 MUSIC: ON';
            musicIcon.style.color = 'var(--neon-blue)';
        }
        musicPlaying = !musicPlaying;
    });

    // 4. Form Validations & Mock Auth
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Password Strength Indicator
    const regPassword = document.getElementById('reg-password');
    const strengthBar = document.querySelector('.strength-bar');

    if (regPassword) {
        regPassword.addEventListener('input', () => {
            const val = regPassword.value;
            let strength = 0;
            if (val.length > 5) strength += 33;
            if (val.match(/[A-Z]/) && val.match(/[0-9]/)) strength += 33;
            if (val.match(/[^A-Za-z0-9]/)) strength += 34;

            strengthBar.style.width = strength + '%';
            if (strength < 50) strengthBar.style.backgroundColor = '#ff3333';
            else if (strength < 80) strengthBar.style.backgroundColor = 'var(--neon-yellow)';
            else strengthBar.style.backgroundColor = '#00ff00';
        });
    }

    // Register Submit
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;
            const errorDiv = document.getElementById('reg-error');

            if (password !== confirm) {
                errorDiv.textContent = 'Passwords do not match!';
                errorDiv.style.display = 'block';
                return;
            }

            // Mock saving to local storage
            const user = { username, email, password };
            localStorage.setItem('gta_user', JSON.stringify(user));
            
            errorDiv.style.display = 'none';
            alert('ID Created Successfully. Proceed to Access Terminal.');
            registerForm.reset();
            strengthBar.style.width = '0%';
            navigateTo('login-page');
        });
    }

    // Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const identity = document.getElementById('login-username').value;
            const pass = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            
            const storedUser = JSON.parse(localStorage.getItem('gta_user'));

            if (!storedUser) {
                errorDiv.textContent = 'Account not found. Access denied.';
                errorDiv.style.display = 'block';
                return;
            }

            if ((identity === storedUser.username || identity === storedUser.email) && pass === storedUser.password) {
                // Success
                errorDiv.style.display = 'none';
                loginForm.reset();
                updateAuthState();
                navigateTo('dashboard-page');
            } else {
                errorDiv.textContent = 'Invalid security clearance!';
                errorDiv.style.display = 'block';
            }
        });
    }

    // 5. Auth State Management
    function updateAuthState() {
        const user = JSON.parse(localStorage.getItem('gta_user'));
        if (user) {
            if (navLogin) navLogin.classList.add('hidden');
            if (navRegister) navRegister.classList.add('hidden');
            if (navDashboard) navDashboard.classList.remove('hidden');
            if (navLogout) navLogout.classList.remove('hidden');
            
            const dashUser = document.getElementById('dash-username');
            if(dashUser) dashUser.textContent = user.username.toUpperCase();
        } else {
            if (navLogin) navLogin.classList.remove('hidden');
            if (navRegister) navRegister.classList.remove('hidden');
            if (navDashboard) navDashboard.classList.add('hidden');
            if (navLogout) navLogout.classList.add('hidden');
        }
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('gta_user');
            updateAuthState();
            navigateTo('home-page');
        });
    }

    // Initial Auth Check
    updateAuthState();
});
