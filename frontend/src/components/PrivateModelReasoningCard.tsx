'use client';

import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { simulationApi } from '@/services/api';
import { Sparkles, RefreshCw, Cpu, AlertTriangle } from 'lucide-react';
import styles from './PrivateModelReasoningCard.module.scss';

export const PrivateModelReasoningCard: React.FC = () => {
  const { state } = useSimulation();
  const [loading, setLoading] = useState(false);
  const [reasoningResult, setReasoningResult] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>('private_model-core-v3');
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedPhase, setLastAnalyzedPhase] = useState<string>('');

  const runModelAnalysis = async () => {
    if (!state) return;
    setLoading(true);
    setError(null);
    try {
      const response = await simulationApi.privateModelAnalyze(state.telemetry, state.current_phase);
      if (response && response.success) {
        setReasoningResult(response.text);
        if (response.model) setActiveModel(response.model);
        setLastAnalyzedPhase(state.current_phase);
      } else {
        setError(response?.error || 'Private cognitive model synthesis failed. Check cluster status.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with private cognitive model');
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze once when phase changes to ANOMALY or CASA_ACTIVATION
  useEffect(() => {
    if (state && (state.current_phase === 'ANOMALY' || state.current_phase === 'CASA_ACTIVATION' || state.current_phase === 'DECISION')) {
      if (lastAnalyzedPhase !== state.current_phase && !reasoningResult) {
        runModelAnalysis();
      }
    }
  }, [state?.current_phase]);

  return (
    <div className={styles.reasoningCard}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.badgePulse}>
            <Sparkles size={16} color="#38bdf8" />
          </div>
          <div>
            <h3 className={styles.title}>C-ASA PRIVATE COGNITIVE REASONING ENGINE</h3>
            <span className={styles.subtitle}>
              Proprietary autonomic telemetry reasoning & root-cause formulation powered by <strong style={{ color: '#38bdf8' }}>{activeModel}</strong>
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.modelTag}>
            <Cpu size={13} color="#22c55e" />
            <span>PRIVATE CLUSTER ACTIVE</span>
          </div>
          <button 
            className={styles.analyzeBtn} 
            onClick={runModelAnalysis} 
            disabled={loading}
            title="Send live telemetry snapshot to C-ASA Private Cognitive Model"
          >
            <RefreshCw size={14} className={loading ? styles.spinning : ''} />
            <span>{loading ? 'Synthesizing...' : 'Run Neural Reasoning'}</span>
          </button>
        </div>
      </div>

      <div className={styles.contentArea}>
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.loaderPulse} />
            <p>Ingesting live SDN packet streams, RTT telemetry, and executing private neural inference...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorState}>
            <AlertTriangle size={16} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        {!loading && reasoningResult && (
          <div className={styles.markdownOutput}>
            <pre className={styles.rawText}>{reasoningResult}</pre>
          </div>
        )}

        {!loading && !reasoningResult && !error && (
          <div className={styles.emptyState}>
            <p>Click <strong>"Run Neural Reasoning"</strong> to execute live cognitive reasoning from the C-ASA Private Model cluster based on current network telemetry.</p>
          </div>
        )}
      </div>
    </div>
  );
};
