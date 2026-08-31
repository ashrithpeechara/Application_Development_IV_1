'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './agents.module.scss';
import { Cpu, Shield, Radio, RefreshCw, Zap, CheckCircle, Activity } from 'lucide-react';

export default function AgentsPage() {
  const { state } = useSimulation();
  const agents = state?.agents || [];

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'telemetry-agent': return <Radio size={20} color="#00ffcc" />;
      case 'security-agent': return <Shield size={20} color="#ff3366" />;
      case 'casa-agent': return <Zap size={20} color="#a855f7" />;
      case 'policy-agent': return <RefreshCw size={20} color="#ffaa00" />;
      case 'network-agent': return <Cpu size={20} color="#38bdf8" />;
      default: return <Cpu size={20} />;
    }
  };

  return (
    <div className={styles.agentsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Cpu size={24} color="#a855f7" />
            <span>AUTONOMIC AGENT ROSTER & SUBSYSTEMS</span>
          </h1>
          <p className={styles.subtitle}>
            Continuous closed-loop cognitive plane comprising 5 specialized agents collaborating via semantic envelopes.
          </p>
        </div>

        <div className="badge badge-primary">
          5 AGENTS ACTIVE & SYNCHRONIZED
        </div>
      </div>

      <div className={styles.agentGrid}>
        {agents.map((agent) => {
          return (
            <div
              key={agent.id}
              className={styles.agentDeepCard}
              style={{ '--agent-color': agent.color } as React.CSSProperties}
            >
              <div className={styles.cardTop}>
                <div className={styles.agentIdentity}>
                  <div className={styles.agentIconBox}>
                    {getAgentIcon(agent.id)}
                  </div>
                  <div className={styles.nameRole}>
                    <span className={styles.agentName}>{agent.name}</span>
                    <span className={styles.agentRole}>{agent.role}</span>
                  </div>
                </div>

                <div
                  className="badge"
                  style={{
                    color: agent.color,
                    borderColor: `${agent.color}66`,
                    backgroundColor: `${agent.color}15`
                  }}
                >
                  {agent.status}
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoBlock}>
                  <span className={styles.label}>Decision Confidence</span>
                  <span className={styles.val} style={{ color: agent.color }}>
                    {agent.confidence}%
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <span className={styles.label}>Threat / Risk Level</span>
                  <span
                    className={styles.val}
                    style={{
                      color: agent.risk.includes('HIGH') || agent.risk.includes('CRITICAL') ? '#ff3366' : '#10b981'
                    }}
                  >
                    {agent.risk}
                  </span>
                </div>

                <div className={styles.infoBlock} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.label}>Latest Registered Event</span>
                  <span className={styles.val}>{agent.last_event}</span>
                </div>
              </div>

              <div className={styles.taskSection}>
                <span className={styles.sectionLabel}>Active Execution Task</span>
                <div className={styles.taskBox}>
                  {agent.task}
                </div>
              </div>

              <div className={styles.capabilitiesGroup}>
                <span className={styles.sectionLabel}>Autonomous Capabilities</span>
                <div className={styles.pills}>
                  {agent.capabilities.map((cap) => (
                    <span key={cap} className={styles.capPill}>
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
