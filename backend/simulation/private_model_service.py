import os
import json
import logging
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

# Load from local .env if present
env_file = Path(__file__).resolve().parent.parent / ".env"
if env_file.exists():
    try:
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k and k not in os.environ:
                        os.environ[k] = v
    except Exception as e:
        logger.warning(f"Could not load .env file: {e}")

# Private cognitive neural engine credentials
PRIVATE_MODEL_KEY = os.getenv("PRIVATE_MODEL_KEY", "")

# Internal private model cluster endpoints
PRIVATE_MODEL_CLUSTER = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite",
    "gemini-pro-latest"
]

DISPLAY_MODEL_NAME = "private_model-core-v3"


def call_private_model(prompt: str, system_prompt: str = None) -> dict:
    """
    Executes inference against the C-ASA Private Cognitive Reasoning Model cluster.
    """
    full_prompt = prompt
    if system_prompt:
        full_prompt = f"[SYSTEM INSTRUCTION]: {system_prompt}\n\n[USER REQUEST]: {prompt}"
        
    payload = {
        "contents": [
            {
                "parts": [{"text": full_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "topP": 0.95,
            "maxOutputTokens": 2048
        }
    }
    
    last_error = None
    for internal_engine in PRIVATE_MODEL_CLUSTER:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{internal_engine}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": PRIVATE_MODEL_KEY
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=25)
            if response.status_code == 200:
                data = response.json()
                try:
                    generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "success": True,
                        "model": DISPLAY_MODEL_NAME,
                        "text": generated_text,
                        "raw": data
                    }
                except (KeyError, IndexError) as parse_err:
                    last_error = f"Inference parse error: {parse_err}"
                    continue
            else:
                last_error = f"Private cluster node error {response.status_code}"
                logger.warning(f"Private model node failed: {last_error}")
                continue
        except Exception as exc:
            last_error = f"Private model inference exception: {str(exc)}"
            logger.warning(f"Private model exception: {last_error}")
            continue

    return {
        "success": False,
        "error": last_error or "Private model inference cluster offline.",
        "text": None
    }


def analyze_incident_cognitive(telemetry_data: dict, current_phase: str, phase_data: dict = None) -> dict:
    """
    Synthesizes real-time C-ASA Cognitive Reasoning & Root Cause Analysis using private neural engine.
    """
    system_instruction = (
        "You are the C-ASA Cognitive Autonomic Networking Core Reasoner (RFC 8995 / Autonomic Control Plane). "
        "Analyze the provided live SDN telemetry, identify the anomaly root cause, evaluate risk metrics, "
        "and formulate the exact autonomic self-healing strategy (e.g. dynamic OpenFlow reroute, rate limiting). "
        "Keep responses professional, authoritative, structured with Markdown headings, bullet points, and concise metrics."
    )
    
    prompt = f"""
Current Simulation Phase: {current_phase}
Active Telemetry Metrics:
- Packet Rate: {telemetry_data.get('packet_rate', 'N/A')} pkts/sec
- Latency (RTT): {telemetry_data.get('latency', 'N/A')} ms
- Packet Drop Rate: {telemetry_data.get('packet_loss', 'N/A')}%
- Bandwidth Utilization: {telemetry_data.get('bandwidth_utilization', 'N/A')}%
- Route Health: {telemetry_data.get('route_health', 'N/A')}
- Anomaly Flag: {telemetry_data.get('anomaly_detected', False)}
- Active Path: {telemetry_data.get('active_path', 'Primary (R1 -> R2 -> Server)')}

Phase Details: {json.dumps(phase_data) if phase_data else 'Standard Phase Telemetry'}

Provide a 4-part Cognitive Brief:
1. **Anomaly & Threat Formulation**: What is happening on the data plane (e.g. DDoS/Buffer exhaustion on R2 eth2)?
2. **Autonomic Agent Task Decomposition**: What tasks are assigned to Security Agent, Policy Agent, and Network Actuator?
3. **Multi-Factor Risk Assessment**: Evaluate alternate path (R1 -> R4 -> Server) vs primary path.
4. **Cognitive Actuation Directive**: The precise SDN flow rule or autonomic decision approved for closed-loop self-healing.
"""
    return call_private_model(prompt, system_prompt=system_instruction)


def copilot_chat_response(query: str, current_state: dict, chat_history: list = None) -> dict:
    """
    Interactive NOC Assistant powered by private cognitive model.
    """
    system_instruction = (
        "You are the C-ASA Autonomous NOC AI Copilot powered by the C-ASA Private Cognitive Reasoning Model. "
        "You have full real-time telemetry and topological awareness of the network (Nodes: Edge Client, R1, R2, R3, R4, Server Core; "
        "Agents: Telemetry Agent, Security Agent, C-ASA Reasoning Core, Policy Agent, Network Actuator). "
        "Answer the NOC engineer's question clearly, concisely, and accurately based on the current network state."
    )
    
    context_str = json.dumps(current_state, indent=2) if current_state else "No active state"
    
    prompt = f"""
[CURRENT NETWORK STATE SNAPSHOT]:
{context_str}

[ENGINEER QUESTION]:
{query}
"""
    return call_private_model(prompt, system_prompt=system_instruction)
