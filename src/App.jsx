import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";

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
  { id: "balloon", num: 1, title: "Balloon Risk", blurb: "Pump each balloon for points — cash out before it pops." },
  { id: "exchange", num: 2, title: "Money Exchange", blurb: "Decide how much to share with a partner across rounds." },
  { id: "arrows", num: 3, title: "Arrow Matching", blurb: "React to the middle arrow while ignoring the ones around it." },
  { id: "easyhard", num: 4, title: "Easy or Hard", blurb: "Choose between a quick task and a harder, higher-value one." },
  { id: "memory", num: 5, title: "Memory Cards", blurb: "Watch a sequence light up, then repeat it back." },
  { id: "faces", num: 6, title: "Face Matching", blurb: "Decide if two expressions show the same emotion." },
  { id: "sort", num: 7, title: "Card Sort", blurb: "Sort cards by a rule that shifts without warning." },
  { id: "reaction", num: 8, title: "Reaction Timer", blurb: "Tap the instant the circle turns green." },
  { id: "stopsignal", num: 9, title: "Stop Signal", blurb: "Respond quickly, but hold back on the stop cue." },
  { id: "magnitudes", num: 10, title: "Magnitudes", blurb: "Pick the larger number, again and again, at speed." },
  { id: "sequences", num: 11, title: "Sequences", blurb: "Spot the pattern and predict what comes next." },
  { id: "keypress", num: 12, title: "Keypresses", blurb: "Tap for one letter, hold back for every other." },
];

const BALLOON_TYPES = [
  { color: "#4FB3A9", label: "Teal", min: 1, max: 30 },
  { color: "#E3B54F", label: "Gold", min: 1, max: 16 },
  { color: "#E0684A", label: "Coral", min: 1, max: 9 },
];
const PUMP_VALUE = 5;

const CARD_COLORS = ["#D9694A", "#4FB3A9", "#6FBF73", "#E3B54F"];
const CARD_SHAPES = ["circle", "square", "triangle", "star"];

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

/* ---------- game 1: balloon risk ---------- */

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
      <GameHeader title="Balloon Risk" onBack={onBack} />
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
          title="Balloon Risk complete"
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

/* ---------- game 2: money exchange ---------- */

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
      <GameHeader title="Money Exchange" onBack={onBack} />
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
          title="Money Exchange complete"
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

/* ---------- game 3: arrow matching (flanker) ---------- */

function ArrowGame({ onBack, onFinish }) {
  const TOTAL = 16;
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
    Array.from({ length: TOTAL }, () => ({
      target: Math.random() < 0.5 ? "left" : "right",
      congruent: Math.random() < 0.5,
    }));

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
      timeoutRef.current = setTimeout(() => handleResponse(null), 1800);
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

  const Arrow = ({ dir, muted }) =>
    dir === "left" ? (
      <ArrowLeft size={32} color={muted ? C.textMuted : C.text} strokeWidth={2.5} />
    ) : (
      <ArrowRight size={32} color={muted ? C.textMuted : C.text} strokeWidth={2.5} />
    );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Arrow Matching" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Follow the centre arrow" onStart={beginGame}>
          A row of arrows will flash on screen. Respond to the direction of the{" "}
          <b style={{ color: C.text }}>middle</b> arrow only, ignoring the ones around it — press the left or right
          arrow key, or tap a button below. Answer as fast and accurately as you can, over {TOTAL} trials.
        </InstructionsScreen>
      )}
      {(phase === "fixation" || phase === "stimulus" || phase === "blank") && display && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            Trial {trialNum + 1} of {TOTAL}
          </div>
          <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
            {phase === "fixation" && <div style={{ fontSize: 26, color: C.textMuted }}>+</div>}
            {phase === "stimulus" && (
              <div className="flex items-center gap-1">
                <Arrow dir={display.congruent ? display.target : display.target === "left" ? "right" : "left"} muted />
                <Arrow dir={display.congruent ? display.target : display.target === "left" ? "right" : "left"} muted />
                <Arrow dir={display.target} />
                <Arrow dir={display.congruent ? display.target : display.target === "left" ? "right" : "left"} muted />
                <Arrow dir={display.congruent ? display.target : display.target === "left" ? "right" : "left"} muted />
              </div>
            )}
          </div>
          <div
            className="flex gap-3"
            style={{ opacity: phase === "stimulus" ? 1 : 0.25, pointerEvents: phase === "stimulus" ? "auto" : "none" }}
          >
            <SecondaryButton onClick={() => handleResponse("left")}>
              <ArrowLeft size={16} />
            </SecondaryButton>
            <SecondaryButton onClick={() => handleResponse("right")}>
              <ArrowRight size={16} />
            </SecondaryButton>
          </div>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Arrow Matching complete"
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

/* ---------- game 4: easy or hard ---------- */

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

/* ---------- game 5: memory cards ---------- */

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

/* ---------- game 6: face matching ---------- */

function FaceGame({ onBack, onFinish }) {
  const FACES = [
    { emoji: "😀", label: "happy" },
    { emoji: "😢", label: "sad" },
    { emoji: "😠", label: "angry" },
    { emoji: "😲", label: "surprised" },
    { emoji: "😐", label: "neutral" },
    { emoji: "😨", label: "afraid" },
  ];
  const TOTAL = 14;
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
      const same = Math.random() < 0.5;
      const a = FACES[Math.floor(Math.random() * FACES.length)];
      let b = a;
      if (!same) {
        do {
          b = FACES[Math.floor(Math.random() * FACES.length)];
        } while (b.label === a.label);
      }
      return { a, b, same };
    });

  const finish = () => {
    const resp = responsesRef.current;
    const avgOf = (arr) => {
      const f = arr.filter((r) => r.rt !== null);
      return f.length ? Math.round(f.reduce((s, r) => s + r.rt, 0) / f.length) : null;
    };
    setSummary({
      accuracy: Math.round((resp.filter((r) => r.correct).length / resp.length) * 100),
      avgRt: avgOf(resp),
    });
    setPhase("done");
  };

  const handleResponse = (ans) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimeout(timeoutRef.current);
    const trial = trialsRef.current[idxRef.current];
    const rt = ans !== null ? performance.now() - startRef.current : null;
    responsesRef.current.push({ ...trial, ans, rt, correct: ans === trial.same });
    setPhase("blank");
    setTimeout(() => {
      const next = idxRef.current + 1;
      if (next >= TOTAL) finish();
      else {
        idxRef.current = next;
        startTrial(next);
      }
    }, 250);
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
      timeoutRef.current = setTimeout(() => handleResponse(null), 3000);
    }, 400);
  };

  const beginGame = () => {
    trialsRef.current = genTrials();
    idxRef.current = 0;
    responsesRef.current = [];
    startTrial(0);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Face Matching" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Same or different?" onStart={beginGame}>
          Two faces will appear side by side. Decide whether they're showing the <b style={{ color: C.text }}>same</b>{" "}
          emotion or a <b style={{ color: C.text }}>different</b> one, as quickly and accurately as you can, over{" "}
          {TOTAL} trials.
        </InstructionsScreen>
      )}
      {(phase === "fixation" || phase === "stimulus" || phase === "blank") && display && (
        <div className="flex flex-col items-center">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            Trial {trialNum + 1} of {TOTAL}
          </div>
          <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginBottom: 36 }}>
            {phase === "fixation" && <div style={{ fontSize: 26, color: C.textMuted }}>+</div>}
            {phase === "stimulus" && (
              <>
                <div style={{ fontSize: 56 }}>{display.a.emoji}</div>
                <div style={{ fontSize: 56 }}>{display.b.emoji}</div>
              </>
            )}
          </div>
          <div
            className="flex gap-3"
            style={{ opacity: phase === "stimulus" ? 1 : 0.25, pointerEvents: phase === "stimulus" ? "auto" : "none" }}
          >
            <SecondaryButton onClick={() => handleResponse(true)}>Same</SecondaryButton>
            <SecondaryButton onClick={() => handleResponse(false)}>Different</SecondaryButton>
          </div>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Face Matching complete"
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

/* ---------- game 7: card sort ---------- */

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

/* ---------- game 8: reaction timer ---------- */

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

/* ---------- game 9: stop signal ---------- */

function StopSignalGame({ onBack, onFinish }) {
  const TOTAL = 20;
  const STOP_PROB = 0.25;
  const STOP_DELAY = 250;
  const RESPONSE_WINDOW = 900;

  const [phase, setPhase] = useState("instructions");
  const [trialNum, setTrialNum] = useState(0);
  const [summary, setSummary] = useState(null);
  const trialsRef = useRef([]);
  const idxRef = useRef(0);
  const startRef = useRef(0);
  const respondedRef = useRef(false);
  const stopTimerRef = useRef(null);
  const endTimerRef = useRef(null);
  const resultsRef = useRef([]);

  const genTrials = () => Array.from({ length: TOTAL }, () => ({ stop: Math.random() < STOP_PROB }));

  const finish = () => {
    const res = resultsRef.current;
    const goTrials = res.filter((r) => !r.stop);
    const stopTrials = res.filter((r) => r.stop);
    const goAcc = goTrials.length ? Math.round((goTrials.filter((r) => r.outcome === "goHit").length / goTrials.length) * 100) : 0;
    const stopAcc = stopTrials.length
      ? Math.round((stopTrials.filter((r) => r.outcome === "stopSuccess").length / stopTrials.length) * 100)
      : 0;
    const goHits = goTrials.filter((r) => r.outcome === "goHit" && r.rt !== null);
    const avgGoRt = goHits.length ? Math.round(goHits.reduce((s, r) => s + r.rt, 0) / goHits.length) : null;
    setSummary({ goAcc, stopAcc, avgGoRt });
    setPhase("done");
  };

  const concludeTrial = (responded) => {
    if (resultsRef.current[idxRef.current] !== undefined) return;
    clearTimeout(stopTimerRef.current);
    clearTimeout(endTimerRef.current);
    const trial = trialsRef.current[idxRef.current];
    const rt = responded ? performance.now() - startRef.current : null;
    let outcome;
    if (trial.stop) outcome = responded ? "stopFail" : "stopSuccess";
    else outcome = responded ? "goHit" : "goMiss";
    resultsRef.current[idxRef.current] = { ...trial, rt, outcome };
    setPhase("blank");
    setTimeout(() => {
      const next = idxRef.current + 1;
      if (next >= TOTAL) {
        finish();
      } else {
        idxRef.current = next;
        startTrial(next);
      }
    }, 250);
  };

  const startTrial = (i) => {
    const trial = trialsRef.current[i];
    setTrialNum(i);
    respondedRef.current = false;
    setPhase("go");
    startRef.current = performance.now();
    if (trial.stop) {
      stopTimerRef.current = setTimeout(() => setPhase("stop"), STOP_DELAY);
    }
    endTimerRef.current = setTimeout(() => concludeTrial(false), RESPONSE_WINDOW);
  };

  const respond = () => {
    if (respondedRef.current) return;
    respondedRef.current = true;
    concludeTrial(true);
  };

  const beginGame = () => {
    trialsRef.current = genTrials();
    idxRef.current = 0;
    resultsRef.current = [];
    startTrial(0);
  };

  useEffect(() => {
    if (phase !== "go" && phase !== "stop") return;
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        respond();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(
    () => () => {
      clearTimeout(stopTimerRef.current);
      clearTimeout(endTimerRef.current);
    },
    []
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <GameHeader title="Stop Signal" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title="Go — unless it turns red" onStart={beginGame}>
          Tap the circle (or press space) as fast as you can every time it's green. If it turns red before you
          respond, hold back and don't tap. {TOTAL} trials.
        </InstructionsScreen>
      )}
      {(phase === "go" || phase === "stop" || phase === "blank") && (
        <div className="flex flex-col items-center py-10">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            Trial {trialNum + 1} of {TOTAL}
          </div>
          <div
            onClick={phase === "go" ? respond : undefined}
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: phase === "stop" ? C.danger : phase === "go" ? C.good : C.surface,
              border: `2px solid ${phase === "blank" ? C.border : "transparent"}`,
              cursor: phase === "go" ? "pointer" : "default",
            }}
          />
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Stop Signal complete"
          stats={[
            { value: `${summary.goAcc}%`, label: "Go accuracy" },
            { value: `${summary.stopAcc}%`, label: "Successful stops" },
            { value: summary.avgGoRt ? `${summary.avgGoRt} ms` : "—", label: "Avg. go RT" },
          ]}
          onBack={() => onFinish(summary)}
        />
      )}
    </div>
  );
}

/* ---------- game 10: magnitudes ---------- */

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

/* ---------- game 11: sequences ---------- */

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

/* ---------- game 12: keypresses ---------- */

function KeypressGame({ onBack, onFinish }) {
  const TOTAL = 24;
  const GO_LETTER = "M";
  const NOGO_LETTER = "W";
  const OTHER_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "N", "P", "R", "S", "T", "V"];
  const GO_PROB = 0.5;
  const NOGO_PROB = 0.2;
  const STIM_DURATION = 700;

  const [phase, setPhase] = useState("instructions");
  const [letter, setLetter] = useState("");
  const [trialNum, setTrialNum] = useState(0);
  const [summary, setSummary] = useState(null);
  const trialsRef = useRef([]);
  const idxRef = useRef(0);
  const startRef = useRef(0);
  const respondedRef = useRef(false);
  const resultsRef = useRef([]);
  const timeoutRef = useRef(null);

  const genTrials = () =>
    Array.from({ length: TOTAL }, () => {
      const r = Math.random();
      if (r < GO_PROB) return { letter: GO_LETTER, isGo: true };
      if (r < GO_PROB + NOGO_PROB) return { letter: NOGO_LETTER, isGo: false };
      return { letter: OTHER_LETTERS[Math.floor(Math.random() * OTHER_LETTERS.length)], isGo: false };
    });

  const finish = () => {
    const res = resultsRef.current;
    const goTrials = res.filter((r) => r.isGo);
    const nogoTrials = res.filter((r) => r.letter === NOGO_LETTER);
    const hits = goTrials.filter((r) => r.responded);
    const hitRate = goTrials.length ? Math.round((hits.length / goTrials.length) * 100) : 0;
    const falseAlarms = nogoTrials.filter((r) => r.responded).length;
    const faRate = nogoTrials.length ? Math.round((falseAlarms / nogoTrials.length) * 100) : 0;
    const avgRt = hits.length ? Math.round(hits.reduce((s, r) => s + r.rt, 0) / hits.length) : null;
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
    setLetter(trial.letter);
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
      <GameHeader title="Keypresses" onBack={onBack} />
      {phase === "instructions" && (
        <InstructionsScreen title={`Tap for "${GO_LETTER}", not for "${NOGO_LETTER}"`} onStart={beginGame}>
          Letters will flash one at a time. Tap the button (or press space) whenever you see{" "}
          <b style={{ color: C.text }}>{GO_LETTER}</b>. Hold back for <b style={{ color: C.text }}>{NOGO_LETTER}</b>{" "}
          and every other letter. {TOTAL} letters total.
        </InstructionsScreen>
      )}
      {(phase === "stimulus" || phase === "blank") && (
        <div className="flex flex-col items-center py-6">
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24 }}>
            Letter {trialNum + 1} of {TOTAL}
          </div>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 10,
              background: C.surface,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO_FONT,
              fontSize: 56,
              fontWeight: 600,
              marginBottom: 32,
            }}
          >
            {phase === "stimulus" ? letter : ""}
          </div>
          <SecondaryButton onClick={respond}>Tap</SecondaryButton>
        </div>
      )}
      {phase === "done" && summary && (
        <DoneScreen
          title="Keypresses complete"
          stats={[
            { value: `${summary.hitRate}%`, label: `Hit rate (${GO_LETTER})` },
            { value: `${summary.faRate}%`, label: "False alarms" },
            { value: summary.avgRt ? `${summary.avgRt} ms` : "—", label: "Avg. reaction time" },
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
          {String(game.num).padStart(2, "0")} / 12
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
        <div style={{ marginTop: 16, fontSize: 13, color: C.textMuted }}>{completedCount} of 12 tried</div>
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
    balloon: BalloonGame,
    exchange: ExchangeGame,
    arrows: ArrowGame,
    easyhard: EasyOrHardGame,
    memory: MemoryGame,
    faces: FaceGame,
    sort: CardSortGame,
    reaction: ReactionTimerGame,
    stopsignal: StopSignalGame,
    magnitudes: MagnitudesGame,
    sequences: SequencesGame,
    keypress: KeypressGame,
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
