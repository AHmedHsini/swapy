from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal
from decimal import Decimal

app = FastAPI(
    title="Swapy Campus AI Service",
    description="Python microservice for repair diagnostics and cost prediction",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagnosticRequest(BaseModel):
    deviceName: str
    problemDescription: str

class RepairAdvice(BaseModel):
    recommendation: str
    difficulty: Literal["low", "medium", "high"]
    safetyNotes: List[str]

class CostPrediction(BaseModel):
    repairCost: str
    resaleValue: str
    replacementCost: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}

@app.post("/analyze-repair", response_model=RepairAdvice)
def analyze_repair(req: DiagnosticRequest):
    text = f"{req.deviceName} {req.problemDescription}".lower()
    
    steps = [
        "Document the symptoms before replacing parts.",
        "Check cables, ports, power source, and visible physical damage.",
        "Test with a known-good charger, cable, or computer when possible."
    ]
    safety_notes = ["Disconnect power before opening or testing the device."]
    difficulty = "medium"
    
    if "arduino" in text or "board" in text or "usb" in text:
        steps.extend([
            "Try another USB data cable and port.",
            "Check whether the board appears in the operating system device manager.",
            "Reinstall drivers only after the physical checks pass."
        ])
        
    if "fan" in text or "noise" in text or "laptop" in text:
        steps.extend([
            "Clean dust from vents while the device is powered off.",
            "Check whether the fan noise changes under load.",
            "Replace the fan if grinding continues after cleaning."
        ])
        
    if "battery" in text or "smoke" in text or "burn" in text:
        difficulty = "high"
        safety_notes.append("Stop using the item if you see swelling, smoke, or burn marks.")
        
    return {
        "recommendation": " ".join(steps),
        "difficulty": difficulty,
        "safetyNotes": safety_notes
    }

@app.post("/predict-cost", response_model=CostPrediction)
def predict_cost(req: DiagnosticRequest):
    text = f"{req.deviceName} {req.problemDescription}".lower()
    
    repair_cost = Decimal("8.00")
    resale_value = Decimal("18.00")
    replacement_cost = Decimal("35.00")
    
    if "arduino" in text or "sensor" in text or "board" in text:
        repair_cost = Decimal("5.00")
        resale_value = Decimal("15.00")
        replacement_cost = Decimal("30.00")
    elif "laptop" in text or "phone" in text:
        repair_cost = Decimal("35.00")
        resale_value = Decimal("120.00")
        replacement_cost = Decimal("400.00")
    elif "headphone" in text or "earbud" in text:
        repair_cost = Decimal("6.00")
        resale_value = Decimal("12.00")
        replacement_cost = Decimal("45.00")
        
    if "burn" in text or "water" in text or "broken screen" in text:
        repair_cost = repair_cost * Decimal("1.8")
        resale_value = resale_value * Decimal("0.6")
        
    return {
        "repairCost": f"{repair_cost:.2f}",
        "resaleValue": f"{resale_value:.2f}",
        "replacementCost": f"{replacement_cost:.2f}"
    }
