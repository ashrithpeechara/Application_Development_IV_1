'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './CognitiveComponents.module.scss';
import { CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';

export const DecisionPanel: React.FC = () => {
  const { state } = useSimulation();
  const decision = state?.cognitive?.decision;

  if (!decision) return null;

  const isApproved = decision.status === 'APPROVED';

  return (
    <div className={styles.cognitiveSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <Cpu size={18} color="#00ffcc" />
          <span>C-ASA COGNITIVE DECISION ENGINE</span>
        </div>
        <div className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`}>
          {isApproved ? '✓ DECISION APPROVED' : 'EVALUATING STRATEGY'}
        </div>
      </div>

      <div className={styles.decisionCard}>
        <div className={styles.decisionTop}>
          <div className={styles.decisionTitle}>
            <ShieldCheck size={16} />
            <span>Optimal Autonomic Response:</span>
          </div>
          <span className="mono-tag" style={{ color: '#00ffcc' }}>
            ID: #CASA-ACT-092
          </span>
        </div>

        <div className={styles.decisionRow}>
          <span className={styles.label}>Detected Issue</span>
          <span className={styles.val}>{decision.problem}</span>
        </div>

        <div className={styles.decisionRow}>
          <span className={styles.label}>Selected Cognitive Action</span>
          <span className={styles.val} style={{ color: '#00ffcc', fontWeight: 700 }}>
            {decision.decision}
          </span>
        </div>

        <div className={styles.decisionRow}>
          <span className={styles.label}>Cognitive Rationale</span>
          <span className={styles.val}>{decision.reason}</span>
        </div>

        <div className={styles.decisionMetrics}>
          <div className={styles.metricItem}>
            <span className={styles.label}>Confidence:</span>
            <span className={styles.val}>{decision.confidence}</span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.label}>Risk Reduction:</span>
            <span className={styles.val} style={{ color: '#10b981' }}>
              {decision.risk_before} ➔ {decision.risk_after} (-57%)
            </span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.label}>Execution Status:</span>
            <span className={styles.val} style={{ color: '#10b981' }}>
              {isApproved ? 'COMMITTED TO SDN' : 'STAGED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
