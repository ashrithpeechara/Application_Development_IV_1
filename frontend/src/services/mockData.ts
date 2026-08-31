import { SimulationState, SimulationPhase } from '@/types/simulation';

const PHASES: SimulationPhase[] = [
  'NORMAL',
  'ANOMALY',
  'TELEMETRY_DETECTED',
  'SECURITY_ANALYSIS',
  'CASA_ACTIVATION',
  'TASK_DECOMPOSITION',
  'A2A_COMMUNICATION',
  'RISK_ASSESSMENT',
  'DECISION',
  'NETWORK_ACTION',
  'RECOVERY'
];

const PHASE_META: Record<SimulationPhase, any> = {
  NORMAL: {
    title: 'Phase 1 — Normal Network',
    badge: 'HEALTHY',
    badge_type: 'success',
    description: 'Baseline network operations. Telemetry agent monitoring all ingress/egress links. Packets flow normally through Router R2.',
    progress: 0
  },
  ANOMALY: {
    title: 'Phase 2 — Anomaly Injected',
    badge: 'ANOMALY DETECTED',
    badge_type: 'danger',
    description: 'Severe traffic spike targeted at Router R2. Packet loss spikes to 8.7% and latency hits 146ms. Buffer overflow imminent.',
    progress: 10
  },
  TELEMETRY_DETECTED: {
    title: 'Phase 3 — Telemetry Agent Trigger',
    badge: 'TELEMETRY ALERT',
    badge_type: 'warning',
    description: 'Telemetry Agent flags anomaly: abnormal rate on interface eth2/R2. Emits telemetry telemetry_alert to Security Agent.',
    progress: 20
  },
  SECURITY_ANALYSIS: {
    title: 'Phase 4 — Security Agent Investigation',
    badge: 'INVESTIGATING',
    badge_type: 'warning',
    description: 'Security Agent analyzes flow distribution and packet entropy. Threat score calculated at 72/100 (Confidence: 89%).',
    progress: 30
  },
  CASA_ACTIVATION: {
    title: 'Phase 5 — C-ASA Activation',
    badge: 'COGNITIVE AWAKENING',
    badge_type: 'primary',
    description: 'C-ASA shifts from IDLE to ANALYZING. Contextual knowledge base and autonomic loop initialized.',
    progress: 40
  },
  TASK_DECOMPOSITION: {
    title: 'Phase 6 — Cognitive Task Decomposition',
    badge: 'DECOMPOSITION',
    badge_type: 'primary',
    description: 'C-ASA decomposes incident into 5 structured autonomic sub-tasks: Validate Anomaly, Traffic Source Analysis, Security Risk Evaluation, Alternate Routing, and Action Selection.',
    progress: 50
  },
  A2A_COMMUNICATION: {
    title: 'Phase 7 — Agent-to-Agent Negotiation',
    badge: 'A2A PROTOCOL',
    badge_type: 'info',
    description: 'Agents exchange structured semantic JSON envelopes (GOAL, EVIDENCE, INTENT, RISK, RECOMMENDATION) across autonomic bus.',
    progress: 65
  },
  RISK_ASSESSMENT: {
    title: 'Phase 8 — Multi-Factor Risk Assessment',
    badge: 'RISK EVALUATION',
    badge_type: 'warning',
    description: 'Multi-dimensional risk analysis evaluates Network Impact, Security Risk, Recovery Cost, and SLA Penalties. Risk adjusted: 72 -> 61 (Confidence: 91%).',
    progress: 75
  },
  DECISION: {
    title: 'Phase 9 — Cognitive Decision Approved',
    badge: 'DECISION APPROVED',
    badge_type: 'success',
    description: 'C-ASA selects Optimal Strategy: Dynamic Traffic Reroute via Router R4 bypass. Projected Post-Action Risk: 31/100.',
    progress: 85
  },
  NETWORK_ACTION: {
    title: 'Phase 10 — Network Action Execution',
    badge: 'EXECUTING ACTION',
    badge_type: 'info',
    description: 'Network Agent applies OpenFlow/BGP policy update: Traffic redirected from R2 to Router R4 bypass route. Ingress packets safely rerouted.',
    progress: 95
  },
  RECOVERY: {
    title: 'Phase 11 — Network Auto-Recovery',
    badge: 'INCIDENT MITIGATED',
    badge_type: 'success',
    description: 'Telemetry metrics normalized: Packet Rate ~2,100/s, Loss 1.4%, Latency 38ms. Network health restored to 96%. Closed-loop cycle complete.',
    progress: 100
  }
};

class MockSimulationStore {
  private phaseIndex = 0;
  private currentPhase: SimulationPhase = 'NORMAL';
  private anomalyType = 'TRAFFIC_SPIKE';
  private incidentActive = false;
  private routeBypassActive = false;
  private telemetryHistory: any[] = [];
  private events: any[] = [];

  constructor() {
    this.reset();
  }

  private getTimeStr(): string {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  }

  public reset(): SimulationState {
    this.phaseIndex = 0;
    this.currentPhase = 'NORMAL';
    this.anomalyType = 'TRAFFIC_SPIKE';
    this.incidentActive = false;
    this.routeBypassActive = false;
    this.events = [
      {
        id: 'evt-1',
        timestamp: this.getTimeStr(),
        source: 'System',
        phase: 'NORMAL',
        level: 'INFO',
        title: 'C-ASA Control Plane Initialized',
        message: 'Autonomic loop initialized. All 5 monitoring & cognitive agents operational.'
      },
      {
        id: 'evt-2',
        timestamp: this.getTimeStr(),
        source: 'Telemetry Agent',
        phase: 'NORMAL',
        level: 'INFO',
        title: 'Baseline Telemetry Established',
        message: 'Packet rate: 1,284/s, Latency: 32ms, Loss: 1.2%, Bandwidth: 420 Mbps.'
      }
    ];
    this.initHistory();
    return this.getState();
  }

  private initHistory() {
    this.telemetryHistory = [];
    for (let i = 20; i >= 1; i--) {
      const now = new Date(Date.now() - i * 2000);
      const timeStr = now.toTimeString().split(' ')[0];
      this.telemetryHistory.push({
        time: timeStr,
        packet_rate: Math.round(1280 + (Math.random() * 80 - 40)),
        latency: Number((32 + (Math.random() * 4 - 2)).toFixed(1)),
        packet_loss: Number((1.2 + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        bandwidth: Math.round(420 + (Math.random() * 30 - 15)),
        cpu: Number((24 + (Math.random() * 4 - 2)).toFixed(1)),
        memory: Number((41 + (Math.random() * 2 - 1)).toFixed(1)),
        active_connections: Math.round(380 + (Math.random() * 20 - 10)),
        status: 'NORMAL',
        health_score: 98
      });
    }
  }

  public triggerAnomaly(type = 'TRAFFIC_SPIKE'): SimulationState {
    this.anomalyType = type;
    this.incidentActive = true;
    this.routeBypassActive = false;
    this.setPhase('ANOMALY');
    this.addEvent({
      id: `evt-${this.events.length + 1}`,
      timestamp: this.getTimeStr(),
      source: 'Simulator',
      phase: 'ANOMALY',
      level: 'DANGER',
      title: type === 'TRAFFIC_SPIKE' ? '⚡ Network Anomaly Injected' : '💥 Router R2 Failure Injected',
      message: 'Simulated traffic flood directed at Router R2 (10.0.2.1). Ingress threshold exceeded by 380%.'
    });
    return this.getState();
  }

  public setPhase(phase: SimulationPhase): SimulationState {
    this.currentPhase = phase;
    this.phaseIndex = PHASES.indexOf(phase);
    if (phase === 'NORMAL') {
      this.incidentActive = false;
      this.routeBypassActive = false;
    } else if (phase === 'NETWORK_ACTION' || phase === 'RECOVERY') {
      this.routeBypassActive = true;
    }

    const t = this.getTelemetry();
    this.telemetryHistory.push({
      time: this.getTimeStr(),
      ...t
    });
    if (this.telemetryHistory.length > 30) {
      this.telemetryHistory.shift();
    }
    return this.getState();
  }

  public step(direction: 'next' | 'prev' = 'next'): SimulationState {
    if (direction === 'next' && this.phaseIndex < PHASES.length - 1) {
      return this.setPhase(PHASES[this.phaseIndex + 1]);
    } else if (direction === 'prev' && this.phaseIndex > 0) {
      return this.setPhase(PHASES[this.phaseIndex - 1]);
    }
    return this.getState();
  }

  private addEvent(ev: any) {
    this.events.push(ev);
    if (this.events.length > 50) this.events.shift();
  }

  public getTelemetry() {
    const p = this.currentPhase;
    if (p === 'NORMAL') {
      return {
        packet_rate: Math.round(1284 + (Math.random() * 60 - 30)),
        latency: Number((32.0 + (Math.random() * 3 - 1.5)).toFixed(1)),
        packet_loss: Number((1.2 + (Math.random() * 0.3 - 0.15)).toFixed(2)),
        bandwidth: Math.round(420 + (Math.random() * 20 - 10)),
        cpu: Number((24.5 + (Math.random() * 4 - 2)).toFixed(1)),
        memory: Number((41.2 + (Math.random() * 2 - 1)).toFixed(1)),
        active_connections: Math.round(384 + (Math.random() * 16 - 8)),
        status: 'NORMAL',
        health_score: 98
      };
    } else if (p === 'ANOMALY' || p === 'TELEMETRY_DETECTED') {
      return {
        packet_rate: Math.round(5920 + (Math.random() * 200 - 100)),
        latency: Number((146.0 + (Math.random() * 10 - 5)).toFixed(1)),
        packet_loss: Number((8.7 + (Math.random() * 0.8 - 0.4)).toFixed(2)),
        bandwidth: Math.round(1850 + (Math.random() * 80 - 40)),
        cpu: Number((89.2 + (Math.random() * 6 - 3)).toFixed(1)),
        memory: Number((78.4 + (Math.random() * 4 - 2)).toFixed(1)),
        active_connections: Math.round(1420 + (Math.random() * 50 - 25)),
        status: 'CRITICAL',
        health_score: 58
      };
    } else if (p === 'SECURITY_ANALYSIS' || p === 'CASA_ACTIVATION' || p === 'TASK_DECOMPOSITION' || p === 'A2A_COMMUNICATION') {
      return {
        packet_rate: Math.round(5650 + (Math.random() * 150 - 75)),
        latency: Number((138.0 + (Math.random() * 8 - 4)).toFixed(1)),
        packet_loss: Number((8.1 + (Math.random() * 0.6 - 0.3)).toFixed(2)),
        bandwidth: Math.round(1780 + (Math.random() * 60 - 30)),
        cpu: Number((84.0 + (Math.random() * 4 - 2)).toFixed(1)),
        memory: Number((75.5 + (Math.random() * 3 - 1.5)).toFixed(1)),
        active_connections: Math.round(1350 + (Math.random() * 40 - 20)),
        status: 'EVALUATING',
        health_score: 64
      };
    } else if (p === 'RISK_ASSESSMENT' || p === 'DECISION') {
      return {
        packet_rate: Math.round(5100 + (Math.random() * 120 - 60)),
        latency: Number((120.0 + (Math.random() * 8 - 4)).toFixed(1)),
        packet_loss: Number((6.9 + (Math.random() * 0.5 - 0.25)).toFixed(2)),
        bandwidth: Math.round(1620 + (Math.random() * 50 - 25)),
        cpu: Number((76.2 + (Math.random() * 4 - 2)).toFixed(1)),
        memory: Number((69.0 + (Math.random() * 3 - 1.5)).toFixed(1)),
        active_connections: Math.round(1190 + (Math.random() * 30 - 15)),
        status: 'ADAPTING',
        health_score: 72
      };
    } else if (p === 'NETWORK_ACTION') {
      return {
        packet_rate: Math.round(3450 + (Math.random() * 100 - 50)),
        latency: Number((74.0 + (Math.random() * 6 - 3)).toFixed(1)),
        packet_loss: Number((3.8 + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        bandwidth: Math.round(980 + (Math.random() * 40 - 20)),
        cpu: Number((52.1 + (Math.random() * 4 - 2)).toFixed(1)),
        memory: Number((54.3 + (Math.random() * 2 - 1)).toFixed(1)),
        active_connections: Math.round(720 + (Math.random() * 25 - 12)),
        status: 'REROUTING',
        health_score: 86
      };
    } else {
      return {
        packet_rate: Math.round(2100 + (Math.random() * 50 - 25)),
        latency: Number((38.0 + (Math.random() * 3 - 1.5)).toFixed(1)),
        packet_loss: Number((1.4 + (Math.random() * 0.2 - 0.1)).toFixed(2)),
        bandwidth: Math.round(540 + (Math.random() * 25 - 12)),
        cpu: Number((31.5 + (Math.random() * 3 - 1.5)).toFixed(1)),
        memory: Number((44.0 + (Math.random() * 2 - 1)).toFixed(1)),
        active_connections: Math.round(460 + (Math.random() * 20 - 10)),
        status: 'RECOVERED',
        health_score: 96
      };
    }
  }

  public getAgents() {
    const p = this.currentPhase;
    return [
      {
        id: 'telemetry-agent',
        name: 'Telemetry Agent',
        role: 'Real-time Metrics & Ingestion',
        status: p === 'ANOMALY' ? 'ANOMALY DETECTED' : (p === 'NORMAL' || p === 'RECOVERY' ? 'MONITORING' : 'STREAMING METRICS'),
        task: p === 'ANOMALY' ? 'Isolating anomalous interface spike on R2' : (p === 'RECOVERY' ? 'Monitoring recovered baseline' : 'Real-time sFlow/SNMP Link Ingestion'),
        confidence: 99,
        risk: p === 'ANOMALY' ? 'CRITICAL' : 'LOW',
        last_event: p === 'ANOMALY' ? 'Packet rate anomaly on R2 interface eth2' : 'All links operational',
        color: '#00ffcc',
        capabilities: ['sFlow Ingestion', 'Interface Telemetry', 'Latency Probing', 'Packet Loss Detection']
      },
      {
        id: 'security-agent',
        name: 'Security Agent',
        role: 'Threat Detection & Diagnostics',
        status: p === 'SECURITY_ANALYSIS' ? 'INVESTIGATING' : (p === 'ANOMALY' || p === 'TELEMETRY_DETECTED' ? 'ALERTED' : (p === 'NORMAL' || p === 'RECOVERY' ? 'MONITORING' : 'SHARING EVIDENCE')),
        task: p === 'SECURITY_ANALYSIS' ? 'Source entropy & volumetric profile analysis' : (p === 'RECOVERY' ? 'Continuous baseline threat inspection' : 'Signature & Flow Anomaly Scanner'),
        confidence: p === 'SECURITY_ANALYSIS' ? 89 : 96,
        risk: p === 'SECURITY_ANALYSIS' || p === 'ANOMALY' ? 'HIGH (72/100)' : 'LOW',
        last_event: p === 'SECURITY_ANALYSIS' ? 'Threat score computed: 72/100' : 'Signature validation active',
        color: '#ff3366',
        capabilities: ['Flow Anomaly Scoring', 'Threat Classification', 'Entropy Analysis', 'Evidence Formulation']
      },
      {
        id: 'casa-agent',
        name: 'C-ASA Core',
        role: 'Cognitive Reasoning & Decision Engine',
        status: p === 'NORMAL' ? 'IDLE' : (p === 'CASA_ACTIVATION' ? 'REASONING' : (p === 'TASK_DECOMPOSITION' ? 'PLANNING' : (p === 'DECISION' ? 'DECISION APPROVED' : (p === 'NETWORK_ACTION' ? 'ACTION IN PROGRESS' : (p === 'RECOVERY' ? 'COMPLETED' : 'ORCHESTRATING'))))),
        task: p === 'NORMAL' ? 'Autonomic Feedback Loop Standby' : (p === 'TASK_DECOMPOSITION' ? 'Decomposing incident into sub-tasks (01-05)' : (p === 'DECISION' ? 'Synthesizing final cognitive response' : (p === 'RECOVERY' ? 'Closed-loop verification complete' : 'Evaluating adaptive response'))),
        confidence: 93,
        risk: p === 'NORMAL' ? 'NOMINAL' : (p === 'DECISION' ? 'PROJECTED 31/100' : 'HIGH (72/100)'),
        last_event: p === 'DECISION' ? 'Approved action: Reroute traffic via R4' : (p === 'RECOVERY' ? 'Autonomic adaptation cycle complete' : 'Cognitive reasoning loop running'),
        color: '#a855f7',
        capabilities: ['Task Decomposition', 'Multi-Factor Risk Scoring', 'Autonomic Closed-Loop', 'Cognitive Strategy Selection']
      },
      {
        id: 'policy-agent',
        name: 'Policy Agent',
        role: 'SLA Governance & Routing Analysis',
        status: p === 'A2A_COMMUNICATION' ? 'ANALYZING ROUTES' : (p === 'RISK_ASSESSMENT' ? 'POLICY VERIFIED' : (p === 'DECISION' || p === 'NETWORK_ACTION' ? 'POLICY ACTIVE' : 'READY')),
        task: p === 'A2A_COMMUNICATION' ? 'Simulating alternate paths (R3, R4)' : (p === 'RISK_ASSESSMENT' ? 'Validating SLA latency < 45ms' : 'SLA & Routing Policy Validator'),
        confidence: 95,
        risk: 'LOW',
        last_event: p === 'A2A_COMMUNICATION' ? 'R4 identified as lowest latency alternate' : 'Default shortest-path routing enforced',
        color: '#ffaa00',
        capabilities: ['SLA Verification', 'Alternate Path Discovery', 'Capacity Planning', 'Rule Authorization']
      },
      {
        id: 'network-agent',
        name: 'Network Agent',
        role: 'SDN & Actuation Controller',
        status: p === 'DECISION' ? 'STAGING FLOWS' : (p === 'NETWORK_ACTION' ? 'EXECUTING ACTION' : (p === 'RECOVERY' ? 'ACTIVE ROUTING' : 'READY')),
        task: p === 'NETWORK_ACTION' ? 'Pushing OpenFlow Rule: Redirect R1->R4->Server' : (p === 'RECOVERY' ? 'Maintaining optimized route topology' : 'SDN / OpenFlow Controller Interface'),
        confidence: 98,
        risk: p === 'NETWORK_ACTION' ? 'ACTIVE ACTION' : 'LOW',
        last_event: p === 'NETWORK_ACTION' ? 'Flow tables updated on R1 & R4. Traffic redirected.' : 'All SDN switches connected & healthy',
        color: '#38bdf8',
        capabilities: ['OpenFlow Rule Injection', 'BGP Path Manipulation', 'Dynamic Rerouting', 'Interface Throttling']
      }
    ];
  }

  public getTopology() {
    const p = this.currentPhase;
    const isAnomaly = ['ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION', 'A2A_COMMUNICATION', 'RISK_ASSESSMENT', 'DECISION'].includes(p);
    const isRerouted = ['NETWORK_ACTION', 'RECOVERY'].includes(p);

    const nodes: any[] = [
      { id: 'internet', name: 'INTERNET', type: 'cloud', x: 400, y: 60, status: 'ONLINE', ip: '0.0.0.0/0', load: 42 },
      { id: 'r1', name: 'ROUTER R1', type: 'router', x: 400, y: 170, status: 'ONLINE', ip: '10.0.0.1', load: isAnomaly ? 65 : 45 },
      { id: 's1', name: 'SWITCH S1', type: 'switch', x: 220, y: 290, status: 'ONLINE', ip: '10.0.1.254', load: 38 },
      { id: 'r2', name: 'ROUTER R2', type: 'router', x: 580, y: 290, status: isAnomaly ? 'CRITICAL' : (isRerouted ? 'BYPASSED' : 'ONLINE'), ip: '10.0.2.1', load: isAnomaly ? 94 : (isRerouted ? 15 : 42) },
      { id: 'r4', name: 'ROUTER R4 (BYPASS)', type: 'router', x: 740, y: 290, status: isRerouted ? 'ACTIVE_ROUTE' : 'STANDBY', ip: '10.0.4.1', load: isRerouted ? 58 : 8 },
      { id: 'pc1', name: 'PC 1', type: 'host', x: 130, y: 420, status: 'ONLINE', ip: '10.0.1.10', load: 22 },
      { id: 'pc2', name: 'PC 2', type: 'host', x: 310, y: 420, status: 'ONLINE', ip: '10.0.1.11', load: 28 },
      { id: 'server', name: 'SERVER CORE', type: 'server', x: 580, y: 440, status: isRerouted ? 'PROTECTED' : (isAnomaly ? 'DEGRADED' : 'ONLINE'), ip: '10.0.2.100', load: isAnomaly ? 78 : 46 }
    ];

    const links: any[] = [
      { id: 'l-inet-r1', source: 'internet', target: 'r1', type: 'normal', traffic: isAnomaly ? 'high' : 'medium', active: true },
      { id: 'l-r1-s1', source: 'r1', target: 's1', type: 'normal', traffic: 'low', active: true },
      { id: 'l-s1-pc1', source: 's1', target: 'pc1', type: 'normal', traffic: 'low', active: true },
      { id: 'l-s1-pc2', source: 's1', target: 'pc2', type: 'normal', traffic: 'low', active: true },
      { id: 'l-r1-r2', source: 'r1', target: 'r2', type: isAnomaly ? 'anomalous' : (isRerouted ? 'inactive' : 'normal'), traffic: isAnomaly ? 'critical' : (isRerouted ? 'idle' : 'normal'), active: !isRerouted },
      { id: 'l-r2-server', source: 'r2', target: 'server', type: isAnomaly ? 'anomalous' : (isRerouted ? 'inactive' : 'normal'), traffic: isAnomaly ? 'critical' : (isRerouted ? 'idle' : 'normal'), active: !isRerouted },
      { id: 'l-r1-r4', source: 'r1', target: 'r4', type: isRerouted ? 'bypass' : 'standby', traffic: isRerouted ? 'high' : 'idle', active: isRerouted },
      { id: 'l-r4-server', source: 'r4', target: 'server', type: isRerouted ? 'bypass' : 'standby', traffic: isRerouted ? 'high' : 'idle', active: isRerouted }
    ];

    let packets: any[] = [];
    if (!isAnomaly && !isRerouted) {
      packets = [
        { id: 'p1', source: 'internet', target: 'r1', type: 'NORMAL', speed: 1.0, progress: 0.4 },
        { id: 'p2', source: 'r1', target: 'r2', type: 'NORMAL', speed: 1.0, progress: 0.7 },
        { id: 'p3', source: 'r2', target: 'server', type: 'NORMAL', speed: 1.0, progress: 0.2 },
        { id: 'p4', source: 'pc1', target: 's1', type: 'NORMAL', speed: 0.8, progress: 0.5 },
      ];
    } else if (isAnomaly) {
      packets = [
        { id: 'p1', source: 'internet', target: 'r1', type: 'SUSPICIOUS', speed: 2.2, progress: 0.3 },
        { id: 'p2', source: 'r1', target: 'r2', type: 'SUSPICIOUS', speed: 2.5, progress: 0.8 },
        { id: 'p3', source: 'r2', target: 'server', type: 'SUSPICIOUS', speed: 2.0, progress: 0.5 },
        { id: 'p4', source: 'r1', target: 'r2', type: 'SUSPICIOUS', speed: 2.8, progress: 0.2 },
      ];
      if (['TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION', 'A2A_COMMUNICATION'].includes(p)) {
        packets.push({ id: 'p-telemetry', source: 'r2', target: 'r1', type: 'TELEMETRY', speed: 1.5, progress: 0.6 });
      }
    } else {
      packets = [
        { id: 'p1', source: 'internet', target: 'r1', type: 'NORMAL', speed: 1.2, progress: 0.5 },
        { id: 'p2', source: 'r1', target: 'r4', type: 'CONTROL_ACTION', speed: 1.4, progress: 0.7 },
        { id: 'p3', source: 'r4', target: 'server', type: 'CONTROL_ACTION', speed: 1.4, progress: 0.3 },
        { id: 'p4', source: 'pc2', target: 's1', type: 'NORMAL', speed: 0.9, progress: 0.4 },
      ];
    }

    return {
      nodes,
      links,
      packets,
      affected_node: isAnomaly || isRerouted ? 'r2' : null,
      bypass_node: isRerouted ? 'r4' : null,
      is_rerouted: isRerouted
    };
  }

  public getCognitive() {
    const p = this.currentPhase;
    return {
      current_phase: p,
      stages: [
        { id: 'input', title: '01 INPUT', desc: 'Ingest Alarm & Telemetry', status: p !== 'NORMAL' ? 'COMPLETED' : 'PENDING' },
        { id: 'context', title: '02 CONTEXT', desc: 'Map Topology & SLA Constraints', status: !['NORMAL', 'ANOMALY'].includes(p) ? 'COMPLETED' : (p === 'ANOMALY' ? 'ACTIVE' : 'PENDING') },
        { id: 'reasoning', title: '03 REASONING', desc: 'Cognitive Diagnosis & Root Cause', status: !['NORMAL', 'ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS'].includes(p) ? 'COMPLETED' : (['SECURITY_ANALYSIS', 'CASA_ACTIVATION'].includes(p) ? 'ACTIVE' : 'PENDING') },
        { id: 'decomposition', title: '04 TASK DECOMPOSITION', desc: 'Decompose into 5 Sub-Tasks', status: !['NORMAL', 'ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION'].includes(p) ? 'COMPLETED' : (p === 'TASK_DECOMPOSITION' ? 'ACTIVE' : 'PENDING') },
        { id: 'planning', title: '05 PLANNING', desc: 'A2A Path & Action Synthesizer', status: !['NORMAL', 'ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION'].includes(p) ? 'COMPLETED' : (p === 'A2A_COMMUNICATION' ? 'ACTIVE' : 'PENDING') },
        { id: 'risk', title: '06 RISK ASSESSMENT', desc: 'Multi-Factor Scoring Matrix', status: !['NORMAL', 'ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION', 'A2A_COMMUNICATION'].includes(p) ? 'COMPLETED' : (p === 'RISK_ASSESSMENT' ? 'ACTIVE' : 'PENDING') },
        { id: 'decision', title: '07 DECISION', desc: 'Cognitive Strategy Selection', status: ['DECISION', 'NETWORK_ACTION', 'RECOVERY'].includes(p) ? 'COMPLETED' : (p === 'DECISION' ? 'ACTIVE' : 'PENDING') },
        { id: 'action', title: '08 ACTION & RECOVERY', desc: 'Actuation & Closed-Loop Verif', status: p === 'RECOVERY' ? 'COMPLETED' : (p === 'NETWORK_ACTION' ? 'ACTIVE' : 'PENDING') }
      ],
      tasks: [
        { id: 't1', code: 'TASK 01', name: 'Validate anomaly telemetry', status: !['NORMAL', 'ANOMALY'].includes(p) ? 'DONE' : 'IN_PROGRESS', agent: 'Telemetry Agent', detail: 'Interface eth2 verified: 5,920 pps spike (380% baseline)' },
        { id: 't2', code: 'TASK 02', name: 'Analyze traffic source distribution', status: !['NORMAL', 'ANOMALY', 'TELEMETRY_DETECTED'].includes(p) ? 'DONE' : (p === 'TELEMETRY_DETECTED' ? 'IN_PROGRESS' : 'PENDING'), agent: 'Security Agent', detail: 'Volumetric anomaly classified with 89% confidence' },
        { id: 't3', code: 'TASK 03', name: 'Evaluate security threat & impact', status: !['NORMAL', 'ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS'].includes(p) ? 'DONE' : (p === 'SECURITY_ANALYSIS' ? 'IN_PROGRESS' : 'PENDING'), agent: 'C-ASA Core', detail: 'Threat Score: 72/100 -> Router R2 buffer saturation threat' },
        { id: 't4', code: 'TASK 04', name: 'Evaluate routing alternatives & SLA', status: !['NORMAL', 'ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION'].includes(p) ? 'DONE' : (['TASK_DECOMPOSITION', 'A2A_COMMUNICATION'].includes(p) ? 'IN_PROGRESS' : 'PENDING'), agent: 'Policy Agent', detail: 'Bypass Router R4 capacity: 10 Gbps, Latency: 38ms (Compliant)' },
        { id: 't5', code: 'TASK 05', name: 'Select & execute optimal response', status: ['NETWORK_ACTION', 'RECOVERY'].includes(p) ? 'DONE' : (p === 'DECISION' ? 'IN_PROGRESS' : 'PENDING'), agent: 'Network Agent', detail: 'Execute OpenFlow flow modification (Redirect R1 -> R4 -> Server)' }
      ],
      risk: {
        initial_risk: 72,
        current_risk: ['ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS'].includes(p) ? 72 : (['CASA_ACTIVATION', 'TASK_DECOMPOSITION', 'A2A_COMMUNICATION', 'RISK_ASSESSMENT'].includes(p) ? 61 : (['DECISION', 'NETWORK_ACTION'].includes(p) ? 31 : 24)),
        factors: [
          { name: 'Network Impact', score: ['ANOMALY', 'TELEMETRY_DETECTED'].includes(p) ? 85 : 22, weight: 0.35 },
          { name: 'Security Risk', score: p !== 'RECOVERY' ? 72 : 20, weight: 0.25 },
          { name: 'Recovery Cost', score: p !== 'RECOVERY' ? 45 : 15, weight: 0.20 },
          { name: 'Policy / SLA Penalty', score: ['ANOMALY', 'TELEMETRY_DETECTED'].includes(p) ? 68 : 18, weight: 0.20 }
        ],
        confidence: ['SECURITY_ANALYSIS', 'CASA_ACTIVATION'].includes(p) ? 89 : (['TASK_DECOMPOSITION', 'A2A_COMMUNICATION', 'RISK_ASSESSMENT', 'DECISION'].includes(p) ? 91 : 98)
      },
      decision: {
        problem: 'Severe anomalous traffic concentration on Router R2 causing SLA degradation and 8.7% packet loss.',
        context: 'High packet rate (5,920/s), High latency (146ms), Server Core critical pathway at risk.',
        decision: 'Reroute affected ingress traffic through Router R4 bypass.',
        reason: 'Lower latency (38ms vs 146ms), 0% congestion on R4, avoids R2 buffer drop, post-action risk reduces from 72 to 31.',
        confidence: '91%',
        risk_before: 72,
        risk_after: 31,
        status: ['DECISION', 'NETWORK_ACTION', 'RECOVERY'].includes(p) ? 'APPROVED' : 'PENDING_ASSESSMENT'
      }
    };
  }

  public getA2A() {
    return [
      {
        id: 'msg-1',
        time: '12:00:02',
        from: 'Telemetry Agent',
        to: 'Security Agent',
        type: 'TELEMETRY_ALERT',
        goal: 'Notify anomalous packet spike on Router R2',
        evidence: {
          affected_node: 'Router R2 (10.0.2.1)',
          packet_rate: '5,920 pps (+380%)',
          packet_loss: '8.7%',
          latency: '146ms'
        },
        intent: 'Request security validation & volumetric classification',
        confidence: '96%',
        risk: 'HIGH'
      },
      {
        id: 'msg-2',
        time: '12:00:05',
        from: 'Security Agent',
        to: 'C-ASA Core',
        type: 'SECURITY_ASSESSMENT',
        goal: 'Deliver structured security diagnostic evidence',
        evidence: {
          event: 'Abnormal Traffic Pattern & Buffer Saturation',
          threat_score: '72 / 100',
          source_entropy: '0.84 (Highly distributed anomalous sources)',
          target: 'Router R2 Interface eth2'
        },
        intent: 'Request autonomic cognitive mitigation response',
        confidence: '89%',
        risk: 'HIGH (72/100)'
      },
      {
        id: 'msg-3',
        time: '12:00:08',
        from: 'C-ASA Core',
        to: 'Policy Agent',
        type: 'POLICY_QUERY',
        goal: 'Evaluate alternate routing paths complying with SLA constraints',
        evidence: {
          unusable_node: 'Router R2',
          required_throughput: '2.5 Gbps',
          max_tolerable_latency: '50ms'
        },
        intent: 'Query available bypass topologies (R3 vs R4)',
        confidence: '91%',
        risk: 'EVALUATING'
      },
      {
        id: 'msg-4',
        time: '12:00:11',
        from: 'Policy Agent',
        to: 'C-ASA Core',
        type: 'RECOMMENDATION',
        goal: 'Return optimal routing recommendation',
        evidence: {
          recommended_route: 'Router R4 Bypass (10.0.4.1)',
          available_bandwidth: '10 Gbps',
          projected_latency: '38ms',
          sla_compliance: '100%'
        },
        intent: 'Recommend dynamic reroute via R4',
        confidence: '94%',
        risk: 'LOW (28/100)'
      },
      {
        id: 'msg-5',
        time: '12:00:14',
        from: 'C-ASA Core',
        to: 'Network Agent',
        type: 'CONTROL_ACTION',
        goal: 'Execute OpenFlow dynamic route reconfiguration',
        evidence: {
          action: 'FLOW_MOD_REDIRECT',
          source_switch: 'Router R1',
          target_switch: 'Router R4',
          destination: 'Server Core'
        },
        intent: 'Execute immediate live network adaptation',
        confidence: '98%',
        risk: 'MITIGATED'
      }
    ];
  }

  public getState(): SimulationState {
    const meta = PHASE_META[this.currentPhase];
    const isAnomaly = ['ANOMALY', 'TELEMETRY_DETECTED'].includes(this.currentPhase);
    const isAdapting = ['SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION', 'A2A_COMMUNICATION', 'RISK_ASSESSMENT', 'DECISION', 'NETWORK_ACTION'].includes(this.currentPhase);
    const isThreatHigh = ['ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION'].includes(this.currentPhase);
    const isThreatMitigating = ['A2A_COMMUNICATION', 'RISK_ASSESSMENT', 'DECISION', 'NETWORK_ACTION'].includes(this.currentPhase);

    return {
      system_status: 'ONLINE',
      environment: 'SIMULATION MODE',
      active_agents_count: 5,
      current_phase: this.currentPhase,
      phase_index: this.phaseIndex,
      total_phases: PHASES.length,
      phase_info: meta,
      network_status: isAnomaly ? 'CRITICAL' : (isAdapting ? 'ADAPTING' : 'HEALTHY'),
      threat_level: isThreatHigh ? 'HIGH' : (isThreatMitigating ? 'MITIGATING' : 'LOW'),
      scenario: this.anomalyType === 'TRAFFIC_SPIKE' ? 'TRAFFIC_SPIKE_MITIGATION' : 'NODE_FAILURE_RECOVERY',
      incident_active: this.incidentActive,
      route_bypass_active: this.routeBypassActive,
      telemetry: this.getTelemetry(),
      telemetry_history: this.telemetryHistory,
      agents: this.getAgents() as any,
      topology: this.getTopology() as any,
      cognitive: this.getCognitive() as any,
      a2a: this.getA2A() as any,
      events: this.events
    };
  }
}

export const mockSimulationStore = new MockSimulationStore();
