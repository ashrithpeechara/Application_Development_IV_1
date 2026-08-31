'use client';

import React, { useState } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { NetworkNode } from '@/types/simulation';
import { simulationApi } from '@/services/api';
import styles from './admin.module.scss';
import {
  Settings,
  PlusCircle,
  Router,
  Network,
  Server,
  Cpu,
  Radio,
  Shield,
  Trash2,
  CheckCircle,
  Sliders,
  Play,
  Flame,
  RotateCcw,
  Zap,
  Activity,
  HardDrive,
  KeyRound,
  FileCheck2,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  FileCode,
  Wand2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ParsedNodeSpec {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'server' | 'host' | 'cloud';
  ip: string;
  target_link: string;
  load: number;
  status: 'ONLINE' | 'PROTECTED' | 'STANDBY' | 'ACTIVE_ROUTE';
  capacity: string;
  explanation: string;
}

export default function AdminPage() {
  const { state, addCustomNode, removeCustomNode, updateNodeStatus } = useSimulation();
  const nodes = state?.topology?.nodes || [];

  // Active Admin View Tab
  const [activeTab, setActiveTab] = useState<'PROMPT' | 'BRSKI' | 'MANUAL'>('PROMPT');

  // AI Prompt-to-Node Provisioning States
  const [promptText, setPromptText] = useState('Deploy a high-capacity backup core router R5 with IP 10.0.5.1 connected to R1 with 15% load and 10 Gbps capacity.');
  const [isCompilingPrompt, setIsCompilingPrompt] = useState(false);
  const [parsedNodeResult, setParsedNodeResult] = useState<ParsedNodeSpec | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);

  // Manual Form states
  const [nodeId, setNodeId] = useState('');
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState<'router' | 'switch' | 'server' | 'host' | 'cloud'>('router');
  const [ipAddress, setIpAddress] = useState('10.0.5.1');
  const [linkTarget, setLinkTarget] = useState('r1');
  const [capacity, setCapacity] = useState('10.0 Gbps');
  const [initialLoad, setInitialLoad] = useState(18);
  const [nodeStatus, setNodeStatus] = useState<NetworkNode['status']>('ONLINE');
  const [successToast, setSuccessToast] = useState('');

  // BRSKI Handshake States
  const [pledgeId, setPledgeId] = useState('r5');
  const [pledgeName, setPledgeName] = useState('Router R5 (Edge Autonomous Bypass)');
  const [pledgeSerial, setPledgeSerial] = useState('SN-ANIMA-8995-0984-X');
  const [pledgeManufacturer, setPledgeManufacturer] = useState('ANIMA Systems Corp (IEEE 802.1AR)');
  const [pledgeProxy, setPledgeProxy] = useState('r1');
  const [brskiStep, setBrskiStep] = useState<number>(0); // 0: Idle, 1: GRASP, 2: VoucherReq, 3: MASA, 4: EST/Done
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [issuedVoucher, setIssuedVoucher] = useState<any | null>(null);
  const [issuedCert, setIssuedCert] = useState<any | null>(null);

  // Policy toggle states
  const [autoMitigation, setAutoMitigation] = useState(true);
  const [entropyInspection, setEntropyInspection] = useState(true);
  const [strictSLA, setStrictSLA] = useState(true);
  const [humanApproval, setHumanApproval] = useState(false);


  // Run BRSKI Zero-Touch Onboarding Handshake
  const handleInitiateBRSKI = async () => {
    setIsBootstrapping(true);
    setBrskiStep(1);
    setIssuedVoucher(null);
    setIssuedCert(null);

    // Step 1: GRASP Discovery
    await new Promise((r) => setTimeout(r, 1200));
    setBrskiStep(2);

    // Step 2: Voucher Request to Join Registrar
    await new Promise((r) => setTimeout(r, 1400));
    setBrskiStep(3);

    // Step 3: MASA Signature & Voucher Generation
    const nonce = Math.random().toString(36).substring(2, 10).toUpperCase();
    const generatedVoucher = {
      "ietf-voucher:voucher": {
        "voucher-version": "1.0",
        "created-on": new Date().toISOString(),
        "expires-on": new Date(Date.now() + 86400000).toISOString(),
        "serial-number": pledgeSerial,
        "pinned-domain-cert": "SHA256:7B:3A:9F:88:C1:4E:02:D5:A6",
        "domain-registrar": "casa-autonomic-registrar.domain.net",
        "nonce": nonce,
        "masa-signature-algorithm": "ECDSA-SHA256",
        "masa-url": "https://masa.anima-auth.org/vouchers"
      }
    };
    setIssuedVoucher(generatedVoucher);

    await new Promise((r) => setTimeout(r, 1500));
    setBrskiStep(4);

    // Step 4: EST Enrollment & LDevID Issuance
    const generatedCert = {
      "x509_certificate": {
        "subject": `CN=${pledgeId}.casa.autonomic.net, OU=Autonomic ACP, O=C-ASA Domain`,
        "issuer": "CN=C-ASA Root CA, O=Autonomic Networking Authority",
        "serial_number": `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
        "valid_from": new Date().toISOString().split('T')[0],
        "valid_until": new Date(Date.now() + 31536000000).toISOString().split('T')[0],
        "key_usage": ["Digital Signature", "Key Encipherment", "ACP Tunnel Auth"],
        "status": "VALIDATED_AND_ENROLLED"
      }
    };
    setIssuedCert(generatedCert);

    // Complete node provisioning into the autonomic state
    const cleanId = pledgeId.toLowerCase();
    const newNode: NetworkNode = {
      id: cleanId,
      name: pledgeName,
      type: 'router',
      x: 350 + Math.floor(Math.random() * 150),
      y: 220 + Math.floor(Math.random() * 100),
      status: 'PROTECTED',
      ip: `10.0.${nodes.length + 2}.1`,
      load: 12
    };

    addCustomNode(newNode, pledgeProxy);

    setIsBootstrapping(false);
    setSuccessToast(`BRSKI Completed! ${newNode.name} successfully converted from Pledge to Authenticated Autonomic Node with LDevID!`);
  };

  // Compile Natural Language Prompt into Structured Node Parameters
  const handleCompilePromptNode = async (overridePrompt?: string) => {
    const textToProcess = overridePrompt || promptText.trim();
    if (!textToProcess) return;

    setIsCompilingPrompt(true);
    setPromptError(null);

    const systemPrompt = `You are the C-ASA Autonomic Topology Compiler. The user will specify a new network node in natural language.
You must parse and output a STRICT, VALID JSON object with no extraneous markdown outside the JSON:
{
  "id": "short alphanumeric lowercase identifier (e.g. r5, r6, sw2, s2, fw1)",
  "name": "descriptive device name (e.g. Router R5 (West Bypass Gateway))",
  "type": "router | switch | server | host | cloud",
  "ip": "valid IPv4 address (e.g. 10.0.5.1)",
  "target_link": "identifier of existing node to attach to: 'client', 'r1', 'r2', 'r3', 'r4', 'server'",
  "load": number integer between 5 and 65,
  "status": "ONLINE | PROTECTED | STANDBY | ACTIVE_ROUTE",
  "capacity": "e.g. 10.0 Gbps",
  "explanation": "Brief 1-sentence rationale of how the private model configured this node."
}`;

    try {
      const response = await simulationApi.privateModelGenerate(
        `[INSTRUCTION]: Parse this network specification into strict JSON:\n${textToProcess}`
      );

      let parsed: ParsedNodeSpec | null = null;
      if (response && response.text) {
        try {
          // Extract JSON block if surrounded by markdown fences
          const jsonMatch = response.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          }
        } catch (jsonErr) {
          console.warn('Failed to parse direct LLM JSON, trying fallback parser', jsonErr);
        }
      }

      // Smart Rule Fallback if LLM was offline or output format differed
      if (!parsed) {
        const lower = textToProcess.toLowerCase();
        let detectedType: 'router' | 'switch' | 'server' | 'host' | 'cloud' = 'router';
        if (lower.includes('switch') || lower.includes('sw')) detectedType = 'switch';
        else if (lower.includes('server') || lower.includes('dc')) detectedType = 'server';
        else if (lower.includes('cloud') || lower.includes('gw')) detectedType = 'cloud';
        else if (lower.includes('host') || lower.includes('client')) detectedType = 'host';

        const idMatch = lower.match(/\b(r\d+|sw\d+|s\d+|fw\d+|cloud\d+|host\d+)\b/);
        const autoId = idMatch ? idMatch[1] : `node-${nodes.length + 1}`;

        const ipMatch = textToProcess.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
        const autoIp = ipMatch ? ipMatch[0] : `10.0.${nodes.length + 2}.1`;

        let targetLink = 'r1';
        if (lower.includes('r2')) targetLink = 'r2';
        else if (lower.includes('r3')) targetLink = 'r3';
        else if (lower.includes('r4')) targetLink = 'r4';
        else if (lower.includes('server')) targetLink = 'server';
        else if (lower.includes('client')) targetLink = 'client';

        const loadMatch = textToProcess.match(/(\d+)\s*%/);
        const autoLoad = loadMatch ? parseInt(loadMatch[1], 10) : 15;

        parsed = {
          id: autoId,
          name: `${detectedType.toUpperCase()} ${autoId.toUpperCase()} (Neural Provisioned)`,
          type: detectedType,
          ip: autoIp,
          target_link: targetLink,
          load: Math.min(Math.max(autoLoad, 5), 85),
          status: lower.includes('standby') ? 'STANDBY' : lower.includes('protect') ? 'PROTECTED' : 'ONLINE',
          capacity: lower.includes('40') ? '40.0 Gbps' : lower.includes('100') ? '100.0 Gbps' : '10.0 Gbps',
          explanation: `Compiled from natural language prompt: ${textToProcess.slice(0, 75)}...`
        };
      }

      setParsedNodeResult(parsed);
    } catch (err: any) {
      setPromptError(`Failed to process prompt: ${err.message}`);
    } finally {
      setIsCompilingPrompt(false);
    }
  };

  // Deploy the AI-Parsed Node to Live SDN Topology
  const handleDeployParsedNode = () => {
    if (!parsedNodeResult) return;

    const cleanId = (parsedNodeResult.id || `node-${Date.now().toString().slice(-4)}`).toLowerCase();
    const newNode: NetworkNode = {
      id: cleanId,
      name: parsedNodeResult.name || `Node ${cleanId.toUpperCase()}`,
      type: parsedNodeResult.type || 'router',
      x: 340 + Math.floor(Math.random() * 200),
      y: 180 + Math.floor(Math.random() * 160),
      status: parsedNodeResult.status || 'ONLINE',
      ip: parsedNodeResult.ip || `10.0.${nodes.length + 2}.1`,
      load: parsedNodeResult.load || 15
    };

    addCustomNode(newNode, parsedNodeResult.target_link || 'r1');

    setSuccessToast(`✨ Prompt Provisioned: ${newNode.name} [${newNode.ip}] connected to ${(parsedNodeResult.target_link || 'r1').toUpperCase()}!`);
    setTimeout(() => setSuccessToast(''), 5000);
  };

  // Handle Manual Form Submission
  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = nodeId.trim() || `node-${Date.now().toString().slice(-4)}`;
    const cleanName = nodeName.trim() || `Router R${nodes.length + 1} (Edge)`;

    const newNode: NetworkNode = {
      id: cleanId.toLowerCase(),
      name: cleanName,
      type: nodeType,
      x: 350 + Math.floor(Math.random() * 200),
      y: 200 + Math.floor(Math.random() * 150),
      status: nodeStatus,
      ip: ipAddress.trim() || '10.0.5.1',
      load: initialLoad
    };

    addCustomNode(newNode, linkTarget);

    setSuccessToast(`Successfully provisioned ${newNode.name} [${newNode.ip}] connected to ${linkTarget.toUpperCase()}!`);
    setTimeout(() => setSuccessToast(''), 4000);

    setNodeId('');
    setNodeName('');
    setIpAddress(`10.0.${nodes.length + 2}.1`);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'router': return <Router size={15} />;
      case 'switch': return <Network size={15} />;
      case 'server': return <Server size={15} />;
      case 'cloud': return <Radio size={15} />;
      default: return <Cpu size={15} />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'ACTIVE_ROUTE':
      case 'PROTECTED':
        return 'badge-success';
      case 'STANDBY':
        return 'badge-info';
      case 'CRITICAL':
      case 'DEGRADED':
        return 'badge-danger';
      case 'BYPASSED':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const totalRouters = nodes.filter((n) => n.type === 'router').length;
  const totalSwitches = nodes.filter((n) => n.type === 'switch').length;
  const totalServers = nodes.filter((n) => n.type === 'server').length;

  return (
    <div className={styles.adminPage}>
      {/* 1. Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Settings size={24} color="#0284c7" />
            <span>SDN INFRASTRUCTURE & BRSKI PROVISIONING</span>
          </h1>
          <p className={styles.subtitle}>
            Admin control plane to onboard autonomic routers via BRSKI (RFC 8995) Zero-Touch Onboarding and manage network inventory.
          </p>
        </div>

        <div className="badge badge-primary">
          BRSKI PROTOCOL v2.4 ENABLED
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <CheckCircle size={18} color="#059669" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. KPI Summary Bar */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <HardDrive size={20} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiVal}>{nodes.length}</span>
            <span className={styles.kpiLabel}>Total Managed Nodes</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Router size={20} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiVal}>{totalRouters}</span>
            <span className={styles.kpiLabel}>Active Routers</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: '#ecfdf5', color: '#059669' }}>
            <KeyRound size={20} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiVal}>RFC 8995</span>
            <span className={styles.kpiLabel}>BRSKI Security Plane</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ background: '#fffbeb', color: '#d97706' }}>
            <Shield size={20} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiVal}>100%</span>
            <span className={styles.kpiLabel}>LDevID Domain Trust</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation View Tabs */}
      <div className={styles.adminTabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'PROMPT' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('PROMPT')}
        >
          <Sparkles size={16} color="#0284c7" />
          <span>🤖 AI Prompt-to-Node Provisioning</span>
          <span className={styles.tabBadge}>AUTONOMIC</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'BRSKI' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('BRSKI')}
        >
          <KeyRound size={16} />
          <span>BRSKI Zero-Touch Onboarding (RFC 8995)</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'MANUAL' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('MANUAL')}
        >
          <PlusCircle size={16} />
          <span>Manual Quick Provision</span>
        </button>
      </div>

      {/* 4. Tab 0: AI Prompt-Driven Node Provisioning */}
      {activeTab === 'PROMPT' && (
        <div className={styles.promptCard}>
          <div className={styles.cardHeader} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className={styles.cardTitleGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Wand2 size={18} color="#0284c7" />
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>PROMPT-DRIVEN TOPOLOGY COMPILER (NATURAL LANGUAGE)</span>
            </div>
            <span className="mono-tag" style={{ color: '#0284c7' }}>private_model-core-v3</span>
          </div>

          <div className={styles.promptGrid}>
            {/* Left: Input Textarea and Suggestion Chips */}
            <div className={styles.promptInputSection}>
              <div>
                <label className={styles.label} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', display: 'block' }}>
                  Admin Natural Language Topology Instruction:
                </label>
                <textarea
                  className={styles.promptTextarea}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="e.g. Deploy a high-capacity backup core router R5 with IP 10.0.5.1 connected to R1 with 15% load..."
                />
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  Quick Prompt Templates (Click to load & test):
                </span>
                <div className={styles.suggestionChips}>
                  <button
                    type="button"
                    className={styles.suggestionChip}
                    onClick={() => {
                      const p = "Deploy a backup core router R5 with IP 10.0.5.1 connected to R1 with 15% load and 10 Gbps capacity.";
                      setPromptText(p);
                      handleCompilePromptNode(p);
                    }}
                  >
                    🚀 Backup Router R5 linked to R1
                  </button>
                  <button
                    type="button"
                    className={styles.suggestionChip}
                    onClick={() => {
                      const p = "Create an edge security switch SW2 with IP 10.0.6.1 connected to R2 with 20% load.";
                      setPromptText(p);
                      handleCompilePromptNode(p);
                    }}
                  >
                    🛡️ Security Switch SW2 linked to R2
                  </button>
                  <button
                    type="button"
                    className={styles.suggestionChip}
                    onClick={() => {
                      const p = "Deploy a telemetry analytics server S2 at 10.0.99.1 connected to server with 10 Gbps capacity.";
                      setPromptText(p);
                      handleCompilePromptNode(p);
                    }}
                  >
                    🖥️ Telemetry Server S2 linked to Server Core
                  </button>
                  <button
                    type="button"
                    className={styles.suggestionChip}
                    onClick={() => {
                      const p = "Provision a high-throughput bypass router R6 at 10.0.8.1 linked to R4 with 100 Gbps mesh link.";
                      setPromptText(p);
                      handleCompilePromptNode(p);
                    }}
                  >
                    ⚡ Terabit Bypass Router R6 linked to R4
                  </button>
                </div>
              </div>

              {promptError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#be123c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={15} />
                  <span>{promptError}</span>
                </div>
              )}

              <div className={styles.compileActions}>
                <button
                  type="button"
                  className={styles.compileBtn}
                  onClick={() => handleCompilePromptNode()}
                  disabled={isCompilingPrompt || !promptText.trim()}
                >
                  <RefreshCw size={15} className={isCompilingPrompt ? styles.spinning : ''} />
                  <span>{isCompilingPrompt ? 'Compiling via Private Model...' : '🤖 Compile Prompt into Node'}</span>
                </button>
              </div>
            </div>

            {/* Right: AI-Parsed Node Specification Preview & Direct Deploy */}
            <div className={styles.parsedPreviewSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  PARSED NODE SPECIFICATION
                </span>
                <span className="mono-tag" style={{ color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                  READY FOR DEPLOYMENT
                </span>
              </div>

              {parsedNodeResult ? (
                <>
                  <div className={styles.parsedSpecGrid}>
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Node ID</span>
                      <span className={styles.specValue} style={{ color: '#0284c7', fontFamily: 'monospace' }}>
                        {parsedNodeResult.id.toUpperCase()}
                      </span>
                    </div>

                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Device Type</span>
                      <span className={styles.specValue} style={{ textTransform: 'capitalize' }}>
                        {parsedNodeResult.type}
                      </span>
                    </div>

                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Assigned IPv4</span>
                      <span className={styles.specValue} style={{ fontFamily: 'monospace' }}>
                        {parsedNodeResult.ip}
                      </span>
                    </div>

                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Attached Uplink</span>
                      <span className={styles.specValue} style={{ color: '#7c3aed', fontFamily: 'monospace' }}>
                        {parsedNodeResult.target_link.toUpperCase()}
                      </span>
                    </div>

                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Capacity & Load</span>
                      <span className={styles.specValue}>
                        {parsedNodeResult.capacity || '10.0 Gbps'} ({parsedNodeResult.load}%)
                      </span>
                    </div>

                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Security Status</span>
                      <span className={styles.specValue} style={{ color: '#059669' }}>
                        {parsedNodeResult.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', fontSize: '0.76rem', color: '#475569' }}>
                    <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>Device Label:</strong>
                    {parsedNodeResult.name}
                    <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                      "{parsedNodeResult.explanation}"
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.deployParsedBtn}
                    onClick={handleDeployParsedNode}
                  >
                    <PlusCircle size={16} />
                    <span>🚀 Deploy Node to Live SDN Topology</span>
                  </button>
                </>
              ) : (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Wand2 size={24} color="#cbd5e1" />
                  <span>Enter an instruction on the left or click a prompt template to parse and deploy a live node.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 1: BRSKI Zero-Touch Onboarding */}
      {activeTab === 'BRSKI' && (

        <div className={styles.brskiCard}>
          <div className={styles.brskiHeader}>
            <div className={styles.titleGroup}>
              <div className={styles.iconBox}>
                <KeyRound size={18} />
              </div>
              <div>
                <div className={styles.title}>AUTONOMIC BRSKI NODE CONVERSION & BOOTSTRAPPING</div>
                <div className={styles.sub}>
                  Converts an untrusted Pledge Router into an Authenticated Domain Node via IDevID, MASA Voucher Tickets, and EST LDevID.
                </div>
              </div>
            </div>
            <span className="badge badge-success">ZERO-TOUCH BOOTSTRAP READY</span>
          </div>

          <div className={styles.brskiBody}>
            {/* Pledge Identity & Join Proxy Parameters */}
            <div className={styles.brskiPledgeDeck}>
              <div className={styles.pledgeBox}>
                <div className={styles.pledgeTitle}>
                  <Router size={16} color="#0284c7" />
                  <span>Untrusted Pledge Hardware Profile</span>
                </div>

                <div className={styles.paramRow}>
                  <span className={styles.paramKey}>Pledge Device Node ID:</span>
                  <span className={styles.paramVal}>{pledgeId.toUpperCase()}</span>
                </div>
                <div className={styles.paramRow}>
                  <span className={styles.paramKey}>Device Friendly Name:</span>
                  <span className={styles.paramVal}>{pledgeName}</span>
                </div>
                <div className={styles.paramRow}>
                  <span className={styles.paramKey}>Hardware Serial Number:</span>
                  <span className={styles.paramVal}>{pledgeSerial}</span>
                </div>
                <div className={styles.paramRow}>
                  <span className={styles.paramKey}>Factory Manufacturer Certificate:</span>
                  <span className={styles.paramVal} style={{ color: '#059669' }}>
                    IDevID (IEEE 802.1AR Valid)
                  </span>
                </div>
              </div>

              <div className={styles.pledgeBox}>
                <div className={styles.pledgeTitle}>
                  <Shield size={16} color="#7c3aed" />
                  <span>Autonomic Domain Registrar & MASA Config</span>
                </div>

                <div className={styles.paramRow}>
                  <span className={styles.paramKey}>Join Proxy Neighbor:</span>
                  <span className={styles.paramVal}>Router R1 (Active Join Registrar)</span>
                </div>
                <div className={styles.paramRow}>
                  <span className={styles.paramKey}>Autonomic Domain Registrar:</span>
                  <span className={styles.paramVal}>casa-autonomic-registrar.net</span>
                </div>
                <div className={styles.paramRow}>
                  <span className={styles.paramKey}>MASA Authority Endpoint:</span>
                  <span className={styles.paramVal}>https://masa.anima-auth.org/vouchers</span>
                </div>
                <div className={styles.paramRow}>
                  <span className={styles.paramKey}>Target Certificate Authority:</span>
                  <span className={styles.paramVal} style={{ color: '#7c3aed' }}>
                    EST / RFC 7030 (LDevID)
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Stage Live Handshake Stepper */}
            <div className={styles.handshakeTrack}>
              <div
                className={`${styles.handshakeStep} ${
                  brskiStep === 1 ? styles.stepActive : brskiStep > 1 ? styles.stepDone : ''
                }`}
              >
                <div className={styles.stepHeader}>
                  <span className={styles.stepNum}>STEP 01</span>
                  {brskiStep > 1 && <CheckCircle size={14} color="#059669" />}
                </div>
                <div className={styles.stepTitle}>GRASP Discovery</div>
                <p className={styles.stepDesc}>
                  Pledge announces IDevID certificate to Join Proxy via GRASP link-local multicast.
                </p>
              </div>

              <div
                className={`${styles.handshakeStep} ${
                  brskiStep === 2 ? styles.stepActive : brskiStep > 2 ? styles.stepDone : ''
                }`}
              >
                <div className={styles.stepHeader}>
                  <span className={styles.stepNum}>STEP 02</span>
                  {brskiStep > 2 && <CheckCircle size={14} color="#059669" />}
                </div>
                <div className={styles.stepTitle}>Voucher Request</div>
                <p className={styles.stepDesc}>
                  Join Registrar proxies signed voucher-request ticket to C-ASA Domain Registrar.
                </p>
              </div>

              <div
                className={`${styles.handshakeStep} ${
                  brskiStep === 3 ? styles.stepActive : brskiStep > 3 ? styles.stepDone : ''
                }`}
              >
                <div className={styles.stepHeader}>
                  <span className={styles.stepNum}>STEP 03</span>
                  {brskiStep > 3 && <CheckCircle size={14} color="#059669" />}
                </div>
                <div className={styles.stepTitle}>MASA Verification</div>
                <p className={styles.stepDesc}>
                  Manufacturer Authority validates serial & signs RFC 8366 Voucher ownership ticket.
                </p>
              </div>

              <div
                className={`${styles.handshakeStep} ${
                  brskiStep === 4 ? styles.stepDone : ''
                }`}
              >
                <div className={styles.stepHeader}>
                  <span className={styles.stepNum}>STEP 04</span>
                  {brskiStep === 4 && <CheckCircle size={14} color="#059669" />}
                </div>
                <div className={styles.stepTitle}>EST LDevID Enrollment</div>
                <p className={styles.stepDesc}>
                  Pledge validates voucher, enrolls via EST, receives LDevID, and joins ACP mesh.
                </p>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className={styles.brskiActionRow}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                  Autonomic Zero-Touch Execution:
                </span>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>
                  Clicking initiate will execute the live cryptographic handshake and convert the Pledge Router.
                </p>
              </div>

              <button
                className={styles.initiateBtn}
                onClick={handleInitiateBRSKI}
                disabled={isBootstrapping}
              >
                <KeyRound size={16} />
                <span>{isBootstrapping ? 'Executing BRSKI Handshake...' : 'Initiate BRSKI Handshake & Convert Node'}</span>
              </button>
            </div>

            {/* Generated Voucher & LDevID Certificate Inspectors */}
            {(issuedVoucher || issuedCert) && (
              <div className={styles.cryptoInspectorGrid}>
                {issuedVoucher && (
                  <div className={styles.cryptoBox}>
                    <div className={styles.cryptoHeader}>
                      ✓ SIGNED MASA VOUCHER TICKET (RFC 8366 CBOR/JSON)
                    </div>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(issuedVoucher, null, 2)}
                    </pre>
                  </div>
                )}

                {issuedCert && (
                  <div className={styles.cryptoBox}>
                    <div className={styles.cryptoHeader} style={{ color: '#a855f7' }}>
                      ✓ ENROLLED LDevID DOMAIN CERTIFICATE (X.509)
                    </div>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(issuedCert, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Manual Quick Provision */}
      {activeTab === 'MANUAL' && (
        <div className={styles.workbenchGrid}>
          {/* Left Column: Device Provisioning Form */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleGroup}>
                <PlusCircle size={17} color="#0284c7" />
                <span>MANUAL QUICK PROVISION</span>
              </div>
              <span className="mono-tag" style={{ color: '#0284c7' }}>SDN_ADD_NODE</span>
            </div>

            <form onSubmit={handleAddDevice} className={styles.provisionForm}>
              <div className={styles.grid2Col}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Device ID (Slug)</label>
                  <input
                    type="text"
                    placeholder="e.g. r5, s2, fw1"
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Device Type</label>
                  <select
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value as any)}
                    className={styles.selectInput}
                  >
                    <option value="router">Edge/Core Router</option>
                    <option value="switch">OpenFlow Switch</option>
                    <option value="server">Core Server cluster</option>
                    <option value="host">Client Host</option>
                    <option value="cloud">Cloud Uplink Gateway</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Router R5 - West Coast Bypass"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.grid2Col}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Management IP</label>
                  <input
                    type="text"
                    placeholder="10.0.5.1"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Uplink Connection</label>
                  <select
                    value={linkTarget}
                    onChange={(e) => setLinkTarget(e.target.value)}
                    className={styles.selectInput}
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        Connect to {n.name} ({n.id.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.grid2Col}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Port Capacity</label>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="1.0 Gbps">1.0 Gbps FastEthernet</option>
                    <option value="2.5 Gbps">2.5 Gbps Multi-Gig</option>
                    <option value="10.0 Gbps">10.0 Gbps Dedicated Fiber</option>
                    <option value="40.0 Gbps">40.0 Gbps Core Trunk</option>
                    <option value="100.0 Gbps">100.0 Gbps Terabit Mesh</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Initial Status</label>
                  <select
                    value={nodeStatus}
                    onChange={(e) => setNodeStatus(e.target.value as any)}
                    className={styles.selectInput}
                  >
                    <option value="ONLINE">ONLINE (Active)</option>
                    <option value="STANDBY">STANDBY (Hot Spare)</option>
                    <option value="PROTECTED">PROTECTED (Encrypted)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                <PlusCircle size={16} />
                <span>Provision Device Instantly</span>
              </button>
            </form>
          </div>

          {/* Autonomic Policy Controls */}
          <div className={styles.inventoryCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleGroup}>
                <Sliders size={17} color="#059669" />
                <span>AUTONOMIC GOVERNANCE & SLA POLICIES</span>
              </div>
              <span className="badge badge-success">POLICIES ENFORCED</span>
            </div>

            <div className={styles.policyGrid}>
              <div className={styles.policyItem}>
                <div className={styles.policyTop}>
                  <span className={styles.policyTitle}>Automatic Route Bypass</span>
                  <input
                    type="checkbox"
                    checked={autoMitigation}
                    onChange={(e) => setAutoMitigation(e.target.checked)}
                    style={{ accentColor: '#0284c7', cursor: 'pointer' }}
                  />
                </div>
                <p className={styles.policyDesc}>
                  Automatically redirects traffic to Router R4 when latency exceeds 80ms or packet loss &gt; 5%.
                </p>
              </div>

              <div className={styles.policyItem}>
                <div className={styles.policyTop}>
                  <span className={styles.policyTitle}>Entropy Traffic Analysis</span>
                  <input
                    type="checkbox"
                    checked={entropyInspection}
                    onChange={(e) => setEntropyInspection(e.target.checked)}
                    style={{ accentColor: '#0284c7', cursor: 'pointer' }}
                  />
                </div>
                <p className={styles.policyDesc}>
                  Continuous spectral analysis to identify DDoS flood vectors and source address randomness.
                </p>
              </div>

              <div className={styles.policyItem}>
                <div className={styles.policyTop}>
                  <span className={styles.policyTitle}>Strict SLA Guardrails</span>
                  <input
                    type="checkbox"
                    checked={strictSLA}
                    onChange={(e) => setStrictSLA(e.target.checked)}
                    style={{ accentColor: '#0284c7', cursor: 'pointer' }}
                  />
                </div>
                <p className={styles.policyDesc}>
                  Rejects route candidate adaptations if projected jitter exceeds 15ms or loss &gt; 1%.
                </p>
              </div>

              <div className={styles.policyItem}>
                <div className={styles.policyTop}>
                  <span className={styles.policyTitle}>Human Approval for Risk &gt;75%</span>
                  <input
                    type="checkbox"
                    checked={humanApproval}
                    onChange={(e) => setHumanApproval(e.target.checked)}
                    style={{ accentColor: '#0284c7', cursor: 'pointer' }}
                  />
                </div>
                <p className={styles.policyDesc}>
                  Requires operator confirmation before executing destructive flow table alterations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Active Topology Inventory Table */}
      <div className={styles.inventoryCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <Router size={17} color="#7c3aed" />
            <span>SDN DEVICE INVENTORY ({nodes.length} MANAGED NODES)</span>
          </div>
          <span className="badge badge-info">LIVE TOPOLOGY SYNC</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.nodeTable}>
            <thead>
              <tr>
                <th>Device Name & ID</th>
                <th>Type</th>
                <th>IP Address</th>
                <th>Utilization</th>
                <th>Security & Trust</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr key={node.id}>
                  <td>
                    <div className={styles.deviceCell}>
                      <div className={styles.deviceIcon}>
                        {getNodeIcon(node.type)}
                      </div>
                      <div>
                        <div className={styles.deviceName}>{node.name}</div>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                          ID: {node.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="mono-tag" style={{ textTransform: 'uppercase' }}>
                      {node.type}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#334155' }}>
                    {node.ip}
                  </td>
                  <td style={{ width: '140px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${node.load}%`,
                            height: '100%',
                            background: node.load > 70 ? '#e11d48' : node.load > 40 ? '#d97706' : '#059669'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 600 }}>
                        {node.load}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                      <Lock size={10} />
                      <span>LDevID (RFC 8995)</span>
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(node.status)}`}>
                      {node.status}
                    </span>
                  </td>
                  <td>
                    {['r5', 's2', 'fw1'].includes(node.id) || node.id.startsWith('node-') ? (
                      <button
                        className={styles.tableActionBtn}
                        onClick={() => removeCustomNode(node.id)}
                        title="Decommission Node"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <button
                        className={styles.tableActionBtn}
                        onClick={() => updateNodeStatus(node.id, node.status === 'ONLINE' ? 'STANDBY' : 'ONLINE')}
                      >
                        <Activity size={12} />
                        <span>Toggle</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
