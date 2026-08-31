'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { simulationApi } from '@/services/api';
import { Sparkles, MessageSquare, Send, X, Bot, User, Trash2, Cpu } from 'lucide-react';
import styles from './CognitiveCopilot.module.scss';

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const CognitiveCopilot: React.FC = () => {
  const { state } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'model',
      text: 'Hello Engineer. I am your **C-ASA Cognitive AI Copilot** (powered by private neural reasoning model `private_model-core-v3`). I have live topological and telemetry visibility over all autonomic agents and SDN nodes. Ask me anything about current anomalies, bypass routing decisions, or policy actuation.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Explain the anomaly on Router R2',
    'Why choose Router R4 over R3 for bypass?',
    'Generate OpenFlow flow rule for mitigation',
    'What is the security agent threat confidence?'
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const response = await simulationApi.privateModelChat(query);
      const replyText = response && response.success 
        ? response.text 
        : (response?.error || 'Unable to connect to private model cluster. Please verify backend service.');

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'model',
        text: `Error contacting private model cluster: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'model',
        text: 'Chat history cleared. Live network context active. How can I assist you?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button 
        className={styles.copilotTriggerBtn}
        onClick={() => setIsOpen(!isOpen)}
        title="Open C-ASA Cognitive AI Copilot"
      >
        <div className={styles.copilotSparkleIcon}>
          <Sparkles size={20} color="#38bdf8" />
        </div>
        <span className={styles.copilotLabel}>Cognitive AI Copilot</span>
        <span className={styles.onlineDot} />
      </button>

      {/* Slide-over Copilot Drawer */}
      {isOpen && (
        <div className={styles.copilotOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.copilotDrawer} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.headerTitle}>
                <div className={styles.botIconWrapper}>
                  <Bot size={20} color="#38bdf8" />
                </div>
                <div>
                  <h4>C-ASA Cognitive AI Copilot</h4>
                  <div className={styles.statusSub}>
                    <Cpu size={12} color="#22c55e" />
                    <span>private_model-core-v3 Active</span>
                  </div>
                </div>
              </div>

              <div className={styles.headerActions}>
                <button onClick={handleClearChat} title="Clear conversation" className={styles.iconBtn}>
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close drawer" className={styles.iconBtn}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className={styles.quickPromptsBar}>
              {quickPrompts.map((prompt, idx) => (
                <button 
                  key={idx} 
                  className={styles.promptChip}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className={styles.messagesContainer}>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.userWrapper : styles.modelWrapper}`}
                >
                  <div className={styles.avatar}>
                    {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} color="#38bdf8" />}
                  </div>
                  <div className={styles.messageBubble}>
                    <div className={styles.messageHeader}>
                      <span className={styles.senderName}>{msg.sender === 'user' ? 'You (NOC Engineer)' : 'C-ASA Private Model'}</span>
                      <span className={styles.timestamp}>{msg.timestamp}</span>
                    </div>
                    <div className={styles.messageBody}>
                      <pre className={styles.formattedText}>{msg.text}</pre>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className={`${styles.messageWrapper} ${styles.modelWrapper}`}>
                  <div className={styles.avatar}>
                    <Bot size={15} color="#38bdf8" />
                  </div>
                  <div className={styles.messageBubble}>
                    <div className={styles.typingIndicator}>
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form 
              className={styles.inputForm}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                placeholder="Ask the private model about live telemetry, routing, or agent actions..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                className={styles.textInput}
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || loading}
                className={styles.sendButton}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
