'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { SimulationPhase } from '@/types/simulation';
import styles from './SimulationBanner.module.scss';
import { Zap, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Check, Sparkles } from 'lucide-react';

const PHASE_STEPS: { phase: SimulationPhase; number: string; short: string }[] = [
  { phase: 'NORMAL', number: '01', short: 'Normal' },
  { phase: 'ANOMALY', number: '02', short: 'Anomaly' },
  { phase: 'TELEMETRY_DETECTED', number: '03', short: 'Telemetry' },
  { phase: 'SECURITY_ANALYSIS', number: '04', short: 'Security' },
  { phase: 'CASA_ACTIVATION', number: '05', short: 'C-ASA' },
  { phase: 'TASK_DECOMPOSITION', number: '06', short: 'Tasks' },
  { phase: 'A2A_COMMUNICATION', number: '07', short: 'A2A Bus' },
  { phase: 'RISK_ASSESSMENT', number: '08', short: 'Risk' },
  { phase: 'DECISION', number: '09', short: 'Decision' },
  { phase: 'NETWORK_ACTION', number: '10', short: 'Action' },
  { phase: 'RECOVERY', number: '11', short: 'Recovery' }
];

export const SimulationBanner: React.FC = () => {
  const {
    state,
    autoPlay,
    toggleAutoPlay,
    triggerAnomaly,
    resetSimulation,
    stepForward,
    stepBackward,
    setPhase
  } = useSimulation();

  if (!state) return null;

  const currentIdx = state.phase_index;
  const info = state.phase_info;
  const totalPhases = state.total_phases || 11;

  return (
    <div className={styles.bannerDeck}>
      <div className={styles.topRow}>
        <div className={styles.phaseInfoGroup}>
          <div className={styles.phaseHeaderRow}>
            <div className={styles.phaseIndexBadge}>
              PHASE {String(currentIdx + 1).padStart(2, '0')} / {String(totalPhases).padStart(2, '0')}
            </div>
            <h2 className={styles.phaseTitle}>
              {info?.title || 'Autonomic Cognitive Loop'}
            </h2>
            <span className={`badge badge-${info?.badge_type || 'info'}`}>
              {info?.badge || state.current_phase}
            </span>
          </div>
          <p className={styles.phaseDescription}>{info?.description}</p>
        </div>

        <div className={styles.controlsGroup}>
          <button
            className={styles.anomalyButton}
            onClick={() => triggerAnomaly('TRAFFIC_SPIKE')}
            id="btn-simulate-anomaly"
          >
            <Zap size={15} />
            <span>Simulate Anomaly</span>
          </button>

          <div className={styles.stepperButtonGroup}>
            <button
              className={styles.stepBtn}
              onClick={stepBackward}
              disabled={currentIdx <= 0}
              title="Previous Phase"
            >
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <button
              className={`${styles.stepBtn} ${autoPlay ? styles.autoActive : ''}`}
              onClick={toggleAutoPlay}
              title="Auto-Play Simulation Workflow"
            >
              {autoPlay ? <Pause size={14} /> : <Play size={14} />}
              <span>{autoPlay ? 'Pause' : 'Auto'}</span>
            </button>

            <button
              className={styles.stepBtn}
              onClick={stepForward}
              disabled={currentIdx >= totalPhases - 1}
              title="Next Phase"
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>

            <button
              className={styles.stepBtn}
              onClick={resetSimulation}
              title="Reset Simulation to Phase 1"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connected Interactive Timeline */}
      <div className={styles.timelineWrapper}>
        <div className={styles.timelineTrack}>
          <div
            className={styles.timelineProgress}
            style={{ width: `${(currentIdx / (totalPhases - 1)) * 100}%` }}
          />
        </div>

        <div className={styles.stepsList}>
          {PHASE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;

            return (
              <button
                key={step.phase}
                type="button"
                className={`${styles.stepNode} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}
                onClick={() => setPhase(step.phase)}
              >
                <div className={styles.stepCircle}>
                  {isCompleted ? (
                    <Check size={11} strokeWidth={3} />
                  ) : isActive ? (
                    <span className={styles.activeDot} />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span className={styles.stepName}>{step.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

