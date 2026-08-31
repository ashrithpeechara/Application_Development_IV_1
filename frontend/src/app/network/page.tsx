'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { NetworkTopology } from '@/components/NetworkTopology';
import styles from './network.module.scss';
import { Network, Zap, Flame, RotateCcw, Play, ArrowRight, ShieldCheck } from 'lucide-react';

export default function NetworkPage() {
  const {
    state,
    triggerAnomaly,
    triggerNodeFailure,
    resetSimulation,
    setPhase
  } = useSimulation();

  const isRerouted = state?.route_bypass_active || (state?.current_phase && ['NETWORK_ACTION', 'RECOVERY'].includes(state.current_phase));

  return (
    <div className={styles.networkPage}>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Network size={24} color="#00ffcc" />
            <span>FULL NETWORK TOPOLOGY WORKBENCH</span>
          </h1>
          <p className={styles.subtitle}>
            Live SDN flow orchestration visualizer with interactive traffic injection and dynamic path re-computation.
          </p>
        </div>

        <div className="badge badge-info">
          SDN OPENFLOW CONTROLLER LINKED
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.leftActions}>
          <button
            className={`${styles.btnAction} ${styles.btnNormal}`}
            onClick={() => setPhase('NORMAL')}
            id="btn-start-traffic"
          >
            <Play size={15} />
            <span>[START TRAFFIC]</span>
          </button>

          <button
            className={`${styles.btnAction} ${styles.btnAnomaly}`}
            onClick={() => triggerAnomaly('TRAFFIC_SPIKE')}
            id="btn-simulate-anomaly-net"
          >
            <Zap size={15} />
            <span>[SIMULATE ANOMALY]</span>
          </button>

          <button
            className={`${styles.btnAction} ${styles.btnFailure}`}
            onClick={triggerNodeFailure}
            id="btn-simulate-failure-net"
          >
            <Flame size={15} />
            <span>[SIMULATE NODE FAILURE]</span>
          </button>

          <button
            className={`${styles.btnAction} ${styles.btnReset}`}
            onClick={resetSimulation}
            id="btn-reset-net"
          >
            <RotateCcw size={15} />
            <span>[RESET NETWORK]</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="mono-tag" style={{ color: '#94a3b8' }}>ACTIVE TOPOLOGY ROUTE:</span>
          <span
            className="badge"
            style={{
              color: isRerouted ? '#00ffcc' : '#38bdf8',
              borderColor: isRerouted ? 'rgba(0,255,204,0.4)' : 'rgba(56,189,248,0.4)'
            }}
          >
            {isRerouted ? 'R1 ➔ R4 (BYPASS) ➔ SERVER' : 'R1 ➔ R2 (PRIMARY) ➔ SERVER'}
          </span>
        </div>
      </div>

      {/* Large Full Height Topology */}
      <NetworkTopology fullHeight={true} />

      {/* Route Path Comparison Cards */}
      <div className={styles.routeComparisonGrid}>
        <div className={styles.routeCard} style={{ opacity: isRerouted ? 0.5 : 1 }}>
          <div className={styles.routeHeader}>
            <span style={{ color: isRerouted ? '#64748b' : '#38bdf8' }}>PRIMARY ROUTE (VIA ROUTER R2)</span>
            <span className={`badge ${!isRerouted ? 'badge-success' : 'badge-danger'}`}>
              {!isRerouted ? 'ACTIVE FLOW' : 'BYPASSED'}
            </span>
          </div>

          <div className={styles.routeDetails}>
            <div className={styles.row}>
              <span className={styles.k}>Path Traversal:</span>
              <span className={styles.v}>INTERNET ➔ R1 ➔ R2 ➔ SERVER CORE</span>
            </div>
            <div className={styles.row}>
              <span className={styles.k}>Assigned Capacity:</span>
              <span className={styles.v}>2.5 Gbps</span>
            </div>
            <div className={styles.row}>
              <span className={styles.k}>Nominal Latency:</span>
              <span className={styles.v}>32ms (Spikes to 146ms during flood)</span>
            </div>
            <div className={styles.row}>
              <span className={styles.k}>SLA Status:</span>
              <span className={styles.v} style={{ color: !isRerouted ? '#10b981' : '#ff3366' }}>
                {!isRerouted ? 'Compliant' : 'Violated (8.7% Loss)'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.routeCard} style={{ borderColor: isRerouted ? 'rgba(0,255,204,0.5)' : 'rgba(255,255,255,0.08)' }}>
          <div className={styles.routeHeader}>
            <span style={{ color: isRerouted ? '#00ffcc' : '#94a3b8' }}>COGNITIVE BYPASS ROUTE (VIA ROUTER R4)</span>
            <span className={`badge ${isRerouted ? 'badge-success' : 'badge-info'}`}>
              {isRerouted ? 'AUTONOMIC ACTIVE' : 'HOT STANDBY'}
            </span>
          </div>

          <div className={styles.routeDetails}>
            <div className={styles.row}>
              <span className={styles.k}>Path Traversal:</span>
              <span className={styles.v}>INTERNET ➔ R1 ➔ R4 ➔ SERVER CORE</span>
            </div>
            <div className={styles.row}>
              <span className={styles.k}>Assigned Capacity:</span>
              <span className={styles.v}>10.0 Gbps (Dedicated Core Link)</span>
            </div>
            <div className={styles.row}>
              <span className={styles.k}>Projected Latency:</span>
              <span className={styles.v}>38ms (Stable)</span>
            </div>
            <div className={styles.row}>
              <span className={styles.k}>SLA Status:</span>
              <span className={styles.v} style={{ color: '#10b981' }}>
                100% Guaranteed SLA Performance
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
