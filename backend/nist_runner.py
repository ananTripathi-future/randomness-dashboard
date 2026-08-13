import os
import shutil
import subprocess
import tempfile

from nist_engine_fallback import run_python_fallback_nist_suite
from result_parser import parse_nist_sts_final_report

def find_nist_assess_executable() -> str | None:
    """Check for standard NIST STS 'assess' executable in PATH or relative directories."""
    # Check PATH
    assess_path = shutil.which("assess") or shutil.which("assess.exe")
    if assess_path:
        return assess_path

    # Check common relative candidate paths
    candidates = [
        "../nist-sts/sts-2.1.2/assess",
        "../nist-sts/assess",
        "./nist-sts/sts-2.1.2/assess",
        "./nist-sts/assess.exe",
        "C:/nist-sts/assess.exe",
        "/usr/local/bin/assess"
    ]
    for candidate in candidates:
        if os.path.exists(candidate) and os.access(candidate, os.X_OK):
            return os.path.abspath(candidate)
            
    return None

def execute_nist_test_suite(bit_str: str, alpha: float = 0.01, num_sequences: int = 1, selected_tests: list[str] | None = None) -> dict:
    """Executes NIST SP 800-22 test suite on supplied bit string. Uses official C reference binary if available, else Python fallback."""
    assess_bin = find_nist_assess_executable()
    
    if assess_bin and os.path.exists(assess_bin):
        try:
            # Create temporary execution directory
            with tempfile.TemporaryDirectory() as tmpdir:
                data_file = os.path.join(tmpdir, "test_sequence.txt")
                with open(data_file, "w", encoding="utf-8") as f:
                    f.write(bit_str)
                    
                seq_len = len(bit_str) // num_sequences
                
                stdin_input = f"0\n{data_file}\n1\n111111111111111\n0\n{num_sequences}\n0\n"
                
                res = subprocess.run(
                    [assess_bin, str(seq_len)],
                    input=stdin_input,
                    text=True,
                    cwd=tmpdir,
                    capture_output=True,
                    timeout=60
                )
                
                report_path = os.path.join(tmpdir, "experiments", "AlgorithmTesting", "finalAnalysisReport.txt")
                if os.path.exists(report_path):
                    parsed_res = parse_nist_sts_final_report(report_path, alpha=alpha)
                    parsed_res["num_sequences"] = num_sequences
                    parsed_res["sequence_length"] = seq_len
                    
                    if selected_tests:
                        filtered = [t for t in parsed_res["tests"] if t["name"] in selected_tests]
                        parsed_res["tests"] = filtered
                        parsed_res["total_tests"] = len(filtered)
                        parsed_res["passed"] = sum(1 for t in filtered if t["status"] == "PASS")
                        parsed_res["failed"] = len(filtered) - parsed_res["passed"]
                        parsed_res["pass_rate"] = round((parsed_res["passed"] / len(filtered) * 100.0), 2) if filtered else 0.0
                    return parsed_res
        except Exception as err:
            print(f"[NIST Runner] Failed to execute C reference binary, falling back to Python engine: {err}")

    # Primary Fallback path when C executable is not installed
    full_res = run_python_fallback_nist_suite(bit_str, alpha=alpha, num_sequences=num_sequences)
    if selected_tests:
        filtered = [t for t in full_res["tests"] if t["name"] in selected_tests]
        full_res["tests"] = filtered
        full_res["total_tests"] = len(filtered)
        full_res["passed"] = sum(1 for t in filtered if t["status"] == "PASS")
        full_res["failed"] = len(filtered) - full_res["passed"]
        full_res["pass_rate"] = round((full_res["passed"] / len(filtered) * 100.0), 2) if filtered else 0.0
    return full_res
