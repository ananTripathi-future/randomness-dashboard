import sys
import os

sys.path.append(os.path.dirname(__file__))

from generators.prng import generate_prng_bits
from generators.trng import generate_trng_bits
from generators.qrng import generate_qrng_bits
from nist_runner import execute_nist_test_suite
import database

def test_pipeline():
    print("=== Testing PRNG Generator (Seed reproducibility) ===")
    res1 = generate_prng_bits("Mersenne Twister", 1000, seed=12345)
    res2 = generate_prng_bits("Mersenne Twister", 1000, seed=12345)
    assert res1["bits"] == res2["bits"], "Seed reproducibility failed!"
    print("[OK] PRNG seed reproducibility verified!")

    print("\n=== Testing TRNG Simulation ===")
    trng_res = generate_trng_bits("OS System Entropy", 1000)
    print(f"[OK] TRNG generated {trng_res['num_bits']} bits with entropy {trng_res['entropy']}")

    print("\n=== Testing QRNG Simulation ===")
    qrng_res = generate_qrng_bits("Quantum Beam Splitter", 1000)
    print(f"[OK] QRNG generated {qrng_res['num_bits']} bits (p1={qrng_res['photon_one_ratio']})")

    print("\n=== Testing NIST SP 800-22 Test Engine ===")
    nist_eval = execute_nist_test_suite(res1["bits"], alpha=0.01, num_sequences=1)
    print(f"[OK] NIST engine finished. Execution Mode: {nist_eval['execution_mode']}")
    print(f"[OK] Total tests: {nist_eval['total_tests']}, Passed: {nist_eval['passed']}, Pass Rate: {nist_eval['pass_rate']}%")

    print("\n=== Testing Database Storage ===")
    database.init_db()
    run_id = database.save_test_run(
        source_type="PRNG",
        algorithm_or_source="Mersenne Twister",
        sequence_length=1000,
        num_sequences=1,
        alpha=0.01,
        execution_mode=nist_eval["execution_mode"],
        total_tests=nist_eval["total_tests"],
        passed_count=nist_eval["passed"],
        failed_count=nist_eval["failed"],
        pass_rate=nist_eval["pass_rate"],
        results_data=nist_eval,
        seed=12345
    )
    history = database.get_all_test_history(limit=5)
    assert len(history) > 0, "Database save/retrieve failed!"
    print(f"[OK] SQLite persistence verified! Saved Run ID: {run_id}")

    print("\nALL BACKEND PIPELINE TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    test_pipeline()
