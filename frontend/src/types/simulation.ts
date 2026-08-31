export type SimulationPhase =
  | 'NORMAL'
  | 'ANOMALY'
  | 'TELEMETRY_DETECTED'
  | 'SECURITY_ANALYSIS'
  | 'CASA_ACTIVATION'
  | 'TASK_DECOMPOSITION'
  | 'A2A_COMMUNICATION'
  | 'RISK_ASSESSMENT'
  | 'DECISION'
  | 'NETWORK_ACTION'
  | 'RECOVERY';

export interface PhaseInfo {
  title: string;
  badge: string;
  badge_type: 'success' | 'warning' | 'danger' | 'primary' | 'info';
  description: string;
  progress: number;
}

export interface TelemetryData {
  packet_rate: number;
  latency: number;
  packet_loss: number;
  bandwidth: number;
  cpu: number;
  memory: number;
  active_connections: number;
  status: string;
  health_score: number;
}

export interface TelemetryPoint extends TelemetryData {
  time: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  task: string;
  confidence: number;
  risk: string;
  last_event: string;
  color: string;
  capabilities: string[];
}

export interface NetworkNode {
  id: string;
  name: string;
  type: 'cloud' | 'router' | 'switch' | 'host' | 'server';
  x: number;
  y: number;
  status: 'ONLINE' | 'CRITICAL' | 'BYPASSED' | 'ACTIVE_ROUTE' | 'STANDBY' | 'PROTECTED' | 'DEGRADED';
  ip: string;
  load: number;
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  type: 'normal' | 'anomalous' | 'bypass' | 'inactive' | 'standby';
  traffic: 'low' | 'medium' | 'high' | 'critical' | 'idle';
  active: boolean;
}

export interface NetworkPacket {
  id: string;
  source: string;
  target: string;
  type: 'NORMAL' | 'SUSPICIOUS' | 'TELEMETRY' | 'A2A_MESSAGE' | 'CONTROL_ACTION';
  speed: number;
  progress: number;
}

export interface NetworkTopologyData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  packets: NetworkPacket[];
  affected_node: string | null;
  bypass_node: string | null;
  is_rerouted: boolean;
}

export interface CognitiveStage {
  id: string;
  title: string;
  desc: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

export interface CognitiveTask {
  id: string;
  code: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  agent: string;
  detail: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
}

export interface RiskBreakdown {
  initial_risk: number;
  current_risk: number;
  factors: RiskFactor[];
  confidence: number;
}

export interface CognitiveDecision {
  problem: string;
  context: string;
  decision: string;
  reason: string;
  confidence: string;
  risk_before: number;
  risk_after: number;
  status: string;
}

export interface CognitiveWorkflowData {
  current_phase: SimulationPhase;
  stages: CognitiveStage[];
  tasks: CognitiveTask[];
  risk: RiskBreakdown;
  decision: CognitiveDecision;
}

export interface A2AMessageData {
  id: string;
  time: string;
  from: string;
  to: string;
  type: string;
  goal: string;
  evidence: Record<string, any>;
  intent: string;
  confidence: string;
  risk: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  source: string;
  phase: string;
  level: 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';
  title: string;
  message: string;
}

export interface SimulationState {
  system_status: string;
  environment: string;
  active_agents_count: number;
  current_phase: SimulationPhase;
  phase_index: number;
  total_phases: number;
  phase_info: PhaseInfo;
  network_status: 'HEALTHY' | 'CRITICAL' | 'ADAPTING';
  threat_level: 'LOW' | 'HIGH' | 'MITIGATING';
  scenario: string;
  incident_active: boolean;
  route_bypass_active: boolean;
  telemetry: TelemetryData;
  telemetry_history: TelemetryPoint[];
  agents: Agent[];
  topology: NetworkTopologyData;
  cognitive: CognitiveWorkflowData;
  a2a: A2AMessageData[];
  events: TimelineEvent[];
}
