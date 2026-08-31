'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './A2A.module.scss';
import { MessageSquareCode, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const A2ACommunication: React.FC = () => {
  const { state } = useSimulation();
  const messages = state?.a2a || [];

  return (
    <div className={styles.a2aContainer}>
      <div className={styles.panelHeader}>
        <div className={styles.titleGroup}>
          <MessageSquareCode size={18} color="#00ffcc" />
          <span>AGENT-TO-AGENT (A2A) SEMANTIC MESSAGE BUS</span>
        </div>
        <span className="badge badge-info">C-ASA PROTOCOL v2.4</span>
      </div>

      <div className={styles.messagesList}>
        {messages.map((msg, index) => {
          return (
            <div key={msg.id} className={styles.messageEnvelope}>
              <div className={styles.envelopeHeader}>
                <div className={styles.routingGroup}>
                  <span className={styles.from}>{msg.from}</span>
                  <ArrowRight size={13} className={styles.arrow} />
                  <span className={styles.to}>{msg.to}</span>
                </div>

                <div className={styles.metaGroup}>
                  <span>{msg.type}</span>
                  <span>•</span>
                  <span>{msg.time}</span>
                </div>
              </div>

              <div className={styles.envelopeBody}>
                <div className={styles.fieldBlock}>
                  <span className={styles.fieldLabel}>GOAL / OBJECTIVE</span>
                  <span className={styles.fieldVal}>{msg.goal}</span>
                </div>

                <div className={styles.fieldBlock}>
                  <span className={styles.fieldLabel}>INTENT / ACTION REQUEST</span>
                  <span className={styles.fieldVal}>{msg.intent}</span>
                </div>

                <div className={styles.fieldBlock}>
                  <span className={styles.fieldLabel}>CONFIDENCE & RISK</span>
                  <span className={styles.fieldVal}>
                    Conf: <strong style={{ color: '#00ffcc' }}>{msg.confidence}</strong> | Risk: <strong style={{ color: msg.risk.includes('HIGH') ? '#ff3366' : '#10b981' }}>{msg.risk}</strong>
                  </span>
                </div>
              </div>

              {msg.evidence && (
                <div className={styles.evidenceBox}>
                  <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Structured Semantic Evidence
                  </div>
                  {Object.entries(msg.evidence).map(([key, val]) => (
                    <div key={key} className={styles.evidenceRow}>
                      <span className={styles.k}>{key.replace(/_/g, ' ')}:</span>
                      <span className={styles.v}>{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
