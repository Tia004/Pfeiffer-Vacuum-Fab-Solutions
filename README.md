# Pfeiffer Vacuum+Fab Solutions — Digital Experience Redesign

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=flat&logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)](https://pfeiffer-vacuum-fab-solutions.vercel.app)

A minimalist, high-precision industrial digital experience redesign for **Pfeiffer Vacuum Technology AG**, world leader in ultra-high vacuum (UHV) turbomolecular pumps, active magnetic levitation, and molecular leak detection systems for semiconductor EUV lithography, CERN, and aerospace simulation.

Designed in an ultra-minimalist aesthetic inspired by **Teenage Engineering, Braun, and Linear**, marrying brutalist architectural grids with high-performance 3D WebGL computation and zero-asset procedural geometry.

---

## Key Highlights

- **Zero SVG & Zero Emoji Architecture**: 100% of the iconography, crosshairs, telemetry gauges, turbine glyphs, and flow indicators are built exclusively through pure geometric CSS (`::before`, `::after`, `clip-path`, `conic-gradient`, and matrix transforms).
- **Interactive 3D WebGL Turbopump Engine**: HiPace turbomolecular rotor assembly built with Three.js & React Three Fiber. Features full **360° OrbitControls**, 7 progressive axial compression stages (36 precision blades per stage), ceramic Si3N4 bearing collars, Holweck molecular drag stage, and an interactive **axial exploded view**.
- **CAD Shading Modes & Kinematic Stage Inspector**: Toggle between Titanium Solid, Wireframe CAD Mesh, and Infrared Thermal Stress mapping. Click any stage to inspect blade pitch angles, tangential blade velocity ($v = 492\text{ m/s}$), and gas conductance.
- **Dynamic 2D Molecular Evacuation Simulation**: Canvas-based real-time particle engine simulating Brownian gas motion ($N_2, Ar, He, H_2$). Click **"AVVIA PUMP-DOWN"** to watch molecules being pulled down through the turbomolecular intake and evacuated as chamber pressure drops in real time.
- **Synthesized Audio Haptics**: Integrated mechanical tactile sound feedback generated directly via the Web Audio API (zero external sound files) mimicking precision Leica/Braun dials.
- **Side-by-Side System Comparison Drawer**: Direct comparison matrix for Pfeiffer flagship pumps (*HiPace 80 Neo*, *HiPace 2300 M*, *HiScroll 12*, *ASM 340*), evaluating volume flow, ultimate vacuum, power draw, and flange standards.
- **Mission-Critical Industrial Case Studies**: Interactive briefs on EUV lithography (ASML 2nm node), high-energy synchrotrons (CERN LHC), and deep space thermal vacuum simulation (ESA/NASA TVAC).
- **Full GDPR & EU 2016/679 Compliance**: Persistent granular cookie consent banner, customizable privacy category controls (Technical, Telemetry, B2B Marketing), and modal documents for Privacy Policy, Terms of Supply (Dual-Use EU 2021/821), and Extended Cookie Policy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **3D Engine** | Three.js & `@react-three/fiber`, `@react-three/drei` |
| **Styling** | Tailwind CSS v4 & Pure Geometric CSS System |
| **Audio** | Pure Web Audio API Synthesizer |
| **Fonts** | Geist & Geist Mono (Vercel) |
| **Hosting** | Vercel Serverless Edge Platform |

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v20 / v24)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Tia004/Pfeiffer-Vacuum-Fab-Solutions.git
cd Pfeiffer-Vacuum-Fab-Solutions

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Compile and optimize production build
npm run build

# Run production server
npm run start
```

---

## Production URL

Live deployment: **[https://pfeiffer-vacuum-fab-solutions.vercel.app](https://pfeiffer-vacuum-fab-solutions.vercel.app)**

---

## License

Created for demonstration and portfolio purposes. Pfeiffer Vacuum, HiPace®, HiScroll®, and Laser Balancing™ are registered trademarks of Pfeiffer Vacuum Technology AG.
