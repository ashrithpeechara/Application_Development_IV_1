import time
import random
from typing import Dict, Any, List

class SimulationEngine:
    PHASES = [
        "NORMAL",
        "ANOMALY",
        "TELEMETRY_DETECTED",
        "SECURITY_ANALYSIS",
        "CASA_ACTIVATION",
        "TASK_DECOMPOSITION",
        "A2A_COMMUNICATION",
        "RISK_ASSESSMENT",
        "DECISION",
        "NETWORK_ACTION",
        "RECOVERY"
    ]

    PHASE_METADATA = {
        "NORMAL": {
            "title": "Phase 1 — Normal Network",
            "badge": "HEALTHY",
            "badge_type": "success",
            "description": "Baseline network operations. Telemetry agent monitoring all ingress/egress links. Packets flow normally through Router R2.",
            "progress": 0
        },
        "ANOMALY": {
            "title": "Phase 2 — Anomaly Injected",
            "badge": "ANOMALY DETECTED",
            "badge_type": "danger",
            "description": "Severe traffic spike targeted at Router R2. Packet loss spikes to 8.7% and latency hits 146ms. Buffer overflow imminent.",
            "progress": 10
        },
        "TELEMETRY_DETECTED": {
            "title": "Phase 3 — Telemetry Agent Trigger",
            "badge": "TELEMETRY ALERT",
            "badge_type": "warning",
            "description": "Telemetry Agent flags anomaly: abnormal rate on interface eth2/R2. Emits telemetry telemetry_alert to Security Agent.",
            "progress": 20
        },
        "SECURITY_ANALYSIS": {
            "title": "Phase 4 — Security Agent Investigation",
            "badge": "INVESTIGATING",
            "badge_type": "warning",
            "description": "Security Agent analyzes flow distribution and packet entropy. Threat score calculated at 72/100 (Confidence: 89%).",
            "progress": 30
        },
        "CASA_ACTIVATION": {
            "title": "Phase 5 — C-ASA Activation",
            "badge": "COGNITIVE AWAKENING",
            "badge_type": "primary",
            "description": "C-ASA shifts from IDLE to ANALYZING. Contextual knowledge base and autonomic loop initialized.",
            "progress": 40
        },
        "TASK_DECOMPOSITION": {
            "title": "Phase 6 — Cognitive Task Decomposition",
            "badge": "DECOMPOSITION",
            "badge_type": "primary",
            "description": "C-ASA decomposes incident into 5 structured autonomic sub-tasks: Validate Anomaly, Traffic Source Analysis, Security Risk Evaluation, Alternate Routing, and Action Selection.",
            "progress": 50
        },
        "A2A_COMMUNICATION": {
            "title": "Phase 7 — Agent-to-Agent Negotiation",
            "badge": "A2A PROTOCOL",
            "badge_type": "info",
            "description": "Agents exchange structured semantic JSON envelopes (GOAL, EVIDENCE, INTENT, RISK, RECOMMENDATION) across autonomic bus.",
            "progress": 65
        },
        "RISK_ASSESSMENT": {
            "title": "Phase 8 — Multi-Factor Risk Assessment",
            "badge": "RISK EVALUATION",
            "badge_type": "warning",
            "description": "Multi-dimensional risk analysis evaluates Network Impact, Security Risk, Recovery Cost, and SLA Penalties. Risk adjusted: 72 -> 61 (Confidence: 91%).",
            "progress": 75
        },
        "DECISION": {
            "title": "Phase 9 — Cognitive Decision Approved",
            "badge": "DECISION APPROVED",
            "badge_type": "success",
            "description": "C-ASA selects Optimal Strategy: Dynamic Traffic Reroute via Router R4 bypass. Projected Post-Action Risk: 31/100.",
            "progress": 85
        },
        "NETWORK_ACTION": {
            "title": "Phase 10 — Network Action Execution",
            "badge": "EXECUTING ACTION",
            "badge_type": "info",
            "description": "Network Agent applies OpenFlow/BGP policy update: Traffic redirected from R2 to Router R4 bypass route. Ingress packets safely rerouted.",
            "progress": 95
        },
        "RECOVERY": {
            "title": "Phase 11 — Network Auto-Recovery",
            "badge": "INCIDENT MITIGATED",
            "badge_type": "success",
            "description": "Telemetry metrics normalized: Packet Rate ~2,100/s, Loss 1.4%, Latency 38ms. Network health restored to 96%. Closed-loop cycle complete.",
            "progress": 100
        }
    }

    def __init__(self):
        self.reset()

    def reset(self):
        self.phase_index = 0
        self.current_phase = self.PHASES[0]
        self.start_time = time.time()
        self.incident_active = False
        self.node_failure_active = False
        self.anomaly_type = "TRAFFIC_SPIKE"  # or NODE_FAILURE
        self.route_bypass_active = False
        
        # Telemetry History (Last 20 points)
        self.telemetry_history = []
        self._init_telemetry_history()
        
        # Event Timeline
        self.events = [
            {
                "id": "evt-1",
                "timestamp": self._fmt_time(time.time() - 30),
                "source": "System",
                "phase": "NORMAL",
                "level": "INFO",
                "title": "C-ASA Control Plane Initialized",
                "message": "Autonomic loop initialized. All 5 monitoring & cognitive agents operational."
            },
            {
                "id": "evt-2",
                "timestamp": self._fmt_time(time.time() - 15),
                "source": "Telemetry Agent",
                "phase": "NORMAL",
                "level": "INFO",
                "title": "Baseline Telemetry Established",
                "message": "Packet rate: 1,284/s, Latency: 32ms, Loss: 1.2%, Bandwidth: 420 Mbps."
            }
        ]

    def _fmt_time(self, t: float) -> str:
        return time.strftime("%H:%M:%S", time.localtime(t))

    def _init_telemetry_history(self):
        now = time.time()
        for i in range(20, 0, -1):
            t = now - (i * 2)
            self.telemetry_history.append({
                "time": self._fmt_time(t),
                "packet_rate": round(1280 + random.uniform(-40, 50)),
                "latency": round(32 + random.uniform(-2, 3), 1),
                "packet_loss": round(1.2 + random.uniform(-0.2, 0.3), 2),
                "bandwidth": round(420 + random.uniform(-15, 20)),
                "cpu": round(24 + random.uniform(-2, 3), 1),
                "memory": round(41 + random.uniform(-1, 2), 1),
                "active_connections": round(380 + random.uniform(-10, 15))
            })

    def trigger_anomaly(self, anomaly_type="TRAFFIC_SPIKE"):
        self.anomaly_type = anomaly_type
        self.incident_active = True
        self.node_failure_active = (anomaly_type == "NODE_FAILURE")
        self.route_bypass_active = False
        self.set_phase("ANOMALY")
        
        self.add_event(
            source="Simulator",
            phase="ANOMALY",
            level="DANGER",
            title="⚡ Network Anomaly Injected" if anomaly_type == "TRAFFIC_SPIKE" else "💥 Router R2 Failure Injected",
            message="Simulated traffic flood directed at Router R2 (192.168.2.1). Ingress threshold exceeded by 380%."
        )
        return self.get_current_state()

    def trigger_node_failure(self):
        return self.trigger_anomaly(anomaly_type="NODE_FAILURE")

    def next_step(self):
        if self.phase_index < len(self.PHASES) - 1:
            self.phase_index += 1
            self.set_phase(self.PHASES[self.phase_index])
        return self.get_current_state()

    def prev_step(self):
        if self.phase_index > 0:
            self.phase_index -= 1
            self.set_phase(self.PHASES[self.phase_index])
        return self.get_current_state()

    def set_phase(self, phase_name: str):
        if phase_name in self.PHASES:
            self.current_phase = phase_name
            self.phase_index = self.PHASES.index(phase_name)
            
            # State side-effects
            if phase_name == "NORMAL":
                self.incident_active = False
                self.node_failure_active = False
                self.route_bypass_active = False
            elif phase_name in ["NETWORK_ACTION", "RECOVERY"]:
                self.route_bypass_active = True
            
            # Log event for phase
            self._log_phase_event(phase_name)
            
            # Append new telemetry snapshot
            self._append_telemetry_point()

    def _log_phase_event(self, phase: str):
        ev_map = {
            "ANOMALY": ("Security Layer", "DANGER", "Anomalous Traffic Spike Detected", "Target: Router R2 (5,920 pps, 8.7% loss, 146ms latency)."),
            "TELEMETRY_DETECTED": ("Telemetry Agent", "WARNING", "Interface eth2 Saturation", "Telemetry Agent triggered anomaly threshold on R2. Forwarding packet metrics."),
            "SECURITY_ANALYSIS": ("Security Agent", "WARNING", "Threat Score 72/100 Calculated", "Evidence indicates volumetric attack pattern. Confidence: 89%."),
            "CASA_ACTIVATION": ("C-ASA", "INFO", "Cognitive Core Activated", "Event ingested. Loading autonomic network knowledge graph and policies."),
            "TASK_DECOMPOSITION": ("C-ASA", "INFO", "Task Decomposition 01-05 Generated", "Sub-tasks mapped: Validation -> Source Analysis -> Risk -> Route Calc -> Response."),
            "A2A_COMMUNICATION": ("A2A Protocol", "INFO", "Semantic Message Flow Initiated", "Security -> C-ASA -> Policy Agent -> Network Agent semantic exchange."),
            "RISK_ASSESSMENT": ("C-ASA", "WARNING", "Multi-Objective Risk: 72 -> 61", "Alternative path evaluation indicates 68% risk reduction via Router R4."),
            "DECISION": ("C-ASA", "SUCCESS", "Cognitive Decision: Dynamic Reroute", "Decision Approved: Reroute ingress flows through Router R4 bypass."),
            "NETWORK_ACTION": ("Network Agent", "INFO", "OpenFlow Flow Mods Applied", "Rerouting active. Ingress packet stream shifting from R2 -> R4."),
            "RECOVERY": ("System", "SUCCESS", "Closed-Loop Recovery Achieved", "Network metrics returned to healthy state (2,100 pps, 38ms latency, 1.4% loss).")
        }
        if phase in ev_map:
            src, lvl, title, msg = ev_map[phase]
            # Avoid duplicate recent log
            if not (self.events and self.events[-1]["phase"] == phase and self.events[-1]["title"] == title):
                self.add_event(source=src, phase=phase, level=lvl, title=title, message=msg)

    def add_event(self, source: str, phase: str, level: str, title: str, message: str):
        ev = {
            "id": f"evt-{len(self.events) + 1}",
            "timestamp": self._fmt_time(time.time()),
            "source": source,
            "phase": phase,
            "level": level,
            "title": title,
            "message": message
        }
        self.events.append(ev)
        if len(self.events) > 50:
            self.events.pop(0)

    def _append_telemetry_point(self):
        t_data = self.get_telemetry()
        self.telemetry_history.append({
            "time": self._fmt_time(time.time()),
            "packet_rate": t_data["packet_rate"],
            "latency": t_data["latency"],
            "packet_loss": t_data["packet_loss"],
            "bandwidth": t_data["bandwidth"],
            "cpu": t_data["cpu"],
            "memory": t_data["memory"],
            "active_connections": t_data["active_connections"]
        })
        if len(self.telemetry_history) > 30:
            self.telemetry_history.pop(0)

    def get_telemetry(self) -> Dict[str, Any]:
        p = self.current_phase
        if p == "NORMAL":
            return {
                "packet_rate": round(1284 + random.uniform(-30, 40)),
                "latency": round(32.0 + random.uniform(-1.5, 2.0), 1),
                "packet_loss": round(1.2 + random.uniform(-0.1, 0.2), 2),
                "bandwidth": round(420 + random.uniform(-10, 15)),
                "cpu": round(24.5 + random.uniform(-2, 3), 1),
                "memory": round(41.2 + random.uniform(-1, 1.5), 1),
                "active_connections": round(384 + random.uniform(-8, 10)),
                "status": "NORMAL",
                "health_score": 98
            }
        elif p in ["ANOMALY", "TELEMETRY_DETECTED"]:
            return {
                "packet_rate": round(5920 + random.uniform(-100, 120)),
                "latency": round(146.0 + random.uniform(-4, 8), 1),
                "packet_loss": round(8.7 + random.uniform(-0.4, 0.6), 2),
                "bandwidth": round(1850 + random.uniform(-40, 50)),
                "cpu": round(89.2 + random.uniform(-3, 4), 1),
                "memory": round(78.4 + random.uniform(-2, 3), 1),
                "active_connections": round(1420 + random.uniform(-30, 40)),
                "status": "CRITICAL",
                "health_score": 58
            }
        elif p in ["SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION"]:
            return {
                "packet_rate": round(5650 + random.uniform(-80, 90)),
                "latency": round(138.0 + random.uniform(-5, 5), 1),
                "packet_loss": round(8.1 + random.uniform(-0.3, 0.4), 2),
                "bandwidth": round(1780 + random.uniform(-30, 40)),
                "cpu": round(84.0 + random.uniform(-2, 3), 1),
                "memory": round(75.5 + random.uniform(-1, 2), 1),
                "active_connections": round(1350 + random.uniform(-20, 30)),
                "status": "EVALUATING",
                "health_score": 64
            }
        elif p in ["RISK_ASSESSMENT", "DECISION"]:
            return {
                "packet_rate": round(5100 + random.uniform(-70, 80)),
                "latency": round(120.0 + random.uniform(-4, 6), 1),
                "packet_loss": round(6.9 + random.uniform(-0.3, 0.4), 2),
                "bandwidth": round(1620 + random.uniform(-25, 35)),
                "cpu": round(76.2 + random.uniform(-2, 3), 1),
                "memory": round(69.0 + random.uniform(-1, 2), 1),
                "active_connections": round(1190 + random.uniform(-20, 25)),
                "status": "ADAPTING",
                "health_score": 72
            }
        elif p == "NETWORK_ACTION":
            return {
                "packet_rate": round(3450 + random.uniform(-60, 70)),
                "latency": round(74.0 + random.uniform(-3, 4), 1),
                "packet_loss": round(3.8 + random.uniform(-0.2, 0.3), 2),
                "bandwidth": round(980 + random.uniform(-20, 30)),
                "cpu": round(52.1 + random.uniform(-2, 2), 1),
                "memory": round(54.3 + random.uniform(-1, 1), 1),
                "active_connections": round(720 + random.uniform(-15, 20)),
                "status": "REROUTING",
                "health_score": 86
            }
        else:  # RECOVERY
            return {
                "packet_rate": round(2100 + random.uniform(-30, 40)),
                "latency": round(38.0 + random.uniform(-1.5, 2), 1),
                "packet_loss": round(1.4 + random.uniform(-0.1, 0.2), 2),
                "bandwidth": round(540 + random.uniform(-15, 20)),
                "cpu": round(31.5 + random.uniform(-2, 2), 1),
                "memory": round(44.0 + random.uniform(-1, 1), 1),
                "active_connections": round(460 + random.uniform(-10, 15)),
                "status": "RECOVERED",
                "health_score": 96
            }

    def get_agents(self) -> List[Dict[str, Any]]:
        p = self.current_phase
        
        # 1. Telemetry Agent
        t_status = "MONITORING"
        t_task = "Real-time sFlow/SNMP Link Ingestion"
        t_conf = 99
        t_risk = "LOW"
        t_event = "All links operational"
        if p == "ANOMALY":
            t_status = "ANOMALY DETECTED"
            t_task = "Isolating anomalous interface spike on R2"
            t_conf = 96
            t_risk = "CRITICAL"
            t_event = "Packet rate anomaly on R2 interface eth2"
        elif p in ["TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION", "RISK_ASSESSMENT", "DECISION", "NETWORK_ACTION"]:
            t_status = "STREAMING METRICS"
            t_task = "Tracking packet loss & jitter post-anomaly"
            t_conf = 98
            t_risk = "HIGH"
            t_event = "Emitting telemetry stream to Security & C-ASA"
        elif p == "RECOVERY":
            t_status = "MONITORING"
            t_task = "Monitoring recovered baseline"
            t_conf = 99
            t_risk = "LOW"
            t_event = "Interface R2 load normalized, R4 bypass stable"

        # 2. Security Agent
        s_status = "MONITORING"
        s_task = "Signature & Flow Anomaly Scanner"
        s_conf = 95
        s_risk = "LOW"
        s_event = "No malicious signatures matched"
        if p in ["ANOMALY", "TELEMETRY_DETECTED"]:
            s_status = "ALERTED"
            s_task = "Ingesting telemetry alarm from Telemetry Agent"
            s_conf = 88
            s_risk = "HIGH"
            s_event = "Telemetry alert received: High packet volume on R2"
        elif p == "SECURITY_ANALYSIS":
            s_status = "INVESTIGATING"
            s_task = "Source entropy & volumetric profile analysis"
            s_conf = 89
            s_risk = "HIGH (72/100)"
            s_event = "Threat score computed: 72/100"
        elif p in ["CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION"]:
            s_status = "SHARING EVIDENCE"
            s_task = "Publishing threat envelope to C-ASA"
            s_conf = 92
            s_risk = "HIGH"
            s_event = "A2A semantic dispatch to C-ASA Core"
        elif p in ["RISK_ASSESSMENT", "DECISION", "NETWORK_ACTION"]:
            s_status = "ASSESSING MITIGATION"
            s_task = "Evaluating bypass security posture"
            s_conf = 94
            s_risk = "MEDIUM"
            s_event = "Endorsing bypass route R4"
        elif p == "RECOVERY":
            s_status = "MONITORING"
            s_task = "Continuous baseline threat inspection"
            s_conf = 98
            s_risk = "LOW (24/100)"
            s_event = "Threat mitigated, confidence 98%"

        # 3. C-ASA (Cognitive Autonomic System)
        c_status = "IDLE"
        c_task = "Autonomic Feedback Loop Standby"
        c_conf = 100
        c_risk = "NOMINAL"
        c_event = "Cognitive engine ready"
        if p in ["ANOMALY", "TELEMETRY_DETECTED"]:
            c_status = "STANDBY"
            c_task = "Monitoring alert bus"
            c_conf = 95
            c_risk = "ELEVATED"
            c_event = "Ingress alert queued"
        elif p == "SECURITY_ANALYSIS":
            c_status = "STANDBY"
            c_task = "Awaiting formal security evidence envelope"
            c_conf = 92
            c_risk = "ELEVATED"
            c_event = "Evidence envelope received"
        elif p == "CASA_ACTIVATION":
            c_status = "REASONING"
            c_task = "Problem formulation & context mapping"
            c_conf = 90
            c_risk = "HIGH (72/100)"
            c_event = "Cognitive context initialized for R2 failure"
        elif p == "TASK_DECOMPOSITION":
            c_status = "PLANNING"
            c_task = "Decomposing incident into sub-tasks (01-05)"
            c_conf = 93
            c_risk = "HIGH"
            c_event = "5-stage autonomic plan generated"
        elif p == "A2A_COMMUNICATION":
            c_status = "ORCHESTRATING"
            c_task = "Querying Policy Agent for routing options"
            c_conf = 91
            c_risk = "HIGH"
            c_event = "A2A query to Policy Agent sent"
        elif p == "RISK_ASSESSMENT":
            c_status = "EVALUATING RISK"
            c_task = "Calculating multi-objective risk trade-offs"
            c_conf = 91
            c_risk = "EVALUATING (61/100)"
            c_event = "Risk matrix scored: R4 bypass reduces risk to 31"
        elif p == "DECISION":
            c_status = "DECISION APPROVED"
            c_task = "Synthesizing final cognitive response"
            c_conf = 91
            c_risk = "PROJECTED 31/100"
            c_event = "Approved action: Reroute traffic via R4"
        elif p == "NETWORK_ACTION":
            c_status = "ACTION IN PROGRESS"
            c_task = "Supervising network agent execution"
            c_conf = 95
            c_risk = "TRANSITIONING"
            c_event = "Flow modification dispatched to Network Agent"
        elif p == "RECOVERY":
            c_status = "COMPLETED"
            c_task = "Closed-loop verification & model memory updated"
            c_conf = 99
            c_risk = "LOW (24/100)"
            c_event = "Autonomic adaptation cycle complete"

        # 4. Policy Agent
        pol_status = "READY"
        pol_task = "SLA & Routing Policy Validator"
        pol_conf = 98
        pol_risk = "LOW"
        pol_event = "Default shortest-path routing enforced"
        if p in ["ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION"]:
            pol_status = "READY"
            pol_task = "Monitoring SLA compliance metrics"
            pol_conf = 95
            pol_risk = "MEDIUM"
            pol_event = "SLA latency warning on path R1-R2"
        elif p == "A2A_COMMUNICATION":
            pol_status = "ANALYZING ROUTES"
            pol_task = "Simulating alternate paths (R3, R4)"
            pol_conf = 91
            pol_risk = "EVALUATING"
            pol_event = "R4 identified as lowest latency alternate"
        elif p == "RISK_ASSESSMENT":
            pol_status = "POLICY VERIFIED"
            pol_task = "Validating compliance with SLA constraints"
            pol_conf = 94
            pol_risk = "LOW"
            pol_event = "Bypass R4 satisfies SLA latency < 45ms"
        elif p in ["DECISION", "NETWORK_ACTION"]:
            pol_status = "POLICY ACTIVE"
            pol_task = "Authorizing dynamic route override"
            pol_conf = 97
            pol_risk = "LOW"
            pol_event = "Rule-set #CASA-089 authorized"
        elif p == "RECOVERY":
            pol_status = "READY"
            pol_task = "Maintaining dynamic policy state"
            pol_conf = 99
            pol_risk = "LOW"
            pol_event = "Policy compliance 100%"

        # 5. Network Agent
        net_status = "READY"
        net_task = "SDN / OpenFlow Controller Interface"
        net_conf = 100
        net_risk = "LOW"
        net_event = "All SDN switches connected & healthy"
        if p in ["ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION", "RISK_ASSESSMENT"]:
            net_status = "READY"
            net_task = "Maintaining flow tables on R1, R2, R4"
            net_conf = 98
            net_risk = "MONITORING"
            net_event = "R2 interface eth2 queue at 94%"
        elif p == "DECISION":
            net_status = "STAGING FLOWS"
            net_task = "Preparing flow rule modifications for R1 & R4"
            net_conf = 96
            net_risk = "STAGED"
            net_event = "Flow modification ready to commit"
        elif p == "NETWORK_ACTION":
            net_status = "EXECUTING ACTION"
            net_task = "Pushing OpenFlow Rule: Redirect R1->R4->Server"
            net_conf = 98
            net_risk = "ACTIVE ACTION"
            net_event = "Flow tables updated on R1 & R4. Traffic redirected."
        elif p == "RECOVERY":
            net_status = "ACTIVE ROUTING"
            net_task = "Maintaining optimized route topology"
            net_conf = 100
            net_risk = "LOW"
            net_event = "R4 handling traffic smoothly at 38ms latency"

        return [
            {
                "id": "telemetry-agent",
                "name": "Telemetry Agent",
                "role": "Real-time Metrics & Ingestion",
                "status": t_status,
                "task": t_task,
                "confidence": t_conf,
                "risk": t_risk,
                "last_event": t_event,
                "color": "#00ffcc",
                "capabilities": ["sFlow Ingestion", "Interface Telemetry", "Latency Probing", "Packet Loss Detection"]
            },
            {
                "id": "security-agent",
                "name": "Security Agent",
                "role": "Threat Detection & Diagnostics",
                "status": s_status,
                "task": s_task,
                "confidence": s_conf,
                "risk": s_risk,
                "last_event": s_event,
                "color": "#ff3366",
                "capabilities": ["Flow Anomaly Scoring", "Threat Classification", "Entropy Analysis", "Evidence Formulation"]
            },
            {
                "id": "casa-agent",
                "name": "C-ASA Core",
                "role": "Cognitive Reasoning & Decision Engine",
                "status": c_status,
                "task": c_task,
                "confidence": c_conf,
                "risk": c_risk,
                "last_event": c_event,
                "color": "#a855f7",
                "capabilities": ["Task Decomposition", "Multi-Factor Risk Scoring", "Autonomic Closed-Loop", "Cognitive Strategy Selection"]
            },
            {
                "id": "policy-agent",
                "name": "Policy Agent",
                "role": "SLA Governance & Routing Analysis",
                "status": pol_status,
                "task": pol_task,
                "confidence": pol_conf,
                "risk": pol_risk,
                "last_event": pol_event,
                "color": "#ffaa00",
                "capabilities": ["SLA Verification", "Alternate Path Discovery", "Capacity Planning", "Rule Authorization"]
            },
            {
                "id": "network-agent",
                "name": "Network Agent",
                "role": "SDN & Actuation Controller",
                "status": net_status,
                "task": net_task,
                "confidence": net_conf,
                "risk": net_risk,
                "last_event": net_event,
                "color": "#38bdf8",
                "capabilities": ["OpenFlow Rule Injection", "BGP Path Manipulation", "Dynamic Rerouting", "Interface Throttling"]
            }
        ]

    def get_network_topology(self) -> Dict[str, Any]:
        p = self.current_phase
        is_anomaly = p in ["ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION", "RISK_ASSESSMENT", "DECISION"]
        is_rerouted = p in ["NETWORK_ACTION", "RECOVERY"]
        
        # Nodes
        nodes = [
            {"id": "internet", "name": "INTERNET", "type": "cloud", "x": 400, "y": 60, "status": "ONLINE", "ip": "0.0.0.0/0", "load": 42},
            {"id": "r1", "name": "ROUTER R1", "type": "router", "x": 400, "y": 170, "status": "ONLINE", "ip": "10.0.0.1", "load": 65 if is_anomaly else 45},
            {"id": "s1", "name": "SWITCH S1", "type": "switch", "x": 220, "y": 290, "status": "ONLINE", "ip": "10.0.1.254", "load": 38},
            {"id": "r2", "name": "ROUTER R2", "type": "router", "x": 580, "y": 290, "status": "CRITICAL" if is_anomaly else ("BYPASSED" if is_rerouted else "ONLINE"), "ip": "10.0.2.1", "load": 94 if is_anomaly else (15 if is_rerouted else 42)},
            {"id": "r4", "name": "ROUTER R4 (BYPASS)", "type": "router", "x": 740, "y": 290, "status": "ACTIVE_ROUTE" if is_rerouted else "STANDBY", "ip": "10.0.4.1", "load": 58 if is_rerouted else 8},
            {"id": "pc1", "name": "PC 1", "type": "host", "x": 130, "y": 420, "status": "ONLINE", "ip": "10.0.1.10", "load": 22},
            {"id": "pc2", "name": "PC 2", "type": "host", "x": 310, "y": 420, "status": "ONLINE", "ip": "10.0.1.11", "load": 28},
            {"id": "server", "name": "SERVER CORE", "type": "server", "x": 580, "y": 440, "status": "PROTECTED" if is_rerouted else ("DEGRADED" if is_anomaly else "ONLINE"), "ip": "10.0.2.100", "load": 78 if is_anomaly else 46}
        ]

        # Links
        links = [
            {"id": "l-inet-r1", "source": "internet", "target": "r1", "type": "normal", "traffic": "high" if is_anomaly else "medium", "active": True},
            {"id": "l-r1-s1", "source": "r1", "target": "s1", "type": "normal", "traffic": "low", "active": True},
            {"id": "l-s1-pc1", "source": "s1", "target": "pc1", "type": "normal", "traffic": "low", "active": True},
            {"id": "l-s1-pc2", "source": "s1", "target": "pc2", "type": "normal", "traffic": "low", "active": True},
            {"id": "l-r1-r2", "source": "r1", "target": "r2", "type": "anomalous" if is_anomaly else ("inactive" if is_rerouted else "normal"), "traffic": "critical" if is_anomaly else ("idle" if is_rerouted else "normal"), "active": not is_rerouted},
            {"id": "l-r2-server", "source": "r2", "target": "server", "type": "anomalous" if is_anomaly else ("inactive" if is_rerouted else "normal"), "traffic": "critical" if is_anomaly else ("idle" if is_rerouted else "normal"), "active": not is_rerouted},
            {"id": "l-r1-r4", "source": "r1", "target": "r4", "type": "bypass" if is_rerouted else "standby", "traffic": "high" if is_rerouted else "idle", "active": is_rerouted},
            {"id": "l-r4-server", "source": "r4", "target": "server", "type": "bypass" if is_rerouted else "standby", "traffic": "high" if is_rerouted else "idle", "active": is_rerouted}
        ]

        # Packets
        packets = []
        if not is_anomaly and not is_rerouted:
            packets = [
                {"id": "p1", "source": "internet", "target": "r1", "type": "NORMAL", "speed": 1.0, "progress": 0.4},
                {"id": "p2", "source": "r1", "target": "r2", "type": "NORMAL", "speed": 1.0, "progress": 0.7},
                {"id": "p3", "source": "r2", "target": "server", "type": "NORMAL", "speed": 1.0, "progress": 0.2},
                {"id": "p4", "source": "pc1", "target": "s1", "type": "NORMAL", "speed": 0.8, "progress": 0.5},
            ]
        elif is_anomaly:
            packets = [
                {"id": "p1", "source": "internet", "target": "r1", "type": "SUSPICIOUS", "speed": 2.2, "progress": 0.3},
                {"id": "p2", "source": "r1", "target": "r2", "type": "SUSPICIOUS", "speed": 2.5, "progress": 0.8},
                {"id": "p3", "source": "r2", "target": "server", "type": "SUSPICIOUS", "speed": 2.0, "progress": 0.5},
                {"id": "p4", "source": "r1", "target": "r2", "type": "SUSPICIOUS", "speed": 2.8, "progress": 0.2},
            ]
            if p in ["TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION"]:
                packets.append({"id": "p-telemetry", "source": "r2", "target": "r1", "type": "TELEMETRY", "speed": 1.5, "progress": 0.6})
        else: # is_rerouted
            packets = [
                {"id": "p1", "source": "internet", "target": "r1", "type": "NORMAL", "speed": 1.2, "progress": 0.5},
                {"id": "p2", "source": "r1", "target": "r4", "type": "CONTROL_ACTION", "speed": 1.4, "progress": 0.7},
                {"id": "p3", "source": "r4", "target": "server", "type": "CONTROL_ACTION", "speed": 1.4, "progress": 0.3},
                {"id": "p4", "source": "pc2", "target": "s1", "type": "NORMAL", "speed": 0.9, "progress": 0.4},
            ]

        return {
            "nodes": nodes,
            "links": links,
            "packets": packets,
            "affected_node": "r2" if is_anomaly or is_rerouted else None,
            "bypass_node": "r4" if is_rerouted else None,
            "is_rerouted": is_rerouted
        }

    def get_cognitive_workflow(self) -> Dict[str, Any]:
        p = self.current_phase
        
        # 8 Visual stages
        stages = [
            {"id": "input", "title": "01 INPUT", "desc": "Ingest Alarm & Telemetry", "status": "COMPLETED" if p != "NORMAL" else "PENDING"},
            {"id": "context", "title": "02 CONTEXT", "desc": "Map Topology & SLA Constraints", "status": "COMPLETED" if p not in ["NORMAL", "ANOMALY"] else ("ACTIVE" if p == "ANOMALY" else "PENDING")},
            {"id": "reasoning", "title": "03 REASONING", "desc": "Cognitive Diagnosis & Root Cause", "status": "COMPLETED" if p not in ["NORMAL", "ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS"] else ("ACTIVE" if p in ["SECURITY_ANALYSIS", "CASA_ACTIVATION"] else "PENDING")},
            {"id": "decomposition", "title": "04 TASK DECOMPOSITION", "desc": "Decompose into 5 Sub-Tasks", "status": "COMPLETED" if p not in ["NORMAL", "ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION"] else ("ACTIVE" if p == "TASK_DECOMPOSITION" else "PENDING")},
            {"id": "planning", "title": "05 PLANNING", "desc": "A2A Path & Action Synthesizer", "status": "COMPLETED" if p not in ["NORMAL", "ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION"] else ("ACTIVE" if p == "A2A_COMMUNICATION" else "PENDING")},
            {"id": "risk", "title": "06 RISK ASSESSMENT", "desc": "Multi-Factor Scoring Matrix", "status": "COMPLETED" if p not in ["NORMAL", "ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION"] else ("ACTIVE" if p == "RISK_ASSESSMENT" else "PENDING")},
            {"id": "decision", "title": "07 DECISION", "desc": "Cognitive Strategy Selection", "status": "COMPLETED" if p in ["DECISION", "NETWORK_ACTION", "RECOVERY"] else ("ACTIVE" if p == "DECISION" else "PENDING")},
            {"id": "action", "title": "08 ACTION & RECOVERY", "desc": "Actuation & Closed-Loop Verif", "status": "COMPLETED" if p == "RECOVERY" else ("ACTIVE" if p == "NETWORK_ACTION" else "PENDING")}
        ]

        # 5 Task Decomposition points
        tasks = [
            {"id": "t1", "code": "TASK 01", "name": "Validate anomaly telemetry", "status": "DONE" if p not in ["NORMAL", "ANOMALY"] else "IN_PROGRESS", "agent": "Telemetry Agent", "detail": "Interface eth2 verified: 5,920 pps spike (380% baseline)"},
            {"id": "t2", "code": "TASK 02", "name": "Analyze traffic source distribution", "status": "DONE" if p not in ["NORMAL", "ANOMALY", "TELEMETRY_DETECTED"] else ("IN_PROGRESS" if p == "TELEMETRY_DETECTED" else "PENDING"), "agent": "Security Agent", "detail": "Volumetric anomaly classified with 89% confidence"},
            {"id": "t3", "code": "TASK 03", "name": "Evaluate security threat & impact", "status": "DONE" if p not in ["NORMAL", "ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS"] else ("IN_PROGRESS" if p == "SECURITY_ANALYSIS" else "PENDING"), "agent": "C-ASA Core", "detail": "Threat Score: 72/100 -> Router R2 buffer saturation threat"},
            {"id": "t4", "code": "TASK 04", "name": "Evaluate routing alternatives & SLA", "status": "DONE" if p not in ["NORMAL", "ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION"] else ("IN_PROGRESS" if p in ["TASK_DECOMPOSITION", "A2A_COMMUNICATION"] else "PENDING"), "agent": "Policy Agent", "detail": "Bypass Router R4 capacity: 10 Gbps, Latency: 38ms (Compliant)"},
            {"id": "t5", "code": "TASK 05", "name": "Select & execute optimal response", "status": "DONE" if p in ["NETWORK_ACTION", "RECOVERY"] else ("IN_PROGRESS" if p == "DECISION" else "PENDING"), "agent": "Network Agent", "detail": "Execute OpenFlow flow modification (Redirect R1 -> R4 -> Server)"}
        ]

        # Risk breakdown
        risk_breakdown = {
            "initial_risk": 72,
            "current_risk": 72 if p in ["ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS"] else (61 if p in ["CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION", "RISK_ASSESSMENT"] else (31 if p in ["DECISION", "NETWORK_ACTION"] else 24)),
            "factors": [
                {"name": "Network Impact", "score": 85 if p in ["ANOMALY", "TELEMETRY_DETECTED"] else 22, "weight": 0.35},
                {"name": "Security Risk", "score": 72 if p not in ["RECOVERY"] else 20, "weight": 0.25},
                {"name": "Recovery Cost", "score": 45 if p not in ["RECOVERY"] else 15, "weight": 0.20},
                {"name": "Policy / SLA Penalty", "score": 68 if p in ["ANOMALY", "TELEMETRY_DETECTED"] else 18, "weight": 0.20}
            ],
            "confidence": 89 if p in ["SECURITY_ANALYSIS", "CASA_ACTIVATION"] else (91 if p in ["TASK_DECOMPOSITION", "A2A_COMMUNICATION", "RISK_ASSESSMENT", "DECISION"] else 98)
        }

        # Cognitive Decision details
        decision = {
            "problem": "Severe anomalous traffic concentration on Router R2 causing SLA degradation and 8.7% packet loss.",
            "context": "High packet rate (5,920/s), High latency (146ms), Server Core critical pathway at risk.",
            "decision": "Reroute affected ingress traffic through Router R4 bypass.",
            "reason": "Lower latency (38ms vs 146ms), 0% congestion on R4, avoids R2 buffer drop, post-action risk reduces from 72 to 31.",
            "confidence": "91%",
            "risk_before": 72,
            "risk_after": 31,
            "status": "APPROVED" if p in ["DECISION", "NETWORK_ACTION", "RECOVERY"] else "PENDING_ASSESSMENT"
        }

        return {
            "current_phase": p,
            "stages": stages,
            "tasks": tasks,
            "risk": risk_breakdown,
            "decision": decision
        }

    def get_a2a_messages(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "msg-1",
                "time": "12:00:02",
                "from": "Telemetry Agent",
                "to": "Security Agent",
                "type": "TELEMETRY_ALERT",
                "goal": "Notify anomalous packet spike on Router R2",
                "evidence": {
                    "affected_node": "Router R2 (10.0.2.1)",
                    "packet_rate": "5,920 pps (+380%)",
                    "packet_loss": "8.7%",
                    "latency": "146ms"
                },
                "intent": "Request security validation & volumetric classification",
                "confidence": "96%",
                "risk": "HIGH"
            },
            {
                "id": "msg-2",
                "time": "12:00:05",
                "from": "Security Agent",
                "to": "C-ASA Core",
                "type": "SECURITY_ASSESSMENT",
                "goal": "Deliver structured security diagnostic evidence",
                "evidence": {
                    "event": "Abnormal Traffic Pattern & Buffer Saturation",
                    "threat_score": "72 / 100",
                    "source_entropy": "0.84 (Highly distributed anomalous sources)",
                    "target": "Router R2 Interface eth2"
                },
                "intent": "Request autonomic cognitive mitigation response",
                "confidence": "89%",
                "risk": "HIGH (72/100)"
            },
            {
                "id": "msg-3",
                "time": "12:00:08",
                "from": "C-ASA Core",
                "to": "Policy Agent",
                "type": "POLICY_QUERY",
                "goal": "Evaluate alternate routing paths complying with SLA constraints",
                "evidence": {
                    "unusable_node": "Router R2",
                    "required_throughput": "2.5 Gbps",
                    "max_tolerable_latency": "50ms"
                },
                "intent": "Query available bypass topologies (R3 vs R4)",
                "confidence": "91%",
                "risk": "EVALUATING"
            },
            {
                "id": "msg-4",
                "time": "12:00:11",
                "from": "Policy Agent",
                "to": "C-ASA Core",
                "type": "RECOMMENDATION",
                "goal": "Return optimal routing recommendation",
                "evidence": {
                    "recommended_route": "Router R4 Bypass (10.0.4.1)",
                    "available_bandwidth": "10 Gbps",
                    "projected_latency": "38ms",
                    "sla_compliance": "100%"
                },
                "intent": "Recommend dynamic reroute via R4",
                "confidence": "94%",
                "risk": "LOW (28/100)"
            },
            {
                "id": "msg-5",
                "time": "12:00:14",
                "from": "C-ASA Core",
                "to": "Network Agent",
                "type": "CONTROL_ACTION",
                "goal": "Execute OpenFlow dynamic route reconfiguration",
                "evidence": {
                    "action": "FLOW_MOD_REDIRECT",
                    "source_switch": "Router R1",
                    "target_switch": "Router R4",
                    "destination": "Server Core"
                },
                "intent": "Execute immediate live network adaptation",
                "confidence": "98%",
                "risk": "MITIGATED"
            }
        ]

    def get_current_state(self) -> Dict[str, Any]:
        meta = self.PHASE_METADATA.get(self.current_phase, {})
        return {
            "system_status": "ONLINE",
            "environment": "SIMULATION MODE",
            "active_agents_count": 5,
            "current_phase": self.current_phase,
            "phase_index": self.phase_index,
            "total_phases": len(self.PHASES),
            "phase_info": meta,
            "network_status": "CRITICAL" if self.current_phase in ["ANOMALY", "TELEMETRY_DETECTED"] else ("ADAPTING" if self.current_phase in ["SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION", "A2A_COMMUNICATION", "RISK_ASSESSMENT", "DECISION", "NETWORK_ACTION"] else "HEALTHY"),
            "threat_level": "HIGH" if self.current_phase in ["ANOMALY", "TELEMETRY_DETECTED", "SECURITY_ANALYSIS", "CASA_ACTIVATION", "TASK_DECOMPOSITION"] else ("MITIGATING" if self.current_phase in ["A2A_COMMUNICATION", "RISK_ASSESSMENT", "DECISION", "NETWORK_ACTION"] else "LOW"),
            "scenario": "TRAFFIC_SPIKE_MITIGATION" if self.anomaly_type == "TRAFFIC_SPIKE" else "NODE_FAILURE_RECOVERY",
            "incident_active": self.incident_active,
            "route_bypass_active": self.route_bypass_active,
            "telemetry": self.get_telemetry(),
            "telemetry_history": self.telemetry_history,
            "agents": self.get_agents(),
            "topology": self.get_network_topology(),
            "cognitive": self.get_cognitive_workflow(),
            "a2a": self.get_a2a_messages(),
            "events": self.events
        }

# Global singleton instance for simulation state
simulation_engine = SimulationEngine()
