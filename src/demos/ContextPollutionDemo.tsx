import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_TOOLS, CATEGORY_COLORS, CATEGORY_LABELS } from '../data/tools';
import type { MCPTool } from '../data/tools';
import {
  formatTokenCount,
  formatPercentage,
  getContextHealthColor,
  getContextHealthLabel,
} from '../utils/format';

const CONTEXT_WINDOW_SIZE = 200_000;
const SYSTEM_PROMPT_TOKENS = 1500;
const USER_MESSAGE_TOKENS = 200;

interface ToolResult {
  toolName: string;
  tokens: number;
  timestamp: number;
}

export function ContextPollutionDemo() {
  const [registeredTools, setRegisteredTools] = useState<MCPTool[]>([]);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [autoAddSpeed, setAutoAddSpeed] = useState<number>(0); // 0 = paused
  const [showBreakdown, setShowBreakdown] = useState(true);

  const availableTools = useMemo(
    () =>
      SAMPLE_TOOLS.filter(
        (t) => !registeredTools.find((r) => r.name === t.name)
      ),
    [registeredTools]
  );

  const descriptionTokens = useMemo(
    () => registeredTools.reduce((sum, t) => sum + t.tokenCount, 0),
    [registeredTools]
  );

  const parameterTokens = useMemo(
    () =>
      registeredTools.reduce(
        (sum, t) => sum + t.parameters.length * 25,
        0
      ),
    [registeredTools]
  );

  const resultTokens = useMemo(
    () => toolResults.reduce((sum, r) => sum + r.tokens, 0),
    [toolResults]
  );

  const totalToolTokens = descriptionTokens + parameterTokens;
  const totalUsed =
    SYSTEM_PROMPT_TOKENS + USER_MESSAGE_TOKENS + totalToolTokens + resultTokens;
  const usedPercentage = (totalUsed / CONTEXT_WINDOW_SIZE) * 100;
  const availableTokens = CONTEXT_WINDOW_SIZE - totalUsed;

  const addTool = useCallback(
    (tool: MCPTool) => {
      setRegisteredTools((prev) => [...prev, tool]);
    },
    []
  );

  const removeTool = useCallback((toolName: string) => {
    setRegisteredTools((prev) => prev.filter((t) => t.name !== toolName));
  }, []);

  const addAllTools = useCallback(() => {
    setRegisteredTools([...SAMPLE_TOOLS]);
  }, []);

  const simulateToolCall = useCallback(() => {
    if (registeredTools.length === 0) return;
    const tool =
      registeredTools[Math.floor(Math.random() * registeredTools.length)];
    const resultSize = 200 + Math.floor(Math.random() * 2000);
    setToolResults((prev) => [
      ...prev,
      { toolName: tool.name, tokens: resultSize, timestamp: Date.now() },
    ]);
  }, [registeredTools]);

  const reset = useCallback(() => {
    setRegisteredTools([]);
    setToolResults([]);
    setAutoAddSpeed(0);
  }, []);

  // Auto-add effect
  useState(() => {
    if (autoAddSpeed === 0) return;
    const interval = setInterval(() => {
      setRegisteredTools((prev) => {
        const remaining = SAMPLE_TOOLS.filter(
          (t) => !prev.find((r) => r.name === t.name)
        );
        if (remaining.length === 0) {
          setAutoAddSpeed(0);
          return prev;
        }
        return [...prev, remaining[0]];
      });
    }, 1000 / autoAddSpeed);
    return () => clearInterval(interval);
  });

  // Context window grid visualization
  const gridCols = 50;
  const gridRows = 20;
  const totalBlocks = gridCols * gridRows;
  const blocksPerToken = CONTEXT_WINDOW_SIZE / totalBlocks;

  const systemBlocks = Math.ceil(SYSTEM_PROMPT_TOKENS / blocksPerToken);
  const userBlocks = Math.ceil(USER_MESSAGE_TOKENS / blocksPerToken);
  const toolDescBlocks = Math.ceil(totalToolTokens / blocksPerToken);
  const resultBlocks = Math.ceil(resultTokens / blocksPerToken);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Description */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--accent)',
          }}
        >
          Pitfall 1: Context Pollution
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          Every MCP tool adds its description and parameter schema to the
          context window. Register 10 tools with 200-token descriptions and
          you've consumed 2,000 tokens before the user says anything. Add tool
          results and the window fills fast.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left: Context Window Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Context meter */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                Context Window Usage
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: getContextHealthColor(usedPercentage),
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {formatPercentage(totalUsed, CONTEXT_WINDOW_SIZE)}
              </span>
            </div>

            {/* Stacked progress bar */}
            <div
              style={{
                height: 24,
                borderRadius: 6,
                background: 'var(--bg-tertiary)',
                overflow: 'hidden',
                display: 'flex',
                position: 'relative',
              }}
            >
              <motion.div
                style={{
                  background: 'rgba(138, 155, 145, 0.6)',
                  height: '100%',
                }}
                animate={{
                  width: `${(SYSTEM_PROMPT_TOKENS / CONTEXT_WINDOW_SIZE) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                style={{
                  background: 'rgba(74, 158, 255, 0.6)',
                  height: '100%',
                }}
                animate={{
                  width: `${(USER_MESSAGE_TOKENS / CONTEXT_WINDOW_SIZE) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                style={{
                  background: 'rgba(229, 160, 0, 0.7)',
                  height: '100%',
                }}
                animate={{
                  width: `${(totalToolTokens / CONTEXT_WINDOW_SIZE) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                style={{
                  background: 'rgba(229, 80, 80, 0.7)',
                  height: '100%',
                }}
                animate={{
                  width: `${(resultTokens / CONTEXT_WINDOW_SIZE) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: 12,
                flexWrap: 'wrap',
                fontSize: 12,
              }}
            >
              {[
                {
                  color: 'rgba(138, 155, 145, 0.6)',
                  label: 'System',
                  tokens: SYSTEM_PROMPT_TOKENS,
                },
                {
                  color: 'rgba(74, 158, 255, 0.6)',
                  label: 'User',
                  tokens: USER_MESSAGE_TOKENS,
                },
                {
                  color: 'rgba(229, 160, 0, 0.7)',
                  label: 'Tool Descriptions',
                  tokens: totalToolTokens,
                },
                {
                  color: 'rgba(229, 80, 80, 0.7)',
                  label: 'Tool Results',
                  tokens: resultTokens,
                },
                {
                  color: 'var(--bg-tertiary)',
                  label: 'Available',
                  tokens: availableTokens,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: item.color,
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.label}:{' '}
                    <span
                      className="font-mono"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatTokenCount(item.tokens)}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* Health indicator */}
            <div
              style={{
                marginTop: 12,
                padding: '8px 12px',
                borderRadius: 6,
                background:
                  usedPercentage > 75
                    ? 'var(--danger-dim)'
                    : usedPercentage > 50
                      ? 'var(--warning-dim)'
                      : 'var(--accent-glow)',
                fontSize: 13,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                Status:{' '}
                <strong
                  style={{ color: getContextHealthColor(usedPercentage) }}
                >
                  {getContextHealthLabel(usedPercentage)}
                </strong>
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {formatTokenCount(availableTokens)} tokens remaining
              </span>
            </div>
          </div>

          {/* Token Grid */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                Token Grid (1 block = {formatTokenCount(Math.round(blocksPerToken))}{' '}
                tokens)
              </span>
              <button
                className="btn btn-sm"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                {showBreakdown ? 'Hide' : 'Show'} Labels
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gap: 2,
              }}
            >
              {Array.from({ length: totalBlocks }).map((_, i) => {
                let color = 'var(--bg-tertiary)';
                let label = '';
                if (i < systemBlocks) {
                  color = 'rgba(138, 155, 145, 0.5)';
                  label = 'sys';
                } else if (i < systemBlocks + userBlocks) {
                  color = 'rgba(74, 158, 255, 0.5)';
                  label = 'usr';
                } else if (
                  i < systemBlocks + userBlocks + toolDescBlocks
                ) {
                  color = 'rgba(229, 160, 0, 0.6)';
                  label = 'tool';
                } else if (
                  i <
                  systemBlocks + userBlocks + toolDescBlocks + resultBlocks
                ) {
                  color = 'rgba(229, 80, 80, 0.6)';
                  label = 'res';
                }

                const isActive =
                  i <
                  systemBlocks + userBlocks + toolDescBlocks + resultBlocks;

                return (
                  <motion.div
                    key={i}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 2,
                      background: color,
                      fontSize: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.3)',
                    }}
                    initial={false}
                    animate={{
                      scale: isActive ? 1 : 0.85,
                      opacity: isActive ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {showBreakdown && isActive ? label : ''}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div
            style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
          >
            <button className="btn" onClick={addAllTools}>
              Register All 20 Tools
            </button>
            <button
              className="btn"
              onClick={simulateToolCall}
              disabled={registeredTools.length === 0}
              style={{
                opacity: registeredTools.length === 0 ? 0.4 : 1,
              }}
            >
              Simulate Tool Call
            </button>
            <button
              className="btn"
              onClick={() => {
                for (let i = 0; i < 5; i++) simulateToolCall();
              }}
              disabled={registeredTools.length === 0}
              style={{
                opacity: registeredTools.length === 0 ? 0.4 : 1,
              }}
            >
              Simulate 5 Calls
            </button>
            <button className="btn btn-danger" onClick={reset}>
              Reset
            </button>
          </div>

          {/* Tool Results Log */}
          {toolResults.length > 0 && (
            <div className="glass-card" style={{ padding: '16px' }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 8,
                  color: 'var(--text-secondary)',
                }}
              >
                Tool Call Results ({toolResults.length})
              </h3>
              <div
                style={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {toolResults.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: 'var(--danger-dim)',
                      fontSize: 12,
                    }}
                  >
                    <span className="font-mono">{result.toolName}()</span>
                    <span
                      className="font-mono"
                      style={{ color: 'var(--danger)' }}
                    >
                      +{formatTokenCount(result.tokens)} tokens
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Tool Palette */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Registered Tools */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                Registered ({registeredTools.length}/{SAMPLE_TOOLS.length})
              </span>
              <span
                className="font-mono"
                style={{ color: 'var(--warning)', fontSize: 13 }}
              >
                {formatTokenCount(totalToolTokens)} tokens
              </span>
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxHeight: 280,
                overflowY: 'auto',
              }}
            >
              <AnimatePresence>
                {registeredTools.map((tool) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, height: 0, scale: 0.8 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.8 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 6,
                      background: 'rgba(229, 160, 0, 0.08)',
                      border: `1px solid ${CATEGORY_COLORS[tool.category]}22`,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    onClick={() => removeTool(tool.name)}
                    title="Click to remove"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 2,
                          background: CATEGORY_COLORS[tool.category],
                        }}
                      />
                      <span className="font-mono">{tool.name}</span>
                    </div>
                    <span
                      className="font-mono"
                      style={{ color: 'var(--text-muted)', fontSize: 11 }}
                    >
                      {tool.tokenCount}t
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {registeredTools.length === 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    padding: 16,
                  }}
                >
                  No tools registered. Add tools below.
                </p>
              )}
            </div>
          </div>

          {/* Available Tools */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              Available Tools ({availableTools.length})
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxHeight: 300,
                overflowY: 'auto',
              }}
            >
              {availableTools.map((tool) => (
                <motion.div
                  key={tool.name}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: 'rgba(0, 229, 160, 0.05)',
                    border: '1px solid rgba(0, 229, 160, 0.1)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  onClick={() => addTool(tool)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 2,
                        background: CATEGORY_COLORS[tool.category],
                      }}
                    />
                    <span className="font-mono">{tool.name}</span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: CATEGORY_COLORS[tool.category],
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: `${CATEGORY_COLORS[tool.category]}15`,
                    }}
                  >
                    {CATEGORY_LABELS[tool.category]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              Token Breakdown
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 13,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  Descriptions
                </span>
                <span className="font-mono">
                  {formatTokenCount(descriptionTokens)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  Parameters
                </span>
                <span className="font-mono">
                  {formatTokenCount(parameterTokens)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>
                  Results
                </span>
                <span className="font-mono" style={{ color: 'var(--danger)' }}>
                  {formatTokenCount(resultTokens)}
                </span>
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(0,229,160,0.1)',
                  paddingTop: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                }}
              >
                <span>Total MCP Overhead</span>
                <span
                  className="font-mono"
                  style={{
                    color: getContextHealthColor(usedPercentage),
                  }}
                >
                  {formatTokenCount(totalToolTokens + resultTokens)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
