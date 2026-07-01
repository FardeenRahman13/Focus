'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────
interface Task {
  id: string;
  text: string;
  done: boolean;
}

// ─── Section heading ─────────────────────────────────────
function SectionTitle({ children }: { children: string }) {
  return (
    <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e0e0e0', marginBottom: 20, letterSpacing: '-0.3px' }}>
      {children}
    </h2>
  );
}

// ─── Dice SVG ────────────────────────────────────────────
function DieFace({ value }: { value: number }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 22], [75, 22], [25, 50], [75, 50], [25, 78], [75, 78]],
  };
  return (
    <svg viewBox="0 0 100 100" width="110" height="110">
      <rect x="5" y="5" width="90" height="90" rx="16" fill="#1a1a1a" stroke="#7C3AED" strokeWidth="2.5" />
      {(dots[value] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="#7C3AED" />
      ))}
    </svg>
  );
}

// ─── Randomizer ──────────────────────────────────────────
function Randomizer() {
  const [options, setOptions] = useState<string[]>(['Study OS', 'Review notes', 'Practice problems']);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [diceVal, setDiceVal] = useState(1);
  const [rolling, setRolling] = useState(false);

  const addOption = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setOptions(prev => [...prev, trimmed]);
    setInput('');
  };

  const removeOption = (i: number) => {
    setOptions(prev => prev.filter((_, idx) => idx !== i));
    if (result && options[i] === result) setResult(null);
  };

  const roll = () => {
    if (options.length === 0) return;
    setRolling(true);
    setResult(null);
    let count = 0;
    const flicker = setInterval(() => {
      setDiceVal(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(flicker);
        const picked = options[Math.floor(Math.random() * options.length)];
        setDiceVal(Math.floor(Math.random() * 6) + 1);
        setResult(picked);
        setRolling(false);
      }
    }, 80);
  };

  return (
    <div className="card" style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 28 }}>
      <SectionTitle>Randomizer</SectionTitle>
      <div style={{ marginBottom: 16 }}>
        {options.length === 0 && <p style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>No options yet.</p>}
        {options.map((opt, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#1a1a1a', borderRadius: 8, padding: '8px 12px', marginBottom: 6
          }}>
            <span style={{ fontSize: 14, color: '#ddd' }}>{opt}</span>
            <button onClick={() => removeOption(i)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 0 0 8px' }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addOption()}
          placeholder="Add an option..."
          style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#f0f0f0', fontSize: 14, outline: 'none' }}
        />
        <button onClick={addOption} style={{ background: '#7C3AED', border: 'none', borderRadius: 8, padding: '9px 16px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Add</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ transform: rolling ? `rotate(${Math.random() * 20 - 10}deg)` : 'none', transition: rolling ? 'none' : 'transform 0.3s ease' }}>
          <DieFace value={diceVal} />
        </div>
        <button onClick={roll} disabled={options.length === 0 || rolling} style={{
          background: options.length === 0 ? '#2a2a2a' : '#7C3AED', border: 'none', borderRadius: 10, padding: '12px 32px',
          color: options.length === 0 ? '#555' : '#fff', fontWeight: 700, fontSize: 15, cursor: options.length === 0 ? 'not-allowed' : 'pointer',
        }}>
          {rolling ? 'Rolling...' : 'Roll'}
        </button>
        {result && (
          <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>You got</p>
            <p style={{ color: '#f0f0f0', fontWeight: 700, fontSize: 17 }}>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pomodoro ────────────────────────────────────────────
const MODES = {
  work:  { label: 'Focus',       duration: 25 * 60 },
  short: { label: 'Short Break', duration:  5 * 60 },
  long:  { label: 'Long Break',  duration: 15 * 60 },
} as const;
type Mode = keyof typeof MODES;

function Pomodoro({ onSessionComplete }: { onSessionComplete: (mins: number) => void }) {
  const [mode, setMode] = useState<Mode>('work');
  const [seconds, setSeconds] = useState(MODES.work.duration);
  const [totalSeconds, setTotalSeconds] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((m: Mode) => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    setSeconds(MODES[m].duration);
    setTotalSeconds(MODES[m].duration);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current!); setRunning(false); onSessionComplete(Math.round(totalSeconds / 60)); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const pct = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const R = 68;
  const circumference = 2 * Math.PI * R;

  const applyCustom = () => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 240) {
      setRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const secs = mins * 60;
      setSeconds(secs);
      setTotalSeconds(secs);
      setCustomMinutes('');
    }
  };

  return (
    <div className="card" style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 28 }}>
      <SectionTitle>Pomodoro</SectionTitle>
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button key={m} onClick={() => reset(m)} style={{
            flex: 1, background: mode === m ? '#7C3AED' : '#1a1a1a',
            border: '1px solid', borderColor: mode === m ? '#7C3AED' : '#2a2a2a',
            borderRadius: 8, padding: '7px 4px', color: mode === m ? '#fff' : '#666',
            fontWeight: 600, fontSize: 12, cursor: 'pointer'
          }}>{MODES[m].label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ position: 'relative', width: 160, height: 160 }}>
          <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r={R} fill="none" stroke="#1f1f1f" strokeWidth="8" />
            <circle cx="80" cy="80" r={R} fill="none" stroke="#7C3AED" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 38, fontWeight: 700, color: '#f0f0f0', letterSpacing: 2, lineHeight: 1 }}>{mm}:{ss}</span>
            <span style={{ color: '#555', fontSize: 12, lineHeight: 1 }}>{MODES[mode].label}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setRunning(r => !r)} style={{
            background: '#7C3AED', border: 'none', borderRadius: 10,
            padding: '11px 28px', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', minWidth: 100
          }}>{running ? 'Pause' : seconds === 0 ? 'Done' : 'Start'}</button>
          <button onClick={() => reset(mode)} style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10,
            padding: '11px 18px', color: '#666', fontWeight: 600, fontSize: 14, cursor: 'pointer'
          }}>Reset</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="text" inputMode="numeric" value={customMinutes}
            onChange={e => setCustomMinutes(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && applyCustom()}
            placeholder="Custom mins"
            style={{ width: 110, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '7px 10px', color: '#f0f0f0', fontSize: 13, outline: 'none' }}
          />
          <button onClick={applyCustom} style={{
            background: 'none', border: '1px solid #7C3AED', borderRadius: 8,
            padding: '7px 14px', color: '#7C3AED', fontWeight: 600, fontSize: 13, cursor: 'pointer'
          }}>Set</button>
        </div>
      </div>
    </div>
  );
}

// ─── Task List ────────────────────────────────────────────
function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Review Chapter 3 notes', done: false },
    { id: '2', text: 'Solve past paper questions', done: false },
  ]);
  const [input, setInput] = useState('');

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text: trimmed, done: false }]);
    setInput('');
  };

  const toggle = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const clearDone = () => setTasks(prev => prev.filter(t => !t.done));
  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div className="card" style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <SectionTitle>Tasks</SectionTitle>
        {doneCount > 0 && (
          <button onClick={clearDone} style={{ background: 'none', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', marginTop: -20 }}>
            Clear done ({doneCount})
          </button>
        )}
      </div>
      {tasks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#555', fontSize: 12 }}>{doneCount}/{tasks.length} done</span>
            <span style={{ color: '#7C3AED', fontSize: 12, fontWeight: 600 }}>{Math.round((doneCount / tasks.length) * 100)}%</span>
          </div>
          <div style={{ background: '#1f1f1f', borderRadius: 4, height: 4 }}>
            <div style={{ background: '#7C3AED', borderRadius: 4, height: '100%', width: `${(doneCount / tasks.length) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}
      <div style={{ marginBottom: 16, maxHeight: 280, overflowY: 'auto' }}>
        {tasks.length === 0 && <p style={{ color: '#555', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nothing here. Add a task below.</p>}
        {tasks.map(task => (
          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: '1px solid #1a1a1a' }}>
            <button onClick={() => toggle(task.id)} style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
              background: task.done ? '#7C3AED' : 'transparent',
              border: task.done ? '2px solid #7C3AED' : '2px solid #3a3a3a',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 11, fontWeight: 700
            }}>{task.done ? '✓' : ''}</button>
            <span style={{ flex: 1, fontSize: 14, color: task.done ? '#444' : '#ddd', textDecoration: task.done ? 'line-through' : 'none', transition: 'color 0.2s' }}>{task.text}</span>
            <button onClick={() => remove(task.id)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="New task..."
          style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#f0f0f0', fontSize: 14, outline: 'none' }}
        />
        <button onClick={addTask} style={{ background: '#7C3AED', border: 'none', borderRadius: 8, padding: '9px 16px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Add</button>
      </div>
    </div>
  );
}

// ─── Calendar + Focus Chart ──────────────────────────────
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const STORAGE_FOCUS = 'focustools-focus-log'; // { "2025-07-01": 95 } minutes per day

function getWeekDays(): string[] {
  // Returns Mon–Sun of the current ISO week (Mon = start)
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function loadFocusLog(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_FOCUS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Prune keys older than 14 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const pruned: Record<string, number> = {};
    Object.entries(parsed).forEach(([k, v]) => { if (k >= cutoffStr) pruned[k] = v as number; });
    return pruned;
  } catch { return {}; }
}

function saveFocusLog(log: Record<string, number>) {
  try { localStorage.setItem(STORAGE_FOCUS, JSON.stringify(log)); } catch {}
}

function FocusChart({ log }: { log: Record<string, number> }) {
  const week = getWeekDays(); // 7 date strings Mon–Sun
  const todayStr = new Date().toISOString().slice(0, 10);

  const data = week.map(d => ({ date: d, mins: log[d] || 0 }));
  const pastData = data.filter(d => d.date <= todayStr);
  const avgMins = pastData.length > 0
    ? Math.round(pastData.reduce((a, b) => a + b.mins, 0) / pastData.filter(d => d.mins > 0).length || 0)
    : 0;

  // Y-axis ticks in minutes: 0, 30, 60, 90, 120, 150, 180
  const maxY = 180;
  const yTicks = [0, 30, 60, 90, 120, 150, 180];

  // Chart area dims
  const W = 400, H = 160;
  const PAD_L = 44, PAD_B = 28, PAD_T = 12, PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const xPos = (i: number) => PAD_L + (i / 6) * chartW;
  const yPos = (mins: number) => PAD_T + chartH - Math.min(mins, maxY) / maxY * chartH;

  // Build SVG polyline for past days with data
  const points = data
    .map((d, i) => ({ x: xPos(i), y: yPos(d.mins), hasMins: d.mins > 0, isPast: d.date <= todayStr }))

  const linePoints = points
    .filter(p => p.isPast)
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  const formatMins = (m: number) => {
    if (m === 0) return '0';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? `${h}h` : `${h}h${rem}m`;
  };

  const today = new Date();

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
        <div>
          <p style={{ color: '#7C3AED', fontWeight: 700, fontSize: 20, margin: 0, lineHeight: 1 }}>
            {formatMins(data.find(d => d.date === todayStr)?.mins || 0)}
          </p>
          <p style={{ color: '#555', fontSize: 11, margin: '2px 0 0' }}>today</p>
        </div>
        <div>
          <p style={{ color: '#7C3AED', fontWeight: 700, fontSize: 20, margin: 0, lineHeight: 1 }}>
            {formatMins(avgMins)}
          </p>
          <p style={{ color: '#555', fontSize: 11, margin: '2px 0 0' }}>avg / day</p>
        </div>
        <div>
          <p style={{ color: '#7C3AED', fontWeight: 700, fontSize: 20, margin: 0, lineHeight: 1 }}>
            {formatMins(data.reduce((a, b) => a + b.mins, 0))}
          </p>
          <p style={{ color: '#555', fontSize: 11, margin: '2px 0 0' }}>this week</p>
        </div>
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
        {/* Y grid lines + labels */}
        {yTicks.map(t => (
          <g key={t}>
            <line
              x1={PAD_L} y1={yPos(t)} x2={W - PAD_R} y2={yPos(t)}
              stroke={t === 0 ? '#2a2a2a' : '#1a1a1a'} strokeWidth={1}
            />
            <text x={PAD_L - 6} y={yPos(t) + 4} textAnchor="end" fontSize={9} fill="#444">
              {t === 0 ? '0' : t < 60 ? `${t}m` : `${t/60}h`}
            </text>
          </g>
        ))}

        {/* Area fill under the line */}
        {linePoints && (
          <polygon
            points={`${xPos(0)},${yPos(0)} ${linePoints} ${xPos(points.filter(p => p.isPast).length - 1)},${yPos(0)}`}
            fill="rgba(124,58,237,0.08)"
          />
        )}

        {/* Line */}
        {linePoints && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#7C3AED"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Average dashed line */}
        {avgMins > 0 && (
          <line
            x1={PAD_L} y1={yPos(avgMins)} x2={W - PAD_R} y2={yPos(avgMins)}
            stroke="#3b1f6e" strokeWidth={1} strokeDasharray="4 3"
          />
        )}

        {/* Data points */}
        {points.map((p, i) => {
          const d = data[i];
          const isToday = d.date === todayStr;
          const isFuture = d.date > todayStr;
          return (
            <g key={i}>
              {!isFuture && (
                <circle
                  cx={p.x} cy={p.y} r={isToday ? 4 : 3}
                  fill={d.mins > 0 ? '#7C3AED' : '#2a2a2a'}
                  stroke={isToday ? '#a855f7' : 'none'}
                  strokeWidth={isToday ? 2 : 0}
                />
              )}
            </g>
          );
        })}

        {/* X axis day labels */}
        {data.map((d, i) => {
          const date = new Date(d.date + 'T00:00:00');
          const isToday = d.date === todayStr;
          const isFuture = d.date > todayStr;
          const dayName = DAYS_SHORT[date.getDay()].slice(0, 3);
          const dateNum = date.getDate();
          return (
            <g key={i}>
              <text
                x={xPos(i)} y={H - 10}
                textAnchor="middle" fontSize={9}
                fill={isToday ? '#7C3AED' : isFuture ? '#333' : '#555'}
                fontWeight={isToday ? 700 : 400}
              >
                {dayName}
              </text>
              <text
                x={xPos(i)} y={H - 1}
                textAnchor="middle" fontSize={8}
                fill={isToday ? '#7C3AED' : isFuture ? '#2a2a2a' : '#444'}
                fontWeight={isToday ? 700 : 400}
              >
                {dateNum}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Week label */}
      <p style={{ color: '#333', fontSize: 10, textAlign: 'right', marginTop: 4, marginBottom: 0 }}>
        Week of {new Date(week[0] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
    </div>
  );
}

function CalendarAndChart({ focusLog }: { focusLog: Record<string, number> }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const today = now.getDate();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const firstDow = new Date(thisYear, thisMonth, 1).getDay();
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, marginTop: 20 }}>

      {/* Calendar */}
      <div className="card" style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#7C3AED', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>
            {MONTHS[thisMonth]} {thisYear}
          </p>
          <p style={{ color: '#f0f0f0', fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-1px' }}>{today}</p>
          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>{DAYS_SHORT[now.getDay()]}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
          {DAYS_SHORT.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#444', fontWeight: 600, padding: '2px 0' }}>{d[0]}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            const isToday = day === today;
            return (
              <div key={i} style={{
                textAlign: 'center', padding: '5px 2px', borderRadius: 6, fontSize: 12,
                background: isToday ? '#7C3AED' : 'transparent',
                color: isToday ? '#fff' : day ? '#aaa' : 'transparent',
                fontWeight: isToday ? 700 : 400,
              }}>{day ?? ''}</div>
            );
          })}
        </div>
      </div>

      {/* Focus time chart */}
      <div className="card" style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 24 }}>
        <SectionTitle>Focus Time</SectionTitle>
        <FocusChart log={focusLog} />
      </div>
    </div>
  );
}


// ─── App ─────────────────────────────────────────────────
export default function Home() {
  const [focusLog, setFocusLog] = useState<Record<string, number>>({});

  useEffect(() => {
    setFocusLog(loadFocusLog());
  }, []);

  const handleSessionComplete = useCallback((mins: number) => {
    setFocusLog(prev => {
      const key = new Date().toISOString().slice(0, 10);
      const next = { ...prev, [key]: (prev[key] || 0) + mins };
      saveFocusLog(next);
      return next;
    });
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-1px', marginBottom: 4 }}>
            focus<span style={{ color: '#7C3AED' }}>.</span>tools
          </h1>
          <p style={{ color: '#555', fontSize: 14 }}>Roll a task. Time your session. Stay on track.</p>
        </div>

        {/* Top 3 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <Randomizer />
          <Pomodoro onSessionComplete={handleSessionComplete} />
          <TaskList />
        </div>

        {/* Calendar + Focus Chart */}
        <CalendarAndChart focusLog={focusLog} />


        <p style={{ color: '#2a2a2a', fontSize: 12, textAlign: 'center', marginTop: 40 }}>built for deep work</p>
      </div>
    </main>
  );
}
