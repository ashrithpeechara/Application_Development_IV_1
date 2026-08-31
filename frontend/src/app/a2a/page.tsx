'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { A2ACommunication } from '@/components/A2ACommunication';
import styles from './a2a-page.module.scss';
import { MessageSquareShare, Radio, Shield, Zap, RefreshCw, Cpu, ArrowRight } from 'lucide-react';

export default function A2APage() {
  const { state } = useSimulation();

  return (
    <div className={styles.a2aPage}>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <MessageSquareShare size={24} color="#00ffcc" />
            <span>AGENT-TO-AGENT (A2A) COMMUNICATION PLANE</span>
          </h1>
          <p className={styles.subtitle}>
            Semantic message exchange protocol enabling decentralized diagnostics, SLA verification, and coordinated network actuation.
          </p>
        </div>

        <div className="badge badge-info">
          A2A PROTOCOL SPECIFICATION v2.4
        </div>
      </div>

      {/* Inter-Agent Interaction Flow Banner */}
      <div className={styles.interactionMatrixCard}>
        <div className={styles.matrixHeader}>
          <span>AUTONOMIC INTERACTION CHAIN</span>
          <span className="mono-tag" style={{ color: '#00ffcc' }}>CLOSED-LOOP ORCHESTRATION</span>
        </div>

        <div className={styles.matrixFlowDiagram}>
          {/* Telemetry Agent */}
          <div className={styles.agentNodeBox} style={{ borderColor: 'rgba(0, 255, 204, 0.4)' }}>
            <div className={styles.agentIcon}><Radio size={18} color="#00ffcc" /></div>
            <span className={styles.agentTitle}>Telemetry Agent</span>
            <span className={styles.agentStatus} style={{ color: '#00ffcc' }}>sFlow Ingest</span>
          </div>

          <div className={styles.flowArrow}>
            <span style={{ color: '#00ffcc' }}>sFlow Alert</span>
            <ArrowRight size={16} />
          </div>

          {/* Security Agent */}
          <div className={styles.agentNodeBox} style={{ borderColor: 'rgba(255, 51, 102, 0.4)' }}>
            <div className={styles.agentIcon}><Shield size={18} color="#ff3366" /></div>
            <span className={styles.agentTitle}>Security Agent</span>
            <span className={styles.agentStatus} style={{ color: '#ff3366' }}>Threat Score</span>
          </div>

          <div className={styles.flowArrow}>
            <span style={{ color: '#ff3366' }}>Evidence Env</span>
            <ArrowRight size={16} />
          </div>

          {/* C-ASA Core */}
          <div className={styles.agentNodeBox} style={{ borderColor: 'rgba(168, 85, 247, 0.6)', background: 'rgba(168, 85, 247, 0.12)' }}>
            <div className={styles.agentIcon}><Zap size={18} color="#a855f7" /></div>
            <span className={styles.agentTitle}>C-ASA Core</span>
            <span className={styles.agentStatus} style={{ color: '#a855f7' }}>Reasoning Loop</span>
          </div>

          <div className={styles.flowArrow}>
            <span style={{ color: '#ffaa00' }}>SLA Query</span>
            <ArrowRight size={16} />
          </div>

          {/* Policy Agent */}
          <div className={styles.agentNodeBox} style={{ borderColor: 'rgba(255, 170, 0, 0.4)' }}>
            <div className={styles.agentIcon}><RefreshCw size={18} color="#ffaa00" /></div>
            <span className={styles.agentTitle}>Policy Agent</span>
            <span className={styles.agentStatus} style={{ color: '#ffaa00' }}>Route Evaluator</span>
          </div>

          <div className={styles.flowArrow}>
            <span style={{ color: '#38bdf8' }}>Flow Mod</span>
            <ArrowRight size={16} />
          </div>

          {/* Network Agent */}
          <div className={styles.agentNodeBox} style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
            <div className={styles.agentIcon}><Cpu size={18} color="#38bdf8" /></div>
            <span className={styles.agentTitle}>Network Agent</span>
            <span className={styles.agentStatus} style={{ color: '#38bdf8' }}>SDN Actuator</span>
          </div>
        </div>
      </div>

      {/* Semantic Message Stream Component */}
      <A2ACommunication />
    </div>
  );
}
