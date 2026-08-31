import {
  SimulationState,
  Agent,
  NetworkTopologyData,
  TelemetryData,
  TelemetryPoint,
  TimelineEvent,
  A2AMessageData,
  CognitiveWorkflowData,
  SimulationPhase
} from '@/types/simulation';
import { mockSimulationStore } from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithFallback<T>(url: string, fallbackFn: () => T, options?: RequestInit): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // Graceful fallback to mock data store
    return fallbackFn();
  }
}

export const simulationApi = {
  async getState(): Promise<SimulationState> {
    return fetchWithFallback('/api/simulation/state/', () => mockSimulationStore.getState());
  },

  async getAgents(): Promise<Agent[]> {
    return fetchWithFallback('/api/agents/', () => mockSimulationStore.getAgents() as Agent[]);
  },

  async getNetworkTopology(): Promise<NetworkTopologyData> {
    return fetchWithFallback('/api/network/', () => mockSimulationStore.getTopology() as NetworkTopologyData);
  },

  async getTelemetry(): Promise<{ current: TelemetryData; history: TelemetryPoint[] }> {
    return fetchWithFallback('/api/telemetry/', () => ({
      current: mockSimulationStore.getTelemetry(),
      history: mockSimulationStore.getState().telemetry_history
    }));
  },

  async getEvents(): Promise<TimelineEvent[]> {
    return fetchWithFallback('/api/events/', () => mockSimulationStore.getState().events);
  },

  async getA2A(): Promise<A2AMessageData[]> {
    return fetchWithFallback('/api/a2a/', () => mockSimulationStore.getA2A() as A2AMessageData[]);
  },

  async getCognitive(): Promise<CognitiveWorkflowData> {
    return fetchWithFallback('/api/cognitive/', () => mockSimulationStore.getCognitive() as CognitiveWorkflowData);
  },

  async triggerAnomaly(type = 'TRAFFIC_SPIKE'): Promise<SimulationState> {
    return fetchWithFallback('/api/simulation/anomaly/', () => mockSimulationStore.triggerAnomaly(type), {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  },

  async triggerNodeFailure(): Promise<SimulationState> {
    return fetchWithFallback('/api/simulation/node-failure/', () => mockSimulationStore.triggerAnomaly('NODE_FAILURE'), {
      method: 'POST'
    });
  },

  async reset(): Promise<SimulationState> {
    return fetchWithFallback('/api/simulation/reset/', () => mockSimulationStore.reset(), {
      method: 'POST'
    });
  },

  async step(direction: 'next' | 'prev' = 'next'): Promise<SimulationState> {
    return fetchWithFallback('/api/simulation/step/', () => mockSimulationStore.step(direction), {
      method: 'POST',
      body: JSON.stringify({ direction })
    });
  },

  async setPhase(phase: SimulationPhase): Promise<SimulationState> {
    return fetchWithFallback('/api/simulation/phase/', () => mockSimulationStore.setPhase(phase), {
      method: 'POST',
      body: JSON.stringify({ phase })
    });
  },

  // Device & Provisioning API
  async getDevices(): Promise<any[]> {
    return fetchWithFallback('/api/nodes/', () => []);
  },

  async provisionDevice(deviceData: any): Promise<any> {
    return fetchWithFallback('/api/nodes/', () => ({ status: 'PROVISIONED', ...deviceData }), {
      method: 'POST',
      body: JSON.stringify(deviceData)
    });
  },

  async deleteDevice(nodeId: string): Promise<any> {
    return fetchWithFallback(`/api/nodes/${nodeId}/`, () => ({ status: 'DELETED', node_id: nodeId }), {
      method: 'DELETE'
    });
  },

  // BRSKI (RFC 8995) API
  async requestBRSKIVoucher(data: { serial_number: string; pledge_id?: string }): Promise<any> {
    return fetchWithFallback('/api/brski/voucher-request/', () => ({
      "ietf-voucher:voucher": {
        "voucher-version": "1.0",
        "serial-number": data.serial_number,
        "pinned-domain-cert": "SHA256:7B:3A:9F:88:C1:4E:02:D5:A6",
        "domain-registrar": "casa-autonomic-registrar.domain.net",
        "nonce": "TESTNONCE"
      }
    }), {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async enrollBRSKIEst(data: { pledge_id: string; pledge_name: string; serial_number: string; proxy_id: string }): Promise<any> {
    return fetchWithFallback('/api/brski/est-enroll/', () => ({
      status: "ENROLLED_AND_TRUSTED",
      certificate: {
        x509_certificate: {
          subject: `CN=${data.pledge_id}.casa.autonomic.net`,
          status: "VALIDATED_AND_ENROLLED"
        }
      }
    }), {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Audit Logs API
  async getAuditLogs(query = ''): Promise<any[]> {
    return fetchWithFallback(`/api/logs/${query}`, () => []);
  },

  // C-ASA Private Cognitive Reasoning Model API
  async privateModelGenerate(prompt: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/simulation/private-model/generate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      return await res.json();
    } catch (e) {
      return { status: 'ERROR', error: String(e) };
    }
  },

  async privateModelAnalyze(telemetry?: any, phase?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/simulation/private-model/analyze/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry, phase })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },

  async privateModelChat(query: string, history: any[] = []): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/simulation/private-model/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },

  async privateModelStatus(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/simulation/private-model/status/`);
      return await res.json();
    } catch (e) {
      return { status: 'OFFLINE' };
    }
  }
};



