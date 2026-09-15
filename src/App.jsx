import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

const C = {
  bg: "#10141A",
  surface: "#1A2029",
  border: "#2A323D",
  text: "#ECE7DC",
  textMuted: "#8D96A3",
  accent: "#4FB3A9",
  accent2: "#E3B54F",
  danger: "#E0684A",
  good: "#6FBF73",
};

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');";
const HEAD_FONT = "'Space Grotesk', sans-serif";
const MONO_FONT = "'IBM Plex Mono', monospace";

const GAMES = [
  { id: "exchange", num: 1, title: "Money Exchange 1", blurb: "Choose how much of $10 to trust to a partner, then reflect on the exchange." },
  { id: "keypress", num: 2, title: "Keypresses", blurb: "Tap from GO to STOP as quickly as possible, without starting early or continuing late." },
  { id: "balloon", num: 3, title: "Balloons", blurb: "Pump recurring balloons, then cash out before each hidden pop point." },
  { id: "exchange2", num: 4, title: "Money Exchange 2", blurb: "Observe one allocation, then make and rate your own give-or-take decision." },
  { id: "digits", num: 5, title: "Digits", blurb: "Recall forward digit sequences as an adaptive staircase tests your memory span." },
  { id: "easyhard", num: 6, title: "Easy or Hard", blurb: "Choose a low-effort sure reward or work harder for a larger one with changing odds." },
  { id: "stop", num: 7, title: "Stop", blurb: "Press for red circles and hold back for green in a fast go/no-go stream." },
  { id: "cards", num: 8, title: "Cards", blurb: "Draw from four hidden decks and learn which ones help your balance over time." },
  { id: "arrows", num: 9, title: "Arrows", blurb: "Follow middle or side arrows as a colour cue switches the active rule." },
  { id: "lengths", num: 10, title: "Lengths", blurb: "Judge subtly short or long cartoon mouths while rewards quietly favour one response." },
  { id: "towers", num: 11, title: "Towers", blurb: "Move five labelled discs to match a target pattern before time runs out." },
  { id: "faces", num: 12, title: "Faces", blurb: "Read facial expressions and use short situations to resolve close emotions." },
  { id: "memory", num: 13, title: "Memory Cards", blurb: "Watch a sequence light up, then repeat it back." },
  { id: "sort", num: 14, title: "Card Sort", blurb: "Sort cards by a rule that shifts without warning." },
  { id: "reaction", num: 15, title: "Reaction Timer", blurb: "Tap the instant the circle turns green." },
  { id: "magnitudes", num: 16, title: "Magnitudes", blurb: "Pick the larger number, again and again, at speed." },
  { id: "sequences", num: 17, title: "Sequences", blurb: "Spot the pattern and predict what comes next." },
];

const BALLOON_TYPES = [
  { color: "#4FB3A9", label: "Teal", min: 1, max: 30 },
  { color: "#E3B54F", label: "Gold", min: 1, max: 16 },
  { color: "#E0684A", label: "Coral", min: 1, max: 9 },
];
const PUMP_VALUE = 5;

const CARD_SHAPES = ["circle", "square", "triangle", "star"];

const RULE_COLORS = {
  blue: { color: "#2D5FA6", label: "BLUE", shapeIdx: 0 },
  black: { color: "#15171C", label: "BLACK", shapeIdx: 1 },
  red: { color: "#C1443A", label: "RED", shapeIdx: 2 },
};
const RULE_KEYS = Object.keys(RULE_COLORS);

/* ---------- shared bits ---------- */

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2.5 text-sm font-medium transition-opacity"
      style={{
        background: C.accent,
        color: "#0D1116",
        borderRadius: 5,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 text-sm font-medium flex items-center gap-2 justify-center"
      style={{ background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 5 }}
    >
      {children}
    </button>
  );
}

function GameHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <button onClick={onBack} className="flex items-center gap-1 text-sm" style={{ color: C.textMuted }}>
        <ArrowLeft size={16} /> Back
      </button>
      <span style={{ color: C.border }}>/</span>
      <span style={{ fontWeight: 600 }}>{title}</span>
    </div>
  );
}

function InstructionsScreen({ title, children, onStart, cta }) {
  return (
    <div className="max-w-xl mx-auto text-center py-10 px-2">
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{title}</h2>
      <div style={{ color: C.textMuted, lineHeight: 1.6, marginBottom: 32, fontSize: 14.5 }}>{children}</div>
      <PrimaryButton onClick={onStart}>{cta || "Start"}</PrimaryButton>
    </div>
  );
}

function DoneScreen({ title, stats, onBack }) {
  return (
    <div className="max-w-xl mx-auto text-center py-10 px-2">
      <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: C.accent2, letterSpacing: 1, marginBottom: 8 }}>
        COMPLETE
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{title}</h2>
      <div className="grid grid-cols-2 gap-3 mb-10">
        {stats.map((s, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 16 }}>
            <div style={{ fontFamily: MONO_FONT, fontSize: 21, fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <PrimaryButton onClick={onBack}>Back to games</PrimaryButton>
    </div>
  );
}

function Shape({ shapeIdx, color, size = 16 }) {
  const shape = CARD_SHAPES[shapeIdx];
  if (shape === "circle") return <div style={{ width: size, height: size, borderRadius: "50%", background: color }} />;
  if (shape === "square") return <div style={{ width: size, height: size, background: color }} />;
  if (shape === "triangle")
    return (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        }}
      />
    );
  return <div style={{ color, fontSize: size, lineHeight: 1 }}>★</div>;
}

const CARD_COLORS = ["#D9694A", "#4FB3A9", "#6FBF73", "#E3B54F"];

function CardFace({ colorIdx, shapeIdx, countIdx }) {
  return (
    <div
      style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center", flexWrap: "wrap", width: 80, minHeight: 40 }}
    >
      {Array.from({ length: countIdx + 1 }).map((_, i) => (
        <Shape key={i} shapeIdx={shapeIdx} color={CARD_COLORS[colorIdx]} />
      ))}
    </div>
  );
}

function genSequenceQuestion() {
  const type = Math.floor(Math.random() * 3);
  let seq = [];
  let start = 1 + Math.floor(Math.random() * 10);
  if (type === 0) {
    const step = 1 + Math.floor(Math.random() * 8);
    seq = Array.from({ length: 6 }, (_, i) => start + i * step);
  } else if (type === 1) {
    const factor = 2 + Math.floor(Math.random() * 2);
    start = 1 + Math.floor(Math.random() * 4);
    seq = Array.from({ length: 6 }, (_, i) => start * Math.pow(factor, i));
  } else {
    const stepA = 1 + Math.floor(Math.random() * 5);
    const stepB = 1 + Math.floor(Math.random() * 5);
    seq = [start];
    for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 === 1 ? stepA : stepB));
  }
  const shown = seq.slice(0, 5);
  const answer = seq[5];
  const distractors = new Set();
  let guard = 0;
  while (distractors.size < 3 && guard < 50) {
    guard++;
    const delta = (Math.floor(Math.random() * 7) - 3) || 1;
    const d = answer + delta * (1 + Math.floor(Math.random() * 3));
    if (d !== answer && d > 0) distractors.add(d);
  }
  const options = shuffleArr([answer, ...distractors]);
  return { shown, answer, options };
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DECKS = [
  { reward: 100, penaltyChance: 0.5, penaltyMin: 150, penaltyMax: 350 },
  { reward: 100, penaltyChance: 0.1, penaltyMin: 1000, penaltyMax: 1500 },
  { reward: 50, penaltyChance: 0.5, penaltyMin: 25, penaltyMax: 75 },
  { reward: 50, penaltyChance: 0.1, penaltyMin: 150, penaltyMax: 350 },
];

const DISC_DEFS = [
  { letter: "A", color: "#D9694A" },
  { letter: "B", color: "#4FB3A9" },
  { letter: "C", color: "#6FBF73" },
  { letter: "D", color: "#E3B54F" },
  { letter: "E", color: "#6C93C7" },
];
const TOWER_CAPACITY = 5;

function randomArrangement() {
  const discs = [0, 1, 2, 3, 4];
  for (let i = discs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [discs[i], discs[j]] = [discs[j], discs[i]];
  }
  const towers = [[], [], []];
  discs.forEach((d) => {
    const t = Math.floor(Math.random() * 3);
    towers[t].push(d);
  });
  return towers;
}

function arrangementsEqual(a, b) {
  return a.every((tower, i) => tower.length === b[i].length && tower.every((d, j) => d === b[i][j]));
}

function CartoonFace({ width }) {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="60" fill="#F2F0EA" />
      <circle cx="48" cy="55" r="6" fill="#20242B" />
      <circle cx="92" cy="55" r="6" fill="#20242B" />
      <rect x={70 - width / 2} y="92" width={width} height="7" rx="3.5" fill="#20242B" />
    </svg>
  );
}

/* ---------- game: balloons ---------- */

function BalloonGame({ onBack, onFinish }) {
  const order = useMemo(() => [0, 1, 2, 0, 1, 2], []);
  const totalRounds = order.length;
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState("instructions");
  const [pumps, setPumps] = useState(0);
  const [popPoint, setPopPoint] = useState(0);
  const [bank, setBank] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [summary, setSummary] = useState(null);

  const type = BALLOON_TYPES[order[roundIdx]];
  const earnings = pumps * PUMP_VALUE;

  const beginRound = (idx) => {
    const t = BALLOON_TYPES[order[idx]];
    const pp = Math.floor(Math.random() * (t.max - t.min + 1)) + t.min;
    setPopPoint(pp);
    setPumps(0);
    setRoundIdx(idx);
    setPhase("playing");
  };

  const pump = () => {
    const next = pumps + 1;
    setPumps(next);
    if (next >= popPoint) {
      setHistory((h) => [...h, { round: roundIdx + 1, result: "popped", pumps: next, earned: 0 }]);
      setLastResult({ type: "popped", earned: 0 });
      setPhase("roundEnd");
    }
  };

  const cashOut = () => {
    setBank((b) => b + earnings);
    setHistory((h) => [...h, { round: roundIdx + 1, result: "cashed", pumps, earned: earnings }]);
    setLastResult({ type: "cashed", earned: earnings });
    setPhase("roundEnd");
  };

  const nextRound = () => {
    if (roundIdx + 1 >= totalRounds) {
      const poppedCount = history.filter((h) => h.result === "popped").length;
      setSummary({ bank, poppedCount });
      setPhase("done");
    } else {
      beginRound(roundIdx + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Balloons" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Pump up the balloon" onStart={() => beginRound(0)}>
          You'll see {totalRounds} balloons, one at a time. Each pump adds {PUMP_VALUE} points to that balloon. Cash
          out any time to bank the points — but if the balloon pops first, you lose them. There's no way to know in
          advance how much any balloon can take.
        </InstructionsScreen>
      )}
      {phase === "playing" && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
            Balloon {roundIdx + 1} of {totalRounds} · <span style={{ color: type.color }}>{type.label}</span>
          </div>
          <svg width="220" height="220" viewBox="0 0 220 220" className="mb-4">
            <ellipse
              cx="110"
              cy="110"
              rx={Math.min(28 + pumps * 4, 95)}
              ry={Math.min(34 + pumps * 4.5, 100)}
              fill={type.color}
              opacity="0.9"
            />
          </svg>
          <div style={{ fontFamily: MONO_FONT, fontSize: 28, fontWeight: 600, marginBottom: 2 }}>{earnings} pts</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 28 }}>
            {pumps} pump{pumps === 1 ? "" : "s"}
          </div>
          <div className="flex gap-3">
            <PrimaryButton onClick={pump}>Pump</PrimaryButton>
            <SecondaryButton onClick={cashOut}>Cash out</SecondaryButton>
          </div>
        </div>
      )}
      {phase === "roundEnd" && lastResult && (
        <div className="text-center py-10">
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            {lastResult.type === "popped" ? "Popped 💥" : `Cashed out ${lastResult.earned} pts`}
          </div>
          <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 28 }}>Bank total: {bank} pts</div>
          <PrimaryButton onClick={nextRound}>
            {roundIdx + 1 >= totalRounds ? "See results" : "Next balloon"}
          </PrimaryButton>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Balloons complete"
          stats={[
            { value: `${summary.bank}`, label: "Points banked" },
            { value: `${summary.poppedCount}/${totalRounds}`, label: "Balloons popped" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: money exchange 1 ---------- */

function ExchangeGame({ onBack, onFinish }) {
  const TOTAL_ROUNDS = 5;
  const ENDOWMENT = 10;
  const MULTIPLIER = 3;
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("instructions");
  const [sent, setSent] = useState(5);
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [summary, setSummary] = useState(null);

  const beginRound = (i) => {
    setRound(i);
    setSent(5);
    setPhase("deciding");
  };

  const send = () => {
    const tripled = sent * MULTIPLIER;
    const frac = Math.min(1, Math.max(0.1, 0.3 + 0.4 * (sent / ENDOWMENT) + (Math.random() * 0.3 - 0.15)));
    const returned = Math.round(tripled * frac);
    const earned = ENDOWMENT - sent + returned;
    const entry = { round: round + 1, sent, tripled, returned, earned };
    setHistory((h) => [...h, entry]);
    setLastResult(entry);
    setPhase("result");
  };

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      const total = history.reduce((s, h) => s + h.earned, 0);
      const avgSentPct = Math.round((history.reduce((s, h) => s + h.sent, 0) / (TOTAL_ROUNDS * ENDOWMENT)) * 100);
      setSummary({ total, avgSentPct });
      setPhase("done");
    } else {
      beginRound(round + 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Money Exchange 1" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Share with your partner" onStart={() => beginRound(0)}>
          Each of {TOTAL_ROUNDS} rounds, you get {ENDOWMENT} points. Decide how much to send to a partner — whatever
          you send is tripled before it reaches them. They then decide how much of it to send back. Whatever you
          don't send, you keep.
        </InstructionsScreen>
      )}
      {phase === "deciding" && (
        <div className="text-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
            Round {round + 1} of {TOTAL_ROUNDS}
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 34, fontWeight: 600, marginBottom: 6 }}>{sent} pts</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            to send · tripled to {sent * MULTIPLIER} pts · you keep {ENDOWMENT - sent} pts now
          </div>
          <input
            type="range"
            min="0"
            max={ENDOWMENT}
            value={sent}
            onChange={(e) => setSent(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.accent, marginBottom: 28 }}
          />
          <PrimaryButton onClick={send}>Send</PrimaryButton>
        </div>
      )}
      {phase === "result" && lastResult && (
        <div className="text-center py-6">
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20, lineHeight: 1.7 }}>
            You sent <b style={{ color: C.text }}>{lastResult.sent}</b>, tripled to{" "}
            <b style={{ color: C.text }}>{lastResult.tripled}</b>. Your partner returned{" "}
            <b style={{ color: C.text }}>{lastResult.returned}</b>.
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 26, fontWeight: 600, marginBottom: 28 }}>
            +{lastResult.earned} pts this round
          </div>
          <PrimaryButton onClick={nextRound}>{round + 1 >= TOTAL_ROUNDS ? "See results" : "Next round"}</PrimaryButton>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Money Exchange 1 complete"
          stats={[
            { value: `${summary.total}`, label: "Total points" },
            { value: `${summary.avgSentPct}%`, label: "Avg. sent" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: arrows ---------- */

function ArrowGame({ onBack, onFinish }) {
  const TOTAL = 18;
  const [phase, setPhase] = useState("instructions");
  const [display, setDisplay] = useState(null);
  const [trialNum, setTrialNum] = useState(0);
  const [summary, setSummary] = useState(null);
  const trialsRef = useRef([]);
  const idxRef = useRef(0);
  const startRef = useRef(0);
  const responsesRef = useRef([]);
  const timeoutRef = useRef(null);
  const answeredRef = useRef(false);

  const genTrials = () =>
    Array.from({ length: TOTAL }, () => {
      const ruleKey = RULE_KEYS[Math.floor(Math.random() * RULE_KEYS.length)];
      const sideDir = Math.random() < 0.5 ? "left" : "right";
      const congruent = Math.random() < 0.5;
      const middleDir = congruent ? sideDir : sideDir === "left" ? "right" : "left";
      const target = ruleKey === "red" ? sideDir : middleDir;
      return { ruleKey, sideDir, middleDir, congruent, target };
    });

  const finish = () => {
    const resp = responsesRef.current;
    const avgOf = (arr) => {
      const a = arr.filter((r) => r.rt !== null);
      return a.length ? Math.round(a.reduce((s, r) => s + r.rt, 0) / a.length) : null;
    };
    setSummary({
      accuracy: Math.round((resp.filter((r) => r.correct).length / resp.length) * 100),
      avgRt: avgOf(resp),
      congruentRt: avgOf(resp.filter((r) => r.congruent)),
      incongruentRt: avgOf(resp.filter((r) => !r.congruent)),
    });
    setPhase("done");
  };

  const handleResponse = (dir) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimeout(timeoutRef.current);
    const trial = trialsRef.current[idxRef.current];
    const rt = dir ? performance.now() - startRef.current : null;
    responsesRef.current.push({ ...trial, dir, rt, correct: dir === trial.target });
    setPhase("blank");
    setTimeout(() => {
      const next = idxRef.current + 1;
      if (next >= TOTAL) {
        finish();
      } else {
        idxRef.current = next;
        startTrial(next);
      }
    }, 200);
  };

  const startTrial = (i) => {
    const trial = trialsRef.current[i];
    setDisplay(trial);
    setTrialNum(i);
    setPhase("fixation");
    setTimeout(() => {
      answeredRef.current = false;
      setPhase("stimulus");
      startRef.current = performance.now();
      timeoutRef.current = setTimeout(() => handleResponse(null), 2200);
    }, 450);
  };

  const beginGame = () => {
    trialsRef.current = genTrials();
    idxRef.current = 0;
    responsesRef.current = [];
    startTrial(0);
  };

  useEffect(() => {
    if (phase !== "stimulus") return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") handleResponse("left");
      else if (e.key === "ArrowRight") handleResponse("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Arrows" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Follow the colour rule" onStart={beginGame}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Five arrows appear together. If the set is blue or black, respond to the middle arrow's direction.",
              "If the set is red, respond to the side arrows' direction.",
              "Press the left or right arrow key before the set changes. The arrows may agree or point in conflicting directions.",
              "A distinct shape sits beside every set as a colour-blind-friendly cue. On touch, use the left/right half-width buttons.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {(phase === "fixation" || phase === "stimulus" || phase === "blank") && display && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            Trial {trialNum + 1} of {TOTAL}
          </div>
          {phase === "fixation" && (
            <div style={{ height: 176, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 26, color: C.textMuted }}>+</div>
            </div>
          )}
          {(phase === "stimulus" || phase === "blank") && (
            <div
              style={{
                background: "#F2F0EA",
                borderRadius: 10,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                width: "100%",
                maxWidth: 380,
                opacity: phase === "blank" ? 0 : 1,
              }}
            >
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => {
                  const dir = i === 2 ? display.middleDir : display.sideDir;
                  const ruleInfo = RULE_COLORS[display.ruleKey];
                  return dir === "left" ? (
                    <ArrowLeft key={i} size={30} color={ruleInfo.color} strokeWidth={2.75} />
                  ) : (
                    <ArrowRight key={i} size={30} color={ruleInfo.color} strokeWidth={2.75} />
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shape shapeIdx={RULE_COLORS[display.ruleKey].shapeIdx} color={RULE_COLORS[display.ruleKey].color} size={14} />
              </div>
            </div>
          )}
          <div
            className="flex gap-3 w-full"
            style={{ marginTop: 28, opacity: phase === "stimulus" ? 1 : 0.25, pointerEvents: phase === "stimulus" ? "auto" : "none" }}
          >
            <button
              onClick={() => handleResponse("left")}
              className="flex-1 flex items-center justify-center"
              style={{ height: 64, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text }}
            >
              <ArrowLeft size={22} />
            </button>
            <button
              onClick={() => handleResponse("right")}
              className="flex-1 flex items-center justify-center"
              style={{ height: 64, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text }}
            >
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Arrows complete"
          stats={[
            { value: `${summary.accuracy}%`, label: "Accuracy" },
            { value: summary.avgRt ? `${summary.avgRt} ms` : "—", label: "Avg. reaction time" },
            { value: summary.congruentRt ? `${summary.congruentRt} ms` : "—", label: "Congruent RT" },
            { value: summary.incongruentRt ? `${summary.incongruentRt} ms` : "—", label: "Incongruent RT" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: easy or hard ---------- */

function EasyOrHardGame({ onBack, onFinish }) {
  const TOTAL_ROUNDS = 6;
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("instructions");
  const [config, setConfig] = useState(null);
  const [choice, setChoice] = useState(null);
  const [taskOutcome, setTaskOutcome] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [litSlot, setLitSlot] = useState(-1);

  const readyRef = useRef(false);
  const clickedRef = useRef(false);
  const timeoutRef = useRef(null);
  const stepRef = useRef(0);
  const hitsRef = useRef([]);

  const beginRound = (i) => {
    setRound(i);
    setConfig({
      easyPoints: 5 + Math.floor(Math.random() * 6),
      hardPoints: 18 + Math.floor(Math.random() * 13),
    });
    setChoice(null);
    setTaskOutcome(null);
    setPhase("choosing");
  };

  const finishTask = (success, earned, which) => {
    setTaskOutcome({ success, earned });
    setHistory((h) => [...h, { round: round + 1, choice: which, success, earned }]);
    setPhase("result");
  };

  const runHardStep = (step) => {
    stepRef.current = step;
    const slot = Math.floor(Math.random() * 4);
    setLitSlot(slot);
    timeoutRef.current = setTimeout(() => {
      hitsRef.current.push(false);
      advanceHard(step);
    }, 700);
  };

  const advanceHard = (step) => {
    setLitSlot(-1);
    const next = step + 1;
    if (next >= 4) {
      const success = hitsRef.current.length === 4 && hitsRef.current.every(Boolean);
      finishTask(success, success ? config.hardPoints : 0, "hard");
    } else {
      setTimeout(() => runHardStep(next), 200);
    }
  };

  const hitSlot = (i) => {
    if (litSlot !== i) return;
    clearTimeout(timeoutRef.current);
    hitsRef.current.push(true);
    advanceHard(stepRef.current);
  };

  const tapEasy = () => {
    if (clickedRef.current) return;
    clickedRef.current = true;
    clearTimeout(timeoutRef.current);
    const success = readyRef.current;
    finishTask(success, success ? config.easyPoints : 0, "easy");
  };

  const choose = (which) => {
    setChoice(which);
    if (which === "easy") {
      readyRef.current = false;
      clickedRef.current = false;
      setPhase("easyWait");
      const delay = 500 + Math.random() * 900;
      timeoutRef.current = setTimeout(() => {
        readyRef.current = true;
        setPhase("easyReady");
      }, delay);
    } else {
      hitsRef.current = [];
      setPhase("hardTask");
      runHardStep(0);
    }
  };

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      const total = history.reduce((s, h) => s + h.earned, 0);
      const hardChosen = history.filter((h) => h.choice === "hard").length;
      setSummary({ total, hardPct: Math.round((hardChosen / TOTAL_ROUNDS) * 100) });
      setPhase("done");
    } else {
      beginRound(round + 1);
    }
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Easy or Hard" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Pick your task" onStart={() => beginRound(0)}>
          Each round, choose between an easy task worth fewer points or a harder task worth more. Complete the task
          you pick to earn its points, over {TOTAL_ROUNDS} rounds.
        </InstructionsScreen>
      )}
      {phase === "choosing" && config && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            Round {round + 1} of {TOTAL_ROUNDS}
          </div>
          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={() => choose("easy")}
              className="flex-1"
              style={{ maxWidth: 200, padding: 24, textAlign: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6 }}
            >
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>Easy task</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 24, fontWeight: 600 }}>{config.easyPoints} pts</div>
            </button>
            <button
              onClick={() => choose("hard")}
              className="flex-1"
              style={{ maxWidth: 200, padding: 24, textAlign: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6 }}
            >
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>Hard task</div>
              <div style={{ fontFamily: MONO_FONT, fontSize: 24, fontWeight: 600 }}>{config.hardPoints} pts</div>
            </button>
          </div>
        </div>
      )}
      {(phase === "easyWait" || phase === "easyReady") && (
        <div className="flex flex-col items-center py-10">
          <div
            onClick={tapEasy}
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: phase === "easyReady" ? C.good : C.surface,
              border: `2px solid ${phase === "easyReady" ? C.good : C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 14,
              color: phase === "easyReady" ? "#0D1116" : C.textMuted,
              fontWeight: 600,
            }}
          >
            {phase === "easyReady" ? "Tap now!" : "Wait..."}
          </div>
        </div>
      )}
      {phase === "hardTask" && (
        <div className="flex flex-col items-center py-10">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>Tap the highlighted slot</div>
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => hitSlot(i)}
                style={{ width: 56, height: 56, borderRadius: 6, background: litSlot === i ? C.accent : C.surface, border: `1px solid ${C.border}` }}
              />
            ))}
          </div>
        </div>
      )}
      {phase === "result" && taskOutcome && (
        <div className="text-center py-10">
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
            {taskOutcome.success ? `+${taskOutcome.earned} pts` : "Not quite — 0 pts"}
          </div>
          <PrimaryButton onClick={nextRound}>{round + 1 >= TOTAL_ROUNDS ? "See results" : "Next round"}</PrimaryButton>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Easy or Hard complete"
          stats={[
            { value: `${summary.total}`, label: "Total points" },
            { value: `${summary.hardPct}%`, label: "Chose hard" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: faces ---------- */

const EMOTIONS = [
  "Anger",
  "Determination",
  "Disgust",
  "Fear",
  "Happiness",
  "Hope",
  "Pain",
  "Sadness",
  "Surprise",
  "Puzzlement",
];
const EMOTION_FACE = {
  Anger: { browTilt: 18, browRaise: -4, mouthCurve: -10, mouthOpen: false, eye: "narrow" },
  Determination: { browTilt: 6, browRaise: -2, mouthCurve: 0, mouthOpen: false, eye: "normal" },
  Disgust: { browTilt: -10, browRaise: 2, mouthCurve: -6, mouthOpen: false, eye: "narrow", asym: true },
  Fear: { browTilt: -14, browRaise: 8, mouthCurve: -2, mouthOpen: true, eye: "wide" },
  Happiness: { browTilt: -4, browRaise: 2, mouthCurve: 16, mouthOpen: false, eye: "normal" },
  Hope: { browTilt: -8, browRaise: 5, mouthCurve: 8, mouthOpen: false, eye: "normal" },
  Pain: { browTilt: 10, browRaise: -3, mouthCurve: -12, mouthOpen: false, eye: "shut" },
  Sadness: { browTilt: -16, browRaise: 3, mouthCurve: -14, mouthOpen: false, eye: "normal" },
  Surprise: { browTilt: -6, browRaise: 10, mouthCurve: 0, mouthOpen: true, eye: "wide" },
  Puzzlement: { browTilt: 4, browRaise: 0, mouthCurve: -2, mouthOpen: false, eye: "normal", asym: true },
};

function IllustratedFace({ emotion, size = 160 }) {
  const p = EMOTION_FACE[emotion] || EMOTION_FACE.Determination;
  const browY = 55 - p.browRaise;
  const tilt = p.browTilt;
  const leftBrow = `M 42 ${browY + tilt * 0.3} L 62 ${browY - tilt * 0.3}`;
  const rightBrow = p.asym
    ? `M 98 ${browY - tilt * 0.5} L 118 ${browY + tilt * 0.1}`
    : `M 98 ${browY - tilt * 0.3} L 118 ${browY + tilt * 0.3}`;
  const mouthY = 108;
  const mouthPath = `M 55 ${mouthY} Q 80 ${mouthY - p.mouthCurve} 105 ${mouthY}`;

  const Eye = ({ x }) => {
    if (p.eye === "shut") return <line x1={x - 9} y1="78" x2={x + 9} y2="78" stroke="#20242B" strokeWidth="3" strokeLinecap="round" />;
    if (p.eye === "wide") return <circle cx={x} cy="78" r="8" fill="#20242B" />;
    if (p.eye === "narrow") return <ellipse cx={x} cy="78" rx="8" ry="3.5" fill="#20242B" />;
    return <circle cx={x} cy="78" r="6" fill="#20242B" />;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="62" fill="#F2CFA0" stroke="#E0B078" strokeWidth="1.5" />
      <path d={leftBrow} stroke="#3A2A1E" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d={rightBrow} stroke="#3A2A1E" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Eye x={62} />
      <Eye x={98} />
      {p.mouthOpen ? (
        <ellipse cx="80" cy={mouthY} rx="14" ry="10" fill="#5B2A22" />
      ) : (
        <path d={mouthPath} stroke="#5B2A22" strokeWidth="4" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}

const EMOTION_STORY = {
  Anger: "Someone just cut in front of them in a long line.",
  Determination: "They're on the final stretch of a race they've trained months for.",
  Disgust: "They just took a bite of something spoiled.",
  Fear: "A car swerved into their lane without warning.",
  Happiness: "They just found out they got the job.",
  Hope: "The test results come back tomorrow morning.",
  Pain: "They just stubbed their toe on the doorframe.",
  Sadness: "Their flight home got cancelled on a holiday.",
  Surprise: "Friends jumped out yelling 'surprise!'",
  Puzzlement: "The instructions don't match what's in the box.",
};

function FaceGame({ onBack, onFinish }) {
  const TOTAL = 12;
  const [phase, setPhase] = useState("instructions");
  const [display, setDisplay] = useState(null);
  const [trialNum, setTrialNum] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [summary, setSummary] = useState(null);
  const trialsRef = useRef([]);
  const idxRef = useRef(0);
  const startRef = useRef(0);
  const responsesRef = useRef([]);
  const timeoutRef = useRef(null);
  const tickRef = useRef(null);
  const answeredRef = useRef(false);

  const genTrials = () =>
    Array.from({ length: TOTAL }, () => {
      const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      const withStory = Math.random() < 0.5;
      return { emotion, withStory, limitMs: withStory ? 30000 : 7000 };
    });

  const finish = () => {
    const resp = responsesRef.current;
    const avgOf = (arr) => {
      const a = arr.filter((r) => r.rt !== null);
      return a.length ? Math.round(a.reduce((s, r) => s + r.rt, 0) / a.length) : null;
    };
    setSummary({
      accuracy: Math.round((resp.filter((r) => r.correct).length / resp.length) * 100),
      avgRt: avgOf(resp),
      photoAvgRt: avgOf(resp.filter((r) => !r.withStory)),
      storyAvgRt: avgOf(resp.filter((r) => r.withStory)),
    });
    setPhase("done");
  };

  const handleResponse = (choice) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimeout(timeoutRef.current);
    clearInterval(tickRef.current);
    const trial = trialsRef.current[idxRef.current];
    const rt = choice !== null ? performance.now() - startRef.current : null;
    responsesRef.current.push({ ...trial, choice, rt, correct: choice === trial.emotion });
    const next = idxRef.current + 1;
    if (next >= TOTAL) {
      finish();
    } else {
      idxRef.current = next;
      setTimeout(() => startTrial(next), 200);
    }
  };

  const startTrial = (i) => {
    const trial = trialsRef.current[i];
    setDisplay(trial);
    setTrialNum(i);
    answeredRef.current = false;
    setPhase("trial");
    setTimeLeft(Math.round(trial.limitMs / 1000));
    startRef.current = performance.now();
    timeoutRef.current = setTimeout(() => handleResponse(null), trial.limitMs);
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
  };

  const beginGame = () => {
    trialsRef.current = genTrials();
    idxRef.current = 0;
    responsesRef.current = [];
    startTrial(0);
  };

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current);
      clearInterval(tickRef.current);
    },
    []
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Faces" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Name the emotion" onStart={beginGame}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Every trial uses the same ten choices: Anger, Determination, Disgust, Fear, Happiness, Hope, Pain, Sadness, Surprise, and Puzzlement.",
              "Some trials show only a photo. Others add a situation; on those trials, use the written context and the facial expression together.",
              "Photo-only trials allow 7 seconds. Photo-and-story trials allow 30 seconds.",
              "Select one emotion label by clicking or tapping it.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {phase === "trial" && display && (
        <div className="flex flex-col items-center">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Trial {trialNum + 1} of {TOTAL}
            </div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: timeLeft <= 3 ? C.danger : C.textMuted }}>{timeLeft}s</div>
          </div>
          <div style={{ marginBottom: display.withStory ? 16 : 32 }}>
            <IllustratedFace emotion={display.emotion} size={150} />
          </div>
          {display.withStory && (
            <div style={{ color: C.textMuted, fontSize: 13.5, textAlign: "center", maxWidth: 380, marginBottom: 28, lineHeight: 1.5 }}>
              {EMOTION_STORY[display.emotion]}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 w-full" style={{ maxWidth: 420 }}>
            {EMOTIONS.map((e) => (
              <button
                key={e}
                onClick={() => handleResponse(e)}
                style={{
                  padding: "10px 12px",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  color: C.text,
                  fontSize: 13.5,
                  textAlign: "left",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Faces complete"
          stats={[
            { value: `${summary.accuracy}%`, label: "Accuracy" },
            { value: summary.avgRt ? `${(summary.avgRt / 1000).toFixed(1)}s` : "—", label: "Avg. response time" },
            { value: summary.photoAvgRt ? `${(summary.photoAvgRt / 1000).toFixed(1)}s` : "—", label: "Photo-only avg" },
            { value: summary.storyAvgRt ? `${(summary.storyAvgRt / 1000).toFixed(1)}s` : "—", label: "Photo+story avg" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: stop ---------- */

function StopGame({ onBack, onFinish }) {
  const TOTAL = 30;
  const GO_PROB = 0.7;
  const STIM_DURATION = 650;

  const [phase, setPhase] = useState("instructions"); // instructions, stimulus, blank, done
  const [color, setColor] = useState(null);
  const [trialNum, setTrialNum] = useState(0);
  const [summary, setSummary] = useState(null);
  const trialsRef = useRef([]);
  const idxRef = useRef(0);
  const startRef = useRef(0);
  const respondedRef = useRef(false);
  const resultsRef = useRef([]);
  const timeoutRef = useRef(null);

  const genTrials = () => Array.from({ length: TOTAL }, () => ({ isRed: Math.random() < GO_PROB }));

  const finish = () => {
    const res = resultsRef.current;
    const redTrials = res.filter((r) => r.isRed);
    const greenTrials = res.filter((r) => !r.isRed);
    const hits = redTrials.filter((r) => r.responded);
    const hitRate = redTrials.length ? Math.round((hits.length / redTrials.length) * 100) : 0;
    const falseAlarms = greenTrials.filter((r) => r.responded).length;
    const faRate = greenTrials.length ? Math.round((falseAlarms / greenTrials.length) * 100) : 0;
    const timedHits = hits.filter((r) => r.rt !== null);
    const avgRt = timedHits.length ? Math.round(timedHits.reduce((s, r) => s + r.rt, 0) / timedHits.length) : null;
    setSummary({ hitRate, faRate, avgRt });
    setPhase("done");
  };

  const conclude = (responded) => {
    if (resultsRef.current[idxRef.current] !== undefined) return;
    clearTimeout(timeoutRef.current);
    const trial = trialsRef.current[idxRef.current];
    const rt = responded ? performance.now() - startRef.current : null;
    resultsRef.current[idxRef.current] = { ...trial, responded, rt };
    setPhase("blank");
    setTimeout(() => {
      const next = idxRef.current + 1;
      if (next >= TOTAL) finish();
      else {
        idxRef.current = next;
        startTrial(next);
      }
    }, 150);
  };

  const startTrial = (i) => {
    const trial = trialsRef.current[i];
    setColor(trial.isRed ? "red" : "green");
    setTrialNum(i);
    respondedRef.current = false;
    setPhase("stimulus");
    startRef.current = performance.now();
    timeoutRef.current = setTimeout(() => conclude(false), STIM_DURATION);
  };

  const respond = () => {
    if (respondedRef.current) return;
    respondedRef.current = true;
    conclude(true);
  };

  const beginGame = () => {
    trialsRef.current = genTrials();
    idxRef.current = 0;
    resultsRef.current = [];
    startTrial(0);
  };

  useEffect(() => {
    if (phase !== "stimulus") return;
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        respond();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Stop" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Press red, skip green" onStart={beginGame}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "A stream of circles flashes one at a time. Press the button (or space bar) whenever you see a red circle.",
              "When a green circle appears, hold back — don't press.",
              "Circles flash briefly and move fast, so stay ready between trials.",
              `${TOTAL} circles total.`,
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {(phase === "stimulus" || phase === "blank") && (
        <div className="flex flex-col items-center py-10">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            Trial {trialNum + 1} of {TOTAL}
          </div>
          <div
            onClick={phase === "stimulus" ? respond : undefined}
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: phase === "stimulus" ? (color === "red" ? C.danger : C.good) : C.surface,
              border: `2px solid ${phase === "blank" ? C.border : "transparent"}`,
              cursor: phase === "stimulus" ? "pointer" : "default",
            }}
          />
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Stop complete"
          stats={[
            { value: `${summary.hitRate}%`, label: "Correct on red" },
            { value: `${summary.faRate}%`, label: "Pressed on green" },
            { value: summary.avgRt ? `${summary.avgRt} ms` : "—", label: "Avg. reaction time" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: keypresses ---------- */

function KeypressGame({ onBack, onFinish }) {
  const READY_MS = 1000;
  const GO_MS = 6000;
  const STOP_WINDOW_MS = 3000;
  const [phase, setPhase] = useState("instructions"); // instructions, ready, go, stop, done
  const [tapCount, setTapCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const goStartRef = useRef(0);
  const tapTimestampsRef = useRef([]);
  const falseStartsRef = useRef(0);
  const lateTapsRef = useRef(0);
  const timeoutsRef = useRef([]);
  const phaseRef = useRef("instructions");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const finish = () => {
    const taps = tapTimestampsRef.current;
    const tapRate = +(taps.length / (GO_MS / 1000)).toFixed(1);
    setSummary({
      tapCount: taps.length,
      tapRate,
      startLatency: taps.length ? Math.round(taps[0]) : null,
      falseStarts: falseStartsRef.current,
      lateTaps: lateTapsRef.current,
    });
    setPhase("done");
  };

  const beginGame = () => {
    tapTimestampsRef.current = [];
    falseStartsRef.current = 0;
    lateTapsRef.current = 0;
    setTapCount(0);
    setPhase("ready");
    timeoutsRef.current.push(
      setTimeout(() => {
        goStartRef.current = performance.now();
        setPhase("go");
        timeoutsRef.current.push(
          setTimeout(() => {
            setPhase("stop");
            timeoutsRef.current.push(setTimeout(finish, STOP_WINDOW_MS));
          }, GO_MS)
        );
      }, READY_MS)
    );
  };

  const tap = () => {
    const p = phaseRef.current;
    if (p === "ready") {
      falseStartsRef.current += 1;
    } else if (p === "go") {
      tapTimestampsRef.current.push(performance.now() - goStartRef.current);
      setTapCount((c) => c + 1);
    } else if (p === "stop") {
      lateTapsRef.current += 1;
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => clearAll(), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Keypresses" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Go, then stop" onStart={beginGame}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "When the screen says GO, tap as quickly and steadily as you can — space bar or the on-screen button both work.",
              "The moment the screen switches to STOP, stop tapping immediately.",
              "Tapping before GO appears or after STOP appears both count against you, so aim for a clean start and a clean stop.",
              "The whole round takes about 20 seconds.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {(phase === "ready" || phase === "go" || phase === "stop") && (
        <div className="flex flex-col items-center py-10">
          <div
            onClick={tap}
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: phase === "go" ? C.good : phase === "stop" ? C.danger : C.surface,
              border: `2px solid ${phase === "ready" ? C.border : "transparent"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 2,
              color: phase === "ready" ? C.textMuted : "#0D1116",
              userSelect: "none",
            }}
          >
            {phase === "ready" ? "READY" : phase === "go" ? "GO" : "STOP"}
          </div>
          <div style={{ marginTop: 24, fontFamily: MONO_FONT, fontSize: 13, color: C.textMuted }}>
            {phase === "go" ? `${tapCount} taps` : phase === "stop" ? "Hold still" : "Get ready..."}
          </div>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Keypresses complete"
          stats={[
            { value: `${summary.tapRate}/s`, label: "Tap rate during GO" },
            { value: summary.startLatency !== null ? `${summary.startLatency} ms` : "—", label: "Start latency" },
            { value: `${summary.falseStarts}`, label: "Early taps" },
            { value: `${summary.lateTaps}`, label: "Late taps after STOP" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: money exchange 2 ---------- */

function MoneyExchange2Game({ onBack, onFinish }) {
  const [phase, setPhase] = useState("instructions");
  const [partnerGive, setPartnerGive] = useState(0);
  const [fairness1, setFairness1] = useState(5);
  const [round2Amount, setRound2Amount] = useState(0);
  const [fairness2, setFairness2] = useState(5);

  const beginRound1 = () => {
    const options = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8];
    setPartnerGive(options[Math.floor(Math.random() * options.length)]);
    setPhase("round1View");
  };

  const yourBalance1 = 5 + partnerGive;
  const partnerBalance1 = 10 - partnerGive;
  const yourBalance2 = 10 - round2Amount;
  const partnerBalance2 = 5 + round2Amount;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Money Exchange 2" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Two partners, two decisions" onStart={beginRound1}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Round 1 uses a fresh partner: you both start with $5, the partner receives an extra $5, allocates a seeded amount to you, and you rate the allocation's fairness from 0 to 10.",
              "Round 2 uses a new partner: you both start with $5 and you receive the extra $5. Use one control to give $0–$5 or take up to $5 from the partner, in $0.50 steps.",
              "Rate your Round 2 allocation's fairness from 0 to 10, then review the neutral Fairness / Generosity trait description and select Continue.",
              "There is no correct answer and this is never scored. Choose the allocation that honestly reflects you.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {phase === "round1View" && (
        <div className="text-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Round 1 · Partner A</div>
          <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            You each started with $5. Your partner also received a $5 bonus, giving them $10 to work with. They've
            decided to give you:
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 36, fontWeight: 600, marginBottom: 20 }}>${partnerGive.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 28 }}>
            You'd end with ${yourBalance1.toFixed(2)} · Partner ends with ${partnerBalance1.toFixed(2)}
          </div>
          <PrimaryButton onClick={() => setPhase("round1Rate")}>Continue</PrimaryButton>
        </div>
      )}
      {phase === "round1Rate" && (
        <div className="text-center">
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>How fair was that allocation?</div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 34, fontWeight: 600, marginBottom: 10 }}>{fairness1}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>0 = very unfair · 10 = very fair</div>
          <input
            type="range"
            min="0"
            max="10"
            value={fairness1}
            onChange={(e) => setFairness1(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.accent, marginBottom: 28 }}
          />
          <PrimaryButton onClick={() => setPhase("round2Decide")}>Continue</PrimaryButton>
        </div>
      )}
      {phase === "round2Decide" && (
        <div className="text-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Round 2 · Partner B</div>
          <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            You each started with $5. This time you received the $5 bonus, giving you $10. Decide how much to give
            to your partner, or take from them.
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 30, fontWeight: 600, marginBottom: 6 }}>
            {round2Amount >= 0 ? `Give $${round2Amount.toFixed(2)}` : `Take $${Math.abs(round2Amount).toFixed(2)}`}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
            You'd end with ${yourBalance2.toFixed(2)} · Partner ends with ${partnerBalance2.toFixed(2)}
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.5"
            value={round2Amount}
            onChange={(e) => setRound2Amount(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.accent, marginBottom: 8 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted, marginBottom: 28 }}>
            <span>Take $5</span>
            <span>Give $5</span>
          </div>
          <PrimaryButton onClick={() => setPhase("round2Rate")}>Confirm</PrimaryButton>
        </div>
      )}
      {phase === "round2Rate" && (
        <div className="text-center">
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>How fair was your allocation?</div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 34, fontWeight: 600, marginBottom: 10 }}>{fairness2}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>0 = very unfair · 10 = very fair</div>
          <input
            type="range"
            min="0"
            max="10"
            value={fairness2}
            onChange={(e) => setFairness2(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.accent, marginBottom: 28 }}
          />
          <PrimaryButton onClick={() => setPhase("traitInfo")}>Continue</PrimaryButton>
        </div>
      )}
      {phase === "traitInfo" && (
        <div className="text-center">
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24, marginBottom: 28, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: C.accent2 }}>Fairness / Generosity</div>
            <div style={{ fontSize: 13.5, color: C.textMuted, lineHeight: 1.6 }}>
              This trait reflects how people balance their own interests against another person's when dividing a
              shared resource. There's a wide, healthy range of approaches — being more self-focused or more
              generous in a moment like this isn't inherently better or worse, just different.
            </div>
          </div>
          <PrimaryButton onClick={() => setPhase("done")}>Continue</PrimaryButton>
        </div>
      )}
      {phase === "done" && (
        <DoneScreen
          title="Money Exchange 2 complete"
          stats={[
            {
              value: round2Amount >= 0 ? `+$${round2Amount.toFixed(2)}` : `-$${Math.abs(round2Amount).toFixed(2)}`,
              label: "Round 2 allocation",
            },
            { value: `${fairness1}/10`, label: "Round 1 fairness rating" },
            { value: `${fairness2}/10`, label: "Round 2 fairness rating" },
          ]}
          onBack={() => onFinish({ partnerGive, fairness1, round2Amount, fairness2 })}
        />
      )}
    </div>
  );
}

/* ---------- game: digits ---------- */

function DigitsGame({ onBack, onFinish }) {
  const START_LENGTH = 3;
  const MAX_WRONG = 3;
  const [phase, setPhase] = useState("instructions");
  const [sequence, setSequence] = useState([]);
  const [shownDigit, setShownDigit] = useState(null);
  const [input, setInput] = useState([]);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [longestCorrect, setLongestCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [summary, setSummary] = useState(null);
  const timeoutsRef = useRef([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const genSeq = (len) => Array.from({ length: len }, () => Math.floor(Math.random() * 10));

  const playSequence = (seq) => {
    clearTimeouts();
    setPhase("showing");
    setInput([]);
    setShownDigit(null);
    seq.forEach((d, i) => {
      timeoutsRef.current.push(setTimeout(() => setShownDigit(d), i * 900));
      timeoutsRef.current.push(setTimeout(() => setShownDigit(null), i * 900 + 600));
    });
    timeoutsRef.current.push(setTimeout(() => setPhase("recall"), seq.length * 900 + 200));
  };

  const startRound = (len) => {
    const seq = genSeq(len);
    setSequence(seq);
    playSequence(seq);
  };

  const beginGame = () => {
    setConsecutiveWrong(0);
    setLongestCorrect(0);
    setAttempts(0);
    startRound(START_LENGTH);
  };

  const pressDigit = (d) => {
    if (phase !== "recall") return;
    setInput((inp) => (inp.length >= sequence.length ? inp : [...inp, d]));
  };

  const backspace = () => {
    if (phase !== "recall") return;
    setInput((inp) => inp.slice(0, -1));
  };

  const submit = () => {
    if (phase !== "recall" || input.length !== sequence.length) return;
    const correct = input.every((d, i) => d === sequence[i]);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (correct) {
      const newLongest = Math.max(longestCorrect, sequence.length);
      setLongestCorrect(newLongest);
      setConsecutiveWrong(0);
      setLastFeedback("correct");
      setTimeout(() => {
        setLastFeedback(null);
        startRound(sequence.length + 1);
      }, 700);
    } else {
      const newWrong = consecutiveWrong + 1;
      setConsecutiveWrong(newWrong);
      setLastFeedback("wrong");
      if (newWrong >= MAX_WRONG) {
        setTimeout(() => {
          setSummary({ longestCorrect, attempts: newAttempts });
          setPhase("done");
        }, 700);
      } else {
        setTimeout(() => {
          setLastFeedback(null);
          startRound(Math.max(1, sequence.length - 1));
        }, 700);
      }
    }
  };

  useEffect(() => {
    if (phase !== "recall") return;
    const onKey = (e) => {
      if (e.key >= "0" && e.key <= "9") pressDigit(Number(e.key));
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, input, sequence]);

  useEffect(() => () => clearTimeouts(), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Digits" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Remember the digits" onStart={beginGame}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Watch the digits as they flash one at a time. When the recall field appears, enter every digit in the same order and submit.",
              "A correct recall makes the next sequence one digit longer. An incorrect recall makes it one digit shorter.",
              "Recall is forward-only. The game ends after three consecutive incorrect recalls.",
              "Use the number keys or the on-screen keypad, then press Enter or select Submit.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {phase === "showing" && (
        <div className="flex flex-col items-center py-16">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>Watch closely...</div>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 10,
              background: C.surface,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO_FONT,
              fontSize: 56,
              fontWeight: 600,
            }}
          >
            {shownDigit !== null ? shownDigit : ""}
          </div>
        </div>
      )}
      {phase === "recall" && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Enter the sequence in order</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, minHeight: 44 }}>
            {Array.from({ length: sequence.length }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 44,
                  borderRadius: 6,
                  background: C.surface,
                  border: `1px solid ${lastFeedback === "wrong" ? C.danger : lastFeedback === "correct" ? C.good : C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: MONO_FONT,
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {input[i] !== undefined ? input[i] : ""}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4" style={{ maxWidth: 220 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button
                key={d}
                onClick={() => pressDigit(d)}
                style={{ width: 60, height: 48, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: MONO_FONT, fontSize: 18, color: C.text }}
              >
                {d}
              </button>
            ))}
            <button onClick={backspace} style={{ width: 60, height: 48, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMuted, fontSize: 13 }}>
              ⌫
            </button>
            <button
              onClick={() => pressDigit(0)}
              style={{ width: 60, height: 48, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: MONO_FONT, fontSize: 18, color: C.text }}
            >
              0
            </button>
            <div />
          </div>
          <PrimaryButton onClick={submit} disabled={input.length !== sequence.length}>
            Submit
          </PrimaryButton>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Digits complete"
          stats={[
            { value: `${summary.longestCorrect}`, label: "Longest correct span" },
            { value: `${summary.attempts}`, label: "Rounds attempted" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: cards ---------- */

function CardsGame({ onBack, onFinish }) {
  const START_BALANCE = 2000;
  const TOTAL_DRAWS = 80;
  const [phase, setPhase] = useState("instructions");
  const [balance, setBalance] = useState(START_BALANCE);
  const [drawNum, setDrawNum] = useState(0);
  const [lastDraw, setLastDraw] = useState(null);
  const [deckCounts, setDeckCounts] = useState([0, 0, 0, 0]);
  const [summary, setSummary] = useState(null);
  const lockRef = useRef(false);

  const beginGame = () => {
    setBalance(START_BALANCE);
    setDrawNum(0);
    setDeckCounts([0, 0, 0, 0]);
    setLastDraw(null);
    setPhase("playing");
  };

  const draw = (deckIdx) => {
    if (lockRef.current) return;
    lockRef.current = true;
    const deck = DECKS[deckIdx];
    const gain = deck.reward;
    const penaltyHit = Math.random() < deck.penaltyChance;
    const penalty = penaltyHit ? Math.round(deck.penaltyMin + Math.random() * (deck.penaltyMax - deck.penaltyMin)) : 0;
    const net = gain - penalty;
    const newBalance = balance + net;
    const newCounts = deckCounts.map((v, i) => (i === deckIdx ? v + 1 : v));
    const nextDrawNum = drawNum + 1;
    setBalance(newBalance);
    setDeckCounts(newCounts);
    setLastDraw({ deckIdx, gain, penalty, net });
    setDrawNum(nextDrawNum);
    setPhase("drawResult");
    setTimeout(() => {
      lockRef.current = false;
      if (nextDrawNum >= TOTAL_DRAWS) {
        setSummary({ finalBalance: newBalance, deckCounts: newCounts });
        setPhase("done");
      } else {
        setPhase("playing");
      }
    }, 550);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Cards" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Pick a deck, build your balance" onStart={beginGame}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "You start with $2,000 and make 80 draws. Select any of the four face-down decks by clicking or tapping its position.",
              "Every card reveals a gain and may reveal a simultaneous penalty. Your running balance updates after each draw.",
              "The decks have different hidden payout and penalty-frequency patterns. No deck labels, quality hints, per-deck statistics, or mid-game advice are shown.",
              "Keep choosing until all 80 draws are complete. There is no per-draw time limit.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {(phase === "playing" || phase === "drawResult") && (
        <div className="flex flex-col items-center">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Draw {Math.min(drawNum + (phase === "playing" ? 1 : 0), TOTAL_DRAWS)} of {TOTAL_DRAWS}
            </div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 14, fontWeight: 600 }}>${balance.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-8 w-full">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => draw(i)}
                disabled={phase !== "playing"}
                style={{
                  aspectRatio: "2/3",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: MONO_FONT,
                  fontSize: 13,
                  color: C.textMuted,
                  opacity: phase === "playing" ? 1 : 0.5,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ height: 40 }}>
            {phase === "drawResult" && lastDraw && (
              <div style={{ fontFamily: MONO_FONT, fontSize: 18, fontWeight: 600, color: lastDraw.net >= 0 ? C.good : C.danger }}>
                {lastDraw.penalty > 0 ? `+$${lastDraw.gain} / -$${lastDraw.penalty}` : `+$${lastDraw.gain}`}
              </div>
            )}
          </div>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Cards complete"
          stats={[
            { value: `$${summary.finalBalance.toLocaleString()}`, label: "Final balance" },
            { value: `${Math.max(...summary.deckCounts)}`, label: "Most-picked deck count" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: towers ---------- */

function TowersGame({ onBack, onFinish }) {
  const TIME_LIMIT = 120;
  const [phase, setPhase] = useState("instructions");
  const [target, setTarget] = useState(null);
  const [towers, setTowers] = useState(null);
  const [initial, setInitial] = useState(null);
  const [selected, setSelected] = useState(null);
  const [steps, setSteps] = useState(0);
  const [moveHistory, setMoveHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [outcome, setOutcome] = useState(null);
  const intervalRef = useRef(null);

  const beginGame = () => {
    let start = randomArrangement();
    let goal = randomArrangement();
    while (arrangementsEqual(start, goal)) goal = randomArrangement();
    setInitial(start);
    setTowers(start.map((t) => [...t]));
    setTarget(goal);
    setSelected(null);
    setSteps(0);
    setMoveHistory([]);
    setTimeLeft(TIME_LIMIT);
    setOutcome(null);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setOutcome("timeout");
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const clickTower = (i) => {
    if (phase !== "playing") return;
    if (selected === null) {
      if (towers[i].length > 0) setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    if (towers[i].length >= TOWER_CAPACITY) {
      setSelected(null);
      return;
    }
    const newTowers = towers.map((t) => [...t]);
    const disc = newTowers[selected].pop();
    newTowers[i].push(disc);
    setMoveHistory((h) => [...h, { from: selected, to: i }]);
    setSteps((s) => s + 1);
    setTowers(newTowers);
    setSelected(null);
    if (arrangementsEqual(newTowers, target)) {
      clearInterval(intervalRef.current);
      setOutcome("solved");
      setPhase("done");
    }
  };

  const undo = () => {
    if (moveHistory.length === 0 || phase !== "playing") return;
    const last = moveHistory[moveHistory.length - 1];
    const newTowers = towers.map((t) => [...t]);
    const disc = newTowers[last.to].pop();
    newTowers[last.from].push(disc);
    setTowers(newTowers);
    setMoveHistory((h) => h.slice(0, -1));
    setSteps((s) => Math.max(0, s - 1));
    setSelected(null);
  };

  const reset = () => {
    if (phase !== "playing") return;
    setTowers(initial.map((t) => [...t]));
    setMoveHistory([]);
    setSteps(0);
    setSelected(null);
  };

  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, "0");

  const Disc = ({ d }) => (
    <div
      style={{
        width: 52,
        height: 28,
        borderRadius: 4,
        background: DISC_DEFS[d].color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: MONO_FONT,
        fontSize: 13,
        fontWeight: 700,
        color: "#10141A",
      }}
    >
      {DISC_DEFS[d].letter}
    </div>
  );

  const TowerView = ({ stack, onClick, isSelected, small }) => (
    <button
      onClick={onClick}
      style={{
        width: small ? 60 : 80,
        height: small ? 100 : 160,
        background: C.surface,
        border: `1px solid ${isSelected ? C.accent : C.border}`,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "center",
        gap: 4,
        padding: 6,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {stack.map((d, i) => (
        <div key={i} style={{ transform: small ? "scale(0.75)" : "none" }}>
          <Disc d={d} />
        </div>
      ))}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Towers" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Match the target pattern" onStart={beginGame}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Match the target pattern before the 2:00 timer reaches zero. The target remains visible throughout the round.",
              "Only the top disc on a tower can move. Select its tower, then select a different destination tower with a free slot.",
              "Every successful forward move adds one Step. Undo reverses the most recent move; Reset restores the full starting board.",
              "Disc letters repeat their colour identity, so the pattern is readable without relying on hue alone.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {phase === "playing" && towers && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Target</div>
          <div className="flex gap-3 mb-8">
            {target.map((stack, i) => (
              <TowerView key={i} stack={stack} small />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 360, marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.textMuted }}>Steps: {steps}</div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 13, color: timeLeft <= 20 ? C.danger : C.text }}>
              {mm}:{ss}
            </div>
          </div>
          <div className="flex gap-3 mb-8">
            {towers.map((stack, i) => (
              <TowerView key={i} stack={stack} onClick={() => clickTower(i)} isSelected={selected === i} />
            ))}
          </div>
          <div className="flex gap-3">
            <SecondaryButton onClick={undo}>Undo</SecondaryButton>
            <SecondaryButton onClick={reset}>Reset</SecondaryButton>
          </div>
        </div>
      )}
      {phase === "done" && (
        <DoneScreen
          title="Towers complete"
          stats={[
            { value: outcome === "solved" ? "Matched" : "Time's up", label: "Result" },
            { value: `${steps}`, label: "Steps taken" },
          ]}
          onBack={() => onFinish({ outcome, steps })}
        />
      )}
    </div>
  );
}

/* ---------- game: lengths ---------- */

function LengthsGame({ onBack, onFinish }) {
  const TOTAL = 90;
  const REWARD_PROB = 0.4;
  const [phase, setPhase] = useState("instructions");
  const [display, setDisplay] = useState(null);
  const [trialNum, setTrialNum] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const trialsRef = useRef([]);
  const idxRef = useRef(0);
  const answeredRef = useRef(false);
  const timeoutRef = useRef(null);

  const genTrials = () =>
    Array.from({ length: TOTAL }, () => {
      const category = Math.random() < 0.5 ? "short" : "long";
      const width = category === "short" ? 18 + Math.random() * 10 : 42 + Math.random() * 14;
      return { category, width };
    });

  const startTrial = (i) => {
    const trial = trialsRef.current[i];
    setDisplay(trial);
    setTrialNum(i);
    answeredRef.current = false;
    setPhase("flash");
    timeoutRef.current = setTimeout(() => setPhase("waiting"), 500);
  };

  const beginGame = () => {
    trialsRef.current = genTrials();
    idxRef.current = 0;
    setTotalReward(0);
    startTrial(0);
  };

  const advance = () => {
    const next = idxRef.current + 1;
    if (next >= TOTAL) {
      setPhase("done");
    } else {
      idxRef.current = next;
      startTrial(next);
    }
  };

  const handleResponse = (choice) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimeout(timeoutRef.current);
    const trial = trialsRef.current[idxRef.current];
    const correct = choice === trial.category;
    const rewarded = correct && Math.random() < REWARD_PROB;
    if (rewarded) {
      setTotalReward((r) => +(r + 0.2).toFixed(2));
      setPhase("reward");
      timeoutRef.current = setTimeout(advance, 700);
    } else {
      setPhase("blank");
      timeoutRef.current = setTimeout(advance, 350);
    }
  };

  useEffect(() => {
    if (phase !== "waiting") return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") handleResponse("short");
      else if (e.key === "ArrowRight") handleResponse("long");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Lengths" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Short or long?" onStart={beginGame}>
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "A cartoon face flashes briefly. Press Left Arrow if its mouth was SHORT or Right Arrow if it was LONG.",
              "On touch devices, use the left SHORT and right LONG tap zones after the face disappears.",
              "Some correct answers show only a +$0.20 reward cue. All unrewarded answers — including correct and incorrect choices — advance silently and identically.",
              "There is no ✓, ✕, or correctness reveal during play. Complete all 90 trials.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: MONO_FONT, color: C.accent, fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </InstructionsScreen>
      )}
      {(phase === "flash" || phase === "waiting" || phase === "reward" || phase === "blank") && display && (
        <div className="flex flex-col items-center">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 380, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Trial {trialNum + 1} of {TOTAL}
            </div>
            <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: C.textMuted }}>${totalReward.toFixed(2)}</div>
          </div>
          <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
            {phase === "flash" && <CartoonFace width={display.width} />}
            {phase === "reward" && <div style={{ fontFamily: MONO_FONT, fontSize: 28, fontWeight: 600, color: C.good }}>+$0.20</div>}
          </div>
          <div
            className="flex gap-3 w-full"
            style={{ opacity: phase === "waiting" ? 1 : 0.25, pointerEvents: phase === "waiting" ? "auto" : "none" }}
          >
            <button
              onClick={() => handleResponse("short")}
              className="flex-1"
              style={{ height: 64, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, fontWeight: 600 }}
            >
              SHORT
            </button>
            <button
              onClick={() => handleResponse("long")}
              className="flex-1"
              style={{ height: 64, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, fontWeight: 600 }}
            >
              LONG
            </button>
          </div>
        </div>
      )}
      {phase === "done" && (
        <DoneScreen
          title="Lengths complete"
          stats={[
            { value: `$${totalReward.toFixed(2)}`, label: "Reward earned" },
            { value: `${TOTAL}`, label: "Trials completed" },
          ]}
          onBack={() => onFinish({ totalReward })}
        />
      )}
    </div>
  );
}

/* ---------- game: memory cards ---------- */

function MemoryGame({ onBack, onFinish }) {
  const GRID = 9;
  const MAX_LENGTH = 8;
  const START_LENGTH = 3;
  const [phase, setPhase] = useState("instructions");
  const [sequence, setSequence] = useState([]);
  const [litIndex, setLitIndex] = useState(-1);
  const [userInput, setUserInput] = useState([]);
  const [longest, setLongest] = useState(0);
  const [roundsCorrect, setRoundsCorrect] = useState(0);
  const [summary, setSummary] = useState(null);
  const timeoutsRef = useRef([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const genSeq = (len) => Array.from({ length: len }, () => Math.floor(Math.random() * GRID));

  const playSequence = (seq) => {
    clearTimeouts();
    setPhase("showing");
    setUserInput([]);
    seq.forEach((cell, i) => {
      timeoutsRef.current.push(setTimeout(() => setLitIndex(cell), i * 750));
      timeoutsRef.current.push(setTimeout(() => setLitIndex(-1), i * 750 + 450));
    });
    timeoutsRef.current.push(setTimeout(() => setPhase("input"), seq.length * 750 + 200));
  };

  const beginRound = (len) => {
    const seq = genSeq(len);
    setSequence(seq);
    playSequence(seq);
  };

  const finishGame = (finalLongest, finalRoundsCorrect) => {
    setSummary({ longest: finalLongest, roundsCorrect: finalRoundsCorrect });
    setPhase("done");
  };

  const clickCell = (i) => {
    if (phase !== "input") return;
    const next = [...userInput, i];
    setUserInput(next);
    const idx = next.length - 1;
    if (sequence[idx] !== i) {
      finishGame(longest, roundsCorrect);
      return;
    }
    if (next.length === sequence.length) {
      const newLongest = Math.max(longest, sequence.length);
      const newRoundsCorrect = roundsCorrect + 1;
      setLongest(newLongest);
      setRoundsCorrect(newRoundsCorrect);
      if (sequence.length >= MAX_LENGTH) {
        finishGame(newLongest, newRoundsCorrect);
      } else {
        setPhase("result");
      }
    }
  };

  const nextRound = () => beginRound(sequence.length + 1);

  useEffect(() => () => clearTimeouts(), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Memory Cards" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Repeat the pattern" onStart={() => beginRound(START_LENGTH)}>
          Watch the cards light up in order, then click them back in the same sequence. Each round the sequence gets
          one card longer — keep going until you slip up.
        </InstructionsScreen>
      )}
      {(phase === "showing" || phase === "input") && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
            {phase === "showing" ? "Watch closely..." : `Your turn · ${userInput.length}/${sequence.length}`}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: GRID }).map((_, i) => (
              <button
                key={i}
                onClick={() => clickCell(i)}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 6,
                  background: litIndex === i ? C.accent : C.surface,
                  border: `1px solid ${C.border}`,
                  cursor: phase === "input" ? "pointer" : "default",
                }}
              />
            ))}
          </div>
        </div>
      )}
      {phase === "result" && (
        <div className="text-center py-10">
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Nice — sequence of {sequence.length} correct</div>
          <PrimaryButton onClick={nextRound}>Next sequence</PrimaryButton>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Memory Cards complete"
          stats={[
            { value: `${summary.longest}`, label: "Longest sequence" },
            { value: `${summary.roundsCorrect}`, label: "Rounds completed" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: card sort ---------- */

function CardSortGame({ onBack, onFinish }) {
  const TOTAL_TRIALS = 24;
  const STREAK_TO_SWITCH = 5;
  const RULES = ["color", "shape", "count"];

  const [phase, setPhase] = useState("instructions");
  const [trialIdx, setTrialIdx] = useState(0);
  const [rule, setRule] = useState(() => RULES[Math.floor(Math.random() * 3)]);
  const [streak, setStreak] = useState(0);
  const [card, setCard] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [switches, setSwitches] = useState(0);
  const [summary, setSummary] = useState(null);

  const genCard = () => ({
    colorIdx: Math.floor(Math.random() * 4),
    shapeIdx: Math.floor(Math.random() * 4),
    countIdx: Math.floor(Math.random() * 4),
  });

  const matchIndexFor = (c, r) => (r === "color" ? c.colorIdx : r === "shape" ? c.shapeIdx : c.countIdx);

  const beginGame = () => {
    setRule(RULES[Math.floor(Math.random() * 3)]);
    setStreak(0);
    setCorrectCount(0);
    setSwitches(0);
    setTrialIdx(0);
    setCard(genCard());
    setFeedback(null);
    setPhase("playing");
  };

  const choosePile = (pileIdx) => {
    if (feedback) return;
    const correct = pileIdx === matchIndexFor(card, rule);
    setFeedback(correct ? "correct" : "wrong");

    let newStreak = correct ? streak + 1 : 0;
    let newRule = rule;
    let didSwitch = false;
    if (newStreak >= STREAK_TO_SWITCH) {
      const options = RULES.filter((r) => r !== rule);
      newRule = options[Math.floor(Math.random() * options.length)];
      newStreak = 0;
      didSwitch = true;
    }

    const finalCorrectCount = correct ? correctCount + 1 : correctCount;
    const finalSwitches = didSwitch ? switches + 1 : switches;

    setTimeout(() => {
      const next = trialIdx + 1;
      if (next >= TOTAL_TRIALS) {
        setSummary({
          accuracy: Math.round((finalCorrectCount / TOTAL_TRIALS) * 100),
          switches: finalSwitches,
        });
        setPhase("done");
      } else {
        setCorrectCount(finalCorrectCount);
        setSwitches(finalSwitches);
        setTrialIdx(next);
        setStreak(newStreak);
        setRule(newRule);
        setCard(genCard());
        setFeedback(null);
      }
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Card Sort" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Find the sorting rule" onStart={beginGame}>
          Sort each card into one of the four piles below. The rule — colour, shape, or count — isn't shown, and it
          can change without warning. Use the correct / incorrect feedback after each card to work out what matters
          right now.
        </InstructionsScreen>
      )}
      {phase === "playing" && card && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>
            Card {trialIdx + 1} of {TOTAL_TRIALS}
          </div>
          <div
            style={{
              padding: 20,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              marginBottom: 8,
              minHeight: 80,
              display: "flex",
              alignItems: "center",
            }}
          >
            <CardFace colorIdx={card.colorIdx} shapeIdx={card.shapeIdx} countIdx={card.countIdx} />
          </div>
          <div
            style={{
              height: 20,
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 600,
              color: feedback === "correct" ? C.good : feedback === "wrong" ? C.danger : "transparent",
            }}
          >
            {feedback === "correct" ? "Correct" : feedback === "wrong" ? "Incorrect" : "—"}
          </div>
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => choosePile(i)}
                disabled={!!feedback}
                style={{ padding: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, opacity: feedback ? 0.6 : 1 }}
              >
                <CardFace colorIdx={i} shapeIdx={i} countIdx={i} />
              </button>
            ))}
          </div>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Card Sort complete"
          stats={[
            { value: `${summary.accuracy}%`, label: "Accuracy" },
            { value: `${summary.switches}`, label: "Rule changes" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: reaction timer ---------- */

function ReactionTimerGame({ onBack, onFinish }) {
  const TOTAL = 6;
  const [phase, setPhase] = useState("instructions");
  const [trialNum, setTrialNum] = useState(0);
  const [times, setTimes] = useState([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const [lastRt, setLastRt] = useState(null);
  const [summary, setSummary] = useState(null);
  const startRef = useRef(0);
  const timeoutRef = useRef(null);

  const startTrial = (i) => {
    setTrialNum(i);
    setPhase("waiting");
    const delay = 1000 + Math.random() * 2500;
    timeoutRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setPhase("ready");
    }, delay);
  };

  const beginGame = () => {
    setTimes([]);
    setFalseStarts(0);
    startTrial(0);
  };

  const tap = () => {
    if (phase === "waiting") {
      clearTimeout(timeoutRef.current);
      setFalseStarts((f) => f + 1);
      setPhase("tooSoon");
      return;
    }
    if (phase === "ready") {
      const rt = Math.round(performance.now() - startRef.current);
      setLastRt(rt);
      setTimes((t) => [...t, rt]);
      setPhase("trialResult");
    }
  };

  const afterTrial = () => {
    const next = trialNum + 1;
    if (next >= TOTAL) {
      const avg = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
      const fastest = Math.min(...times);
      setSummary({ avg, fastest, falseStarts });
      setPhase("done");
    } else {
      startTrial(next);
    }
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Reaction Timer" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Tap the instant it turns green" onStart={beginGame}>
          Wait for the circle to turn green, then tap it as fast as you can. Tap too soon and you'll need to try that
          round again. {TOTAL} rounds total.
        </InstructionsScreen>
      )}
      {(phase === "waiting" || phase === "ready") && (
        <div className="flex flex-col items-center py-10">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
            Round {trialNum + 1} of {TOTAL}
          </div>
          <div
            onClick={tap}
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: phase === "ready" ? C.good : C.surface,
              border: `2px solid ${phase === "ready" ? C.good : C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: 600,
              color: phase === "ready" ? "#0D1116" : C.textMuted,
              fontSize: 14,
            }}
          >
            {phase === "ready" ? "Tap!" : "Wait..."}
          </div>
        </div>
      )}
      {phase === "tooSoon" && (
        <div className="text-center py-10">
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: C.danger }}>Too soon</div>
          <PrimaryButton onClick={() => startTrial(trialNum)}>Try again</PrimaryButton>
        </div>
      )}
      {phase === "trialResult" && (
        <div className="text-center py-10">
          <div style={{ fontFamily: MONO_FONT, fontSize: 32, fontWeight: 600, marginBottom: 24 }}>{lastRt} ms</div>
          <PrimaryButton onClick={afterTrial}>{trialNum + 1 >= TOTAL ? "See results" : "Next round"}</PrimaryButton>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Reaction Timer complete"
          stats={[
            { value: `${summary.avg} ms`, label: "Average" },
            { value: `${summary.fastest} ms`, label: "Fastest" },
            { value: `${summary.falseStarts}`, label: "False starts" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: magnitudes ---------- */

function MagnitudesGame({ onBack, onFinish }) {
  const TOTAL = 18;
  const [phase, setPhase] = useState("instructions");
  const [display, setDisplay] = useState(null);
  const [trialNum, setTrialNum] = useState(0);
  const [summary, setSummary] = useState(null);
  const trialsRef = useRef([]);
  const idxRef = useRef(0);
  const startRef = useRef(0);
  const responsesRef = useRef([]);
  const timeoutRef = useRef(null);
  const answeredRef = useRef(false);

  const genTrials = () =>
    Array.from({ length: TOTAL }, () => {
      let a = 1 + Math.floor(Math.random() * 98);
      let b = 1 + Math.floor(Math.random() * 98);
      while (b === a) b = 1 + Math.floor(Math.random() * 98);
      return { a, b, target: a > b ? "left" : "right" };
    });

  const finish = () => {
    const resp = responsesRef.current;
    const answered = resp.filter((r) => r.rt !== null);
    setSummary({
      accuracy: Math.round((resp.filter((r) => r.correct).length / resp.length) * 100),
      avgRt: answered.length ? Math.round(answered.reduce((s, r) => s + r.rt, 0) / answered.length) : null,
    });
    setPhase("done");
  };

  const handleResponse = (dir) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimeout(timeoutRef.current);
    const trial = trialsRef.current[idxRef.current];
    const rt = dir ? performance.now() - startRef.current : null;
    responsesRef.current.push({ ...trial, dir, rt, correct: dir === trial.target });
    setPhase("blank");
    setTimeout(() => {
      const next = idxRef.current + 1;
      if (next >= TOTAL) finish();
      else {
        idxRef.current = next;
        startTrial(next);
      }
    }, 200);
  };

  const startTrial = (i) => {
    const trial = trialsRef.current[i];
    setDisplay(trial);
    setTrialNum(i);
    setPhase("fixation");
    setTimeout(() => {
      answeredRef.current = false;
      setPhase("stimulus");
      startRef.current = performance.now();
      timeoutRef.current = setTimeout(() => handleResponse(null), 1500);
    }, 350);
  };

  const beginGame = () => {
    trialsRef.current = genTrials();
    idxRef.current = 0;
    responsesRef.current = [];
    startTrial(0);
  };

  useEffect(() => {
    if (phase !== "stimulus") return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") handleResponse("left");
      else if (e.key === "ArrowRight") handleResponse("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Magnitudes" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Pick the larger number" onStart={beginGame}>
          Two numbers will appear side by side. Click the larger one — or use the left / right arrow keys — as fast
          as you can, over {TOTAL} trials.
        </InstructionsScreen>
      )}
      {(phase === "fixation" || phase === "stimulus" || phase === "blank") && display && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            Trial {trialNum + 1} of {TOTAL}
          </div>
          <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginBottom: 36 }}>
            {phase === "fixation" && <div style={{ fontSize: 26, color: C.textMuted }}>+</div>}
            {phase === "stimulus" && (
              <>
                <button
                  onClick={() => handleResponse("left")}
                  style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 600, background: "none", border: "none", color: C.text, cursor: "pointer" }}
                >
                  {display.a}
                </button>
                <button
                  onClick={() => handleResponse("right")}
                  style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 600, background: "none", border: "none", color: C.text, cursor: "pointer" }}
                >
                  {display.b}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Magnitudes complete"
          stats={[
            { value: `${summary.accuracy}%`, label: "Accuracy" },
            { value: summary.avgRt ? `${summary.avgRt} ms` : "—", label: "Avg. reaction time" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game: sequences ---------- */

function SequencesGame({ onBack, onFinish }) {
  const TOTAL = 8;
  const [phase, setPhase] = useState("instructions");
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [times, setTimes] = useState([]);
  const [summary, setSummary] = useState(null);

  const beginQuestion = (i) => {
    setQIdx(i);
    setQuestion(genSequenceQuestion());
    setSelected(null);
    setStartTime(performance.now());
    setPhase("question");
  };

  const beginGame = () => {
    setCorrectCount(0);
    setTimes([]);
    beginQuestion(0);
  };

  const answer = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === question.answer) setCorrectCount((c) => c + 1);
    setTimes((t) => [...t, Math.round(performance.now() - startTime)]);
    setPhase("feedback");
  };

  const next = () => {
    const nextIdx = qIdx + 1;
    if (nextIdx >= TOTAL) {
      const avgTime = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
      setSummary({ correctCount, avgTime });
      setPhase("done");
    } else {
      beginQuestion(nextIdx);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Sequences" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="What comes next?" onStart={beginGame}>
          Each round shows a sequence of numbers following a pattern. Pick what comes next from the four options,
          across {TOTAL} rounds. Take the time you need.
        </InstructionsScreen>
      )}
      {(phase === "question" || phase === "feedback") && question && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
            Round {qIdx + 1} of {TOTAL}
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 24, fontWeight: 600, marginBottom: 32, letterSpacing: 1 }}>
            {question.shown.join("  ,  ")}  ,  ?
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {question.options.map((opt, i) => {
              const isCorrect = phase === "feedback" && opt === question.answer;
              const isWrongPick = phase === "feedback" && opt === selected && opt !== question.answer;
              return (
                <button
                  key={i}
                  onClick={() => answer(opt)}
                  disabled={phase === "feedback"}
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: 18,
                    fontWeight: 600,
                    padding: "14px 0",
                    background: isCorrect ? C.good : isWrongPick ? C.danger : C.surface,
                    color: isCorrect || isWrongPick ? "#0D1116" : C.text,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {phase === "feedback" && (
            <div className="mt-8">
              <PrimaryButton onClick={next}>{qIdx + 1 >= TOTAL ? "See results" : "Next"}</PrimaryButton>
            </div>
          )}
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Sequences complete"
          stats={[
            { value: `${summary.correctCount}/${TOTAL}`, label: "Correct" },
            { value: `${(summary.avgTime / 1000).toFixed(1)}s`, label: "Avg. time" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- dashboard ---------- */

function GameCard({ game, result, onSelect }) {
  return (
    <button
      onClick={() => onSelect(game.id)}
      className="text-left p-5 flex flex-col gap-3"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${C.accent}`,
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: MONO_FONT, color: C.textMuted, fontSize: 12 }}>
          {String(game.num).padStart(2, "0")} / {GAMES.length}
        </span>
        {result && <CheckCircle2 size={16} color={C.good} />}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600 }}>{game.title}</div>
      <div style={{ fontSize: 13.5, color: C.textMuted, lineHeight: 1.4 }}>{game.blurb}</div>
      <div style={{ fontSize: 12, color: result ? C.accent2 : C.accent, display: "flex", alignItems: "center", gap: 4 }}>
        {result ? "Play again" : "Play"} <ArrowRight size={12} />
      </div>
    </button>
  );
}

function Dashboard({ results, onSelect }) {
  const completedCount = Object.keys(results).length;
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: C.accent, letterSpacing: 1 }}>PRACTICE MODE</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>Games practice arena</h1>
        <p style={{ color: C.textMuted, marginTop: 10, maxWidth: 560, lineHeight: 1.55, fontSize: 14.5 }}>
          A stand-in for the kind of behavioural games used in some job application screenings — similar mechanics,
          no stakes, nothing recorded or sent anywhere. Not affiliated with pymetrics or any employer.
        </p>
        <div style={{ marginTop: 16, fontSize: 13, color: C.textMuted }}>{completedCount} of {GAMES.length} tried</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((g) => (
          <GameCard key={g.id} game={g} result={results[g.id]} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [view, setView] = useState("dashboard");
  const [results, setResults] = useState({});

  const finishGame = (id, summary) => {
    setResults((prev) => ({ ...prev, [id]: summary }));
    setView("dashboard");
  };

  const GAME_COMPONENTS = {
    exchange: ExchangeGame,
    keypress: KeypressGame,
    balloon: BalloonGame,
    exchange2: MoneyExchange2Game,
    digits: DigitsGame,
    easyhard: EasyOrHardGame,
    stop: StopGame,
    cards: CardsGame,
    arrows: ArrowGame,
    lengths: LengthsGame,
    towers: TowersGame,
    faces: FaceGame,
    memory: MemoryGame,
    sort: CardSortGame,
    reaction: ReactionTimerGame,
    magnitudes: MagnitudesGame,
    sequences: SequencesGame,
  };

  const ActiveGame = view !== "dashboard" ? GAME_COMPONENTS[view] : null;

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: HEAD_FONT }}>
      <style>{FONT_IMPORT}</style>
      {view === "dashboard" && <Dashboard results={results} onSelect={setView} />}
      {ActiveGame && <ActiveGame onBack={() => setView("dashboard")} onFinish={(s) => finishGame(view, s)} />}
    </div>
  );
}