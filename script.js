import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";

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

    // Notification Helper
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <span style="margin-left: 20px; font-size: 12px; opacity: 0.5;">[OK]</span>
        `;

        container.appendChild(notification);

        // Auto remove from DOM after animation finishes
        setTimeout(() => {
            notification.remove();
        }, 4500);
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
                errorDiv.textContent = 'Invalid username or password';
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
                const dashUser = document.getElementById('dash-username');
                
                if(dashUser) dashUser.textContent = data.username.toUpperCase();
                if(levelEl) levelEl.textContent = data.stats.level;
                if(coinsEl) coinsEl.textContent = data.stats.coins.toLocaleString();
                if(missionsEl) missionsEl.textContent = data.stats.missions;
                
                // Update progress bar based on level progress (simulated)
                const progressFill = document.querySelector('.progress-fill');
                const progressLabel = document.querySelector('.progress-label span:last-child');
                const levelLabel = document.querySelector('.progress-label span:first-child');
                
                if (levelLabel) levelLabel.textContent = `Level ${data.stats.level}`;
                
                // Randomish progress just for show
                const progress = (data.stats.missions % 10) * 10 || 5; 
                if (progressFill) progressFill.style.width = `${progress}%`;
                if (progressLabel) progressLabel.textContent = `${progress}% to Level ${data.stats.level + 1}`;
            }
        }
    }

    // 6. Game Action Buttons
    const startMissionBtn = document.getElementById('start-mission-btn');
    const garageBtn = document.getElementById('garage-btn');
    const blackMarketBtn = document.getElementById('black-market-btn');

    if (startMissionBtn) {
        startMissionBtn.addEventListener('click', async () => {
            if (!auth.currentUser) return;
            
            startMissionBtn.disabled = true;
            startMissionBtn.innerText = 'INITIALIZING...';
            
            try {
                const userRef = doc(db, "users", auth.currentUser.uid);
                
                // Reward: +1 mission, +5000 coins, maybe a level up every 5 missions
                await updateDoc(userRef, {
                    "stats.missions": increment(1),
                    "stats.coins": increment(5000)
                });
                
                // Check if we should level up
                const userSnap = await getDoc(userRef);
                const stats = userSnap.data().stats;
                if (stats.missions % 5 === 0) {
                    await updateDoc(userRef, {
                        "stats.level": increment(1)
                    });
                    showNotification("LEVEL UP! NEW ABILITIES UNLOCKED.", "success");
                }
                
                showNotification("MISSION COMPLETE! EARNED 5,000 COINS.", "success");
                await fetchUserData(auth.currentUser.uid);
                navigateTo('mission-effect-page');
            } catch (error) {
                console.error("Mission failed:", error);
                showNotification("NEURAL LINK ERROR!", "danger");
            } finally {
                startMissionBtn.disabled = false;
                startMissionBtn.innerText = 'START MISSION';
            }
        });
    }

    if (garageBtn) {
        garageBtn.addEventListener('click', () => {
            showNotification("SYNCING GARAGE DATA...", "success");
            navigateTo('garage-effect-page');
        });
    }

    if (blackMarketBtn) {
        blackMarketBtn.addEventListener('click', async () => {
            if (!auth.currentUser) return;
            
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            const coins = userSnap.data().stats.coins;
            
            if (coins >= 10000) {
                try {
                    await updateDoc(userRef, {
                        "stats.coins": increment(-10000)
                    });
                    showNotification("PURCHASED ILLEGAL MODS. -10,000 COINS.", "danger");
                    await fetchUserData(auth.currentUser.uid);
                    navigateTo('market-effect-page');
                } catch (error) {
                    showNotification("TRANSACTION FAILED.", "danger");
                }
            } else {
                showNotification("INSUFFICIENT FUNDS.", "warning");
            }
        });
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
