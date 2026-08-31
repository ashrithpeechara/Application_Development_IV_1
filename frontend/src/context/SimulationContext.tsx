'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SimulationState, SimulationPhase, NetworkNode, NetworkLink, TimelineEvent } from '@/types/simulation';
import { simulationApi } from '@/services/api';

interface SimulationContextType {
  state: SimulationState | null;
  loading: boolean;
  autoPlay: boolean;
  toggleAutoPlay: () => void;
  triggerAnomaly: (type?: string) => Promise<void>;
  triggerNodeFailure: () => Promise<void>;
  resetSimulation: () => Promise<void>;
  stepForward: () => Promise<void>;
  stepBackward: () => Promise<void>;
  setPhase: (phase: SimulationPhase) => Promise<void>;
  refreshState: () => Promise<void>;
  addCustomNode: (node: NetworkNode, targetLinkId?: string) => void;
  removeCustomNode: (nodeId: string) => void;
  updateNodeStatus: (nodeId: string, status: NetworkNode['status']) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [customNodes, setCustomNodes] = useState<NetworkNode[]>([]);
  const [customLinks, setCustomLinks] = useState<NetworkLink[]>([]);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  const refreshState = useCallback(async () => {
    try {
      const s = await simulationApi.getState();
      if (s && s.topology) {
        // Merge custom added nodes if any
        const existingNodeIds = new Set(s.topology.nodes.map((n) => n.id));
        const mergedNodes = [...s.topology.nodes];
        customNodes.forEach((cn) => {
          if (!existingNodeIds.has(cn.id)) {
            mergedNodes.push(cn);
          }
        });

        const existingLinkIds = new Set(s.topology.links.map((l) => l.id));
        const mergedLinks = [...s.topology.links];
        customLinks.forEach((cl) => {
          if (!existingLinkIds.has(cl.id)) {
            mergedLinks.push(cl);
          }
        });

        s.topology.nodes = mergedNodes;
        s.topology.links = mergedLinks;
      }
      setState(s);
    } catch (e) {
      console.error('Failed to fetch state:', e);
    } finally {
      setLoading(false);
    }
  }, [customNodes, customLinks]);

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 2500);
    return () => clearInterval(interval);
  }, [refreshState]);

  // Auto-play loop across phases
  useEffect(() => {
    if (autoPlay && state) {
      if (state.phase_index < state.total_phases - 1) {
        autoPlayTimer.current = setTimeout(async () => {
          const next = await simulationApi.step('next');
          setState(next);
        }, 3200);
      } else {
        setAutoPlay(false);
      }
    }
    return () => {
      if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    };
  }, [autoPlay, state?.phase_index, state?.total_phases]);

  const toggleAutoPlay = () => {
    setAutoPlay((prev) => !prev);
  };

  const triggerAnomaly = async (type = 'TRAFFIC_SPIKE') => {
    const s = await simulationApi.triggerAnomaly(type);
    setState(s);
    setAutoPlay(true);
  };

  const triggerNodeFailure = async () => {
    const s = await simulationApi.triggerNodeFailure();
    setState(s);
    setAutoPlay(true);
  };

  const resetSimulation = async () => {
    setAutoPlay(false);
    const s = await simulationApi.reset();
    setState(s);
  };

  const stepForward = async () => {
    setAutoPlay(false);
    const s = await simulationApi.step('next');
    setState(s);
  };

  const stepBackward = async () => {
    setAutoPlay(false);
    const s = await simulationApi.step('prev');
    setState(s);
  };

  const setPhase = async (phase: SimulationPhase) => {
    setAutoPlay(false);
    const s = await simulationApi.setPhase(phase);
    setState(s);
  };

  // Add a newly provisioned Router / Node
  const addCustomNode = (node: NetworkNode, targetLinkId?: string) => {
    setCustomNodes((prev) => [...prev, node]);

    const newLinks: NetworkLink[] = [];
    if (targetLinkId) {
      newLinks.push({
        id: `link-${node.id}-${targetLinkId}`,
        source: targetLinkId,
        target: node.id,
        type: 'normal',
        traffic: 'low',
        active: true
      });
    }

    if (newLinks.length > 0) {
      setCustomLinks((prev) => [...prev, ...newLinks]);
    }

    // Add log event
    if (state) {
      const newEvent: TimelineEvent = {
        id: `ev-admin-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        source: 'Admin Plane',
        phase: 'PROVISIONING',
        level: 'SUCCESS',
        title: `Node Provisioned: ${node.name}`,
        message: `Admin registered new ${node.type.toUpperCase()} [${node.id.toUpperCase()}] at ${node.ip} with connection to ${targetLinkId || 'SDN Plane'}.`
      };
      state.events = [...(state.events || []), newEvent];
      if (state.topology) {
        state.topology.nodes = [...state.topology.nodes, node];
        if (newLinks.length > 0) {
          state.topology.links = [...state.topology.links, ...newLinks];
        }
      }
      setState({ ...state });
    }
  };

  const removeCustomNode = (nodeId: string) => {
    setCustomNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setCustomLinks((prev) => prev.filter((l) => l.source !== nodeId && l.target !== nodeId));

    if (state && state.topology) {
      state.topology.nodes = state.topology.nodes.filter((n) => n.id !== nodeId);
      state.topology.links = state.topology.links.filter((l) => l.source !== nodeId && l.target !== nodeId);
      setState({ ...state });
    }
  };

  const updateNodeStatus = (nodeId: string, status: NetworkNode['status']) => {
    if (state && state.topology) {
      state.topology.nodes = state.topology.nodes.map((n) => (n.id === nodeId ? { ...n, status } : n));
      setState({ ...state });
    }
  };

  return (
    <SimulationContext.Provider
      value={{
        state,
        loading,
        autoPlay,
        toggleAutoPlay,
        triggerAnomaly,
        triggerNodeFailure,
        resetSimulation,
        stepForward,
        stepBackward,
        setPhase,
        refreshState,
        addCustomNode,
        removeCustomNode,
        updateNodeStatus
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return ctx;
};

