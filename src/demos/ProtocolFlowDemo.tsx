import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROTOCOL_SCENARIOS } from '../data/protocol';
import type { ProtocolMessage, ProtocolScenario } from '../data/protocol';
import { formatTokenCount, formatLatency } from '../utils/format';

const LANE_WIDTH = 200;
const MESSAGE_HEIGHT = 60;
const MESSAGE_GAP = 16;
const ARROW_AREA = 200;
const SVG_WIDTH = LANE_WIDTH * 2 + ARROW_AREA;

function getMessageColor(msg: ProtocolMessage): string {
  if (msg.failure) {
    if (msg.failure.type === 'timeout') return 'var(--warning)';
    if (msg.failure.type === 'wrong_tool') return 'var(--warning)';
    return 'var(--danger)';
  }
  if (msg.type === 'error') return 'var(--danger)';
  if (msg.type === 'notification') return 'var(--protocol-purple)';
  if (msg.direction === 'client-to-server') return 'var(--protocol-blue)';
  return 'var(--accent)';
}

function getMessageBg(msg: ProtocolMessage): string {
  if (msg.failure) {
    if (msg.failure.type === 'timeout') return 'var(--warning-dim)';
    return 'var(--danger-dim)';
  }
  if (msg.type === 'error') return 'var(--danger-dim)';
  if (msg.type === 'notification') return 'var(--protocol-purple-dim)';
  if (msg.direction === 'client-to-server') return 'var(--protocol-blue-dim)';
  return 'var(--accent-glow)';
}

interface FlowProps {
  scenario: ProtocolScenario;
  visibleCount: number;
}

function FlowDiagram({ scenario, visibleCount }: FlowProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const visibleMessages = scenario.messages.slice(0, visibleCount);
  const totalHeight =
    visibleMessages.length * (MESSAGE_HEIGHT + MESSAGE_GAP) + 80;

  return (
    <div style={{ position: 'relative', overflowX: 'auto' }}>
      <svg
        ref={svgRef}
        width={SVG_WIDTH}
        height={totalHeight}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Lane headers */}
        <text
          x={LANE_WIDTH / 2}
          y={24}
          textAnchor="middle"
          fill="var(--protocol-blue)"
          fontSize={14}
          fontWeight={600}
          fontFamily="Inter, system-ui, sans-serif"
        >
          Client (LLM)
        </text>
        <text
          x={LANE_WIDTH + ARROW_AREA + LANE_WIDTH / 2}
          y={24}
          textAnchor="middle"
          fill="var(--accent)"
          fontSize={14}
          fontWeight={600}
          fontFamily="Inter, system-ui, sans-serif"
        >
          MCP Server
        </text>

        {/* Lane lines */}
        <line
          x1={LANE_WIDTH / 2}
          y1={40}
          x2={LANE_WIDTH / 2}
          y2={totalHeight}
          stroke="rgba(74, 158, 255, 0.2)"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        <line
          x1={LANE_WIDTH + ARROW_AREA + LANE_WIDTH / 2}
          y1={40}
          x2={LANE_WIDTH + ARROW_AREA + LANE_WIDTH / 2}
          y2={totalHeight}
          stroke="rgba(0, 229, 160, 0.2)"
          strokeWidth={2}
          strokeDasharray="4 4"
        />

        {/* Messages */}
        {visibleMessages.map((msg, i) => {
          const y = 56 + i * (MESSAGE_HEIGHT + MESSAGE_GAP);
          const isClientToServer = msg.direction === 'client-to-server';
          const color = getMessageColor(msg);
          const startX = isClientToServer
            ? LANE_WIDTH / 2
            : LANE_WIDTH + ARROW_AREA + LANE_WIDTH / 2;
          const endX = isClientToServer
            ? LANE_WIDTH + ARROW_AREA + LANE_WIDTH / 2
            : LANE_WIDTH / 2;
          const arrowDir = isClientToServer ? 1 : -1;

          return (
            <g key={msg.id}>
              {/* Arrow line */}
              <motion.line
                x1={startX}
                y1={y + MESSAGE_HEIGHT / 2}
                x2={endX}
                y2={y + MESSAGE_HEIGHT / 2}
                stroke={color}
                strokeWidth={2}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              />
              {/* Arrowhead */}
              <motion.polygon
                points={
                  arrowDir > 0
                    ? `${endX - 8},${y + MESSAGE_HEIGHT / 2 - 5} ${endX},${y + MESSAGE_HEIGHT / 2} ${endX - 8},${y + MESSAGE_HEIGHT / 2 + 5}`
                    : `${endX + 8},${y + MESSAGE_HEIGHT / 2 - 5} ${endX},${y + MESSAGE_HEIGHT / 2} ${endX + 8},${y + MESSAGE_HEIGHT / 2 + 5}`
                }
                fill={color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: i * 0.08 + 0.3 }}
              />

              {/* Label on arrow */}
              <motion.text
                x={SVG_WIDTH / 2}
                y={y + MESSAGE_HEIGHT / 2 - 8}
                textAnchor="middle"
                fill={color}
                fontSize={12}
                fontWeight={600}
                fontFamily="'JetBrains Mono', monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.1 }}
              >
                {msg.label}
              </motion.text>

              {/* Token cost under arrow */}
              {msg.tokenCost > 0 && (
                <motion.text
                  x={SVG_WIDTH / 2}
                  y={y + MESSAGE_HEIGHT / 2 + 16}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize={10}
                  fontFamily="'JetBrains Mono', monospace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 + 0.2 }}
                >
                  +{formatTokenCount(msg.tokenCost)} tokens |{' '}
                  {formatLatency(msg.latencyMs)}
                </motion.text>
              )}

              {/* Failure/timeout indicator */}
              {msg.failure && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 + 0.3, type: 'spring' }}
                >
                  <rect
                    x={SVG_WIDTH / 2 - 12}
                    y={y + MESSAGE_HEIGHT / 2 + 20}
                    width={24}
                    height={16}
                    rx={4}
                    fill={
                      msg.failure.type === 'timeout'
                        ? 'var(--warning)'
                        : 'var(--danger)'
                    }
                  />
                  <text
                    x={SVG_WIDTH / 2}
                    y={y + MESSAGE_HEIGHT / 2 + 32}
                    textAnchor="middle"
                    fill="var(--bg-primary)"
                    fontSize={9}
                    fontWeight={700}
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {msg.failure.type === 'timeout' ? '\u23F1' : '\u2718'}
                  </text>
                </motion.g>
              )}

              {/* Time dots for latency */}
              {msg.latencyMs > 1000 && (
                <motion.text
                  x={
                    isClientToServer
                      ? endX + 12
                      : startX + 12
                  }
                  y={y + MESSAGE_HEIGHT / 2 + 4}
                  fill="var(--warning)"
                  fontSize={10}
                  fontFamily="'JetBrains Mono', monospace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 + 0.4 }}
                >
                  {formatLatency(msg.latencyMs)}
                </motion.text>
              )}
            </g>
          );
        })}

        {/* Annotations */}
        {scenario.annotations
          .filter((a) => {
            const msgIdx = scenario.messages.findIndex(
              (m) => m.id === a.afterMessageId
            );
            return msgIdx < visibleCount;
          })
          .map((annotation, i) => {
            const msgIdx = scenario.messages.findIndex(
              (m) => m.id === annotation.afterMessageId
            );
            const y =
              56 +
              msgIdx * (MESSAGE_HEIGHT + MESSAGE_GAP) +
              MESSAGE_HEIGHT +
              4;
            const bgColor =
              annotation.type === 'danger'
                ? 'var(--danger-dim)'
                : annotation.type === 'warning'
                  ? 'var(--warning-dim)'
                  : 'var(--accent-glow)';
            const textColor =
              annotation.type === 'danger'
                ? 'var(--danger)'
                : annotation.type === 'warning'
                  ? 'var(--warning)'
                  : 'var(--accent)';

            return (
              <motion.foreignObject
                key={i}
                x={60}
                y={y}
                width={SVG_WIDTH - 120}
                height={28}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (msgIdx + 1) * 0.08 + 0.2 }}
              >
                <div
                  style={{
                    background: bgColor,
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontSize: 11,
                    color: textColor,
                    textAlign: 'center',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {annotation.text}
                </div>
              </motion.foreignObject>
            );
          })}
      </svg>
    </div>
  );
}

export function ProtocolFlowDemo() {
  const [activeScenarioId, setActiveScenarioId] = useState(
    PROTOCOL_SCENARIOS[0].id
  );
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMessage, setSelectedMessage] =
    useState<ProtocolMessage | null>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = PROTOCOL_SCENARIOS.find(
    (s) => s.id === activeScenarioId
  )!;

  const totalTokens = scenario.messages
    .slice(0, visibleMessages)
    .reduce((sum, m) => sum + m.tokenCost, 0);

  const totalLatency = scenario.messages
    .slice(0, visibleMessages)
    .reduce((sum, m) => sum + m.latencyMs, 0);

  const errorCount = scenario.messages
    .slice(0, visibleMessages)
    .filter((m) => m.type === 'error' || m.failure).length;

  const stepForward = useCallback(() => {
    setVisibleMessages((prev) => {
      if (prev >= scenario.messages.length) {
        setIsPlaying(false);
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current);
          playIntervalRef.current = null;
        }
        return prev;
      }
      return prev + 1;
    });
  }, [scenario.messages.length]);

  const play = useCallback(() => {
    if (visibleMessages >= scenario.messages.length) {
      setVisibleMessages(0);
    }
    setIsPlaying(true);
    playIntervalRef.current = setInterval(() => {
      stepForward();
    }, 800);
  }, [stepForward, visibleMessages, scenario.messages.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  const resetFlow = useCallback(() => {
    pause();
    setVisibleMessages(0);
    setSelectedMessage(null);
  }, [pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  // Reset when scenario changes
  useEffect(() => {
    resetFlow();
  }, [activeScenarioId, resetFlow]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Description */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--danger)',
          }}
        >
          Pitfall 3: Protocol Flow Assumptions
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          MCP is request-response, but AI agents are conversational. No
          streaming for long-running tools, crude error handling, and no built-in
          state management between calls. Watch how these limitations play out
          in practice.
        </p>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {PROTOCOL_SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={`tab-button ${activeScenarioId === s.id ? 'active' : ''}`}
            onClick={() => setActiveScenarioId(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left: Flow Diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Scenario Info */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {scenario.name}
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              {scenario.description}
            </p>
          </div>

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            {isPlaying ? (
              <button className="btn" onClick={pause}>
                {'\u23F8'} Pause
              </button>
            ) : (
              <button className="btn" onClick={play}>
                {'\u25B6'} Play
              </button>
            )}
            <button
              className="btn"
              onClick={stepForward}
              disabled={visibleMessages >= scenario.messages.length}
              style={{
                opacity:
                  visibleMessages >= scenario.messages.length ? 0.4 : 1,
              }}
            >
              Step {'\u27A1'}
            </button>
            <button className="btn btn-danger" onClick={resetFlow}>
              Reset
            </button>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              {visibleMessages}/{scenario.messages.length} messages
            </span>
          </div>

          {/* SVG Flow */}
          <div
            className="glass-card"
            style={{
              padding: '20px',
              overflow: 'auto',
              maxHeight: '600px',
            }}
          >
            <FlowDiagram
              scenario={scenario}
              visibleCount={visibleMessages}
            />
          </div>
        </div>

        {/* Right: Stats and Message Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Running Stats */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 12,
              }}
            >
              RUNNING STATS
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--warning)',
                  }}
                >
                  {formatTokenCount(totalTokens)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  tokens used
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--protocol-blue)',
                  }}
                >
                  {formatLatency(totalLatency)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  total latency
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  {visibleMessages}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  messages
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color:
                      errorCount > 0
                        ? 'var(--danger)'
                        : 'var(--text-muted)',
                  }}
                >
                  {errorCount}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  errors
                </div>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 12,
              }}
            >
              MESSAGE LOG
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              <AnimatePresence>
                {scenario.messages
                  .slice(0, visibleMessages)
                  .map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: getMessageBg(msg),
                        border: `1px solid ${getMessageColor(msg)}22`,
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'background 0.15s ease',
                      }}
                      onClick={() => setSelectedMessage(msg)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: 'var(--text-muted)',
                            }}
                          >
                            {i + 1}.
                          </span>
                          <span
                            className="font-mono"
                            style={{
                              color: getMessageColor(msg),
                              fontWeight: 500,
                            }}
                          >
                            {msg.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            color: getMessageColor(msg),
                          }}
                        >
                          {msg.direction === 'client-to-server'
                            ? '\u2192'
                            : '\u2190'}
                        </span>
                      </div>
                      {msg.failure && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: 'var(--danger)',
                          }}
                        >
                          {msg.failure.message.slice(0, 60)}...
                        </div>
                      )}
                    </motion.div>
                  ))}
              </AnimatePresence>

              {visibleMessages === 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    padding: 16,
                  }}
                >
                  Press Play or Step to begin
                </p>
              )}
            </div>
          </div>

          {/* Selected Message Detail */}
          <AnimatePresence>
            {selectedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="glass-card"
                style={{ padding: '16px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                    }}
                  >
                    MESSAGE DETAIL
                  </div>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                    onClick={() => setSelectedMessage(null)}
                  >
                    {'\u2715'}
                  </button>
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: getMessageColor(selectedMessage),
                    marginBottom: 8,
                  }}
                >
                  {selectedMessage.label}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    marginBottom: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {selectedMessage.description}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  <span>
                    Tokens:{' '}
                    <span
                      className="font-mono"
                      style={{ color: 'var(--warning)' }}
                    >
                      {formatTokenCount(selectedMessage.tokenCost)}
                    </span>
                  </span>
                  <span>
                    Latency:{' '}
                    <span
                      className="font-mono"
                      style={{ color: 'var(--protocol-blue)' }}
                    >
                      {formatLatency(selectedMessage.latencyMs)}
                    </span>
                  </span>
                </div>
                {selectedMessage.payload && (
                  <pre
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.3)',
                      overflow: 'auto',
                      maxHeight: 120,
                      lineHeight: 1.4,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {selectedMessage.payload}
                  </pre>
                )}
                {selectedMessage.failure && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'var(--danger-dim)',
                      fontSize: 12,
                      color: 'var(--danger)',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>
                      {selectedMessage.failure.type.toUpperCase()}:
                    </strong>{' '}
                    {selectedMessage.failure.message}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
