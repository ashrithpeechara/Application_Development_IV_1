'use client';

import React from 'react';
import { SimulationBanner } from '@/components/SimulationBanner';
import { NetworkTopology } from '@/components/NetworkTopology';
import { AgentWorkflow } from '@/components/AgentWorkflow';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { CognitivePipeline } from '@/components/CognitivePipeline';
import { TaskDecomposition } from '@/components/TaskDecomposition';
import { RiskMeter } from '@/components/RiskMeter';
import { DecisionPanel } from '@/components/DecisionPanel';
import { EventTimeline } from '@/components/EventTimeline';
import styles from './dashboard.module.scss';

export default function DashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      {/* 1. Master Simulation Stepper & Control Deck */}
      <SimulationBanner />

      {/* 2. SDN Network Topology & Agent Workflow */}
      <div className={styles.topGrid}>
        <div className={styles.topologyCol}>
          <NetworkTopology />
        </div>
        <div className={styles.agentCol}>
          <AgentWorkflow />
        </div>
      </div>

      {/* 3. 8-Stage Cognitive Reasoning Pipeline */}
      <CognitivePipeline />

      {/* 4. Real-time Telemetry Sparkline Stream */}
      <TelemetryPanel />

      {/* 5. Autonomic Diagnostics, Risk/Decision & Event Audit Log */}
      <div className={styles.bottomGrid}>
        <div className={styles.bottomCard}>
          <TaskDecomposition />
        </div>

        <div className={styles.bottomCardGroup}>
          <RiskMeter />
          <DecisionPanel />
        </div>

        <div className={styles.bottomCard}>
          <EventTimeline />
        </div>
      </div>
    </div>
  );
}

