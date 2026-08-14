# Randomness Test Lab & NIST SP 800-22 Rev 1a Dashboard

A full-stack web application designed for random number generation (PRNG, TRNG, QRNG) and statistical randomness evaluation using the **NIST SP 800-22 Rev 1a Statistical Test Suite**.

---

## 🧪 Complete Implemented NIST SP 800-22 Test Cases (16 Test Cases)

| # | Statistical Test Case Name | Mathematical Spec & Formula | Purpose & Description |
| :-: | :--- | :--- | :--- |
| **1** | **Frequency (Monobit)** | $S_{\text{obs}} = \frac{\left\vert\sum X_i\right\vert}{\sqrt{n}}$, $P = \text{erfc}\left(\frac{S_{\text{obs}}}{\sqrt{2}}\right)$ | Tests the proportion of zeros and ones across the entire bit sequence. |
| **2** | **Block Frequency** | $\chi^2 = 4M \sum (\pi_i - 0.5)^2$, $P = \text{igamc}\left(\frac{N}{2}, \frac{\chi^2}{2}\right)$ | Tests the proportion of ones within fixed $M$-bit blocks ($M=128$). |
| **3** | **Cumulative Sums (Forward)** | $Z = \max \left\vert S_k \right\vert$ (Forward random walk) | Evaluates maximum excursion of cumulative sum random walk from left to right. |
| **4** | **Cumulative Sums (Reverse)** | $Z = \max \left\vert S_k \right\vert$ (Reverse random walk) | Evaluates maximum excursion of cumulative sum random walk from right to left. |
| **5** | **Runs** | $V_{\text{obs}} = 1 + \sum (X_i \neq X_{i+1})$ | Evaluates the total number of runs (transitions between consecutive 0s and 1s). |
| **6** | **Longest Run of Ones** | $\chi^2$ test on maximum streak lengths in blocks | Evaluates the longest run of ones in $M$-bit blocks against expected distributions. |
| **7** | **Binary Matrix Rank** | Rank over $GF(2)$ for $32 \times 32$ matrices | Tests linear dependence among fixed $M$-bit sub-words via Gaussian elimination over $GF(2)$. |
| **8** | **Discrete Fourier Transform (FFT)** | Peak count threshold $d = \frac{N_1 - N_0}{\sqrt{n \times 0.95 \times 0.05 / 4}}$ | Detects periodic features or repetitive spectral peaks via Fast Fourier Transform. |
| **9** | **Non-Overlapping Template Matching** | $\chi^2 = \sum \frac{(W_i - \mu)^2}{\sigma^2}$ for target $m=9$ template | Detects non-periodic target $m$-bit pattern frequencies across sub-blocks. |
| **10** | **Overlapping Template Matching** | $\chi^2$ goodness-of-fit on overlapping $m=9$ 1-streaks | Evaluates occurrences of overlapping $m$-bit target patterns within fixed blocks. |
| **11** | **Maurer's Universal Statistical** | $f_n = \frac{1}{K} \sum \log_2(\text{dist}_i)$, $L=7, Q=1280$ | Measures sequence compressibility via matching pattern distances. |
| **12** | **Approximate Entropy** | $\text{ApEn} = \Phi(m) - \Phi(m+1)$, $\chi^2 = 2n(\ln 2 - \text{ApEn})$ | Compares frequency of overlapping block patterns of length $m$ and $m+1$. |
| **13** | **Random Excursions** | $\chi^2$ test on random walk state cycle visits | Evaluates state cycle visit counts during random walk trajectory excursions. |
| **14** | **Random Excursions Variant** | $\text{P-value} = \text{erfc}\left(\frac{\left\vert \xi(x) - J \right\vert}{\sqrt{2J(4\left\vert x \right\vert - 2)}}\right)$ | Evaluates specific state counts ($x \in \{-9, \dots, +9\}$) across random walk cycles. |
| **15** | **Serial (Tests 1 & 2)** | $\Psi^2$ statistics over $2^m$ $m$-bit overlapping patterns | Determines whether frequency of all $2^m$ $m$-bit overlapping sub-patterns is uniform. |
| **16** | **Linear Complexity** | Berlekamp-Massey algorithm over $M=500$ bit blocks | Evaluates sequence complexity using LFSR shortest polynomial length. |

---

## 🌟 Key Features

- **Dual Execution Engine Architecture**:
  - Primary **Python SciPy/NumPy Backend** + Standalone **Client-Side Web JS Engine** for 100% cloud uptime.
  - Multi-sequence testing ($s$) with **P-value uniformity ($\chi^2$)** test over 10 bins ($p_T = \text{igamc}(9/2, \chi^2/2)$).
  - Standardized significance level **$\alpha = 0.01$**.

- **Requirement-Based `.txt` File Upload**:
  - Drag & drop uploader for `.txt`, `.bin`, and `.dat` files with live in-browser file preview, total bit count extraction, and $1\text{s} / 0\text{s}$ distribution ratio.
  - Test requirement presets (*Full Suite*, *Core Suite*, *Spectral Suite*, or *Custom Test Selection checkboxes*).

- **Failure Analysis & Bad Generator Laboratory**:
  - Dedicated **Why Tests Fail** tab (`/failures`) with interactive bad generator diagnostics (*All Zeros*, *All Ones*, *Alternating 0101*, *90% Biased Zeros*, *Periodic 00001111*).

- **3 Core Randomness Generators**:
  - **PRNG**: Mersenne Twister (MT19937), PCG32, Xorshift128+, ChaCha20 CSPRNG. **Guarantees 100% seed reproducibility**.
  - **TRNG Simulation**: Harvesters OS system entropy (`urandom`) and microsecond CPU timing jitter. Shannon entropy calculation ($H \approx 0.9999$).
  - **QRNG Simulation**: Photonic 50:50 Beam Splitter model, Vacuum Field Fluctuation model, and ANU Quantum API proxy.

---

## 🏗️ Architecture & Directory Structure

```
randomness-dashboard/
├── frontend/             # React + Vite + Recharts + Lucide Icons
│   ├── src/
│   │   ├── components/   # Navbar, Footer, TestTable, TestResultModal, Charts
│   │   ├── pages/        # Home, PRNG, TRNG, QRNG, NISTTests, Compare, Failures, History, Educational
│   │   ├── utils/        # nistEngineJS.js (Client-side JS NIST Engine)
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── backend/              # Python FastAPI Server
│   ├── main.py           # REST Endpoints
│   ├── nist_engine_fallback.py # Pure Python NIST SP 800-22 Engine
│   ├── nist_runner.py    # NIST C STS Executor & Fallback Router
│   ├── database.py       # SQLite Persistence Layer
│   ├── generators/       # PRNG, TRNG, QRNG Modules
│   └── requirements.txt
└── README.md
```

---

## 🚀 Local Development & Execution Guide

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
