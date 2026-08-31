from django.core.management.base import BaseCommand
from simulation.models import NetworkDevice, NetworkConnection, AutonomicAgent, AuditLogEvent
from datetime import datetime

class Command(BaseCommand):
    help = 'Seeds initial autonomic network devices and agents into SQLite database.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding autonomic network data...")

        # 1. Seed Network Devices
        devices_data = [
            {"node_id": "cloud", "name": "INTERNET GATEWAY", "device_type": "cloud", "ip_address": "198.51.100.1", "status": "ONLINE", "load": 24, "x_pos": 420, "y_pos": 55, "port_capacity": "100.0 Gbps"},
            {"node_id": "r1", "name": "ROUTER R1 (INGRESS)", "device_type": "router", "ip_address": "10.0.1.1", "status": "ONLINE", "load": 32, "x_pos": 420, "y_pos": 165, "port_capacity": "40.0 Gbps"},
            {"node_id": "s1", "name": "SWITCH S1 (ACCESS)", "device_type": "switch", "ip_address": "10.0.1.2", "status": "ONLINE", "load": 18, "x_pos": 200, "y_pos": 285, "port_capacity": "10.0 Gbps"},
            {"node_id": "r2", "name": "ROUTER R2 (PRIMARY)", "device_type": "router", "ip_address": "10.0.2.1", "status": "ONLINE", "load": 42, "x_pos": 500, "y_pos": 285, "port_capacity": "10.0 Gbps"},
            {"node_id": "r4", "name": "ROUTER R4 (BYPASS)", "device_type": "router", "ip_address": "10.0.4.1", "status": "STANDBY", "load": 8, "x_pos": 700, "y_pos": 285, "port_capacity": "10.0 Gbps"},
            {"node_id": "pc1", "name": "CLIENT HOST 01", "device_type": "host", "ip_address": "10.0.1.101", "status": "ONLINE", "load": 12, "x_pos": 120, "y_pos": 415, "port_capacity": "1.0 Gbps"},
            {"node_id": "pc2", "name": "CLIENT HOST 02", "device_type": "host", "ip_address": "10.0.1.102", "status": "ONLINE", "load": 15, "x_pos": 280, "y_pos": 415, "port_capacity": "1.0 Gbps"},
            {"node_id": "server", "name": "SERVER CORE GATEWAY", "device_type": "server", "ip_address": "10.0.3.50", "status": "ONLINE", "load": 28, "x_pos": 500, "y_pos": 425, "port_capacity": "40.0 Gbps"},
        ]

        dev_objs = {}
        for d in devices_data:
            obj, _ = NetworkDevice.objects.update_or_create(
                node_id=d["node_id"],
                defaults=d
            )
            dev_objs[d["node_id"]] = obj

        # 2. Seed Network Connections
        links_data = [
            ("cloud", "r1", "normal", "medium"),
            ("r1", "s1", "normal", "low"),
            ("r1", "r2", "normal", "medium"),
            ("r1", "r4", "bypass", "low"),
            ("s1", "pc1", "normal", "low"),
            ("s1", "pc2", "normal", "low"),
            ("r2", "server", "normal", "medium"),
            ("r4", "server", "bypass", "low"),
        ]

        for src, tgt, l_type, traffic in links_data:
            if src in dev_objs and tgt in dev_objs:
                link_id = f"link-{src}-{tgt}"
                NetworkConnection.objects.update_or_create(
                    link_id=link_id,
                    defaults={
                        "source": dev_objs[src],
                        "target": dev_objs[tgt],
                        "link_type": l_type,
                        "traffic_level": traffic,
                        "is_active": True
                    }
                )

        # 3. Seed Autonomic Agents
        agents_data = [
            {
                "agent_id": "telemetry-agent",
                "name": "Telemetry Agent",
                "role": "Real-time Metrics & Ingestion",
                "status": "STREAMING METRICS",
                "task": "Tracking packet loss & jitter streams on eth1/eth2",
                "confidence": 98,
                "risk_level": "LOW",
                "color": "#0284c7",
                "last_event": "Telemetry stream healthy (60 samples/sec)",
                "capabilities": ["sFlow Sampling", "SNMP Polling", "In-band Telemetry", "Jitter Tracking"]
            },
            {
                "agent_id": "security-agent",
                "name": "Security Agent",
                "role": "Threat Detection & Diagnostics",
                "status": "READY",
                "task": "Continuous signature & anomaly entropy scan",
                "confidence": 96,
                "risk_level": "LOW",
                "color": "#e11d48",
                "last_event": "Baseline entropy normal (0.12)",
                "capabilities": ["Spectral Entropy Analysis", "DDoS Classifier", "Anomaly Scoring", "Evidence Generation"]
            },
            {
                "agent_id": "casa-agent",
                "name": "C-ASA Core",
                "role": "Cognitive Reasoning & Decision Engine",
                "status": "MONITORING",
                "task": "Maintaining autonomic closed-loop equilibrium",
                "confidence": 95,
                "risk_level": "LOW",
                "color": "#7c3aed",
                "last_event": "Cognitive plane idling in normal state",
                "capabilities": ["Cognitive Problem Formulation", "Dynamic Task Graph", "Multi-Factor Utility Matrix", "Closed-Loop Governance"]
            },
            {
                "agent_id": "policy-agent",
                "name": "Policy Agent",
                "role": "SLA Governance & Routing Analysis",
                "status": "READY",
                "task": "Monitoring SLA compliance & bypass availability",
                "confidence": 94,
                "risk_level": "LOW",
                "color": "#d97706",
                "last_event": "Bypass route via R4 validated (SLA OK)",
                "capabilities": ["SLA Metric Verification", "Topology Graph Pathing", "Intent Enforcement", "Cost/Loss Tradeoff"]
            },
            {
                "agent_id": "network-agent",
                "name": "Network Agent",
                "role": "SDN & Actuation Controller",
                "status": "READY",
                "task": "Maintaining flow tables on R1, R2, R4",
                "confidence": 99,
                "risk_level": "LOW",
                "color": "#0284c7",
                "last_event": "OpenFlow controller connected (8 flows)",
                "capabilities": ["OpenFlow 1.3 Control", "Fast Flow Modification", "Bypass Route Injection", "Rollback State Machine"]
            }
        ]

        for ag in agents_data:
            AutonomicAgent.objects.update_or_create(
                agent_id=ag["agent_id"],
                defaults=ag
            )

        # 4. Seed Initial Audit Log Events
        initial_events = [
            ("ev-init-01", "00:00:01", "SUCCESS", "SDN Controller", "INIT", "OpenFlow Controller Connected", "Controller initialized with 8 baseline flow rules across R1, R2, R4."),
            ("ev-init-02", "00:00:02", "INFO", "Telemetry Agent", "INIT", "Telemetry Streaming Initialized", "Real-time sFlow sampling rate established at 1:100 packets."),
            ("ev-init-03", "00:00:03", "INFO", "C-ASA Core", "INIT", "Cognitive Reasoning Plane Online", "5 autonomic agents synchronized via A2A semantic envelope bus."),
        ]

        for e_id, ts, lvl, src, ph, title, msg in initial_events:
            AuditLogEvent.objects.update_or_create(
                event_id=e_id,
                defaults={
                    "timestamp": ts,
                    "level": lvl,
                    "source": src,
                    "phase": ph,
                    "title": title,
                    "message": msg
                }
            )

        self.stdout.write(self.style.SUCCESS("Autonomic network database successfully seeded!"))
