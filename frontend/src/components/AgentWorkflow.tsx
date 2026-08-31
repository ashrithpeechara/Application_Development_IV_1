'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './AgentWorkflow.module.scss';
import { Cpu, Terminal, Shield, Zap, RefreshCw, Radio, Sparkles, AlertCircle } from 'lucide-react';

export const AgentWorkflow: React.FC = () => {
  const { state } = useSimulation();
  const agents = state?.agents || [];

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'telemetry-agent': return <Radio size={14} color="#06b6d4" />;
      case 'security-agent': return <Shield size={14} color="#f43f5e" />;
      case 'casa-agent': return <Zap size={14} color="#a855f7" />;
      case 'policy-agent': return <RefreshCw size={14} color="#f59e0b" />;
      case 'network-agent': return <Cpu size={14} color="#38bdf8" />;
      default: return <Cpu size={14} />;
    }
  };

  const getStatusType = (status: string) => {
    if (['ANOMALY DETECTED', 'CRITICAL', 'INVESTIGATING'].includes(status)) return 'danger';
    if (['REASONING', 'PLANNING', 'ORCHESTRATING', 'DECISION APPROVED', 'ACTION IN PROGRESS', 'EXECUTING ACTION'].includes(status)) return 'purple';
    if (['STREAMING METRICS', 'ALERTED', 'ANALYZING ROUTES', 'EVALUATING RISK'].includes(status)) return 'warning';
    return 'success';
  };

  return (
    <div className={styles.agentDeck}>
      <div className={styles.deckHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <Cpu size={15} />
          </div>
          <div>
            <div className={styles.title}>AUTONOMIC AGENT WORKFLOW</div>
            <div className={styles.subtitle}>Closed-Loop Multi-Agent Cognition</div>
          </div>
        </div>
        <span className="badge badge-primary">5 AGENTS SYNCED</span>
      </div>

      <div className={styles.agentsList}>
        {agents.map((agent) => {
          const statusType = getStatusType(agent.status);
          const isBusy = !['IDLE', 'MONITORING', 'READY'].includes(agent.status);

          return (
            <div
              key={agent.id}
              className={`${styles.agentCard} ${isBusy ? styles.activeAgent : ''}`}
              style={{ '--agent-color': agent.color } as React.CSSProperties}
            >
              <div className={styles.cardHeader}>
                <div className={styles.agentMeta}>
                  <div className={styles.agentIconCircle}>
                    {getAgentIcon(agent.id)}
                  </div>
                  <div>
                    <div className={styles.agentName}>{agent.name}</div>
                    <div className={styles.agentRole}>{agent.role}</div>
                  </div>
                </div>

                <div className={`${styles.statusBadge} ${styles[statusType]}`}>
                  <span className={`pulsing-dot ${statusType}`} />
                  <span>{agent.status}</span>
                </div>
              </div>

              {/* Task Terminal Line */}
              <div className={styles.taskTerminal}>
                <Terminal size={11} className={styles.termIcon} />
                <span className={styles.taskContent}>{agent.task}</span>
              </div>

              {/* Metrics Progress Row */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricItem}>
                  <div className={styles.metricLabelRow}>
                    <span>Confidence</span>
                    <span className={styles.metricVal}>{agent.confidence}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${agent.confidence}%`, background: agent.color }}
                    />
                  </div>
                </div>

                <div className={styles.metricItem}>
                  <div className={styles.metricLabelRow}>
                    <span>Risk Level</span>
                    <span
                      className={styles.metricVal}
                      style={{
                        color: agent.risk.includes('HIGH') || agent.risk.includes('CRITICAL') ? '#f43f5e' : '#10b981'
                      }}
                    >
                      {agent.risk}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: agent.risk.includes('HIGH') || agent.risk.includes('CRITICAL') ? '80%' : '20%',
                        background: agent.risk.includes('HIGH') || agent.risk.includes('CRITICAL') ? '#f43f5e' : '#10b981'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Last Event Timestamp / Narrative */}
              <div className={styles.eventRow}>
                <span className={styles.bullet}>›</span>
                <span className={styles.eventText}>{agent.last_event}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

