import math
import numpy as np
from scipy import special, stats
import re

def monobit_frequency_test(bit_str: str) -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    if n == 0:
        return 0.0
    ones = bit_str.count('1')
    sum_val = ones - (n - ones)
    s_obs = abs(sum_val) / math.sqrt(n)
    p_val = math.erfc(s_obs / math.sqrt(2))
    return p_val

def block_frequency_test(bit_str: str, block_size: int = 128) -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    num_blocks = n // block_size
    if num_blocks == 0:
        return 0.0
    
    chi_sq = 0.0
    for i in range(num_blocks):
        block = bit_str[i * block_size : (i + 1) * block_size]
        pi = block.count('1') / block_size
        chi_sq += (pi - 0.5) ** 2
        
    chi_sq *= 4.0 * block_size
    p_val = special.gammaincc(num_blocks / 2.0, chi_sq / 2.0)
    return float(p_val)

def cumulative_sums_test(bit_str: str, mode: str = 'forward') -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    if n == 0:
        return 0.0
    
    # Vectorized conversion using NumPy
    arr = np.frombuffer(bit_str.encode('ascii'), dtype=np.uint8)
    x = np.where(arr == 49, 1, -1)
    if mode == 'reverse':
        x = x[::-1]
    
    cusum = np.cumsum(x)
    z = int(np.max(np.abs(cusum)))
    
    if z == 0:
        return 1.0
        
    start1 = int((-n / z + 1) / 4)
    end1 = int((n / z - 1) / 4)
    sum1 = 0.0
    for k in range(start1, end1 + 1):
        term1 = stats.norm.cdf((4 * k + 1) * z / math.sqrt(n))
        term2 = stats.norm.cdf((4 * k - 1) * z / math.sqrt(n))
        sum1 += (term1 - term2)
        
    start2 = int((-n / z - 3) / 4)
    end2 = int((n / z - 1) / 4)
    sum2 = 0.0
    for k in range(start2, end2 + 1):
        term1 = stats.norm.cdf((4 * k + 3) * z / math.sqrt(n))
        term2 = stats.norm.cdf((4 * k + 1) * z / math.sqrt(n))
        sum2 += (term1 - term2)
        
    p_val = 1.0 - sum1 + sum2
    return float(np.clip(p_val, 0.0, 1.0))

def runs_test(bit_str: str) -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    if n == 0:
        return 0.0
    ones = bit_str.count('1')
    pi = ones / n
    
    if abs(pi - 0.5) >= (2.0 / math.sqrt(n)):
        return 0.0
        
    # Vectorized run counting using NumPy diff
    arr = np.frombuffer(bit_str.encode('ascii'), dtype=np.uint8)
    v_obs = 1 + int(np.count_nonzero(arr[:-1] != arr[1:]))
            
    num = abs(v_obs - 2.0 * n * pi * (1.0 - pi))
    den = 2.0 * math.sqrt(2.0 * n) * pi * (1.0 - pi)
    p_val = math.erfc(num / den)
    return float(p_val)

def longest_run_ones_test(bit_str: str) -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    if n < 128:
        return 0.0
    
    if n < 6272:
        m = 8
        k = 3
        n_blocks = 16
        pi = [0.2148, 0.3672, 0.2305, 0.1875]
    elif n < 75000:
        m = 128
        k = 5
        n_blocks = n // m
        pi = [0.1174, 0.2430, 0.2493, 0.1752, 0.1027, 0.1124]
    else:
        m = 10000
        k = 6
        n_blocks = n // m
        pi = [0.0882, 0.2092, 0.2483, 0.1933, 0.1208, 0.0679, 0.0723]
        
    counts = [0] * (k + 1)
    
    for i in range(n_blocks):
        block = bit_str[i*m : (i+1)*m]
        # find longest run of 1s
        max_run = max((len(run) for run in block.split('0')), default=0)
        
        if m == 8:
            if max_run <= 1: counts[0] += 1
            elif max_run == 2: counts[1] += 1
            elif max_run == 3: counts[2] += 1
            else: counts[3] += 1
        elif m == 128:
            if max_run <= 4: counts[0] += 1
            elif max_run == 5: counts[1] += 1
            elif max_run == 6: counts[2] += 1
            elif max_run == 7: counts[3] += 1
            elif max_run == 8: counts[4] += 1
            else: counts[5] += 1
        else: # m == 10000
            if max_run <= 10: counts[0] += 1
            elif max_run == 11: counts[1] += 1
            elif max_run == 12: counts[2] += 1
            elif max_run == 13: counts[3] += 1
            elif max_run == 14: counts[4] += 1
            elif max_run == 15: counts[5] += 1
            else: counts[6] += 1

    chi_sq = 0.0
    for i in range(k + 1):
        chi_sq += ((counts[i] - n_blocks * pi[i]) ** 2) / (n_blocks * pi[i])
        
    p_val = special.gammaincc(k / 2.0, chi_sq / 2.0)
    return float(p_val)

def matrix_rank_test(bit_str: str, row_size: int = 32, col_size: int = 32) -> float:
    n = len(bit_str)
    matrix_size = row_size * col_size
    # Cap evaluated matrices to 1000 max (320,000 bits) for sub-second performance
    num_matrices = min(n // matrix_size, 1000)
    if num_matrices == 0:
        return 0.0
    
    r32 = 0
    r31 = 0
    r30 = 0
    
    for i in range(num_matrices):
        chunk = bit_str[i*matrix_size : (i+1)*matrix_size]
        arr = np.array([int(b) for b in chunk], dtype=np.uint8).reshape((row_size, col_size))
        
        # GF(2) Matrix Rank via Gaussian Elimination
        mat = arr.copy()
        rank = 0
        for col in range(col_size):
            pivot = -1
            for r in range(rank, row_size):
                if mat[r, col] == 1:
                    pivot = r
                    break
            if pivot != -1:
                mat[[rank, pivot]] = mat[[pivot, rank]]
                for r in range(row_size):
                    if r != rank and mat[r, col] == 1:
                        mat[r] = mat[r] ^ mat[rank]
                rank += 1
                
        if rank == row_size:
            r32 += 1
        elif rank == row_size - 1:
            r31 += 1
        else:
            r30 += 1
            
    p32 = 0.2888
    p31 = 0.5776
    p30 = 0.1336
    
    chi_sq = (((r32 - p32 * num_matrices) ** 2) / (p32 * num_matrices) +
              ((r31 - p31 * num_matrices) ** 2) / (p31 * num_matrices) +
              ((r30 - p30 * num_matrices) ** 2) / (p30 * num_matrices))
              
    p_val = math.exp(-chi_sq / 2.0)
    return float(p_val)

def dft_spectral_test(bit_str: str) -> float:
    # Cap FFT sample length to max 1,000,000 bits for sub-second execution
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    if n == 0:
        return 0.0
    x = np.array([1 if b == '1' else -1 for b in bit_str], dtype=np.int8)
    s = np.abs(np.fft.fft(x))[:n // 2]
    h = 0.95
    t = math.sqrt(math.log(1.0 / (1.0 - h)) * n)
    n0 = h * n / 2.0
    n1 = np.sum(s < t)
    d = (n1 - n0) / math.sqrt(n * 0.95 * 0.05 / 4.0)
    p_val = math.erfc(abs(d) / math.sqrt(2))
    return float(p_val)

def approximate_entropy_test(bit_str: str, m: int = 10) -> float:
    # Cap sample to 500,000 bits for fast execution
    if len(bit_str) > 500000:
        bit_str = bit_str[:500000]
    n = len(bit_str)
    if n < (2**m):
        m = max(2, int(math.log2(n)) - 2)
        
    def phi(block_len):
        extended = bit_str + bit_str[:block_len - 1]
        counts = {}
        for i in range(n):
            pattern = extended[i : i + block_len]
            counts[pattern] = counts.get(pattern, 0) + 1
        sum_p = 0.0
        for cnt in counts.values():
            p = cnt / n
            sum_p += p * math.log(p)
        return sum_p

    phi_m = phi(m)
    phi_m1 = phi(m + 1)
    apen = phi_m - phi_m1
    chi_sq = 2.0 * n * (math.log(2) - apen)
    p_val = special.gammaincc(2**(m-1), chi_sq / 2.0)
    return float(p_val)

def serial_test(bit_str: str, m: int = 16) -> tuple[float, float]:
    # Cap sample to 500,000 bits for fast execution
    if len(bit_str) > 500000:
        bit_str = bit_str[:500000]
    n = len(bit_str)
    if n < (2**m):
        m = max(2, int(math.log2(n)) - 3)
        
    def psi_sq(block_len):
        if block_len == 0:
            return 0.0
        extended = bit_str + bit_str[:block_len - 1]
        counts = {}
        for i in range(n):
            pattern = extended[i : i + block_len]
            counts[pattern] = counts.get(pattern, 0) + 1
        sum_sq = sum(cnt**2 for cnt in counts.values())
        return (2**block_len / n) * sum_sq - n

    psim = psi_sq(m)
    psim1 = psi_sq(m - 1)
    psim2 = psi_sq(m - 2)

    d1 = psim - psim1
    d2 = psim - 2 * psim1 + psim2

    p_val1 = special.gammaincc(2**(m-2), d1 / 2.0)
    p_val2 = special.gammaincc(2**(m-3), d2 / 2.0)
    return float(p_val1), float(p_val2)

def berlekamp_massey_lfsr(block: list[int]) -> int:
    """Berlekamp-Massey algorithm to find linear complexity of binary block."""
    n = len(block)
    b = [0] * n
    c = [0] * n
    b[0] = 1
    c[0] = 1
    l = 0
    m = -1
    for i in range(n):
        d = block[i]
        for j in range(1, l + 1):
            d ^= c[j] & block[i - j]
        if d == 1:
            t = c[:]
            p = i - m
            for j in range(n - p):
                c[j + p] ^= b[j]
            if l <= i // 2:
                l = i + 1 - l
                m = i
                b = t
    return l

def linear_complexity_test(bit_str: str, block_size: int = 500) -> float:
    n = len(bit_str)
    # Cap evaluated blocks to 1000 max (500,000 bits) for sub-second execution
    num_blocks = min(n // block_size, 1000)
    if num_blocks == 0:
        return 0.0
        
    mu = block_size / 2.0 + (9.0 + (-1)**(block_size + 1)) / 36.0 - (block_size / 3.0 + 2.0 / 9.0) / (2**block_size)
    pi = [0.010417, 0.03125, 0.125, 0.5, 0.25, 0.0625, 0.020833]
    v = [0] * 7
    
    for i in range(num_blocks):
        block_bits = [int(b) for b in bit_str[i*block_size : (i+1)*block_size]]
        lc = berlekamp_massey_lfsr(block_bits)
        t = (-1)**block_size * (lc - mu) + 2.0 / 9.0
        
        if t <= -2.5: v[0] += 1
        elif t <= -1.5: v[1] += 1
        elif t <= -0.5: v[2] += 1
        elif t <= 0.5: v[3] += 1
        elif t <= 1.5: v[4] += 1
        elif t <= 2.5: v[5] += 1
        else: v[6] += 1
        
    chi_sq = 0.0
    for i in range(7):
        chi_sq += ((v[i] - num_blocks * pi[i]) ** 2) / (num_blocks * pi[i])
        
    p_val = special.gammaincc(3.0, chi_sq / 2.0)
    return float(p_val)

def non_overlapping_template_test(bit_str: str, template: str = "000000001", m: int = 9) -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    num_blocks = 8
    block_size = n // num_blocks
    if block_size < m:
        return 0.0
    
    w = [0] * num_blocks
    for i in range(num_blocks):
        block = bit_str[i*block_size : (i+1)*block_size]
        pos = 0
        while pos <= len(block) - m:
            if block[pos : pos + m] == template:
                w[i] += 1
                pos += m
            else:
                pos += 1
                
    mu = (block_size - m + 1) / (2**m)
    var = block_size * ((1.0 / (2**m)) - ((2 * m - 1) / (2**(2*m))))
    if var <= 0: var = 1.0
    
    chi_sq = sum(((w[i] - mu)**2) / var for i in range(num_blocks))
    return float(special.gammaincc(num_blocks / 2.0, chi_sq / 2.0))

def overlapping_template_test(bit_str: str, m: int = 9) -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    num_blocks = 500
    block_size = 1032
    if n < num_blocks * block_size:
        num_blocks = max(1, n // block_size)
    
    template = "1" * m
    pi = [0.364091, 0.185659, 0.139381, 0.100571, 0.0704323, 0.139865]
    counts = [0] * 6
    
    for i in range(num_blocks):
        block = bit_str[i*block_size : (i+1)*block_size]
        cnt = 0
        for j in range(len(block) - m + 1):
            if block[j : j + m] == template:
                cnt += 1
        if cnt <= 0: counts[0] += 1
        elif cnt == 1: counts[1] += 1
        elif cnt == 2: counts[2] += 1
        elif cnt == 3: counts[3] += 1
        elif cnt == 4: counts[4] += 1
        else: counts[5] += 1

    chi_sq = sum(((counts[i] - num_blocks * pi[i])**2) / (num_blocks * pi[i]) for i in range(6))
    return float(special.gammaincc(2.5, chi_sq / 2.0))

def maurers_universal_test(bit_str: str, L: int = 7, Q: int = 1280) -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    K = (n // L) - Q
    if K <= 0:
        return 0.5
    
    table = {}
    for i in range(1, Q + 1):
        block = bit_str[(i-1)*L : i*L]
        table[block] = i
        
    sum_log = 0.0
    for i in range(Q + 1, Q + K + 1):
        block = bit_str[(i-1)*L : i*L]
        last_pos = table.get(block, 0)
        dist = i - last_pos
        table[block] = i
        sum_log += math.log2(dist) if dist > 0 else 0
        
    fn = sum_log / K
    expected_value = 6.0506
    variance = 3.125
    c = 0.7 - 0.8 / L + (4.0 + 32.0 / L) * (K ** (-3.0 / L)) / 15.0
    sigma = c * math.sqrt(variance / K)
    if sigma <= 0: return 0.5
    
    val = abs(fn - expected_value) / (math.sqrt(2.0) * sigma)
    return float(special.erfc(val))

def random_excursions_test(bit_str: str) -> float:
    if len(bit_str) > 1000000:
        bit_str = bit_str[:1000000]
    n = len(bit_str)
    if n == 0: return 0.0
    
    x = np.frombuffer(bit_str.encode('ascii'), dtype=np.uint8)
    vals = np.where(x == 49, 1, -1)
    s = np.cumsum(vals)
    
    cycles = int(np.count_nonzero(s == 0))
    if cycles == 0:
        return 1.0
        
    state1_count = int(np.count_nonzero(s == 1))
    pi = 0.5
    chi_sq = ((state1_count - cycles * pi) ** 2) / (cycles * pi)
    return float(special.gammaincc(0.5, chi_sq / 2.0))

def compute_pvalue_uniformity(p_values: list[float]) -> tuple[float, list[int]]:
    """NIST SP 800-22 Chi-Square test for P-value uniformity over 10 bins."""
    s = len(p_values)
    if s == 0:
        return 0.0, [0] * 10
        
    bins = [0] * 10
    for p in p_values:
        idx = min(9, int(p * 10))
        bins[idx] += 1
        
    exp_freq = s / 10.0
    chi_sq = sum(((b - exp_freq) ** 2) / exp_freq for b in bins)
    p_uniformity = special.gammaincc(9 / 2.0, chi_sq / 2.0)
    return float(p_uniformity), bins

def run_python_fallback_nist_suite(bit_str: str, alpha: float = 0.01, num_sequences: int = 1) -> dict:
    """Runs Python approximation of NIST SP 800-22 tests over 1 or multiple sequences."""
    n_total = len(bit_str)
    seq_len = n_total // num_sequences if num_sequences > 0 else n_total
    
    if seq_len < 100:
        num_sequences = 1
        seq_len = n_total

    sequences = [bit_str[i*seq_len : (i+1)*seq_len] for i in range(num_sequences)]
    
    test_definitions = [
        ("Frequency (Monobit)", monobit_frequency_test),
        ("Block Frequency", lambda s: block_frequency_test(s, 128)),
        ("Cumulative Sums (Forward)", lambda s: cumulative_sums_test(s, 'forward')),
        ("Cumulative Sums (Reverse)", lambda s: cumulative_sums_test(s, 'reverse')),
        ("Runs", runs_test),
        ("Longest Run of Ones", longest_run_ones_test),
        ("Binary Matrix Rank", lambda s: matrix_rank_test(s, 32, 32)),
        ("Discrete Fourier Transform (FFT)", dft_spectral_test),
        ("Non-Overlapping Template Matching", lambda s: non_overlapping_template_test(s, "000000001", 9)),
        ("Overlapping Template Matching", lambda s: overlapping_template_test(s, 9)),
        ("Maurer's Universal Statistical", lambda s: maurers_universal_test(s, 7, 1280)),
        ("Approximate Entropy", lambda s: approximate_entropy_test(s, 10)),
        ("Random Excursions", random_excursions_test),
        ("Serial (Test 1)", lambda s: serial_test(s, 16)[0]),
        ("Serial (Test 2)", lambda s: serial_test(s, 16)[1]),
        ("Linear Complexity", lambda s: linear_complexity_test(s, 500)),
    ]

    results = []
    total_tests_run = 0
    passed_tests_count = 0

    # Calculate proportion pass threshold according to NIST formula
    # Confidence interval: (1 - alpha) +/- 3 * sqrt(alpha * (1 - alpha) / s)
    if num_sequences > 1:
        min_pass_prop = (1.0 - alpha) - 3.0 * math.sqrt(alpha * (1.0 - alpha) / num_sequences)
        min_pass_prop = max(0.0, min_pass_prop)
    else:
        min_pass_prop = 1.0

    for name, test_func in test_definitions:
        p_vals = []
        for seq in sequences:
            try:
                pval = test_func(seq)
                p_vals.append(pval)
            except Exception:
                p_vals.append(0.0)
                
        passes = [p for p in p_vals if p >= alpha]
        pass_ratio = len(passes) / num_sequences
        
        if num_sequences > 1:
            p_uniformity, bin_counts = compute_pvalue_uniformity(p_vals)
            status = "PASS" if (pass_ratio >= min_pass_prop and p_uniformity >= 0.0001) else "FAIL"
        else:
            p_uniformity = p_vals[0]
            bin_counts = [1 if min(9, int(p_vals[0] * 10)) == i else 0 for i in range(10)]
            status = "PASS" if p_vals[0] >= alpha else "FAIL"

        total_tests_run += 1
        if status == "PASS":
            passed_tests_count += 1

        results.append({
            "name": name,
            "p_value": p_vals[0] if num_sequences == 1 else round(float(np.mean(p_vals)), 6),
            "p_values_all": [round(p, 6) for p in p_vals[:20]], # Cap list sample
            "p_uniformity": round(p_uniformity, 6),
            "pass_ratio": round(pass_ratio, 4),
            "bin_counts": bin_counts,
            "status": status,
            "description": f"Statistical test evaluation for {name} across {num_sequences} sequence(s)."
        })

    pass_rate = (passed_tests_count / total_tests_run * 100.0) if total_tests_run > 0 else 0.0

    return {
        "execution_mode": "PYTHON_FALLBACK_APPROXIMATION",
        "reference_notice": "NOTICE: Executed via Python NIST approximation module. Official validation should run through standard NIST STS C executable ('assess').",
        "alpha": alpha,
        "num_sequences": num_sequences,
        "sequence_length": seq_len,
        "total_tests": total_tests_run,
        "passed": passed_tests_count,
        "failed": total_tests_run - passed_tests_count,
        "pass_rate": round(pass_rate, 2),
        "min_pass_threshold_proportion": round(min_pass_prop, 4),
        "tests": results
    }
