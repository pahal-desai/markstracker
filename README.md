# MarksTracker 🎯

A clean, minimalist personal marks tracking web application designed specifically for tracking test performance across Milestone and AITS test series (JEE Main & Advanced).

![MarksTracker](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20TailwindCSS%20%7C%20Chart.js-blue)

---

## ✨ Features

- **4 Dedicated Test Categories**:
  - **Milestone Main** (Fixed 300 marks: 100 Physics, 100 Chemistry, 100 Maths)
  - **Milestone Advanced** (~360 marks variable: custom marks obtained & maximum marks per subject)
  - **AITS Main** (Fixed 300 marks: 100 Physics, 100 Chemistry, 100 Maths)
  - **AITS Advanced** (~360 marks variable: custom marks obtained & maximum marks per subject)
- **Subject-wise Tracking**:
  - Subject breakdown for Physics, Chemistry, and Mathematics.
  - Interactive trend lines for each subject across tests (switch between Percentage % and Raw Marks).
- **Strong & Weak Subject Analysis**:
  - Automatically identifies and ranks your **Strongest**, **Moderate**, and **Priority Focus / Weak** subjects.
  - Compares average percentage, cumulative marks scored, and peak scores.
  - Sub-breakdown for Main vs Advanced performance.
- **Category Comparison Graphs**:
  - Direct comparison of Physics, Chemistry, and Maths averages across Milestone Main/Adv and AITS Main/Adv.
  - Cumulative subject marks view across categories.
- **Total Marks Progression**:
  - Bar chart showing marks obtained versus maximum paper marks over time.
- **Local Storage & Data Portability**:
  - Data persists automatically in browser local storage.
  - **Clean Slate**: Starts completely clean with 0 fake marks—only your actual test scores.
  - **Export to JSON** backup file anytime.
  - **Import / Restore** from JSON backup file.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/pahal-desai/markstracker.git
   cd markstracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack

- **React 18** with **TypeScript**
- **Vite** for rapid bundling and hot module reloading
- **Tailwind CSS** for clean, responsive UI styling
- **Chart.js** & **react-chartjs-2** for interactive visual analytics
- **Lucide React** for icons
