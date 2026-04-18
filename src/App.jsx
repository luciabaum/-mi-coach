import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `Sos una entrenadora personal experta y empática llamada "Coach". Conocés muy bien a tu clienta y tenés toda su información:

PERFIL:
- Mujer, 30-45 años
- Nivel: Intermedia (1-2 años de experiencia previa, parada hace más de 1 año)
- Objetivo: Perder grasa, tonificar, verse y sentirse mejor
- Zona de foco: Piernas y glúteos (aunque quiere trabajar todo el cuerpo)
- Sin lesiones ni limitaciones físicas
- Gimnasio completo disponible
- 3 días/semana, +60 min por sesión
- Cardio: elíptico (lo tolera)
- Alimentación: regular, con altibajos
- Sueño: bien, pero estrés alto
- Dejó el gimnasio por falta de motivación

RUTINA ACTUAL — FASE 1 (Semanas 1-4, Reintroducción):
BLOQUE DE ABS: Crunch básico 3x20, Crunch bicicleta 3x15, Plancha frontal 3x30seg, Dead bug 3x10/lado
DÍA 1 — Tren inferior: Sentadilla con barra 3x15 20-30kg, Hip thrust 3x12 20-40kg, P.muerto rumano 3x12 20-30kg, Abducción máquina 3x15 20-30kg, Elíptico 15min
DÍA 2 — Tren superior: Press banca mancuernas 3x12 8-12kg, Remo polea 3x12 25-35kg, Press militar 3x12 6-10kg, Jalón al pecho 3x12 25-35kg, Curl bíceps 3x12 6-10kg, Elíptico 15min
DÍA 3 — Cuerpo completo: Goblet squat 3x12 12-16kg, Zancadas 3x10/pierna 8-10kg, Remo mancuernas 3x12 10-14kg, Press hombros 3x12 15-25kg, Extensión tríceps 3x12 10-15kg, P.muerto mancuernas 3x12 12-16kg, Elíptico 20min

Tu rol: Seguimiento, ajustá rutinas, motivá sin exagerar, respondé en español cercano y directo, analizá registros, recordá progresar pesos, considerá el estrés. Máx 4-5 oraciones.`;

const INITIAL_MESSAGE = { role: "assistant", content: "¡Hola! 💜 Soy tu Coach. Ya tengo toda tu info cargada. ¿Cómo arrancamos hoy?" };

const EXERCISE_TIPS = {
  squat: "Pies a ancho de hombros, puntas levemente hacia afuera. Bajá como si fueras a sentarte en una silla, rodillas alineadas con los pies. Pecho arriba, espalda recta. Bajá hasta que los muslos queden paralelos al piso.",
  hipthrust: "Apoyá la parte alta de la espalda en el banco. Pies apoyados en el piso a ancho de caderas. Empujá la cadera hacia arriba apretando los glúteos al máximo. Bajá sin tocar el piso y volvé a subir.",
  rdl: "Pies a ancho de caderas, barra cerca del cuerpo. Inclinarte hacia adelante empujando las caderas hacia atrás, espalda recta. Sentís el estiramiento en los isquiotibiales. Volvé apretando glúteos.",
  abduction: "Sentada en la máquina con la espalda bien apoyada. Abrí las piernas hacia afuera de forma controlada. Resistí el cierre lento. Enfocate en sentir el trabajo en la parte externa del glúteo.",
  bench: "Acostada en el banco, mancuernas a la altura del pecho. Codos a 45° del cuerpo. Empujá hacia arriba y adentro juntando las mancuernas arriba. Bajá de forma controlada.",
  cablerow: "Sentada con la espalda recta, agarre neutro. Tirá del cable hacia el abdomen apretando los omóplatos al final. Extendé los brazos de forma controlada sin redondear la espalda.",
  ohpress: "De pie o sentada, mancuernas a la altura de los hombros. Empujá hacia arriba sin arquear la espalda. Bajá hasta que los codos queden a 90°. Core apretado durante todo el movimiento.",
  latpull: "Sentada, agarre más ancho que los hombros. Tirá la barra hacia el pecho inclinando levemente el torso. Apretá los omóplatos abajo. Extendé los brazos de forma controlada.",
  curl: "De pie, codos pegados al cuerpo. Subí las mancuernas rotando levemente la muñeca. No balancees el cuerpo. Bajá de forma lenta y controlada.",
  goblet: "Sostené la mancuerna con ambas manos frente al pecho. Pies a ancho de hombros. Bajá en sentadilla profunda manteniendo el pecho arriba y los codos adentro de las rodillas.",
  lunge: "Un paso largo hacia adelante, bajá la rodilla trasera casi al piso. Rodilla delantera no pasa la punta del pie. Empujá con el talón delantero para volver. Alternando piernas caminando.",
  dbrow: "Apoyá una mano y rodilla en el banco. Con la otra mano tirá la mancuerna hacia la cadera apretando el omóplato. Codo cerca del cuerpo. Bajá de forma controlada.",
  shpress: "Sentada en la máquina, agarre a la altura de los hombros. Empujá hacia arriba sin bloquear los codos. Bajá controlado. Espalda bien apoyada en el respaldo.",
  triceps: "De pie frente a la polea, codos pegados al cuerpo y fijos. Extendé los brazos hacia abajo apretando los tríceps. Volvé lento sin mover los codos.",
  ddl: "Pies a ancho de caderas, mancuernas frente a los muslos. Inclinarte empujando caderas atrás, espalda recta. Bajá las mancuernas cerca de las piernas. Subí apretando glúteos y espalda baja."
};

const ROUTINE = {
  abs: [
    { id: "crunch", name: "Crunch básico", sets: 3, reps: 20, tip: "Acostada boca arriba, rodillas dobladas. Manos detrás de la cabeza sin jalar el cuello. Subí el torso contrayendo el abdomen. Bajá lento sin apoyar completamente." },
    { id: "bicycle", name: "Crunch bicicleta", sets: 3, reps: 15, tip: "Acostada, manos detrás de la cabeza. Llevá el codo derecho hacia la rodilla izquierda mientras extendés la pierna derecha. Alternando de forma controlada." },
    { id: "plank", name: "Plancha frontal", sets: 3, reps: "30seg", tip: "Apoyada en antebrazos y puntas de pie. Cuerpo recto como una tabla, glúteos apretados, sin hundir ni elevar la cadera. Respirá de forma continua." },
    { id: "deadbug", name: "Dead bug", sets: 3, reps: "10/lado", tip: "Acostada boca arriba, brazos al techo, rodillas a 90°. Extendé el brazo derecho y la pierna izquierda sin tocar el piso. La espalda baja siempre pegada al piso." },
  ],
  days: [
    { label: "Día 1", subtitle: "Tren inferior · Glúteos", cardioMin: 15, exercises: [
      { id: "squat", name: "Sentadilla con barra", sets: 3, reps: 15, weight: "20-30kg" },
      { id: "hipthrust", name: "Hip thrust", sets: 3, reps: 12, weight: "20-40kg" },
      { id: "rdl", name: "P. muerto rumano", sets: 3, reps: 12, weight: "20-30kg" },
      { id: "abduction", name: "Abducción máquina", sets: 3, reps: 15, weight: "20-30kg" },
    ]},
    { label: "Día 2", subtitle: "Tren superior · Core", cardioMin: 15, exercises: [
      { id: "bench", name: "Press banca mancuernas", sets: 3, reps: 12, weight: "8-12kg c/u" },
      { id: "cablerow", name: "Remo polea sentada", sets: 3, reps: 12, weight: "25-35kg" },
      { id: "ohpress", name: "Press militar", sets: 3, reps: 12, weight: "6-10kg c/u" },
      { id: "latpull", name: "Jalón al pecho", sets: 3, reps: 12, weight: "25-35kg" },
      { id: "curl", name: "Curl bíceps", sets: 3, reps: 12, weight: "6-10kg c/u" },
    ]},
    { label: "Día 3", subtitle: "Cuerpo completo", cardioMin: 20, exercises: [
      { id: "goblet", name: "Goblet squat", sets: 3, reps: 12, weight: "12-16kg" },
      { id: "lunge", name: "Zancadas caminando", sets: 3, reps: "10/pierna", weight: "8-10kg c/u" },
      { id: "dbrow", name: "Remo mancuernas", sets: 3, reps: 12, weight: "10-14kg c/u" },
      { id: "shpress", name: "Press hombros máquina", sets: 3, reps: 12, weight: "15-25kg" },
      { id: "triceps", name: "Extensión tríceps", sets: 3, reps: 12, weight: "10-15kg" },
      { id: "ddl", name: "P. muerto mancuernas", sets: 3, reps: 12, weight: "12-16kg c/u" },
    ]},
  ]
};

const PHASE_WEEKS = 4;
const WATER_GOAL = 2500;
const C = { bg: "#2c2a35", surface: "#3a3845", border: "#4e4a5e", purple: "#b39ddb", purpleDark: "#4a4560", purpleBorder: "#6b6485", text: "#ede8f5", muted: "#9e99b0", deep: "#242230" };
const F = "Tahoma, sans-serif";
const todayKey = () => new Date().toISOString().split("T")[0];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [bodyWeights, setBodyWeights] = useState([]);
  const [exLogs, setExLogs] = useState({});
  const [phaseStart, setPhaseStart] = useState(null);
  const [water, setWater] = useState({});
  const [showLogModal, setShowLogModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editingWeight, setEditingWeight] = useState(null);
  const [logDay, setLogDay] = useState(0);
  const [logNotes, setLogNotes] = useState("");
  const [logBodyW, setLogBodyW] = useState("");
  const [logExW, setLogExW] = useState({});
  const [logAbsSets, setLogAbsSets] = useState({});
  const [logAbsReps, setLogAbsReps] = useState({});
  const [logCardioMin, setLogCardioMin] = useState("");
  const [newBW, setNewBW] = useState("");
  const [openEx, setOpenEx] = useState(null);
  const [showTip, setShowTip] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const w = localStorage.getItem("fc_workouts");
    const bw = localStorage.getItem("fc_bodyweights");
    const el = localStorage.getItem("fc_exlogs");
    const ps = localStorage.getItem("fc_phasestart");
    const wa = localStorage.getItem("fc_water");
    if (w) setWorkouts(JSON.parse(w));
    if (bw) setBodyWeights(JSON.parse(bw));
    if (el) setExLogs(JSON.parse(el));
    if (wa) setWater(JSON.parse(wa));
    if (ps) setPhaseStart(ps);
    else setShowStartModal(true);
  }, []);

  const save = (key, val) => localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));

  const startPhase = () => {
    const today = new Date().toISOString().split("T")[0];
    setPhaseStart(today); save("fc_phasestart", today); setShowStartModal(false);
  };

  const getPhaseInfo = () => {
    if (!phaseStart) return { week: 1, daysLeft: PHASE_WEEKS * 7, pct: 0 };
    const elapsed = Math.floor((Date.now() - new Date(phaseStart)) / 86400000);
    const total = PHASE_WEEKS * 7;
    return { week: Math.min(PHASE_WEEKS, Math.floor(elapsed / 7) + 1), daysLeft: Math.max(0, total - elapsed), pct: Math.min(100, (elapsed / total) * 100) };
  };

  const todayWater = water[todayKey()] || 0;
  const addWater = (ml) => {
    const key = todayKey();
    const newVal = Math.min(WATER_GOAL, (water[key] || 0) + ml);
    const newWater = { ...water, [key]: newVal };
    setWater(newWater); save("fc_water", newWater);
  };
  const resetWater = () => {
    const newWater = { ...water, [todayKey()]: 0 };
    setWater(newWater); save("fc_water", newWater);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const newMsgs = [...messages, { role: "user", content: text }];
    setMessages(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: newMsgs })
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: "assistant", content: data.content?.[0]?.text || "Error, intentá de nuevo." }]);
    } catch { setMessages([...newMsgs, { role: "assistant", content: "Hubo un error 💜" }]); }
    setLoading(false);
  };

  const openEditWorkout = (w) => {
    setEditingWorkout(w);
    setLogDay(ROUTINE.days.findIndex(d => d.label === w.day));
    setLogNotes(w.notes || "");
    setLogExW(w.exWeights || {});
    setLogBodyW("");
    setLogCardioMin(w.cardioMin || "");
    setLogAbsSets(w.absSets || {});
    setLogAbsReps(w.absReps || {});
    setShowLogModal(true);
  };

  const deleteWorkout = (id) => {
    const updated = workouts.filter(x => x.id !== id);
    setWorkouts(updated); save("fc_workouts", updated);
  };

  const logWorkout = () => {
    const day = ROUTINE.days[logDay];
    const date = new Date().toLocaleDateString("es-AR");
    const newEl = { ...exLogs };

    day.exercises.forEach(ex => {
      if (logExW[ex.id]) {
        if (!newEl[ex.id]) newEl[ex.id] = [];
        newEl[ex.id].push({ date, weight: logExW[ex.id] });
      }
    });
    ROUTINE.abs.forEach(ab => {
      if (logAbsSets[ab.id] || logAbsReps[ab.id]) {
        if (!newEl[ab.id]) newEl[ab.id] = [];
        newEl[ab.id].push({ date, sets: logAbsSets[ab.id] || "—", reps: logAbsReps[ab.id] || "—" });
      }
    });
    if (logCardioMin) {
      const cid = `cardio_d${logDay}`;
      if (!newEl[cid]) newEl[cid] = [];
      newEl[cid].push({ date, minutes: logCardioMin, goal: day.cardioMin });
    }
    setExLogs(newEl); save("fc_exlogs", newEl);

    if (logBodyW) {
      const newBws = [...bodyWeights, { date, weight: parseFloat(logBodyW), id: Date.now() }];
      setBodyWeights(newBws); save("fc_bodyweights", newBws);
    }

    if (editingWorkout) {
      const updated = workouts.map(x => x.id === editingWorkout.id ? { ...x, day: day.label, subtitle: day.subtitle, notes: logNotes, exWeights: { ...logExW }, cardioMin: logCardioMin, absSets: { ...logAbsSets }, absReps: { ...logAbsReps } } : x);
      setWorkouts(updated); save("fc_workouts", updated);
    } else {
      const w = { id: Date.now(), date, day: day.label, subtitle: day.subtitle, notes: logNotes, exWeights: { ...logExW }, cardioMin: logCardioMin, absSets: { ...logAbsSets }, absReps: { ...logAbsReps } };
      const newWs = [w, ...workouts]; setWorkouts(newWs); save("fc_workouts", newWs);
    }

    const summary = day.exercises.filter(e => logExW[e.id]).map(e => `${e.name}: ${logExW[e.id]}kg`).join(", ");
    const msg = `${editingWorkout ? "Edité" : "Registré"}: ${day.label} (${day.subtitle}). ${logBodyW ? `Peso: ${logBodyW}kg.` : ""} ${summary ? `Pesos: ${summary}.` : ""} ${logCardioMin ? `Cardio: ${logCardioMin}min de ${day.cardioMin}min.` : ""} ${logNotes || ""}`;
    setShowLogModal(false); setLogNotes(""); setLogBodyW(""); setLogExW({}); setLogAbsSets({}); setLogAbsReps({}); setLogCardioMin(""); setEditingWorkout(null);
    sendMessage(msg); setTab("chat");
  };

  const saveNewBW = () => {
    if (!newBW) return;
    if (editingWeight) {
      const updated = bodyWeights.map(b => b.id === editingWeight.id ? { ...b, weight: parseFloat(newBW) } : b);
      setBodyWeights(updated); save("fc_bodyweights", updated);
    } else {
      const bw = { date: new Date().toLocaleDateString("es-AR"), weight: parseFloat(newBW), id: Date.now() };
      const newBws = [...bodyWeights, bw]; setBodyWeights(newBws); save("fc_bodyweights", newBws);
    }
    setShowWeightModal(false); setNewBW(""); setEditingWeight(null);
  };

  const deleteWeight = (id) => {
    const updated = bodyWeights.filter(b => b.id !== id);
    setBodyWeights(updated); save("fc_bodyweights", updated);
  };

  const getExProg = (id) => {
    const logs = exLogs[id] || [];
    if (logs.length < 2) return null;
    const first = parseFloat(logs[0].weight), last = parseFloat(logs[logs.length-1].weight);
    if (isNaN(first) || isNaN(last)) return null;
    return { diff: (last - first).toFixed(1) };
  };

  const pi = getPhaseInfo();
  const currentBW = bodyWeights.length ? bodyWeights[bodyWeights.length-1].weight : null;
  const bwDiff = bodyWeights.length > 1 ? (currentBW - bodyWeights[0].weight).toFixed(1) : null;
  const weekWos = workouts.filter(w => (Date.now() - w.id) < 7*86400000).length;
  const waterPct = Math.min(100, (todayWater / WATER_GOAL) * 100);
  const waterColor = waterPct >= 100 ? "#88c9a1" : waterPct >= 60 ? "#89b4e8" : C.purple;

  const card = (children, extra = {}) => (
    <div style={{ background: C.surface, borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, marginBottom: 14, ...extra }}>{children}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: F, display: "flex", flexDirection: "column" }}>

      <div style={{ background: `linear-gradient(135deg, ${C.deep}, #2e2b3a)`, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: "bold", color: C.purple }}>💜 Mi Coach</div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>Fase 1 · Semana {pi.week}/{PHASE_WEEKS}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ background: C.purpleDark, borderRadius: 20, padding: "4px 12px", border: `1px solid ${C.purpleBorder}`, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: "bold", color: pi.daysLeft <= 7 ? "#e8a87c" : C.purple }}>{pi.daysLeft}d</span>
            <span style={{ fontSize: 10, color: C.muted }}> para Fase 2</span>
          </div>
          <div style={{ width: 100, height: 4, background: C.purpleDark, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${pi.pct}%`, height: "100%", background: `linear-gradient(90deg, #8b7bb5, ${C.purple})`, borderRadius: 2 }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", background: C.deep, borderBottom: `1px solid ${C.border}` }}>
        {[["dashboard","📊","Dashboard"],["progreso","📈","Progreso"],["rutina","🏋️","Rutina"],["chat","💬","Coach"]].map(([id,icon,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "10px 4px", border: "none", cursor: "pointer", background: tab===id ? C.surface : "transparent", color: tab===id ? C.purple : C.muted, fontSize: 11, fontFamily: F, borderBottom: tab===id ? `2px solid ${C.purple}` : "2px solid transparent" }}>
            <div style={{ fontSize: 16 }}>{icon}</div><div style={{ marginTop: 1 }}>{label}</div>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 20 }}>

        {tab === "dashboard" && <div style={{ padding: 16 }}>

          <div style={{ background: `linear-gradient(135deg, ${C.deep}, #322f40)`, borderRadius: 14, padding: 16, border: `1px solid ${C.purpleBorder}`, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>🌱 Fase 1 — Reintroducción</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: C.purple }}>{pi.daysLeft === 0 ? "¡Lista para Fase 2! 🎉" : `${pi.daysLeft} días restantes`}</div>
              </div>
              <div style={{ background: C.purpleDark, borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: "bold", color: C.text }}>S{pi.week}</div>
                <div style={{ fontSize: 9, color: C.muted }}>de {PHASE_WEEKS}</div>
              </div>
            </div>
            <div style={{ background: C.bg, borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${pi.pct}%`, height: "100%", background: `linear-gradient(90deg, #8b7bb5, ${C.purple})`, borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: C.muted }}>Inicio</span>
              <span style={{ fontSize: 10, color: C.purple }}>{Math.round(pi.pct)}% completada</span>
              <span style={{ fontSize: 10, color: C.muted }}>Fase 2</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { l: "Sesiones totales", v: workouts.length, i: "🔥", c: "#e8a87c" },
              { l: "Esta semana", v: `${weekWos}/3`, i: "📅", c: "#88c9a1" },
              { l: "Peso actual", v: currentBW ? `${currentBW}kg` : "—", i: "⚖️", c: "#89b4e8" },
              { l: "Cambio total", v: bwDiff ? `${bwDiff > 0 ? "+" : ""}${bwDiff}kg` : "—", i: bwDiff < 0 ? "📉" : "📈", c: bwDiff < 0 ? "#88c9a1" : "#e8a87c" },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 20 }}>{s.i}</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: s.c, marginTop: 4 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {card(<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: "bold", color: C.purple }}>💧 Agua de hoy</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: "bold", color: waterColor }}>{(todayWater/1000).toFixed(1)}L</span>
                <span style={{ fontSize: 11, color: C.muted }}>/ 2.5L</span>
                <button onClick={resetWater} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, cursor: "pointer" }}>↺</button>
              </div>
            </div>
            <div style={{ background: C.bg, borderRadius: 8, height: 12, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ width: `${waterPct}%`, height: "100%", background: `linear-gradient(90deg, #89b4e8, ${waterColor})`, borderRadius: 8, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[150, 250, 350, 500].map(ml => (
                <button key={ml} onClick={() => addWater(ml)} style={{ flex: 1, background: todayWater >= WATER_GOAL ? C.border : C.purpleDark, border: `1px solid ${C.purpleBorder}`, borderRadius: 8, color: todayWater >= WATER_GOAL ? C.muted : C.purple, padding: "8px 4px", fontSize: 11, cursor: todayWater >= WATER_GOAL ? "default" : "pointer", fontFamily: F }}>+{ml}ml</button>
              ))}
            </div>
            {todayWater >= WATER_GOAL && <div style={{ textAlign: "center", fontSize: 12, color: "#88c9a1", marginTop: 8 }}>¡Objetivo cumplido! 🎉</div>}
          </>)}

          {card(<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: "bold", color: C.purple }}>⚖️ Peso corporal</div>
              <button onClick={() => { setEditingWeight(null); setNewBW(""); setShowWeightModal(true); }} style={{ background: C.purpleDark, border: `1px solid ${C.purpleBorder}`, borderRadius: 8, color: C.purple, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: F }}>+ Registrar</button>
            </div>
            {bodyWeights.length === 0 ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "10px 0" }}>Todavía no registraste tu peso 🌱</div> : (
              <div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 50, marginBottom: 10 }}>
                  {bodyWeights.slice(-12).map((bw, i, arr) => {
                    const ws = arr.map(b => b.weight), mn = Math.min(...ws)-1, mx = Math.max(...ws)+1;
                    const h = Math.max(6, ((bw.weight-mn)/(mx-mn))*44);
                    return <div key={i} style={{ flex: 1 }}><div style={{ width: "100%", background: i===arr.length-1 ? C.purple : C.purpleDark, borderRadius: "3px 3px 0 0", height: h }} /></div>;
                  })}
                </div>
                {bodyWeights.slice(-4).reverse().map((bw) => (
                  <div key={bw.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 12, color: C.muted }}>{bw.date}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: "bold", color: C.text }}>{bw.weight}kg</span>
                      <button onClick={() => { setEditingWeight(bw); setNewBW(String(bw.weight)); setShowWeightModal(true); }} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 14, cursor: "pointer" }}>✏️</button>
                      <button onClick={() => deleteWeight(bw.id)} style={{ background: "transparent", border: "none", color: "#c97a7a", fontSize: 14, cursor: "pointer" }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>)}

          {card(<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: "bold", color: C.purple }}>🗓️ Últimas sesiones</div>
              <button onClick={() => { setEditingWorkout(null); setLogDay(0); setLogNotes(""); setLogExW({}); setLogBodyW(""); setLogCardioMin(""); setLogAbsSets({}); setLogAbsReps({}); setShowLogModal(true); }} style={{ background: C.purple, border: "none", borderRadius: 8, color: C.deep, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: F, fontWeight: "bold" }}>+ Registrar</button>
            </div>
            {workouts.length === 0 ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "10px 0" }}>¡Registrá tu primera sesión! 💪</div>
              : workouts.slice(0,5).map((w, i) => (
                <div key={w.id} style={{ padding: "8px 0", borderBottom: i<Math.min(workouts.length,5)-1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: "bold" }}>{w.day}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{w.subtitle}</div>
                      {w.notes && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 2 }}>{w.notes}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: C.purple }}>{w.date}</span>
                      <button onClick={() => openEditWorkout(w)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 14, cursor: "pointer" }}>✏️</button>
                      <button onClick={() => { if(window.confirm("¿Eliminás esta sesión?")) deleteWorkout(w.id); }} style={{ background: "transparent", border: "none", color: "#c97a7a", fontSize: 14, cursor: "pointer" }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
          </>)}
        </div>}

        {tab === "progreso" && <div style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: "bold", color: C.purple, marginBottom: 4 }}>📈 Progreso por ejercicio</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Tocá para ver el historial.</div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: "bold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>💪 Abdominales</div>
            {ROUTINE.abs.map(ab => {
              const logs = exLogs[ab.id] || [];
              const last = logs.length ? logs[logs.length-1] : null;
              const isOpen = openEx === ab.id;
              return (
                <div key={ab.id} onClick={() => setOpenEx(isOpen ? null : ab.id)}
                  style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${isOpen ? C.purple : C.border}`, marginBottom: 8, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: "bold" }}>{ab.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>Objetivo: {ab.sets}x{ab.reps}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {last ? <>
                        <div style={{ fontSize: 12, color: C.purple }}>{last.sets} series</div>
                        <div style={{ fontSize: 12, color: C.purple }}>{last.reps} reps</div>
                      </> : <div style={{ fontSize: 11, color: C.muted }}>Sin registros</div>}
                    </div>
                  </div>
                  {isOpen && logs.length > 0 && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    {logs.slice(-5).reverse().map((l, li) => (
                      <div key={li} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0" }}>
                        <span style={{ color: C.muted }}>{l.date}</span>
                        <span style={{ color: C.text }}>{l.sets} series · {l.reps} reps</span>
                      </div>
                    ))}
                  </div>}
                </div>
              );
            })}
          </div>

          {ROUTINE.days.map((day, di) => (
            <div key={di} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: "bold", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{day.label} · {day.subtitle}</div>
              {day.exercises.map(ex => {
                const logs = exLogs[ex.id] || [];
                const lastW = logs.length ? logs[logs.length-1].weight : null;
                const prog = getExProg(ex.id);
                const isOpen = openEx === ex.id;
                return (
                  <div key={ex.id} onClick={() => setOpenEx(isOpen ? null : ex.id)}
                    style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${isOpen ? C.purple : C.border}`, marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: "bold" }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{ex.sets}x{ex.reps} · Ref: {ex.weight}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {lastW ? <>
                          <div style={{ fontSize: 16, fontWeight: "bold", color: C.purple }}>{lastW}kg</div>
                          {prog && <div style={{ fontSize: 11, color: prog.diff > 0 ? "#88c9a1" : "#e8a87c" }}>{prog.diff > 0 ? "+" : ""}{prog.diff}kg</div>}
                        </> : <div style={{ fontSize: 11, color: C.muted }}>Sin registros</div>}
                      </div>
                    </div>
                    {isOpen && <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                      {logs.length > 0 ? <>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 44, marginBottom: 8 }}>
                          {logs.slice(-8).map((l, li, arr) => {
                            const ws = arr.map(x => parseFloat(x.weight)), mn = Math.min(...ws)-1, mx = Math.max(...ws)+1;
                            const h = Math.max(4, ((parseFloat(l.weight)-mn)/(mx-mn))*36);
                            return <div key={li} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                              <div style={{ fontSize: 8, color: C.muted }}>{l.weight}</div>
                              <div style={{ width: "100%", background: li===arr.length-1 ? C.purple : C.purpleDark, borderRadius: "2px 2px 0 0", height: h }} />
                            </div>;
                          })}
                        </div>
                        {logs.slice(-5).reverse().map((l, li) => (
                          <div key={li} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0" }}>
                            <span style={{ color: C.muted }}>{l.date}</span>
                            <span style={{ color: C.text, fontWeight: li===0 ? "bold" : "normal" }}>{l.weight}kg</span>
                          </div>
                        ))}
                      </> : <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>Registrá pesos en tu próxima sesión 💜</div>}
                    </div>}
                  </div>
                );
              })}

              {(() => {
                const cid = `cardio_d${di}`;
                const logs = exLogs[cid] || [];
                const last = logs.length ? logs[logs.length-1] : null;
                const isOpen = openEx === cid;
                return (
                  <div onClick={() => setOpenEx(isOpen ? null : cid)}
                    style={{ background: C.surface, borderRadius: 10, padding: 12, border: `1px solid ${isOpen ? C.purple : C.border}`, marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: "bold" }}>🏃 Elíptico</div>
                        <div style={{ fontSize: 11, color: C.muted }}>Objetivo: {day.cardioMin} min</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {last ? <>
                          <div style={{ fontSize: 16, fontWeight: "bold", color: parseInt(last.minutes) >= day.cardioMin ? "#88c9a1" : "#e8a87c" }}>{last.minutes}min</div>
                          <div style={{ fontSize: 10, color: C.muted }}>de {day.cardioMin}min</div>
                        </> : <div style={{ fontSize: 11, color: C.muted }}>Sin registros</div>}
                      </div>
                    </div>
                    {isOpen && logs.length > 0 && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                      {logs.slice(-5).reverse().map((l, li) => (
                        <div key={li} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0" }}>
                          <span style={{ color: C.muted }}>{l.date}</span>
                          <span style={{ color: parseInt(l.minutes) >= l.goal ? "#88c9a1" : "#e8a87c", fontWeight: li===0 ? "bold" : "normal" }}>{l.minutes}min / {l.goal}min</span>
                        </div>
                      ))}
                    </div>}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>}

        {tab === "rutina" && <div style={{ padding: 16 }}>
          {card(<>
            <div style={{ fontSize: 14, fontWeight: "bold", color: C.purple, marginBottom: 10 }}>💪 Bloque de Abs — Inicio de cada sesión</div>
            {ROUTINE.abs.map((ex, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13 }}>{ex.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{ex.sets}x{ex.reps}</span>
                    <button onClick={() => setShowTip(showTip === ex.id ? null : ex.id)} style={{ background: C.purpleDark, border: "none", borderRadius: 12, color: C.purple, fontSize: 10, padding: "2px 8px", cursor: "pointer", fontFamily: F }}>?</button>
                  </div>
                </div>
                {showTip === ex.id && <div style={{ background: C.bg, borderRadius: 8, padding: 10, margin: "4px 0", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{ex.tip}</div>}
              </div>
            ))}
          </>, { border: `1px solid ${C.purpleBorder}` })}
          {ROUTINE.days.map((day, di) => card(
            <>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: "bold", color: C.purple }}>{day.label}</span>
                <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>· {day.subtitle}</span>
              </div>
              {day.exercises.map((ex, i) => {
                const logs = exLogs[ex.id] || [];
                const lastW = logs.length ? logs[logs.length-1].weight : null;
                return (
                  <div key={i}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 6, padding: "8px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13 }}>{ex.name}</div>
                        {lastW && <div style={{ fontSize: 10, color: "#88c9a1" }}>Último: {lastW}kg</div>}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>{ex.sets}x{ex.reps}</div>
                      <div style={{ fontSize: 11, color: C.purple, background: C.purpleDark, borderRadius: 6, padding: "2px 6px", textAlign: "center", minWidth: 54 }}>{ex.weight}</div>
                      <button onClick={() => setShowTip(showTip === ex.id ? null : ex.id)} style={{ background: C.purpleDark, border: "none", borderRadius: 12, color: C.purple, fontSize: 10, padding: "2px 8px", cursor: "pointer", fontFamily: F }}>?</button>
                    </div>
                    {showTip === ex.id && <div style={{ background: C.bg, borderRadius: 8, padding: 10, margin: "4px 0", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{EXERCISE_TIPS[ex.id]}</div>}
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: C.muted }}>🏃 Elíptico</div>
                <div style={{ fontSize: 12, color: C.purple }}>{day.cardioMin} min</div>
              </div>
            </>, di
          ))}
        </div>}

        {tab === "chat" && <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
          <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
                {m.role==="assistant" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.purpleDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>💜</div>}
                <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role==="user" ? C.purple : C.surface, color: m.role==="user" ? C.deep : C.text, fontSize: 13, lineHeight: 1.55, border: m.role==="assistant" ? `1px solid ${C.border}` : "none" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.purpleDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💜</div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", padding: "10px 16px" }}>
                <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.purple, animation: `bounce 1.2s ${i*.2}s infinite` }} />)}</div>
              </div>
            </div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: "0 12px 8px", display: "flex", gap: 6, overflowX: "auto" }}>
            {["¿Cómo progreso?","Ajustá mi rutina","Tips para hoy","Registrar sesión"].map((q,i) => (
              <button key={i} onClick={() => q==="Registrar sesión" ? setShowLogModal(true) : sendMessage(q)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, color: C.purple, padding: "5px 12px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: F }}>{q}</button>
            ))}
          </div>
          <div style={{ padding: "8px 12px 16px", display: "flex", gap: 8, background: C.deep, borderTop: `1px solid ${C.border}` }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage(input)} placeholder="Escribile a tu coach..."
              style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "10px 16px", color: C.text, fontSize: 13, fontFamily: F, outline: "none" }} />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{ background: input.trim() ? C.purple : C.purpleDark, border: "none", borderRadius: "50%", width: 40, height: 40, color: input.trim() ? C.deep : C.muted, cursor: input.trim() ? "pointer" : "default", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>➤</button>
          </div>
        </div>}
      </div>

      {showStartModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
        <div style={{ background: C.surface, borderRadius: 20, padding: 24, border: `1px solid ${C.purpleBorder}`, maxWidth: 320, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💜</div>
          <div style={{ fontSize: 18, fontWeight: "bold", color: C.purple, marginBottom: 8 }}>¡Bienvenida de vuelta!</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>¿Arrancás la Fase 1 hoy? Vamos a contar las 4 semanas desde ahora.</div>
          <button onClick={startPhase} style={{ width: "100%", background: C.purple, border: "none", borderRadius: 12, padding: 14, color: C.deep, fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: F }}>¡Arranco hoy! 🚀</button>
        </div>
      </div>}

      {showLogModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => { setShowLogModal(false); setEditingWorkout(null); }}>
        <div style={{ background: C.surface, borderRadius: "20px 20px 0 0", padding: 20, width: "100%", border: `1px solid ${C.border}`, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 16, fontWeight: "bold", color: C.purple, marginBottom: 14 }}>{editingWorkout ? "✏️ Editar sesión" : "🏋️ Registrar sesión"}</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>¿Qué día entrenaste?</div>
            <div style={{ display: "flex", gap: 8 }}>
              {ROUTINE.days.map((d,i) => <button key={i} onClick={() => setLogDay(i)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, cursor: "pointer", fontFamily: F, background: logDay===i ? C.purple : C.purpleDark, border: logDay===i ? "none" : `1px solid ${C.purpleBorder}`, color: logDay===i ? C.deep : C.purple, fontSize: 12, fontWeight: "bold" }}>{d.label}</button>)}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>💪 Abdominales</div>
            {ROUTINE.abs.map(ab => (
              <div key={ab.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{ab.name} <span style={{ color: C.muted }}>(obj: {ab.sets}x{ab.reps})</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Series</div>
                    <input type="number" placeholder={String(ab.sets)} value={logAbsSets[ab.id]||""} onChange={e => setLogAbsSets({...logAbsSets,[ab.id]:e.target.value})}
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 8px", color: C.text, fontSize: 13, fontFamily: F, outline: "none", textAlign: "center", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>Reps</div>
                    <input type="number" placeholder={String(ab.reps)} value={logAbsReps[ab.id]||""} onChange={e => setLogAbsReps({...logAbsReps,[ab.id]:e.target.value})}
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 8px", color: C.text, fontSize: 13, fontFamily: F, outline: "none", textAlign: "center", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>🏋️ Pesos por ejercicio</div>
            {ROUTINE.days[logDay].exercises.map(ex => (
              <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, fontSize: 12, color: C.text }}>{ex.name}</div>
                <input type="number" placeholder="kg" value={logExW[ex.id]||""} onChange={e => setLogExW({...logExW,[ex.id]:e.target.value})}
                  style={{ width: 64, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 8px", color: C.text, fontSize: 13, fontFamily: F, outline: "none", textAlign: "center" }} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>🏃 Elíptico — minutos hechos (objetivo: {ROUTINE.days[logDay].cardioMin} min)</div>
            <input type="number" value={logCardioMin} onChange={e => setLogCardioMin(e.target.value)} placeholder={String(ROUTINE.days[logDay].cardioMin)}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: F, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>⚖️ Peso corporal (kg) — opcional</div>
            <input type="number" value={logBodyW} onChange={e => setLogBodyW(e.target.value)} placeholder="Ej: 68.5"
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: F, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>📝 Notas — opcional</div>
            <textarea value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder="¿Cómo te sentiste?" rows={2}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: F, outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={logWorkout} style={{ width: "100%", background: C.purple, border: "none", borderRadius: 12, padding: 14, color: C.deep, fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: F }}>
            {editingWorkout ? "Guardar cambios 💜" : "Guardar y compartir con Coach 💜"}
          </button>
        </div>
      </div>}

      {showWeightModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => { setShowWeightModal(false); setEditingWeight(null); setNewBW(""); }}>
        <div style={{ background: C.surface, borderRadius: "20px 20px 0 0", padding: 20, width: "100%", border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 16, fontWeight: "bold", color: C.purple, marginBottom: 16 }}>{editingWeight ? "✏️ Editar peso" : "⚖️ Registrar peso corporal"}</div>
          <input type="number" value={newBW} onChange={e => setNewBW(e.target.value)} placeholder="Ej: 68.5 kg"
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px", color: C.text, fontSize: 16, fontFamily: F, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
          <button onClick={saveNewBW} style={{ width: "100%", background: C.purple, border: "none", borderRadius: 12, padding: 14, color: C.deep, fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: F }}>
            {editingWeight ? "Guardar cambio" : "Guardar"}
          </button>
        </div>
      </div>}

      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.purpleDark};border-radius:2px}
        input::placeholder,textarea::placeholder{color:${C.muted}}
      `}</style>
    </div>
  );
}
