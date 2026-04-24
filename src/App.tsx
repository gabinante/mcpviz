import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextPollutionDemo } from './demos/ContextPollutionDemo';
import { ToolDescriptionDemo } from './demos/ToolDescriptionDemo';
import { ProtocolFlowDemo } from './demos/ProtocolFlowDemo';

type DemoTab = 'context' | 'descriptions' | 'protocol';

const TABS: { id: DemoTab; label: string; icon: string; subtitle: string }[] = [
  {
    id: 'context',
    label: 'Context Pollution',
    icon: '\u25A3',
    subtitle: 'Watch tokens disappear',
  },
  {
    id: 'descriptions',
    label: 'Tool Descriptions',
    icon: '\u2693',
    subtitle: 'Words matter to models',
  },
  {
    id: 'protocol',
    label: 'Protocol Flow',
    icon: '\u21C4',
    subtitle: 'Where MCP breaks down',
  },
];

function App() {
  const [activeTab, setActiveTab] = useState<DemoTab>('context');

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          padding: '24px 32px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--accent-glow)',
              border: '1px solid rgba(0, 229, 160, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            {'\u26A1'}
          </div>
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 600,
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              <span className="glow-text">mcpviz</span>
            </h1>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                margin: 0,
              }}
            >
              MCP Protocol Visualizer
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Interactive Demo
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav
        style={{
          padding: '20px 32px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: 16 }}>{tab.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div>{tab.label}</div>
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.6,
                  fontWeight: 400,
                }}
              >
                {tab.subtitle}
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* Demo Content */}
      <main style={{ padding: '0 32px 32px', flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'context' && <ContextPollutionDemo />}
            {activeTab === 'descriptions' && <ToolDescriptionDemo />}
            {activeTab === 'protocol' && <ProtocolFlowDemo />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '16px 32px',
          borderTop: '1px solid rgba(0, 229, 160, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Talk 6: Pitfalls of MCP &mdash; The Protocol Everyone's Using Wrong
        </span>
        <span>Lightning Talks: AI-Adjacent Topics</span>
      </footer>
    </div>
  );
}

export default App;
