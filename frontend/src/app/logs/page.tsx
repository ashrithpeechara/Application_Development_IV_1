'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { TimelineEvent } from '@/types/simulation';
import styles from './logs.module.scss';
import {
  ScrollText,
  Search,
  Download,
  Copy,
  Check,
  Terminal,
  Table as TableIcon,
  Filter,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  X,
  RefreshCw,
  Layers,
  ShieldAlert,
  Cpu
} from 'lucide-react';

export default function LogsPage() {
  const { state } = useSimulation();
  const events = state?.events || [];

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CONSOLE'>('TABLE');
  const [selectedLog, setSelectedLog] = useState<TimelineEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Available unique sources
  const sources = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => {
      if (ev.source) set.add(ev.source);
    });
    return Array.from(set);
  }, [events]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = events.length;
    const info = events.filter((e) => e.level === 'INFO').length;
    const warning = events.filter((e) => e.level === 'WARNING').length;
    const danger = events.filter((e) => e.level === 'DANGER').length;
    const success = events.filter((e) => e.level === 'SUCCESS').length;
    return { total, info, warning, danger, success };
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return [...events].reverse().filter((ev) => {
      // Level filter
      if (selectedLevel !== 'ALL' && ev.level !== selectedLevel) return false;

      // Source filter
      if (selectedSource !== 'ALL' && ev.source !== selectedSource) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = ev.title?.toLowerCase().includes(query);
        const matchMsg = ev.message?.toLowerCase().includes(query);
        const matchSource = ev.source?.toLowerCase().includes(query);
        const matchId = ev.id?.toLowerCase().includes(query);
        const matchPhase = ev.phase?.toLowerCase().includes(query);
        if (!matchTitle && !matchMsg && !matchSource && !matchId && !matchPhase) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedLevel, selectedSource, searchTerm]);

  // Export handlers
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `casa_autonomic_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Level', 'Source', 'Phase', 'Title', 'Message'];
    const rows = events.map((e) => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.level}"`,
      `"${e.source}"`,
      `"${e.phase}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.message.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `casa_autonomic_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyLogs = () => {
    const text = filteredEvents
      .map((e) => `[${e.timestamp}] [${e.level}] [${e.source}] ${e.title} - ${e.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'DANGER': return <AlertOctagon size={13} color="#e11d48" />;
      case 'WARNING': return <AlertTriangle size={13} color="#d97706" />;
      case 'SUCCESS': return <CheckCircle2 size={13} color="#059669" />;
      default: return <Info size={13} color="#0284c7" />;
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'DANGER': return 'badge-danger';
      case 'WARNING': return 'badge-warning';
      case 'SUCCESS': return 'badge-success';
      default: return 'badge-info';
    }
  };

  return (
    <div className={styles.logsPage}>
      {/* 1. Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <ScrollText size={24} color="#0284c7" />
            <span>AUTONOMIC SYSTEM LOGS & AUDIT TRAIL</span>
          </h1>
          <p className={styles.subtitle}>
            Comprehensive multi-agent telemetry, cognitive decision steps, diagnostic evidence, and SDN flow state logs.
          </p>
        </div>

        <div className="badge badge-info">
          LIVE LOG STREAMING ACTIVE
        </div>
      </div>

      {/* 2. Statistics KPI Bar */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <Layers size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.total}</span>
            <span className={styles.statLabel}>Total Events</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.success}</span>
            <span className={styles.statLabel}>Actuations Success</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <Info size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.info}</span>
            <span className={styles.statLabel}>Informational</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fffbeb', color: '#d97706' }}>
            <AlertTriangle size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.warning}</span>
            <span className={styles.statLabel}>Warnings / Anomaly</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fff1f2', color: '#e11d48' }}>
            <AlertOctagon size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{stats.danger}</span>
            <span className={styles.statLabel}>Critical Incidents</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Deck */}
      <div className={styles.filterDeck}>
        <div className={styles.topControlRow}>
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search logs by keyword, agent, phase, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              className={`${styles.actionBtn} ${viewMode === 'TABLE' ? styles.active : ''}`}
              onClick={() => setViewMode('TABLE')}
              title="Structured Table View"
            >
              <TableIcon size={14} />
              <span>Table</span>
            </button>

            <button
              className={`${styles.actionBtn} ${viewMode === 'CONSOLE' ? styles.active : ''}`}
              onClick={() => setViewMode('CONSOLE')}
              title="Raw Console Log View"
            >
              <Terminal size={14} />
              <span>Console</span>
            </button>

            <button className={styles.actionBtn} onClick={handleCopyLogs} title="Copy Filtered Logs">
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button className={styles.actionBtn} onClick={handleExportJSON} title="Download JSON">
              <Download size={14} />
              <span>JSON</span>
            </button>

            <button className={styles.actionBtn} onClick={handleExportCSV} title="Download CSV">
              <Download size={14} />
              <span>CSV</span>
            </button>
          </div>
        </div>

        <div className={styles.filterPillsRow}>
          <div className={styles.levelTabs}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginRight: 4 }}>
              LEVEL:
            </span>
            {['ALL', 'INFO', 'WARNING', 'DANGER', 'SUCCESS'].map((lvl) => (
              <button
                key={lvl}
                className={`${styles.levelTab} ${selectedLevel === lvl ? styles.active : ''}`}
                onClick={() => setSelectedLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              SOURCE AGENT:
            </span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className={styles.sourceSelect}
            >
              <option value="ALL">All Sources ({events.length})</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Log Content (Table or Console) */}
      <div className={styles.logContainer}>
        <div className={styles.tableHeader}>
          <span className={styles.countInfo}>
            Displaying {filteredEvents.length} of {events.length} autonomic log entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pulsing-dot success" />
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748b' }}>
              LIVE SYNC
            </span>
          </div>
        </div>

        {viewMode === 'TABLE' ? (
          <div className={styles.tableWrapper}>
            {filteredEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <Filter size={32} />
                <p>No log records match the current filters.</p>
                <button
                  className={styles.actionBtn}
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLevel('ALL');
                    setSelectedSource('ALL');
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <table className={styles.logTable}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Level</th>
                    <th>Source Agent</th>
                    <th>Phase</th>
                    <th>Event Title</th>
                    <th>Message & Diagnostics</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev) => (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedLog(ev)}
                      className={selectedLog?.id === ev.id ? styles.selectedRow : ''}
                    >
                      <td className={styles.timeCell}>{ev.timestamp}</td>
                      <td>
                        <span className={`badge ${getLevelBadgeClass(ev.level)}`}>
                          {getLevelIcon(ev.level)}
                          <span>{ev.level}</span>
                        </span>
                      </td>
                      <td className={styles.sourceCell}>
                        <Cpu size={13} color="#7c3aed" />
                        <span>{ev.source}</span>
                      </td>
                      <td>
                        <span className={styles.phaseTag}>{ev.phase || 'COGNITION'}</span>
                      </td>
                      <td className={styles.titleCell}>{ev.title}</td>
                      <td className={styles.msgCell}>{ev.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className={styles.consoleContainer}>
            {filteredEvents.map((ev) => (
              <div key={ev.id} className={styles.consoleLine}>
                <span className={styles.cTime}>[{ev.timestamp}]</span>
                <span
                  className={
                    ev.level === 'DANGER'
                      ? styles.cLevelDanger
                      : ev.level === 'WARNING'
                      ? styles.cLevelWarning
                      : ev.level === 'SUCCESS'
                      ? styles.cLevelSuccess
                      : styles.cLevelInfo
                  }
                >
                  [{ev.level.padEnd(7, ' ')}]
                </span>
                <span className={styles.cSource}>[{ev.source}]</span>
                <span className={styles.cMsg}>{ev.title}: {ev.message}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        )}
      </div>

      {/* 5. Detailed Log Record Modal */}
      {selectedLog && (
        <div className={styles.logInspectorModal} onClick={() => setSelectedLog(null)}>
          <div className={styles.inspectorBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.inspectorHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getLevelIcon(selectedLog.level)}
                <span className={styles.modalTitle}>LOG RECORD INSPECTOR</span>
                <span className={`badge ${getLevelBadgeClass(selectedLog.level)}`}>
                  {selectedLog.level}
                </span>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.inspectorContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Event ID</span>
                <span className={styles.detailVal} style={{ fontFamily: 'monospace' }}>
                  {selectedLog.id}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.detailRow}>
                  <span className={styles.detailKey}>Timestamp</span>
                  <span className={styles.detailVal} style={{ fontFamily: 'monospace' }}>
                    {selectedLog.timestamp}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailKey}>Source Component</span>
                  <span className={styles.detailVal} style={{ fontWeight: 600, color: '#7c3aed' }}>
                    {selectedLog.source}
                  </span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Event Title</span>
                <span className={styles.detailVal} style={{ fontWeight: 700 }}>
                  {selectedLog.title}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Audit Message</span>
                <span className={styles.detailVal} style={{ lineHeight: 1.45, color: '#334155' }}>
                  {selectedLog.message}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Raw JSON Record</span>
                <pre className={styles.jsonBox}>
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
