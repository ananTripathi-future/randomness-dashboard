# Randomness Test Lab & NIST SP 800-22 Rev 1a Dashboard

A full-stack web application designed for random number generation (PRNG, TRNG, QRNG) and statistical randomness evaluation using the **NIST SP 800-22 Rev 1a Statistical Test Suite**.

---

## 🌟 Key Features

- **NIST SP 800-22 Statistical Test Suite (15 Tests)**:
  - Frequency (Monobit), Block Frequency, Cumulative Sums (Forward/Reverse), Runs, Longest Run of Ones, Binary Matrix Rank GF(2), Discrete Fourier Transform (Spectral FFT), Non-Overlapping Template, Overlapping Template, Universal Statistical, Approximate Entropy, Serial (Tests 1 & 2), and Linear Complexity (Berlekamp-Massey).
  - Primary validation via official **NIST STS C Reference binary** (`assess`), with automatic fallback to a pure Python SciPy engine.
  - Multi-sequence testing ($s$) with **P-value uniformity ($\chi^2$)** test over 10 bins ($p_T = \text{igamc}(9/2, \chi^2/2)$).
  - Standardized significance level **$\alpha = 0.01$**.

- **Requirement-Based `.txt` File Upload**:
  - Drag & drop uploader for `.txt`, `.bin`, and `.dat` files with live in-browser file preview, total bit count extraction, and $1\text{s} / 0\text{s}$ distribution ratio.
  - Test requirement presets (*Full Suite*, *Core Suite*, *Spectral Suite*, or *Custom Test Selection checkboxes*).

- **3 Core Randomness Generators**:
  - **PRNG**: Mersenne Twister (MT19937), PCG32, Xorshift128+, ChaCha20 CSPRNG. **Guarantees 100% seed reproducibility**.
  - **TRNG Simulation**: Harvesters OS system entropy (`urandom`) and microsecond CPU timing jitter. Shannon entropy calculation ($H \approx 0.9999$).
  - **QRNG Simulation**: Photonic 50:50 Beam Splitter model, Vacuum Field Fluctuation model, and ANU Quantum API proxy.

- **Interactive Visualizations & History**:
  - Recharts Donut Pass/Fail Ratio, P-value Scatter Plot, and Uniformity Histogram graphs.
  - SQLite database storing test run history with JSON export.
  - Educational section clarifying: **Statistical PASS ≠ Cryptographic Proof** and **NIST PASS ≠ Quantum Origin Proof**.

---

## 🏗️ Architecture

```
randomness-dashboard/
├── frontend/             # React + Vite + Recharts + Lucide Icons
│   ├── src/
│   │   ├── components/   # Navbar, Footer, TestTable, TestResultModal, Charts
│   │   ├── pages/        # Home, PRNG, TRNG, QRNG, NISTTests, Compare, History, Educational
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── backend/              # Python FastAPI Server
│   ├── main.py           # REST Endpoints
│   ├── nist_runner.py    # NIST C STS Executor & Fallback Router
│   ├── nist_engine_fallback.py # Pure Python NIST SP 800-22 Engine
│   ├── result_parser.py  # NIST C Report Parser
│   ├── database.py       # SQLite Persistence Layer
│   ├── generators/       # PRNG, TRNG, QRNG Modules
│   └── requirements.txt
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend API
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/Kali: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000`.

### 2. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Frontend Dashboard will be live at `http://localhost:5173`.

---

## 📜 License & Disclaimers

NIST SP 800-22 is a specification developed by the National Institute of Standards and Technology. Statistical testing evaluates sequence bit distribution uniformity and non-periodicity. Passing NIST tests does not imply cryptographic un-predictability or proof of physical quantum origin.
