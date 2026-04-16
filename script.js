import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

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
                target = auth.currentUser ? 'dashboard-page' : 'login-page';
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

    // 4. Firebase Authentication Logic
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const googleLoginBtn = document.getElementById('google-login');
    
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
        registerForm.addEventListener('submit', async (e) => {
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

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Save extra info to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: email,
                    createdAt: new Date(),
                    stats: {
                        level: 1,
                        coins: 500,
                        missions: 0
                    }
                });

                errorDiv.style.display = 'none';
                alert('ID Created Successfully. Access matches found.');
                registerForm.reset();
                strengthBar.style.width = '0%';
                navigateTo('dashboard-page');
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            }
        });
    }

    // Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-username').value; // Treat as email
            const pass = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            
            try {
                await signInWithEmailAndPassword(auth, email, pass);
                errorDiv.style.display = 'none';
                loginForm.reset();
                navigateTo('dashboard-page');
            } catch (error) {
                errorDiv.textContent = 'Invalid security clearance! ' + error.message;
                errorDiv.style.display = 'block';
            }
        });
    }

    // Google Login
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                // Check if user exists in Firestore, if not create
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        username: user.displayName || "GUEST_" + user.uid.substring(0, 5),
                        email: user.email,
                        createdAt: new Date(),
                        stats: {
                            level: 1,
                            coins: 500,
                            missions: 0
                        }
                    });
                }
                navigateTo('dashboard-page');
            } catch (error) {
                console.error("Google Auth Error:", error);
                alert("Neural link failed: " + error.message);
            }
        });
    }

    // 5. Auth State Management
    function updateUI(user) {
        if (user) {
            if (navLogin) navLogin.classList.add('hidden');
            if (navRegister) navRegister.classList.add('hidden');
            if (navDashboard) navDashboard.classList.remove('hidden');
            if (navLogout) navLogout.classList.remove('hidden');
            
            // For the dashboard, we need to fetch name from Firestore
            fetchUserData(user.uid);
        } else {
            if (navLogin) navLogin.classList.remove('hidden');
            if (navRegister) navRegister.classList.remove('hidden');
            if (navDashboard) navDashboard.classList.add('hidden');
            if (navLogout) navLogout.classList.add('hidden');
        }
    }

    async function fetchUserData(uid) {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            const dashUser = document.getElementById('dash-username');
            if(dashUser) dashUser.textContent = data.username.toUpperCase();
            
            // Update stats if they exist
            if (data.stats) {
                const levelEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
                const coinsEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
                const missionsEl = document.querySelector('.stat-card:nth-child(3) .stat-value');
                
                if(levelEl) levelEl.textContent = data.stats.level;
                if(coinsEl) coinsEl.textContent = data.stats.coins.toLocaleString();
                if(missionsEl) missionsEl.textContent = data.stats.missions;
            }
        }
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                navigateTo('home-page');
            } catch (error) {
                console.error("Logout failed:", error);
            }
        });
    }

    // Listen for Auth State Changes
    onAuthStateChanged(auth, (user) => {
        updateUI(user);
    });
});
