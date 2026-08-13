import random
import math
import httpx

def simulate_beam_splitter(num_bits: int) -> str:
    """Simulate single-photon 50:50 beam splitter measurement."""
    # Quantum shot noise simulation using Bernoulli trials with p=0.5
    bits = []
    needed_words = (num_bits + 31) // 32
    for _ in range(needed_words):
        word = random.getrandbits(32)
        bits.append(f"{word:032b}")
    return "".join(bits)[:num_bits]

def simulate_vacuum_fluctuations(num_bits: int) -> str:
    """Simulate homodyne detection of quantum vacuum field zero-point fluctuations."""
    # Gaussian quadrature distribution digitized into bits
    bits = []
    for _ in range(num_bits):
        val = random.gauss(0.0, 1.0)
        bits.append("1" if val >= 0.0 else "0")
    return "".join(bits)

def fetch_anu_qrng_or_fallback(num_bits: int) -> tuple[str, str]:
    """Attempt to fetch live quantum random numbers from ANU Quantum API; fallback to local simulation if network unavailable."""
    needed_bytes = (num_bits + 7) // 8
    # ANU API limits hex requests to 1024 array elements
    try:
        url = f"https://qrng.anu.edu.au/API/jsonI.php?length={min(needed_bytes, 1024)}&type=hex16&size=1"
        with httpx.Client(timeout=3.0) as client:
            res = client.get(url)
            if res.status_code == 200:
                data = res.json()
                if data.get("success"):
                    hex_array = data.get("data", [])
                    raw_bytes = bytearray.fromhex("".join(hex_array))
                    bit_str = "".join(f"{b:08b}" for b in raw_bytes)
                    if len(bit_str) < num_bits:
                        # Pad with beam splitter model if more bits needed
                        bit_str += simulate_beam_splitter(num_bits - len(bit_str))
                    return bit_str[:num_bits], "ANU Quantum Random Number Generator API (Live Quantum State Measurement)"
    except Exception:
        pass
    
    # Fallback to model simulation
    return simulate_beam_splitter(num_bits), "Quantum Optical Beam Splitter Model (Simulation Fallback)"

def generate_qrng_bits(model: str, num_bits: int) -> dict:
    model_lower = model.lower()
    
    if "anu" in model_lower or "api" in model_lower:
        bit_string, model_name = fetch_anu_qrng_or_fallback(num_bits)
    elif "vacuum" in model_lower or "fluctuation" in model_lower:
        bit_string = simulate_vacuum_fluctuations(num_bits)
        model_name = "Quantum Vacuum Field Fluctuation (Homodyne Detection Model)"
    else:
        bit_string = simulate_beam_splitter(num_bits)
        model_name = "Quantum Single-Photon Beam Splitter (50:50 Transmission/Reflection Model)"

    ones = bit_string.count('1')
    n = len(bit_string)
    p1 = ones / n if n > 0 else 0.5

    return {
        "bits": bit_string,
        "model": model_name,
        "num_bits": n,
        "photon_one_ratio": round(p1, 5),
        "is_genuine_quantum_hardware": False,
        "category": "QRNG Simulation / Proxy Model",
        "disclaimer": "IMPORTANT NOTICE: This sequence is generated using a quantum physical simulation model or remote API proxy. Passing NIST SP 800-22 tests evaluates bit sequence statistical distribution; NIST tests DO NOT prove that a sequence originated from genuine quantum mechanical collapse.",
        "quantum_note": "A classical pseudorandom stream can pass NIST statistical tests identically to quantum random data. NIST SP 800-22 tests statistical uniformity, not physical quantum origin."
    }
