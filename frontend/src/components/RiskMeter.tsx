'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './CognitiveComponents.module.scss';
import { ShieldAlert } from 'lucide-react';

export const RiskMeter: React.FC = () => {
  const { state } = useSimulation();
  const risk = state?.cognitive?.risk;

  if (!risk) return null;

  const currentScore = risk.current_risk;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  let riskColor = '#10b981';
  let category = 'LOW RISK';
  if (currentScore > 65) {
    riskColor = '#ff3366';
    category = 'CRITICAL / HIGH';
  } else if (currentScore > 40) {
    riskColor = '#ffaa00';
    category = 'MODERATE RISK';
  }

  return (
    <div className={styles.cognitiveSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <ShieldAlert size={18} color={riskColor} />
          <span>MULTI-FACTOR RISK ASSESSMENT</span>
        </div>
        <span className="badge" style={{ color: riskColor, borderColor: `${riskColor}55` }}>
          SCORE: {currentScore}/100
        </span>
      </div>

      <div className={styles.riskMeterWrapper}>
        <div className={styles.riskScoreRow}>
          <div className={styles.gaugeBox}>
            <svg className={styles.gaugeSvg} viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={riskColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
              />
            </svg>
            <div className={styles.scoreValue}>{currentScore}</div>
          </div>

          <div className={styles.riskTextGroup}>
            <span className={styles.riskCategory} style={{ color: riskColor }}>
              {category}
            </span>
            <span className={styles.confidenceBadge}>
              Cognitive Confidence: <strong>{risk.confidence}%</strong>
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Baseline: {risk.initial_risk} ➔ Target: 24
            </span>
          </div>
        </div>

        <div className={styles.factorsList}>
          {risk.factors.map((factor) => {
            let barColor = '#38bdf8';
            if (factor.score > 65) barColor = '#ff3366';
            else if (factor.score > 40) barColor = '#ffaa00';

            return (
              <div key={factor.name} className={styles.factorItem}>
                <div className={styles.factorHeader}>
                  <span className={styles.name}>{factor.name} (w: {factor.weight})</span>
                  <span className={styles.score} style={{ color: barColor }}>{factor.score}%</span>
                </div>
                <div className={styles.factorBarBg}>
                  <div
                    className={styles.factorBarFill}
                    style={{ width: `${factor.score}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
