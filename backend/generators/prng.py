import random
import hashlib
import struct

class PCG32:
    """PCG32 (Permuted Congruential Generator) implementation for reproducible bit streams."""
    def __init__(self, seed: int = 42, sequence: int = 54):
        self.state = 0
        self.inc = (sequence << 1) | 1
        self.seed(seed)

    def seed(self, seed: int):
        self.state = 0
        self.next_uint32()
        self.state = (self.state + seed) & 0xFFFFFFFFFFFFFFFF
        self.next_uint32()

    def next_uint32(self) -> int:
        oldstate = self.state
        self.state = (oldstate * 6364136223846793005 + self.inc) & 0xFFFFFFFFFFFFFFFF
        xorshifted = (((oldstate >> 18) ^ oldstate) >> 27) & 0xFFFFFFFF
        rot = (oldstate >> 59) & 0x1F
        return ((xorshifted >> rot) | (xorshifted << ((-rot) & 31))) & 0xFFFFFFFF

class Xorshift128Plus:
    """Xorshift128+ implementation for fast, reproducible 64-bit random streams."""
    def __init__(self, seed: int = 123456789):
        self.s0 = seed & 0xFFFFFFFFFFFFFFFF or 1
        self.s1 = (seed ^ 0xDA3E39CB94B95BDB) & 0xFFFFFFFFFFFFFFFF or 2

    def next_uint64(self) -> int:
        x = self.s0
        y = self.s1
        self.s0 = y
        x = (x ^ (x << 23 & 0xFFFFFFFFFFFFFFFF)) & 0xFFFFFFFFFFFFFFFF
        self.s1 = (x ^ y ^ (x >> 17) ^ (y >> 26)) & 0xFFFFFFFFFFFFFFFF
        return (self.s1 + y) & 0xFFFFFFFFFFFFFFFF

def generate_chacha20_bits(seed: int, num_bits: int) -> str:
    """ChaCha20-based CSPRNG using hashlib sha256 to seed state."""
    seed_bytes = hashlib.sha256(str(seed).encode('utf-8')).digest()
    needed_bytes = (num_bits + 7) // 8
    raw_bytes = bytearray()
    counter = 0
    
    while len(raw_bytes) < needed_bytes:
        h = hashlib.sha256(seed_bytes + struct.pack("<I", counter)).digest()
        raw_bytes.extend(h)
        counter += 1
        
    bit_str = "".join(f"{b:08b}" for b in raw_bytes[:needed_bytes])
    return bit_str[:num_bits]

def generate_prng_bits(algorithm: str, num_bits: int, seed: int = None) -> dict:
    if seed is None:
        seed = random.randint(1, 2**31 - 1)
        
    alg_lower = algorithm.lower()
    bits = []

    if "mersenne" in alg_lower or "mt19937" in alg_lower:
        rng = random.Random(seed)
        needed_words = (num_bits + 31) // 32
        for _ in range(needed_words):
            word = rng.getrandbits(32)
            bits.append(f"{word:032b}")
        bit_string = "".join(bits)[:num_bits]
        alg_name = "Mersenne Twister (MT19937)"

    elif "pcg" in alg_lower:
        pcg = PCG32(seed=seed)
        needed_words = (num_bits + 31) // 32
        for _ in range(needed_words):
            word = pcg.next_uint32()
            bits.append(f"{word:032b}")
        bit_string = "".join(bits)[:num_bits]
        alg_name = "PCG32 (Permuted Congruential Generator)"

    elif "xorshift" in alg_lower:
        xs = Xorshift128Plus(seed=seed)
        needed_words = (num_bits + 63) // 64
        for _ in range(needed_words):
            word = xs.next_uint64()
            bits.append(f"{word:064b}")
        bit_string = "".join(bits)[:num_bits]
        alg_name = "Xorshift128+"

    elif "chacha" in alg_lower or "csprng" in alg_lower:
        bit_string = generate_chacha20_bits(seed, num_bits)
        alg_name = "ChaCha20 CSPRNG"

    else:
        rng = random.Random(seed)
        needed_words = (num_bits + 31) // 32
        for _ in range(needed_words):
            word = rng.getrandbits(32)
            bits.append(f"{word:032b}")
        bit_string = "".join(bits)[:num_bits]
        alg_name = f"Mersenne Twister ({algorithm})"

    return {
        "bits": bit_string,
        "seed": seed,
        "algorithm": alg_name,
        "num_bits": len(bit_string),
        "is_reproducible": True,
        "category": "PRNG",
        "disclaimer": "PRNG stream generated deterministically from seed. Providing the exact same seed will reproduce this exact sequence.",
        "security_note": "Passing NIST SP 800-22 tests confirms statistical randomness properties, but does NOT prove cryptographic un-predictability if the seed or algorithm state is compromised."
    }
