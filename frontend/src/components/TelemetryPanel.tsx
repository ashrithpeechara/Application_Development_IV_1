'use client';

import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import styles from './TelemetryPanel.module.scss';
import { Activity, Gauge, Wifi, Server, Cpu, HardDrive, ShieldCheck } from 'lucide-react';

interface SparklineProps {
  data: number[];
  color: string;
  isDanger?: boolean;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, isDanger }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 140;
  const height = 28;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isDanger ? '#f43f5e' : color;

  return (
    <svg className={styles.sparkline} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const TelemetryPanel: React.FC = () => {
  const { state } = useSimulation();

  const telemetry = state?.telemetry;
  const history = state?.telemetry_history || [];

  if (!telemetry) return null;

  const isAnomaly = state?.current_phase && ['ANOMALY', 'TELEMETRY_DETECTED', 'SECURITY_ANALYSIS', 'CASA_ACTIVATION', 'TASK_DECOMPOSITION'].includes(state.current_phase);

  const packetRateHistory = history.map((h) => h.packet_rate);
  const latencyHistory = history.map((h) => h.latency);
  const lossHistory = history.map((h) => h.packet_loss);
  const bandwidthHistory = history.map((h) => h.bandwidth);
  const cpuHistory = history.map((h) => h.cpu);
  const connHistory = history.map((h) => h.active_connections);

  return (
    <div className={styles.telemetryCard}>
      <div className={styles.panelHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <Activity size={15} />
          </div>
          <div>
            <div className={styles.title}>LIVE TELEMETRY STREAM & AUTONOMIC METRICS</div>
            <div className={styles.subtitle}>Continuous Telemetry Agent Feed (100ms Sampling)</div>
          </div>
        </div>

        <div className={styles.healthBadge}>
          <ShieldCheck size={14} color="#10b981" />
          <span className={styles.healthLabel}>Network Health Index:</span>
          <span
            className={styles.healthVal}
            style={{
              color: telemetry.health_score > 80 ? '#34d399' : (telemetry.health_score > 60 ? '#fbbf24' : '#fb7185')
            }}
          >
            {telemetry.health_score}%
          </span>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        {/* Packet Rate */}
        <div className={`${styles.metricTile} ${isAnomaly && telemetry.packet_rate > 3000 ? styles.criticalTile : ''}`}>
          <div className={styles.tileHeader}>
            <span className={styles.metricLabel}>Ingress Packet Rate</span>
            <Activity size={13} color={isAnomaly && telemetry.packet_rate > 3000 ? '#f43f5e' : '#22d3ee'} />
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricValue}>
              {telemetry.packet_rate.toLocaleString()}
              <span className={styles.unit}>pkts/s</span>
            </div>
            <Sparkline data={packetRateHistory} color="#06b6d4" isDanger={isAnomaly && telemetry.packet_rate > 3000} />
          </div>
        </div>

        {/* Latency */}
        <div className={`${styles.metricTile} ${isAnomaly && telemetry.latency > 80 ? styles.criticalTile : ''}`}>
          <div className={styles.tileHeader}>
            <span className={styles.metricLabel}>Transit Latency</span>
            <Gauge size={13} color={isAnomaly && telemetry.latency > 80 ? '#f43f5e' : '#38bdf8'} />
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricValue}>
              {telemetry.latency}
              <span className={styles.unit}>ms</span>
            </div>
            <Sparkline data={latencyHistory} color="#38bdf8" isDanger={isAnomaly && telemetry.latency > 80} />
          </div>
        </div>

        {/* Packet Loss */}
        <div className={`${styles.metricTile} ${isAnomaly && telemetry.packet_loss > 3 ? styles.criticalTile : ''}`}>
          <div className={styles.tileHeader}>
            <span className={styles.metricLabel}>Drop / Loss Rate</span>
            <Wifi size={13} color={isAnomaly && telemetry.packet_loss > 3 ? '#f43f5e' : '#10b981'} />
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricValue}>
              {telemetry.packet_loss}
              <span className={styles.unit}>%</span>
            </div>
            <Sparkline data={lossHistory} color="#10b981" isDanger={isAnomaly && telemetry.packet_loss > 3} />
          </div>
        </div>

        {/* Bandwidth */}
        <div className={`${styles.metricTile} ${isAnomaly && telemetry.bandwidth > 1200 ? styles.criticalTile : ''}`}>
          <div className={styles.tileHeader}>
            <span className={styles.metricLabel}>Active Throughput</span>
            <Server size={13} color={isAnomaly && telemetry.bandwidth > 1200 ? '#f43f5e' : '#c084fc'} />
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricValue}>
              {telemetry.bandwidth}
              <span className={styles.unit}>Mbps</span>
            </div>
            <Sparkline data={bandwidthHistory} color="#a855f7" isDanger={isAnomaly && telemetry.bandwidth > 1200} />
          </div>
        </div>

        {/* CPU Load */}
        <div className={`${styles.metricTile} ${isAnomaly && telemetry.cpu > 70 ? styles.criticalTile : ''}`}>
          <div className={styles.tileHeader}>
            <span className={styles.metricLabel}>Router R2 CPU</span>
            <Cpu size={13} color={isAnomaly && telemetry.cpu > 70 ? '#f43f5e' : '#f59e0b'} />
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricValue}>
              {telemetry.cpu}
              <span className={styles.unit}>%</span>
            </div>
            <Sparkline data={cpuHistory} color="#f59e0b" isDanger={isAnomaly && telemetry.cpu > 70} />
          </div>
        </div>

        {/* Active Connections */}
        <div className={styles.metricTile}>
          <div className={styles.tileHeader}>
            <span className={styles.metricLabel}>Active Flows</span>
            <HardDrive size={13} color="#38bdf8" />
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricValue}>
              {telemetry.active_connections}
              <span className={styles.unit}>flows</span>
            </div>
            <Sparkline data={connHistory} color="#38bdf8" />
          </div>
        </div>
      </div>
    </div>
  );
};

