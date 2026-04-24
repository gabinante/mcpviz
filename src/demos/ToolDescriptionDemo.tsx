import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DESCRIPTION_SCENARIOS,
  DESCRIPTION_TIPS,
} from '../data/descriptions';

export function ToolDescriptionDemo() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [simulatedSelection, setSimulatedSelection] = useState<string | null>(
    null
  );
  const [isSimulating, setIsSimulating] = useState(false);

  // Group scenarios into pairs (ambiguous / improved)
  const scenarioPairs = [
    {
      label: 'Search Tools',
      ambiguous: DESCRIPTION_SCENARIOS[0],
      improved: DESCRIPTION_SCENARIOS[1],
    },
    {
      label: 'Read/Database Tools',
      ambiguous: DESCRIPTION_SCENARIOS[2],
      improved: DESCRIPTION_SCENARIOS[3],
    },
  ];

  const currentPair = scenarioPairs[activeScenarioIdx];
  const scenario = showComparison
    ? currentPair.improved
    : currentPair.ambiguous;

  const simulateSelection = () => {
    setIsSimulating(true);
    setSimulatedSelection(null);

    // Animate through tools before settling
    let iterations = 0;
    const maxIterations = 12;
    const interval = setInterval(() => {
      const randomTool =
        scenario.tools[Math.floor(Math.random() * scenario.tools.length)];
      setSimulatedSelection(randomTool.name);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        // Final selection based on probability
        const rand = Math.random();
        let cumulative = 0;
        for (const tool of scenario.tools) {
          cumulative += tool.selectionProbability;
          if (rand <= cumulative) {
            setSimulatedSelection(tool.name);
            break;
          }
        }
        setIsSimulating(false);
      }
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Description */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--warning)',
          }}
        >
          Pitfall 2: Static Tool Descriptions
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          Tool descriptions are prompts the model reads to decide which tool to
          call. Ambiguous descriptions lead to wrong tool selection, wasted
          tokens, and poor results. The model has no way to ask "did you mean
          search files or search the web?"
        </p>
      </div>

      {/* Scenario Selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {scenarioPairs.map((pair, idx) => (
          <button
            key={idx}
            className={`tab-button ${activeScenarioIdx === idx ? 'active' : ''}`}
            onClick={() => {
              setActiveScenarioIdx(idx);
              setSimulatedSelection(null);
            }}
          >
            {pair.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          className={`btn ${showComparison ? '' : 'btn-danger'}`}
          onClick={() => {
            setShowComparison(!showComparison);
            setSimulatedSelection(null);
          }}
        >
          {showComparison ? '\u2714 Better Descriptions' : '\u2718 Ambiguous Descriptions'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}
      >
        {/* Left: Scenario View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* User Query */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 6,
              }}
            >
              USER QUERY
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                padding: '12px 16px',
                borderRadius: 8,
                background: 'var(--protocol-blue-dim)',
                border: '1px solid rgba(74, 158, 255, 0.2)',
              }}
            >
              "{scenario.userQuery}"
            </div>
          </div>

          {/* Tool Options */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 12,
              }}
            >
              AVAILABLE TOOLS — {showComparison ? 'IMPROVED' : 'AMBIGUOUS'}{' '}
              DESCRIPTIONS
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {scenario.tools.map((tool) => {
                  const isSelected = simulatedSelection === tool.name;
                  const isCorrect = tool.isCorrectChoice;
                  const showResult =
                    simulatedSelection !== null && !isSimulating;
                  const borderColor = isSelected
                    ? showResult
                      ? isCorrect
                        ? 'var(--accent)'
                        : 'var(--danger)'
                      : 'var(--protocol-blue)'
                    : 'rgba(0, 229, 160, 0.1)';

                  return (
                    <motion.div
                      key={tool.name}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 8,
                        border: `2px solid ${borderColor}`,
                        background: isSelected
                          ? showResult
                            ? isCorrect
                              ? 'var(--accent-glow)'
                              : 'var(--danger-dim)'
                            : 'var(--protocol-blue-dim)'
                          : 'rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.15s ease',
                      }}
                      animate={{
                        scale: isSelected && isSimulating ? 1.02 : 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        <span
                          className="font-mono"
                          style={{ fontSize: 14, fontWeight: 600 }}
                        >
                          {tool.name}
                        </span>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          {isCorrect && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'var(--accent-glow)',
                                color: 'var(--accent)',
                                border: '1px solid rgba(0,229,160,0.2)',
                              }}
                            >
                              CORRECT
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 12,
                              color: 'var(--text-muted)',
                            }}
                          >
                            P={Math.round(tool.selectionProbability * 100)}%
                          </span>
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                        }}
                      >
                        {tool.description}
                      </p>

                      {/* Selection result */}
                      {isSelected && showResult && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: isCorrect
                              ? 'var(--accent)'
                              : 'var(--danger)',
                          }}
                        >
                          {isCorrect
                            ? '\u2714 Model selected the correct tool!'
                            : '\u2718 Wrong tool selected! Tokens and time wasted.'}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <button
              className="btn"
              onClick={simulateSelection}
              disabled={isSimulating}
              style={{
                marginTop: 16,
                width: '100%',
                opacity: isSimulating ? 0.6 : 1,
              }}
            >
              {isSimulating ? 'Selecting...' : 'Simulate Model Selection'}
            </button>
          </div>
        </div>

        {/* Right: Probability Visualization & Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Probability Distribution */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 12,
              }}
            >
              SELECTION PROBABILITY
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {scenario.tools.map((tool) => (
                <div key={tool.name}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                      fontSize: 12,
                    }}
                  >
                    <span className="font-mono">{tool.name}</span>
                    <span
                      className="font-mono"
                      style={{
                        color: tool.isCorrectChoice
                          ? 'var(--accent)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {Math.round(tool.selectionProbability * 100)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      style={{
                        background: tool.isCorrectChoice
                          ? 'var(--accent)'
                          : tool.selectionProbability > 0.3
                            ? 'var(--danger)'
                            : 'var(--text-muted)',
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${tool.selectionProbability * 100}%`,
                      }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Accuracy Score */}
            <div
              style={{
                marginTop: 16,
                padding: '12px',
                borderRadius: 8,
                background: showComparison
                  ? 'var(--accent-glow)'
                  : 'var(--danger-dim)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: showComparison ? 'var(--accent)' : 'var(--danger)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {Math.round(
                  (scenario.tools.find((t) => t.isCorrectChoice)
                    ?.selectionProbability ?? 0) * 100
                )}
                %
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  marginTop: 4,
                }}
              >
                Correct tool selection probability
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 12,
              }}
            >
              DESCRIPTION BEST PRACTICES
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {DESCRIPTION_TIPS.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(0,229,160,0.08)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    {tip.title}
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    <span
                      style={{ color: 'var(--danger)', marginRight: 4 }}
                    >
                      Bad:
                    </span>
                    <span
                      className="font-mono"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      "{tip.bad}"
                    </span>
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    <span
                      style={{ color: 'var(--accent)', marginRight: 4 }}
                    >
                      Good:
                    </span>
                    <span
                      className="font-mono"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      "{tip.good}"
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    {tip.improvement}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
