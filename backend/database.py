import sqlite3
import json
import os
from datetime import datetime

if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/randomness_history.db"
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "randomness_history.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS test_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        source_type TEXT NOT NULL,
        algorithm_or_source TEXT NOT NULL,
        seed TEXT,
        filename TEXT,
        sequence_length INTEGER NOT NULL,
        num_sequences INTEGER NOT NULL,
        alpha REAL NOT NULL,
        execution_mode TEXT NOT NULL,
        total_tests INTEGER NOT NULL,
        passed_count INTEGER NOT NULL,
        failed_count INTEGER NOT NULL,
        pass_rate REAL NOT NULL,
        results_json TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

def save_test_run(
    source_type: str,
    algorithm_or_source: str,
    sequence_length: int,
    num_sequences: int,
    alpha: float,
    execution_mode: str,
    total_tests: int,
    passed_count: int,
    failed_count: int,
    pass_rate: float,
    results_data: dict,
    seed: int | str | None = None,
    filename: str | None = None
) -> int:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    seed_str = str(seed) if seed is not None else None
    results_json = json.dumps(results_data)
    
    cursor.execute("""
    INSERT INTO test_runs (
        timestamp, source_type, algorithm_or_source, seed, filename,
        sequence_length, num_sequences, alpha, execution_mode,
        total_tests, passed_count, failed_count, pass_rate, results_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        timestamp, source_type, algorithm_or_source, seed_str, filename,
        sequence_length, num_sequences, alpha, execution_mode,
        total_tests, passed_count, failed_count, pass_rate, results_json
    ))
    
    run_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return run_id

def get_all_test_history(limit: int = 50) -> list[dict]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT id, timestamp, source_type, algorithm_or_source, seed, filename,
           sequence_length, num_sequences, alpha, execution_mode,
           total_tests, passed_count, failed_count, pass_rate
    FROM test_runs
    ORDER BY id DESC
    LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_test_run_by_id(run_id: int) -> dict | None:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM test_runs WHERE id = ?", (run_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    data = dict(row)
    data["results_data"] = json.loads(data["results_json"])
    del data["results_json"]
    return data
