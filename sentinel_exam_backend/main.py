from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import asyncio
import hashlib
import base64
from typing import List
from modules.proctor_ai import proctor_engine

app = FastAPI(title="SentinelExam Security Core")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SecurityStatus(BaseModel):
    hardware_id: str
    user_id: str
    timestamp: float
    rolling_hash: str
    salt: str

@app.get("/")
async def root():
    return {"status": "Sentinel Core Online", "version": "2.0.0-React-Native"}

@app.get("/api/security/rolling-key", response_model=SecurityStatus)
async def get_rolling_key(user_id: str = "STUDENT-8842", hw_id: str = "HW-TRX-9902"):
    """
    Generates a server-side hardware-bound rolling key.
    """
    ts = time.time()
    # Batch into 10-second windows (1 decasecond) to match client-side Math.floor(Date.now() / 10000)
    batch_ts = int(ts // 10)
    raw = f"{hw_id}:{user_id}:{batch_ts}"
    
    sha256 = hashlib.sha256(raw.encode()).hexdigest()
    salt = base64.b64encode(sha256[:16].encode()).decode()
    
    return SecurityStatus(
        hardware_id=hw_id,
        user_id=user_id,
        timestamp=ts,
        rolling_hash=sha256,
        salt=salt
    )

@app.post("/api/security/verify-access")
async def verify_access(payload: dict):
    """
    Verifies if the client has all security shields active before granting decryption key.
    """
    # Simulation: In a real app, we'd check signed device tokens
    await asyncio.sleep(1) # Asynchronous sleep doesn't block the event loop
    return {"granted": True, "token": "DECRYPT_KEY_MOCK_SHA512_..."}

@app.get("/api/proctor/status")
async def proctor_status():
    """
    Returns the real-time AI proctoring health.
    """
    scan = proctor_engine.scan_environment()
    return {
        "status": "Active" if scan["safe"] else "Threat Detected",
        "cam_active": True,
        "phone_detection": "DeepScan Active",
        "threat_level": "Low" if scan["safe"] else "High",
        "details": scan["threat"],
        "confidence": scan["confidence"]
    }

@app.get("/api/audit/logs")
async def get_audit_logs():
    return [
        {"time": "17:05:12", "event": "Hardware Handshake Success", "origin": "192.168.1.45"},
        {"time": "17:10:01", "event": "Telegram.exe process killed", "origin": "LOCAL_SHIELD"},
        {"time": "17:12:44", "event": "RSA Key Rotation Initialized", "origin": "SENTINEL_CORE"}
    ]

@app.get("/api/exam/paper")
async def get_exam_paper(token: str = None):
    """
    Returns the encrypted exam paper content if the token is valid.
    """
    if not token or "MOCK" not in token:
        raise HTTPException(status_code=403, detail="Invalid security token. Hardware handshake failed.")
    
    return {
        "title": "Quantum Physics & Cryptographic Systems - Final 2026",
        "instructions": "Answer all questions. Forensic markers are embedded in each word.",
        "questions": [
            {
                "id": 1,
                "text": "Describe the societal impact of a zero-day leak on national examination integrity.",
                "marks": 10
            },
            {
                "id": 2,
                "text": "Explain the relationship between hardware-bound hashing and time-locked encryption.",
                "marks": 15
            },
            {
                "id": 3,
                "text": "Design a forensic micro-watermarking algorithm that survives high-compression image formats.",
                "marks": 25
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
