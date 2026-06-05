# Premium Interactive Creative Design Portfolio

A state-of-the-art, high-fidelity graphic and UI/UX designer portfolio built entirely from scratch with semantic HTML5, modern CSS3 layout systems, and custom Vanilla JS logic. No third-party framework dependencies, ensuring a sub-14KB visual loading bundle.

---

## 🎨 Visual Features & Aesthetics
- **Obsidian Dark Mode**: Deep black charcoal background (`#121315`) with fine glowing yellow contours.
- **Vibrant Lemon Gradients**: Transitions of Lemon Punch (`#febf24`) to Lisbon Lemon (`#ffff66`) and Gold (`#eab308`).
- **Dynamic Background Blobs**: Moving ambient radial shapes blurring across layers to form floating gold/lemon halos.
- **Glassmorphism panels**: High-performance backdrop blur (`backdrop-filter`) with hover light offsets and dynamic flashlight shadows.
- **Magnetic Custom Cursor**: A custom floating vector dot trailing smooth transitions and transforming on interaction zones.

---

## ⚙️ Core Architecture & Components

### 🖥️ Structural Hierarchy (`index.html`)
- **Interactive Sticky Header**: Blurs dynamically when scroll bounds cross 50px.
- **Hero Sandbox Banner**: Includes active stats counters, professional indicators, CTAs, and a floating interactive profile element.
- **Active Career Timeline**: Vertical visual timeline nodes that reflect professional, academic, or contract milestones.
- **Selected Works Gallery**: Grid displaying modular project cards with categories (Engineering / Creative Design), tag indices, overlay anchors, and detailed close-overlay modals.
- **Skill Proficiency Indicators**: Rotating circular radial progress bars utilizing animated dash-offsets.
- **Centered Contact card**: Beautiful, centered glassmorphic layout highlighting direct email and location details.

### 🖌️ Visual Assets (`style.css`)
- Leverages Google Fonts: `Poppins` (Headings) and `DM Sans` (Body).
- Configured using strictly scoped CSS custom properties for effortless theme swapping.
- Premium custom webkit scrollbar matching the obsidian theme colors.
- Responsive breakpoints optimized across modern smartphone, tablet, and widescreen monitors.

### 🧪 Interaction Engine (`app.js`)
- Runs custom smooth cursor trackers within `requestAnimationFrame` loops.
- Injects a typist simulation looping professional subheadings.
- Triggers active scroll-spies to highlight current navigation segments.
- Connects modal events, blocking window scroll while active.
- Initiates high-performance `IntersectionObserver` layers, activating radial progress rings on scroll entrance.

---

## 🚀 Running Locally

To host the portfolio on your local machine:

1. Double-click [index.html](file:///Users/tomas/Desktop/untitled%20folder/index.html) to run it directly inside your web browser.
2. Alternatively, launch a lightweight developmental server in the workspace directory:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js npx
   npx serve .
   ```
3. Visit `http://localhost:8000` or `http://localhost:3000` to preview.
