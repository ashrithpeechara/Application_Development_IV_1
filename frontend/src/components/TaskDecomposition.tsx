'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './CognitiveComponents.module.scss';
import { ListTree, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const TaskDecomposition: React.FC = () => {
  const { state } = useSimulation();
  const tasks = state?.cognitive?.tasks || [];

  return (
    <div className={styles.cognitiveSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <ListTree size={18} color="#00ffcc" />
          <span>AUTONOMIC TASK DECOMPOSITION</span>
        </div>
        <span className="badge badge-info">5 SUB-TASKS</span>
      </div>

      <div className={styles.tasksList}>
        {tasks.map((task) => {
          const isDone = task.status === 'DONE';
          const isInProgress = task.status === 'IN_PROGRESS';

          return (
            <div
              key={task.id}
              className={`${styles.taskCard} ${isDone ? styles.taskDone : ''} ${isInProgress ? styles.taskInProgress : ''}`}
            >
              <div className={styles.taskTop}>
                <div className={styles.codeTitle}>
                  <span className={styles.code}>{task.code}</span>
                  <span className={styles.name}>{task.name}</span>
                </div>

                <div className="badge" style={{ fontSize: '0.65rem' }}>
                  {isDone && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> COMPLETE</span>}
                  {isInProgress && <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> EXECUTING</span>}
                  {!isDone && !isInProgress && <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> QUEUED</span>}
                </div>
              </div>

              <div className={styles.taskDetail}>
                <strong>[{task.agent}]</strong> {task.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
