import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Lock, AlertTriangle, Eye, Activity, Database, FileText, Smartphone } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [securityData, setSecurityData] = useState({
    rolling_hash: 'INITIALIZING...',
    salt: '...',
    timestamp: Date.now()
  });
  const [proctorStatus, setProctorStatus] = useState({
    status: 'Standby',
    threat_level: 'None',
    details: 'Calibrating...'
  });
  const [timeLeft, setTimeLeft] = useState(45 * 60 + 12);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [traceLogs, setTraceLogs] = useState([]);
  const [isTracing, setIsTracing] = useState(false);
  const [examContent, setExamContent] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 'p')) || e.key === 'PrintScreen') {
        e.preventDefault();
        alert("SECURITY ALERT: System-level restricted shortcut detected.");
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    const fetchData = async () => {
      try {
        const [keyRes, proctorRes] = await Promise.all([
          axios.get(`${API_BASE}/api/security/rolling-key`),
          axios.get(`${API_BASE}/api/proctor/status`)
        ]);
        setSecurityData(keyRes.data);
        setProctorStatus(proctorRes.data);
      } catch (err) {
        console.error("Backend offline");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000);

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
  };

  const handleUnlock = async () => {
    setIsDecrypting(true);
    try {
      const res = await axios.post(`${API_BASE}/api/security/verify-access`, {});
      if (res.data.granted) {
        setTimeout(async () => {
          const paperRes = await axios.get(`${API_BASE}/api/exam/paper`, {
            params: { token: res.data.token }
          });
          setExamContent(paperRes.data);
          setIsUnlocked(true);
          setIsDecrypting(false);
        }, 1500);
      }
    } catch (err) {
      alert("Decryption Error: Hardware bound token rejected.");
      setIsDecrypting(false);
    }
  };

  const runTrace = () => {
    setIsTracing(true);
    setTraceLogs([]);
    const messages = [
      "Running DeepBit Analysis...",
      "Matching pixel-level forensic markers...",
      "Hardware Signature Found: HW-TRX-9902",
      "User ID Correlation: STUDENT-8842",
      "Timestamp Match: 17:15:22 GMT+5",
      "INCIDENT LOGGED: Prosecution package generated."
    ];
    
    messages.forEach((msg, i) => {
      setTimeout(() => {
        setTraceLogs(prev => [...prev, msg]);
        if (i === messages.length - 1) setIsTracing(false);
      }, i * 600);
    });
  };

  const { h, m, s } = formatTime(timeLeft);

  return (
    <div className="glass-container no-select">
      <div className="sentinel-shield">
        <div className="shield-pulse"></div>
        <span className="shield-label">SENTINEL PREMIUM SECURED</span>
      </div>

      <header>
        <div className="logo">
          <Shield className="logo-icon" color="#3b82f6" size={32} />
          <h1>Sentinel<span>Exam</span></h1>
        </div>
        <div className="status-indicator">
          <div className={`dot ${proctorStatus.threat_level === 'High' ? 'red' : 'green'}`}></div>
          <span>Status: {proctorStatus.status}</span>
        </div>
      </header>

      <main>
        <section className="vault-section">
          {!isUnlocked ? (
            <div className="card vault-card main-vault">
              <Lock size={64} className={isDecrypting ? "animate-spin-slow" : ""} color={isDecrypting ? "#3b82f6" : "#94a3b8"} style={{ margin: '0 auto 20px' }} />
              <h2>{isDecrypting ? "SHIELD VERIFICATION..." : "Secure Vault"}</h2>
              <p className="subtitle">Time-Locked Cryptographic Sequence Card</p>
              
              <div className="timer-container">
                <div className="time-unit"><span>{String(h).padStart(2, '0')}</span><label>HRS</label></div>
                <span className="sep">:</span>
                <div className="time-unit"><span>{String(m).padStart(2, '0')}</span><label>MIN</label></div>
                <span className="sep">:</span>
                <div className="time-unit"><span>{String(s).padStart(2, '0')}</span><label>SEC</label></div>
              </div>

              <div className="hashing-status">
                <div className="hash-row"><label>Dynamic Salt:</label><code>{securityData.salt}</code></div>
                <div className="hash-row"><label>Active Hash:</label><code>{securityData.rolling_hash.substring(0, 18)}...</code></div>
              </div>

              <button 
                className={`btn ${timeLeft === 0 || isDecrypting ? 'btn-locked' : 'btn-primary'}`}
                onClick={handleUnlock}
                disabled={timeLeft > 0 || isDecrypting}
              >
                {isDecrypting ? "AUTHENTICATING..." : (timeLeft === 0 ? "DECRYPT & ACCESS" : "LOCKED")}
              </button>
            </div>
          ) : (
            <div className="card paper-card fade-in">
              <div className="paper-header">
                <FileText size={24} color="#3b82f6" />
                <h2>{examContent?.title}</h2>
              </div>
              <div className="question-list">
                {examContent?.questions.map((q) => (
                  <div key={q.id} className="question-item">
                    <div className="q-head"><span className="q-num">Question {q.id}</span><span className="q-marks">{q.marks}M</span></div>
                    <p className="q-text">{q.text}</p>
                  </div>
                ))}
              </div>
              <div className="secure-footer">
                <Shield size={12} /> Forensic markers embedded. Your ID: STUDENT-8842-{(Date.now()/1000).toFixed(0)}
              </div>
            </div>
          )}

          <div className="side-panel">
            <div className="card impact-card">
              <h3><AlertTriangle size={18} /> AI Proctoring</h3>
              <div className="status-grid">
                <div className="status-box">
                  <span className="box-label">Threat</span>
                  <span className={`box-value ${proctorStatus.threat_level === 'High' ? 'danger' : ''}`}>{proctorStatus.threat_level}</span>
                </div>
                <div className="status-box">
                  <span className="box-label">Confidence</span>
                  <span className="box-value">{(proctorStatus.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              <p className="proctor-detail">{proctorStatus.details || "Scanning environment..."}</p>
            </div>

            <div className="card threat-card">
              <h3><Smartphone size={18} /> Signal Blocking</h3>
              <div className="signal-bar">
                <div className="bar-fill" style={{width: '98%'}}></div>
              </div>
              <span className="small">RF Interference: Active | Bluetooth: Jammed</span>
            </div>

            <div className="card forensic-card">
              <h3><Eye size={18} /> Forensic Tracer</h3>
              <p className="small">Analyze suspected leak fragments.</p>
              <button className="btn-secondary" onClick={runTrace} disabled={isTracing}>
                {isTracing ? "Extracting markers..." : "Trace Leak"}
              </button>
              
              {traceLogs.length > 0 && (
                <div className="trace-output">
                  {traceLogs.map((log, i) => (
                    <div key={i} className={`trace-line ${log.includes('INCIDENT') ? 'trace-success' : ''}`}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 SentinelExam | Zero-Day Leak Defense System</p>
      </footer>

      <div id="watermark-layer">
        {[...Array(30)].map((_, i) => (
          <span key={i} className="watermark-text animated" style={{
            top: `${Math.random() * 100}vh`, left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 5}s`, fontSize: `${Math.random() * 4 + 10}px`
          }}>
            CONFIDENTIAL-S8842-T{(Date.now()/10000).toFixed(0)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
