'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { NetworkNode } from '@/types/simulation';
import styles from './NetworkTopology.module.scss';
import { Network, AlertCircle, CheckCircle2, X, Cpu } from 'lucide-react';

interface Particle {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  type: 'NORMAL' | 'SUSPICIOUS' | 'TELEMETRY' | 'BYPASS';
}

const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  internet: { x: 530, y: 50 },
  r1: { x: 530, y: 150 },
  s1: { x: 260, y: 270 },
  r2: { x: 620, y: 270 },
  r4: { x: 880, y: 270 },
  pc1: { x: 160, y: 400 },
  pc2: { x: 360, y: 400 },
  server: { x: 620, y: 405 },
};


export const NetworkTopology: React.FC<{ fullHeight?: boolean }> = ({ fullHeight = false }) => {
  const { state } = useSimulation();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const topology = state?.topology;
  const isAnomaly = state?.current_phase && ['ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION', 'A2A_COMMUNICATION', 'RISK_ASSESSMENT', 'DECISION'].includes(state.current_phase);
  const isRerouted = state?.current_phase && ['NETWORK_ACTION', 'RECOVERY'].includes(state.current_phase);

  // Initialize and update animated packet particles
  useEffect(() => {
    if (!topology) return;

    const nodePosMap = new Map<string, { x: number; y: number }>();
    topology.nodes.forEach((n) => {
      const pos = NODE_COORDINATES[n.id] || { x: n.x, y: n.y };
      nodePosMap.set(n.id, pos);
    });

    const newParticles: Particle[] = [];

    topology.links.forEach((link, idx) => {
      if (!link.active) return;
      const sPos = nodePosMap.get(link.source);
      const tPos = nodePosMap.get(link.target);
      if (!sPos || !tPos) return;

      const count = link.type === 'anomalous' ? 5 : 2;
      for (let i = 0; i < count; i++) {
        let pType: Particle['type'] = 'NORMAL';
        if (link.type === 'anomalous') pType = 'SUSPICIOUS';
        else if (link.type === 'bypass') pType = 'BYPASS';

        newParticles.push({
          id: `p-${idx}-${i}`,
          sourceX: sPos.x,
          sourceY: sPos.y,
          targetX: tPos.x,
          targetY: tPos.y,
          progress: (i / count) + Math.random() * 0.15,
          speed: link.type === 'anomalous' ? 0.008 : 0.0035,
          type: pType
        });
      }
    });

    // Anomaly telemetry burst
    if (isAnomaly) {
      const r2Pos = nodePosMap.get('r2');
      if (r2Pos) {
        newParticles.push({
          id: 'p-telemetry-stream-1',
          sourceX: r2Pos.x,
          sourceY: r2Pos.y,
          targetX: 530,
          targetY: 480,
          progress: 0.1,
          speed: 0.006,
          type: 'TELEMETRY'
        });
      }
    }

    setParticles(newParticles);
  }, [topology, isAnomaly, isRerouted]);

  // Particle animation ticker
  useEffect(() => {
    const updateLoop = () => {
      setParticles((prev) =>
        prev.map((p) => {
          let np = p.progress + p.speed;
          if (np >= 1) np = 0;
          return { ...p, progress: np };
        })
      );
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (!topology) {
    return (
      <div className={styles.topologyCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading Autonomic Topology Map...</div>
      </div>
    );
  }

  const getPosition = (id: string) => {
    return NODE_COORDINATES[id] || { x: 530, y: 260 };
  };

  const getParticleColor = (type: Particle['type']) => {
    switch (type) {
      case 'SUSPICIOUS': return '#e11d48';
      case 'TELEMETRY': return '#7c3aed';
      case 'BYPASS': return '#0284c7';
      default: return '#2563eb';
    }
  };

  return (
    <div className={styles.topologyCard} style={{ height: fullHeight ? '640px' : '540px', minHeight: '500px' }}>
      <div className={styles.cardHeader}>

        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <Network size={16} />
          </div>
          <div>
            <div className={styles.cardTitle}>SDN Topology & Flow Simulator</div>
            <div className={styles.cardSub}>Dynamic OpenFlow Route Telemetry</div>
          </div>
        </div>

        <div className={styles.legendBar}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#2563eb' }} />
            <span>Normal Traffic</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#e11d48' }} />
            <span>Anomalous Flood</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#7c3aed' }} />
            <span>Telemetry Bus</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#0284c7' }} />
            <span>Cognitive Bypass (R4)</span>
          </div>
        </div>
      </div>

      <div className={styles.canvasContainer}>
        {/* Floating Notification Badges */}
        {isAnomaly && (
          <div className={styles.statusToastDanger}>
            <AlertCircle size={15} />
            <span>CRITICAL CONGESTION ON ROUTER R2 (10.0.2.1) — 8.7% LOSS</span>
          </div>
        )}

        {isRerouted && (
          <div className={styles.statusToastSuccess}>
            <CheckCircle2 size={15} />
            <span>AUTONOMIC BYPASS ACTIVE: FLOW REROUTED VIA ROUTER R4 (10G LINK)</span>
          </div>
        )}

        {/* SVG Drawing Canvas */}
        <svg
          className={styles.svgCanvas}
          viewBox="0 0 1060 520"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background Structural Grid */}
          <line x1="80" y1="480" x2="980" y2="480" stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1="530" y1="20" x2="530" y2="480" stroke="#e2e8f0" strokeDasharray="3 3" />

          {/* Links Between Network Nodes */}
          {topology.links.map((link) => {
            const sPos = getPosition(link.source);
            const tPos = getPosition(link.target);

            let stroke = '#cbd5e1';
            let strokeWidth = 1.8;
            let strokeDash = 'none';

            if (link.type === 'anomalous') {
              stroke = '#e11d48';
              strokeWidth = 2.8;
              strokeDash = '6 4';
            } else if (link.type === 'bypass' && link.active) {
              stroke = '#0284c7';
              strokeWidth = 2.8;
            } else if (link.type === 'inactive' || link.type === 'standby') {
              stroke = '#e2e8f0';
              strokeWidth = 1.5;
              strokeDash = '4 4';
            }

            return (
              <g key={link.id}>
                <line
                  x1={sPos.x}
                  y1={sPos.y}
                  x2={tPos.x}
                  y2={tPos.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                />
              </g>
            );
          })}

          {/* Flying Animated Packet Stream */}
          {particles.map((p) => {
            const curX = p.sourceX + (p.targetX - p.sourceX) * p.progress;
            const curY = p.sourceY + (p.targetY - p.sourceY) * p.progress;
            const color = getParticleColor(p.type);
            const radius = p.type === 'SUSPICIOUS' ? 4 : 3;

            return (
              <g key={p.id}>
                <circle
                  cx={curX}
                  cy={curY}
                  r={radius}
                  fill={color}
                />
              </g>
            );
          })}

          {/* Bottom Cognitive Agent Bus Bar */}
          <g transform="translate(230, 480)">
            <rect
              x="0"
              y="-12"
              width="600"
              height="24"
              rx="6"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <text x="20" y="4" fill="#7c3aed" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600" letterSpacing="0.05em">
              C-ASA AUTONOMIC AGENT PLANE (A2A PROTOCOL BUS)
            </text>
            <circle cx="570" cy="0" r="3.5" fill="#7c3aed" />
          </g>


          {/* Render Network Nodes */}
          {topology.nodes.map((node) => {
            const pos = getPosition(node.id);
            const isSelected = selectedNode?.id === node.id;
            const isTargeted = node.id === 'r2' && isAnomaly;
            const isBypassActive = node.id === 'r4' && isRerouted;

            let mainColor = '#0284c7';
            let bgFill = '#ffffff';
            let borderStroke = '#cbd5e1';

            if (isTargeted) {
              mainColor = '#e11d48';
              borderStroke = '#e11d48';
              bgFill = '#fff1f2';
            } else if (isBypassActive) {
              mainColor = '#0284c7';
              borderStroke = '#0284c7';
              bgFill = '#f0f9ff';
            } else if (node.id === 'r4' && !isRerouted) {
              mainColor = '#94a3b8';
              borderStroke = '#e2e8f0';
            } else if (node.type === 'server') {
              mainColor = '#059669';
              borderStroke = '#10b981';
            }

            if (isSelected) {
              borderStroke = '#0284c7';
            }

            return (
              <g
                key={node.id}
                className={styles.nodeItem}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(node)}
              >
                {/* Outer animated pulse ring for Alert or Bypass */}
                {isTargeted && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="1.5"
                    opacity="0.7"
                  >
                    <animate attributeName="r" values="18;28;18" dur="1.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.4s" repeatCount="indefinite" />
                  </circle>
                )}

                {isBypassActive && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    opacity="0.7"
                  >
                    <animate attributeName="r" values="18;26;18" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                {isSelected && (
                  <circle
                    r="23"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Node Base Disc */}
                <rect
                  x="-19"
                  y="-17"
                  width="38"
                  height="34"
                  rx="7"
                  fill={bgFill}
                  stroke={borderStroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Node Load Bar */}
                <rect
                  x="-12"
                  y="9"
                  width="24"
                  height="2.5"
                  rx="1"
                  fill="#e2e8f0"
                />
                <rect
                  x="-12"
                  y="9"
                  width={Math.max(3, (node.load / 100) * 24)}
                  height="2.5"
                  rx="1"
                  fill={isTargeted ? '#e11d48' : (node.load > 70 ? '#d97706' : mainColor)}
                />

                {/* Node Type Abbreviation */}
                <text
                  textAnchor="middle"
                  dy="3"
                  fill={isTargeted ? '#e11d48' : '#0f172a'}
                  fontSize="9.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="700"
                >
                  {node.id === 'cloud' || node.id === 'internet' ? 'INET' : (node.id === 'server' ? 'SRV' : node.id.toUpperCase())}
                </text>


                {/* Node Full Label */}
                <text
                  textAnchor="middle"
                  dy="28"
                  fill={isTargeted ? '#e11d48' : '#1e293b'}
                  fontSize="8.5"
                  fontFamily="Inter"
                  fontWeight="700"
                >
                  {node.name}
                </text>

                {/* Node IP Address */}
                <text
                  textAnchor="middle"
                  dy="38"
                  fill="#64748b"
                  fontSize="7.5"
                  fontFamily="JetBrains Mono"
                >
                  {node.ip}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className={styles.nodeInspectorCard}>
            <div className={styles.inspectorHeader}>
              <div className={styles.inspectorTitle}>
                <Cpu size={14} color="#0284c7" />
                <span>{selectedNode.name}</span>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedNode(null)}
                title="Close inspector"
              >
                <X size={14} />
              </button>
            </div>

            <div className={styles.inspectorBody}>
              <div className={styles.inspectorRow}>
                <span className={styles.label}>Node ID</span>
                <span className={styles.val}>{selectedNode.id.toUpperCase()}</span>
              </div>
              <div className={styles.inspectorRow}>
                <span className={styles.label}>IP Address</span>
                <span className={styles.val}>{selectedNode.ip}</span>
              </div>
              <div className={styles.inspectorRow}>
                <span className={styles.label}>Device Type</span>
                <span className={styles.val} style={{ textTransform: 'capitalize' }}>{selectedNode.type}</span>
              </div>
              <div className={styles.inspectorRow}>
                <span className={styles.label}>Operational Status</span>
                <span
                  className={styles.val}
                  style={{
                    color: selectedNode.status === 'CRITICAL' ? '#e11d48' : (selectedNode.status === 'ACTIVE_ROUTE' ? '#0284c7' : '#059669')
                  }}
                >
                  {selectedNode.status}
                </span>
              </div>
              <div className={styles.inspectorRow}>
                <span className={styles.label}>Buffer / Utilization</span>
                <span className={styles.val}>{selectedNode.load}%</span>
              </div>
              <div className={styles.inspectorRow}>
                <span className={styles.label}>Security Protocol</span>
                <span className={styles.val} style={{ color: '#7c3aed' }}>LDevID (RFC 8995)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
