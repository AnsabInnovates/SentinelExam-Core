import random

class ProctorAI:
    """
    Simulation of AI-driven proctoring that detects anomalous activities.
    """
    
    def __init__(self):
        self.threat_vulnerabilities = [
            "Handheld Device Detected",
            "Screen Photographing Pattern Detected",
            "Secondary User in Proximity",
            "HDMI Capture Hardware Detected"
        ]

    def scan_environment(self):
        """
        Simulates a scan of the local environment.
        Returns a threat score 0.0 to 1.0
        """
        # In a real app, this would use OpenCV/MediaPipe to scan webcam/processes
        threat_detected = random.random() > 0.95 # 5% chance of mock alert
        
        if threat_detected:
            return {
                "safe": False,
                "threat": random.choice(self.threat_vulnerabilities),
                "confidence": random.uniform(0.85, 0.99)
            }
        
        return {"safe": True, "threat": None, "confidence": 1.0}

proctor_engine = ProctorAI()
