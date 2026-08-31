'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './EventTimeline.module.scss';
import { History, Info, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const EventTimeline: React.FC = () => {
  const { state } = useSimulation();
  const events = state?.events || [];

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'DANGER': return styles.levelDanger;
      case 'WARNING': return styles.levelWarning;
      case 'SUCCESS': return styles.levelSuccess;
      default: return styles.levelInfo;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'DANGER': return <AlertOctagon size={13} color="#f43f5e" />;
      case 'WARNING': return <AlertTriangle size={13} color="#f59e0b" />;
      case 'SUCCESS': return <CheckCircle2 size={13} color="#10b981" />;
      default: return <Info size={13} color="#38bdf8" />;
    }
  };

  return (
    <div className={styles.timelineCard}>
      <div className={styles.panelHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <History size={15} />
          </div>
          <div>
            <div className={styles.title}>AUTONOMIC EVENT LOG & AUDIT TIMELINE</div>
            <div className={styles.subtitle}>Real-time Agent & Control Plane Actions</div>
          </div>
        </div>
        <span className="badge badge-info">{events.length} EVENTS</span>
      </div>

      <div className={styles.eventsList}>
        {[...events].reverse().map((ev) => (
          <div key={ev.id} className={`${styles.eventRow} ${getLevelClass(ev.level)}`}>
            <div className={styles.timeCol}>
              <span className={styles.timeVal}>{ev.timestamp}</span>
              <span className={styles.sourceTag}>{ev.source}</span>
            </div>

            <div className={styles.contentCol}>
              <div className={styles.eventTitle}>
                {getLevelIcon(ev.level)}
                <span>{ev.title}</span>
              </div>
              <p className={styles.eventMsg}>{ev.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

