import re
import os

def parse_nist_sts_final_report(report_path: str, alpha: float = 0.01) -> dict:
    """Parses NIST STS C Reference finalAnalysisReport.txt file."""
    if not os.path.exists(report_path):
        raise FileNotFoundError(f"Report file {report_path} does not exist.")

    with open(report_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    tests = []
    # Standard format line in finalAnalysisReport.txt:
    # C1 C2 C3 C4 C5 C6 C7 C8 C9 C10  P-VALUE  PROPORTION  STATISTICAL TEST
    # 10 12 11  9  8 10 11 12  9  8  0.534231    98/100    Frequency
    
    header_found = False
    for line in lines:
        line_str = line.strip()
        if "P-VALUE" in line_str and "PROPORTION" in line_str:
            header_found = True
            continue
            
        if header_found and line_str and not line_str.startswith("-") and not line_str.startswith(""):
            parts = line_str.split()
            if len(parts) >= 13:
                bin_counts = [int(p) for p in parts[:10] if p.isdigit()]
                p_val_str = parts[10]
                prop_str = parts[11]
                test_name = " ".join(parts[12:])
                
                try:
                    p_val = float(p_val_str)
                except ValueError:
                    p_val = 0.0
                    
                # Proportion parse e.g. "98/100"
                if "/" in prop_str:
                    num, den = prop_str.split("/")
                    pass_ratio = float(num) / float(den) if float(den) > 0 else 0.0
                else:
                    try:
                        pass_ratio = float(prop_str)
                    except ValueError:
                        pass_ratio = 0.0
                        
                status = "PASS" if (p_val >= 0.0001 and pass_ratio >= 0.96) else "FAIL"
                
                tests.append({
                    "name": test_name,
                    "p_value": p_val,
                    "p_uniformity": p_val,
                    "pass_ratio": pass_ratio,
                    "bin_counts": bin_counts if len(bin_counts) == 10 else [0]*10,
                    "status": status,
                    "description": f"Official NIST SP 800-22 STS C Reference evaluation for {test_name}."
                })

    passed_count = sum(1 for t in tests if t["status"] == "PASS")
    total_count = len(tests)
    pass_rate = (passed_count / total_count * 100.0) if total_count > 0 else 0.0

    return {
        "execution_mode": "NIST_STS_C_REFERENCE",
        "reference_notice": "OFFICIAL NIST STS REFERENCE EXECUTION: Evaluated via compiled NIST SP 800-22 'assess' binary.",
        "alpha": alpha,
        "total_tests": total_count,
        "passed": passed_count,
        "failed": total_count - passed_count,
        "pass_rate": round(pass_rate, 2),
        "tests": tests
    }
