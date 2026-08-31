'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './CognitivePipeline.module.scss';
import { Brain, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const CognitivePipeline: React.FC = () => {
  const { state } = useSimulation();
  const stages = state?.cognitive?.stages || [];

  return (
    <div className={styles.pipelineCard}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <Brain size={15} />
          </div>
          <div>
            <div className={styles.title}>C-ASA COGNITIVE REASONING PIPELINE</div>
            <div className={styles.subtitle}>8-Stage Closed-Loop Autonomic Engine</div>
          </div>
        </div>
        <span className="badge badge-primary">AUTONOMIC COGNITION</span>
      </div>

      <div className={styles.stagesTrack}>
        {stages.map((stg, idx) => {
          const isCompleted = stg.status === 'COMPLETED';
          const isActive = stg.status === 'ACTIVE';

          return (
            <div
              key={stg.id}
              className={`${styles.stageNode} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : styles.pending}`}
            >
              <div className={styles.stageTop}>
                <span className={styles.stepNum}>{String(idx + 1).padStart(2, '0')}</span>
                {isCompleted && <CheckCircle2 size={12} className={styles.statusIconDone} />}
                {isActive && <Sparkles size={12} className={styles.statusIconActive} />}
                {!isCompleted && !isActive && <Clock size={12} className={styles.statusIconPending} />}
              </div>

              <div className={styles.stageTitle}>{stg.title.replace(/^\d+\s*/, '')}</div>
              <div className={styles.stageDesc}>{stg.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

