# Neon City Gaming 🌆

A modern, responsive, GTA-inspired cyberpunk gaming website frontend. Featuring dark neon aesthetics, an ambient music toggle, custom AI-generated backgrounds and avatars, and full page structures (Landing, About, Login, Register, Dashboard).

## Features 🚀

- **Immersive Cyberpunk Theme**: Dark mode styled using glowing CSS neon aesthetics (`#ff007f`, `#00f0ff`, `#b537f2`).
- **Single Page Application Flow**: Smooth transitions between the Landing, About, Login, Register, and Dashboard sections using Vanilla JavaScript logic.
- **Client-side Authentication Simulator**: Test run the entire flow! Contains a mock database using `localStorage` to simulate account creation and user login.
- **Dynamic Register Screen**: Includes an interactive password strength indicator and form validation for matching passwords.
- **Dashboard Hub**: Displays mock user information, player rank, stats (Level, Coins, Missions), and game action buttons.
- **Audio Experience**: Embedded ambient background music with an interactive Navbar toggle for immersion.

## Tech Stack 🛠️

- **HTML5**: Semantic layout.
- **CSS3**: Custom CSS variables, Flexbox/Grid for mobile responsiveness, keyframe animations, glowing box-shadows, and glassmorphism (backdrop filters).
- **JavaScript (Vanilla)**: DOM manipulation, mock state management (`localStorage`), and basic password evaluation logic.

## Local Setup & Run 💻

This project requires zero backend dependencies, framework installations, or compilations!

1. Clone or extract this project folder to your machine.
2. Navigate to the directory containing the project files.
3. Simply double-click `index.html` to open it in your default web browser (Chrome, Edge, Firefox, Brave).
   - Alternatively, open the folder in an editor like VS Code and use the **Live Server** extension for a more seamless development experience.

## Project Structure 📁

- `index.html`: The core application container, featuring the nested templates for all pages.
- `style.css`: Contains the entire cyberpunk styling system.
- `script.js`: Handles all the frontend UI interactions, form validations, and routing logic.
- `assets/`: Contains custom image art (the city background and the profile avatar).

## UI Preview Highlights 🎨

- **Glitch & Glow Elements**: Title fonts and interactive buttons utilize layered `box-shadow` and `text-shadow` for that futuristic action feel.
- **Loader Animation**: Custom spinning CSS loader built with borders on initialization to match the UI scheme.
- **Stats Grid**: Dashboard items neatly showcased using a responsive CSS Grid.
