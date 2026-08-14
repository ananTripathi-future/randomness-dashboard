from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sys
import os

# Add local path for relative imports
sys.path.append(os.path.dirname(__file__))

from generators.prng import generate_prng_bits
from generators.trng import generate_trng_bits
from generators.qrng import generate_qrng_bits
from nist_runner import execute_nist_test_suite
import database

database.init_db()

app = FastAPI(
    title="Randomness Test Lab & NIST SP 800-22 Engine API",
    description="Backend service for random number generators and statistical randomness evaluation.",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PRNGRequest(BaseModel):
    algorithm: str = Field(default="Mersenne Twister")
    num_bits: int = Field(default=100000, ge=100, le=5000000)
    seed: int | None = Field(default=None)

class TRNGRequest(BaseModel):
    source_type: str = Field(default="OS System Entropy")
    num_bits: int = Field(default=100000, ge=100, le=5000000)

class QRNGRequest(BaseModel):
    model: str = Field(default="Quantum Beam Splitter")
    num_bits: int = Field(default=100000, ge=100, le=5000000)

class NISTRunRequest(BaseModel):
    bit_str: str
    alpha: float = Field(default=0.01, ge=0.0001, le=0.1)
    num_sequences: int = Field(default=1, ge=1, le=1000)
    source_type: str = Field(default="Custom Bit Sequence")
    algorithm_or_source: str = Field(default="User Input Stream")
    seed: int | str | None = Field(default=None)
    selected_tests: list[str] | None = Field(default=None)

class CompareRequest(BaseModel):
    num_bits: int = Field(default=100000, ge=100, le=1000000)
    alpha: float = Field(default=0.01)
    prng_seed: int = Field(default=123456)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Randomness Test Lab Backend",
        "default_alpha": 0.01,
        "database": "SQLite connected"
    }

@app.post("/api/generate/prng")
def api_generate_prng(req: PRNGRequest):
    res = generate_prng_bits(algorithm=req.algorithm, num_bits=req.num_bits, seed=req.seed)
    return res

@app.post("/api/generate/trng")
def api_generate_trng(req: TRNGRequest):
    res = generate_trng_bits(source_type=req.source_type, num_bits=req.num_bits)
    return res

@app.post("/api/generate/qrng")
def api_generate_qrng(req: QRNGRequest):
    res = generate_qrng_bits(model=req.model, num_bits=req.num_bits)
    return res

import asyncio

@app.post("/api/nist/run")
async def api_run_nist(req: NISTRunRequest):
    if not req.bit_str:
        raise HTTPException(status_code=400, detail="bit_str cannot be empty")
        
    clean_bits = "".join(c for c in req.bit_str if c in ('0', '1'))
    if len(clean_bits) < 100:
        raise HTTPException(status_code=400, detail="bit sequence must contain at least 100 valid bits ('0' and '1')")
        
    nist_res = await asyncio.to_thread(
        execute_nist_test_suite,
        bit_str=clean_bits,
        alpha=req.alpha,
        num_sequences=req.num_sequences,
        selected_tests=req.selected_tests
    )
    
    run_id = database.save_test_run(
        source_type=req.source_type,
        algorithm_or_source=req.algorithm_or_source,
        sequence_length=nist_res.get("sequence_length", len(clean_bits)),
        num_sequences=req.num_sequences,
        alpha=req.alpha,
        execution_mode=nist_res.get("execution_mode", "UNKNOWN"),
        total_tests=nist_res.get("total_tests", 0),
        passed_count=nist_res.get("passed", 0),
        failed_count=nist_res.get("failed", 0),
        pass_rate=nist_res.get("pass_rate", 0.0),
        results_data=nist_res,
        seed=req.seed,
        filename=None
    )
    
    nist_res["run_id"] = run_id
    return nist_res

@app.post("/api/nist/upload")
async def api_upload_file(
    file: UploadFile = File(...),
    alpha: float = Form(0.01),
    num_sequences: int = Form(1),
    selected_tests_json: str | None = Form(None)
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
    import json
    selected_tests = None
    if selected_tests_json:
        try:
            selected_tests = json.loads(selected_tests_json)
        except Exception:
            selected_tests = None

    try:
        text = content.decode("utf-8")
        clean_bits = "".join(c for c in text if c in ('0', '1'))
        if len(clean_bits) < 100:
            clean_bits = "".join(f"{b:08b}" for b in content)
    except Exception:
        clean_bits = "".join(f"{b:08b}" for b in content)

    if len(clean_bits) < 100:
        raise HTTPException(status_code=400, detail="Could not extract at least 100 bits from file")
        
    nist_res = await asyncio.to_thread(
        execute_nist_test_suite,
        bit_str=clean_bits,
        alpha=alpha,
        num_sequences=num_sequences,
        selected_tests=selected_tests
    )
    
    run_id = database.save_test_run(
        source_type="Text/Binary File Upload",
        algorithm_or_source=file.filename or "Uploaded File",
        sequence_length=nist_res.get("sequence_length", len(clean_bits)),
        num_sequences=num_sequences,
        alpha=alpha,
        execution_mode=nist_res.get("execution_mode", "UNKNOWN"),
        total_tests=nist_res.get("total_tests", 0),
        passed_count=nist_res.get("passed", 0),
        failed_count=nist_res.get("failed", 0),
        pass_rate=nist_res.get("pass_rate", 0.0),
        results_data=nist_res,
        seed=None,
        filename=file.filename
    )
    
    nist_res["run_id"] = run_id
    return nist_res

@app.post("/api/compare/run")
def api_compare_generators(req: CompareRequest):
    # 1. PRNG
    prng_gen = generate_prng_bits("Mersenne Twister", req.num_bits, seed=req.prng_seed)
    prng_eval = execute_nist_test_suite(prng_gen["bits"], alpha=req.alpha)
    
    # 2. TRNG
    trng_gen = generate_trng_bits("OS System Entropy", req.num_bits)
    trng_eval = execute_nist_test_suite(trng_gen["bits"], alpha=req.alpha)
    
    # 3. QRNG
    qrng_gen = generate_qrng_bits("Quantum Beam Splitter", req.num_bits)
    qrng_eval = execute_nist_test_suite(qrng_gen["bits"], alpha=req.alpha)
    
    return {
        "num_bits": req.num_bits,
        "alpha": req.alpha,
        "comparison": [
            {
                "category": "PRNG",
                "name": "Mersenne Twister",
                "seed": req.prng_seed,
                "is_hardware": False,
                "is_reproducible": True,
                "passed": prng_eval.get("passed", 0),
                "total": prng_eval.get("total_tests", 0),
                "pass_rate": prng_eval.get("pass_rate", 0.0),
                "eval": prng_eval
            },
            {
                "category": "TRNG Simulation",
                "name": "OS System Entropy Pool",
                "seed": "Non-deterministic",
                "is_hardware": False,
                "is_reproducible": False,
                "passed": trng_eval.get("passed", 0),
                "total": trng_eval.get("total_tests", 0),
                "pass_rate": trng_eval.get("pass_rate", 0.0),
                "eval": trng_eval
            },
            {
                "category": "QRNG Simulation",
                "name": "Quantum Beam Splitter Model",
                "seed": "Non-deterministic",
                "is_hardware": False,
                "is_reproducible": False,
                "passed": qrng_eval.get("passed", 0),
                "total": qrng_eval.get("total_tests", 0),
                "pass_rate": qrng_eval.get("pass_rate", 0.0),
                "eval": qrng_eval
            }
        ]
    }

@app.get("/api/history")
def api_get_history(limit: int = 50):
    return database.get_all_test_history(limit=limit)

@app.get("/api/history/{run_id}")
def api_get_history_detail(run_id: int):
    record = database.get_test_run_by_id(run_id)
    if not record:
        raise HTTPException(status_code=404, detail="Run ID not found")
    return record

from security_simulator import generate_otp_from_source, generate_nonce_hex, run_controlled_otp_experiment

class OTPAnalysisRequest(BaseModel):
    source: str = "ChaCha20"
    count: int = 100000
    seed: int = 42

class BankingTxRequest(BaseModel):
    account_name: str = "ANANT"
    recipient_account: str = "XYZ-987"
    amount: float = 5000.0
    source: str = "ChaCha20"

class DefenceCmdRequest(BaseModel):
    sender: str = "COMMAND"
    receiver: str = "DRONE-07"
    message: str = "MOVE TO SECTOR B"
    source: str = "ChaCha20"

@app.post("/api/simulator/otp_analysis")
def api_otp_analysis(req: OTPAnalysisRequest):
    return run_controlled_otp_experiment(source=req.source, count=req.count, seed=req.seed)

@app.post("/api/simulator/banking_tx")
def api_banking_tx(req: BankingTxRequest):
    otp = generate_otp_from_source(req.source)
    session_id = f"SESS-{generate_nonce_hex(req.source, 8).upper()}"
    nonce = generate_nonce_hex(req.source, 12)
    return {
        "account_name": req.account_name,
        "recipient": req.recipient_account,
        "amount": req.amount,
        "source": req.source,
        "otp": otp,
        "session_id": session_id,
        "transaction_nonce": nonce,
        "status": "OTP_GENERATED_PENDING_VERIFICATION"
    }

@app.post("/api/simulator/defence_cmd")
def api_defence_cmd(req: DefenceCmdRequest):
    session_key = generate_nonce_hex(req.source, 16).upper() # 128-bit key
    gcm_nonce = generate_nonce_hex(req.source, 12).upper()   # 96-bit AES-GCM nonce
    ciphertext = f"ENC[{hashlib.sha256((req.message + gcm_nonce).encode()).hexdigest()[:24].upper()}]"
    
    return {
        "sender": req.sender,
        "receiver": req.receiver,
        "message": req.message,
        "source": req.source,
        "session_key": session_key,
        "gcm_nonce": gcm_nonce,
        "encrypted_payload": ciphertext,
        "status": "ENCRYPTED_COMMAND_TRANSMITTED"
    }
