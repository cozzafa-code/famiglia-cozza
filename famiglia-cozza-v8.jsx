import { useState, useEffect, useCallback, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const uid = () => Math.random().toString(36).slice(2, 9);
const nowD = () => new Date().toLocaleDateString("it-IT", { day: "numeric", month: "short" });
const nowT = () => new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
const doy = () => Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
const isoDay = () => new Date().toISOString().slice(0, 10);

const FAM = [
  { id: "fabio", name: "Fabio", emoji: "👨", color: "#5B8DEF", grad: "linear-gradient(135deg,#5B8DEF,#3B6FD4)" },
  { id: "lidia", name: "Lidia", emoji: "👩", color: "#E07BAF", grad: "linear-gradient(135deg,#E07BAF,#C45A91)" },
  { id: "walter", name: "Walter", emoji: "👦", color: "#47C5D8", grad: "linear-gradient(135deg,#47C5D8,#2BA8BC)" },
  { id: "lucrezia", name: "Lucrezia", emoji: "👧", color: "#F2845C", grad: "linear-gradient(135deg,#F2845C,#E06A3E)" },
];

const DEFAULT_PHASES = [
  { id: "prima", label: "Partenza", icon: "📦", color: "#F5A623" },
  { id: "arrivati", label: "Arrivati", icon: "✈️", color: "#47C5D8" },
  { id: "weekend", label: "Weekend", icon: "🗺️", color: "#6BC986" },
  { id: "vita", label: "Nuova Vita", icon: "🏠", color: "#E07BAF" },
];

const MOODS = ["😫", "😢", "😐", "🙂", "😄", "🤩"];
const EUR_PLN = 4.28;
const PHASE_COLORS = ["#F5A623","#47C5D8","#6BC986","#E07BAF","#5B8DEF","#F2845C","#9B7FE6","#E85D5D","#3DBFA0","#D4699A"];
const PHASE_ICONS = ["📦","✈️","🗺️","🏠","🎄","☀️","📚","🏔️","🎉","🌸","⛷️","🏖️","🎓","💼","🌍","❤️"];

// ═══ THEMES ═══
const THEMES = [
  { id: "caldo", name: "Caldo", icon: "☀️", bg: "#F5F3EE", card: "#FFFFFF", text: "#1C1C1E", sub: "#8A8780", muted: "#B0ADA6", border: "#E8E5E0", cardHov: "#F8F7F4", accent: null, f1: "'Nunito',sans-serif", f2: "'Playfair Display',serif", fonts: "Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900", dark: false },
  { id: "oceano", name: "Oceano", icon: "🌊", bg: "#EEF4FA", card: "#FFFFFF", text: "#1A2B3C", sub: "#6B8BA4", muted: "#9DB5C9", border: "#D4E4F0", cardHov: "#F0F6FC", accent: "#2B7FD4", f1: "'Inter',sans-serif", f2: "'Inter',sans-serif", fonts: "Inter:wght@400;600;700;800;900", dark: false },
  { id: "tramonto", name: "Tramonto", icon: "🌅", bg: "#FFF5F0", card: "#FFFFFF", text: "#2D1B14", sub: "#A07868", muted: "#C4A99D", border: "#F0DDD4", cardHov: "#FFF8F4", accent: "#E8613A", f1: "'Quicksand',sans-serif", f2: "'Quicksand',sans-serif", fonts: "Quicksand:wght@400;600;700", dark: false },
  { id: "foresta", name: "Foresta", icon: "🌿", bg: "#EFF5ED", card: "#FFFFFF", text: "#1C2A1C", sub: "#6B8A6B", muted: "#9CB59C", border: "#D4E4D0", cardHov: "#F4F8F2", accent: "#3A8A4A", f1: "'Nunito',sans-serif", f2: "'Playfair Display',serif", fonts: "Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900", dark: false },
  { id: "lavanda", name: "Lavanda", icon: "💜", bg: "#F4F0FA", card: "#FFFFFF", text: "#2A1F3A", sub: "#8A78A0", muted: "#B5A6C9", border: "#E0D4F0", cardHov: "#F8F4FC", accent: "#8B5CF6", f1: "'Poppins',sans-serif", f2: "'Poppins',sans-serif", fonts: "Poppins:wght@400;600;700;800;900", dark: false },
  { id: "candy", name: "Candy", icon: "🍬", bg: "#FFF5F8", card: "#FFFFFF", text: "#3A2040", sub: "#B068A0", muted: "#D4A0C8", border: "#F5D8EC", cardHov: "#FFF8FA", accent: "#FF69B4", f1: "'Quicksand',sans-serif", f2: "'Quicksand',sans-serif", fonts: "Quicksand:wght@400;600;700", dark: false },
  { id: "notte", name: "Notte", icon: "🌙", bg: "#141418", card: "#1E1E24", text: "#E8E6E0", sub: "#9A9890", muted: "#5A5850", border: "#2E2E36", cardHov: "#26262E", accent: "#FFB74D", f1: "'Inter',sans-serif", f2: "'Inter',sans-serif", fonts: "Inter:wght@400;600;700;800;900", dark: true },
  { id: "minimal", name: "Minimal", icon: "⬜", bg: "#FAFAFA", card: "#FFFFFF", text: "#111111", sub: "#666666", muted: "#999999", border: "#E0E0E0", cardHov: "#F5F5F5", accent: "#111111", f1: "'Inter',sans-serif", f2: "'Inter',sans-serif", fonts: "Inter:wght@400;600;700;800;900", dark: false },
];

const SHAPES = [
  { id: "morbido", name: "Morbido", icon: "⬜", card: 18, btn: 12, pill: 10, input: 13, header: 24, av: .35 },
  { id: "tondo", name: "Tondo", icon: "⚪", card: 26, btn: 18, pill: 20, input: 20, header: 30, av: .5 },
  { id: "squadrato", name: "Squadrato", icon: "🔲", card: 6, btn: 6, pill: 4, input: 6, header: 10, av: .2 },
  { id: "bolla", name: "Bolla", icon: "💊", card: 32, btn: 24, pill: 24, input: 24, header: 36, av: .45 },
];

const PHRASES = {
  prima: [
    { t: "Ogni grande avventura inizia col coraggio di partire.", s: "Oggi fate un passo avanti." },
    { t: "Non state scappando. State scegliendo.", s: "Il futuro per i vostri figli." },
    { t: "La paura è il biglietto per le cose belle.", s: "Sentirla è normale." },
    { t: "Tra un anno direte: ce l'abbiamo fatta.", s: "E sarà vero." },
    { t: "La Calabria le radici. La Polonia le ali.", s: "Portate il sole dentro." },
  ],
  arrivati: [
    { t: "Ce l'avete fatta. Siete qui.", s: "Sentite quanto siete stati bravi." },
    { t: "Non dovete capire tutto oggi.", s: "Una cosa nuova al giorno basta." },
    { t: "Ogni parola polacca è un ponte.", s: "Anche 'Dzień dobry' è perfetto." },
  ],
  weekend: [
    { t: "Oggi è giorno di scoperta!", s: "Un posto nuovo, un ricordo nuovo." },
    { t: "Poznań ha mille segreti.", s: "Oggi ne scoprite uno." },
  ],
  vita: [
    { t: "Casa è dove siete voi quattro.", s: "E voi siete qui. Insieme." },
    { t: "Se vi manca l'Italia, va bene.", s: "La nostalgia è amore." },
    { t: "Guardate quanta strada.", s: "Da Cosenza a Poznań. Incredibili." },
  ],
  _default: [
    { t: "Ogni giorno è un capitolo nuovo.", s: "Scrivetelo bene." },
    { t: "La vostra storia continua.", s: "E diventa sempre più bella." },
  ],
};

const RECIPES = [
  { id: "r1", name: "Pierogi Ruskie", icon: "🥟", time: "60m", diff: 2, color: "#F5A623", ing: [["Farina", "Mąka", "400g"], ["Uovo", "Jajko", "1"], ["Patate", "Ziemniaki", "500g"], ["Ricotta", "Twaróg", "250g"], ["Cipolla", "Cebula", "2"]], steps: ["Impastare farina, uovo, acqua, sale. Riposare 30min.", "Lessare patate, schiacciare con twaróg e cipolla fritta.", "Cerchi 7cm, farcire, chiudere a mezzaluna.", "Lessare 3-4min, servire con cipolla e panna."] },
  { id: "r2", name: "Żurek", icon: "🥣", time: "45m", diff: 2, color: "#47C5D8", ing: [["Lievito segale", "Żur", "500ml"], ["Salsiccia", "Kiełbasa", "300g"], ["Uova sode", "Jajka", "4"], ["Patate", "Ziemniaki", "3"]], steps: ["Cuocere salsiccia, tagliare.", "Scaldare żur con brodo.", "Aggiungere patate, aglio.", "Servire con uovo sodo."] },
  { id: "r3", name: "Placki", icon: "🥞", time: "30m", diff: 1, color: "#6BC986", ing: [["Patate", "Ziemniaki", "1kg"], ["Cipolla", "Cebula", "1"], ["Uova", "Jajka", "2"], ["Farina", "Mąka", "3 cucchiai"]], steps: ["Grattugiare patate, strizzare.", "Mescolare con uova, farina.", "Friggere 3min per lato.", "Servire con panna o zucchero!"] },
  { id: "r4", name: "Bigos", icon: "🥘", time: "2h+", diff: 3, color: "#E07BAF", ing: [["Crauti", "Kapusta", "500g"], ["Carne", "Mięso", "500g"], ["Salsiccia", "Kiełbasa", "200g"], ["Funghi", "Grzyby", "30g"]], steps: ["Rosolare carne.", "Aggiungere crauti, funghi.", "Unire salsiccia, prugne.", "Fuoco lento 2+ ore."] },
  { id: "r5", name: "Sernik", icon: "🍰", time: "75m", diff: 2, color: "#5B8DEF", ing: [["Ricotta", "Twaróg", "1kg"], ["Zucchero", "Cukier", "200g"], ["Uova", "Jajka", "5"], ["Biscotti", "Herbatniki", "200g"]], steps: ["Base: biscotti + burro.", "Twaróg + tuorli montati.", "Albumi a neve, incorporare.", "160°C per 60min."] },
  { id: "r6", name: "Pączki", icon: "🍩", time: "3h", diff: 3, color: "#F2845C", ing: [["Farina", "Mąka", "500g"], ["Latte", "Mleko", "200ml"], ["Tuorli", "Żółtka", "5"], ["Marmellata", "Konfitura", "200g"]], steps: ["Lievito in latte + zucchero.", "Impastare, lievitare 1h.", "Palline, lievitare 30min.", "Friggere 170°C, farcire."] },
];
const QUIZ = [["Dzień dobry","Buongiorno",["Buongiorno","Arrivederci","Grazie","Scusa"]],["Dziękuję","Grazie",["Per favore","Grazie","Scusa","Ciao"]],["Przepraszam","Mi scusi",["Buongiorno","Quanto costa?","Mi scusi","Prego"]],["Ile to kosztuje?","Quanto costa?",["Dove?","Quanto costa?","Come stai?","Che ore?"]],["Smacznego!","Buon appetito!",["Notte!","Buon appetito!","Salute!","Viaggio!"]],["Kocham cię","Ti amo",["Mi piaci","Ti amo","Grazie","Bello"]],["Lody","Gelato",["Torta","Gelato","Caramelle","Cioccolato"]],["Dobranoc","Buonanotte",["Giorno","Pomeriggio","Buonanotte","Sera"]],["Tak","Sì",["No","Forse","Sì","Grazie"]],["Cześć","Ciao",["Arrivederci","Giorno","Ciao","Notte"]]];
const KIDS_QS = ["Qual è la cosa più bella di oggi?","Cosa ti manca dell'Italia?","Hai imparato qualcosa di nuovo?","Cosa vorresti fare domani?","Cosa ti piace di Poznań?","Racconta un momento divertente!","Di cosa sei orgoglioso/a?","Cosa ti fa sentire al sicuro?","C'è qualcosa che ti preoccupa?","Ti sei sentito/a capito/a?"];
const TIPS = [["🛒","Biedronka vs Lidl","Biedronka base economica. Lidl offerte frutta."],["🚋","PEKA","Abbonamento ~110PLN/mese. Sotto 7 gratis!"],["💊","Apteka","Generici molto meno. 'Odpowiednik'."],["📱","Telefonia","30PLN/mese (~€7) internet illimitato!"],["🍕","Bar Mleczny","Pranzo 15-25PLN. Casalingo!"],["📦","OLX.pl","Il Subito polacco. Metà prezzo!"],["🎓","Bimbi","MDK comunali: 50-100PLN/mese."],["🎫","Cultura","Musei gratis martedì. Biblioteca gratis."]];

const mkTasks = () => [
  { id: uid(), text: "Disdire utenze Italia", phase: "prima", cat: "casa", pts: 15, done: false, assignee: "lidia" },
  { id: uid(), text: "Richiedere NASPI", phase: "prima", cat: "finanze", pts: 20, done: false, assignee: "fabio" },
  { id: uid(), text: "Apostille documenti", phase: "prima", cat: "documenti", pts: 15, done: false, assignee: "lidia" },
  { id: uid(), text: "Ricerca appartamento", phase: "prima", cat: "casa", pts: 25, done: false, assignee: "fabio" },
  { id: uid(), text: "Piano homeschooling", phase: "prima", cat: "scuola", pts: 20, done: false, assignee: "fabio" },
  { id: uid(), text: "Iscrizione AIRE", phase: "prima", cat: "documenti", pts: 10, done: false, assignee: "fabio" },
  { id: uid(), text: "Salutare famiglia ❤️", phase: "prima", cat: "emotivo", pts: 10, done: false, assignee: null },
  { id: uid(), text: "PESEL per tutti", phase: "arrivati", cat: "documenti", pts: 25, done: false, assignee: "fabio" },
  { id: uid(), text: "Conto bancario PL", phase: "arrivati", cat: "finanze", pts: 20, done: false, assignee: "fabio" },
  { id: uid(), text: "Carta PEKA", phase: "arrivati", cat: "logistica", pts: 10, done: false, assignee: null },
  { id: uid(), text: "Trovare pediatra", phase: "arrivati", cat: "salute", pts: 15, done: false, assignee: "lidia" },
  { id: uid(), text: "Routine homeschool", phase: "vita", cat: "scuola", pts: 30, done: false, assignee: null },
  { id: uid(), text: "Walter: sport/club", phase: "vita", cat: "bambini", pts: 25, done: false, assignee: "walter" },
  { id: uid(), text: "Lucrezia: danza/arte", phase: "vita", cat: "bambini", pts: 25, done: false, assignee: "lucrezia" },
  { id: uid(), text: "Primo amico polacco", phase: "vita", cat: "bambini", pts: 40, done: false, assignee: null },
  { id: uid(), text: "Sentirsi a casa ❤️", phase: "vita", cat: "emotivo", pts: 50, done: false, assignee: null },
];
const mkPlaces = () => "Stary Rynek|Caprette!,Cytadela|190 ettari,Termy Maltańskie|Acquapark,Zoo + Lago Malta|Bici e treno,Palmiarnia|Serre tropicali,ICHOT|Museo interattivo,Parco Sołacki|Anatre,Stary Browar|Shopping,Museo Nazionale|Mart. gratis!,Ostrów Tumski|Cattedrale,Rogalin|Querce,Kórnik|Castello,Mercato Jeżyce|Sabato,Croissant Museum|Tradizione,Toruń|Copernico,Wrocław|Nani".split(",").map(s => { const [n, d] = s.split("|"); return { id: uid(), name: n, desc: d, visited: false, rating: 0, comments: [], photos: [] }; });
const mkBgt = () => ({
  partenza: { label: "Partenza", icon: "🚀", items: [{ id: uid(), n: "Voli", p: 1200, s: 0 }, { id: uid(), n: "Spedizione", p: 800, s: 0 }, { id: uid(), n: "Traduzioni", p: 600, s: 0 }, { id: uid(), n: "Deposito", p: 2400, s: 0 }, { id: uid(), n: "Buffer", p: 5000, s: 0 }] },
  arrivo: { label: "1° Mese", icon: "🏠", items: [{ id: uid(), n: "Affitto", p: 3000, s: 0 }, { id: uid(), n: "Arredamento", p: 2000, s: 0 }, { id: uid(), n: "Corso PL", p: 400, s: 0 }, { id: uid(), n: "Assicurazione", p: 300, s: 0 }] },
  mensile: { label: "Mensile", icon: "📅", items: [{ id: uid(), n: "Affitto", p: 3000, s: 0 }, { id: uid(), n: "Spesa", p: 1800, s: 0 }, { id: uid(), n: "Bollette", p: 500, s: 0 }, { id: uid(), n: "Trasporti", p: 200, s: 0 }, { id: uid(), n: "Bimbi", p: 400, s: 0 }, { id: uid(), n: "Svago", p: 600, s: 0 }, { id: uid(), n: "Tech", p: 150, s: 0 }] },
});

const MILESTONES = [
  { days: 7, name: "1 Settimana", icon: "🌱" }, { days: 30, name: "1 Mese", icon: "🎖️" },
  { days: 90, name: "3 Mesi", icon: "🏅" }, { days: 180, name: "6 Mesi", icon: "🎉" },
  { days: 365, name: "1 Anno!", icon: "🏆" }, { days: 730, name: "2 Anni!", icon: "⭐" },
];

// ═══ APP ═══
export default function App() {
  // Theme
  const [themeId, setThemeId] = useState("caldo");
  const [shapeId, setShapeId] = useState("morbido");
  const [showSettings, setShowSettings] = useState(false);
  const T = THEMES.find(t => t.id === themeId) || THEMES[0];
  const S = SHAPES.find(s => s.id === shapeId) || SHAPES[0];
  const F1 = T.f1, F2 = T.f2;

  // Core state
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState("home");
  const [phase, setPhase] = useState("prima");
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [tasks, setTasks] = useState(mkTasks);
  const [places, setPlaces] = useState(mkPlaces);
  const [bgt, setBgt] = useState(mkBgt);
  const [moods, setMoods] = useState([]);
  const [diary, setDiary] = useState([]);
  const [chat, setChat] = useState([]);
  const [fd, setFd] = useState("2026-04-01");
  const [qa, setQa] = useState(0);
  const [rc, setRc] = useState(0);
  const [kd, setKd] = useState([]);
  const [wx, setWx] = useState(null);
  const [goals, setGoals] = useState([
    { id: uid(), text: "Parlare polacco 30min", freq: "daily", streak: 0, lastDone: null, icon: "🇵🇱" },
    { id: uid(), text: "Cucinare piatto polacco", freq: "weekly", streak: 0, lastDone: null, icon: "🍲" },
    { id: uid(), text: "Weekend fuori casa", freq: "weekly", streak: 0, lastDone: null, icon: "🗺️" },
    { id: uid(), text: "Scrivere nel diario", freq: "daily", streak: 0, lastDone: null, icon: "📔" },
  ]);
  const [arrivalDate, setArrivalDate] = useState("2026-04-01");
  const [txns, setTxns] = useState([]);
  // Pre-departure state
  const [departed, setDeparted] = useState(false);
  const [savings, setSavings] = useState(85000); // Current savings toward 130k goal
  const [italyBgt, setItalyBgt] = useState([
    { id: uid(), n: "Affitto ricevuto", type: "in", p: 900 },
    { id: uid(), n: "Disoccupazione", type: "in", p: 1400 },
    { id: uid(), n: "Affitto casa CS", type: "out", p: 450 },
    { id: uid(), n: "Bollette", type: "out", p: 200 },
    { id: uid(), n: "Spesa", type: "out", p: 500 },
    { id: uid(), n: "Auto/Benzina", type: "out", p: 200 },
    { id: uid(), n: "Scuola bimbi", type: "out", p: 150 },
    { id: uid(), n: "Varie", type: "out", p: 200 },
  ]);
  const [showPartiamo, setShowPartiamo] = useState(false); // {id, type:"in"|"out", amount, note, cat, date, who}

  // UI state
  const [sub, setSub] = useState("quiz");
  const [eDate, setEDate] = useState(false);
  const [aPlace, setAPlace] = useState(false); const [nP, setNP] = useState(""); const [nPD, setNPD] = useState("");
  const [xPlace, setXPlace] = useState(null); const [cTxt, setCTxt] = useState(""); const [cWho, setCWho] = useState("fabio");
  const [pFilt, setPFilt] = useState("all");
  const [dTxt, setDTxt] = useState(""); const [dWho, setDWho] = useState("fabio");
  const [mPick, setMPick] = useState({}); const [sMood, setSMood] = useState(false);
  const [eurA, setEurA] = useState(""); const [sConv, setSConv] = useState(false);
  const [aBgt, setABgt] = useState(null); const [nBN, setNBN] = useState(""); const [nBA, setNBA] = useState("");
  const [qQ, setQQ] = useState(null); const [qA, setQA] = useState(null);
  const [xRec, setXRec] = useState(null);
  const [kW, setKW] = useState("walter"); const [kT, setKT] = useState("");
  const [chatTxt, setChatTxt] = useState(""); const [chatWho, setChatWho] = useState("fabio");
  const [aPhase, setAPhase] = useState(false); const [npLabel, setNpLabel] = useState(""); const [npIcon, setNpIcon] = useState("🎉"); const [npColor, setNpColor] = useState("#9B7FE6");
  const [aGoal, setAGoal] = useState(false); const [ngTxt, setNgTxt] = useState(""); const [ngFreq, setNgFreq] = useState("daily");
  const [txOpen, setTxOpen] = useState(false); const [txType, setTxType] = useState("out"); const [txAmt, setTxAmt] = useState(""); const [txNote, setTxNote] = useState(""); const [txCat, setTxCat] = useState("🛒");
  const [chatAttach, setChatAttach] = useState(null);
  const [chatMenu, setChatMenu] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const chatEnd = useRef(null);
  const photoRef = useRef(null);
  const chatPhotoRef = useRef(null);
  const chatVideoRef = useRef(null);
  const chatDocRef = useRef(null);
  const [photoPlace, setPhotoPlace] = useState(null);
  const mediaRec = useRef(null);
  const recChunks = useRef([]);
  const recTimer = useRef(null);

  // ─── Derived theme values ───
  const P = phases.find(p => p.id === phase) || phases[0];
  const pc = T.accent || P.color; // accent color: theme override or phase color
  const pg = T.accent ? `linear-gradient(135deg,${T.accent},${T.accent}CC)` : `linear-gradient(135deg,${P.color},${P.color}CC)`;
  const hg = T.id === "caldo" ? `linear-gradient(135deg,${P.color},${P.color}CC)` : T.id === "notte" ? T.bg : (THEMES.find(t=>t.id===themeId)?.accent ? `linear-gradient(135deg,${T.accent},${T.accent}BB)` : `linear-gradient(135deg,${P.color},${P.color}CC)`);
  const headerGrad = T.id === "caldo" ? `linear-gradient(135deg,${P.color},${P.color}CC)` : (T.dark ? "linear-gradient(135deg,#1E1E28,#2A2A38)" : `linear-gradient(135deg,${pc},${pc}BB)`);

  const css = `@import url('https://fonts.googleapis.com/css2?family=${T.fonts}&display=swap');*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.fu{animation:fu .3s ease both}.ch:active{transform:scale(0.97)}.gl{box-shadow:0 2px 14px ${T.dark?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.05)"}}input,textarea{-webkit-appearance:none;color:${T.text}}`;
  const inp = (x = {}) => ({ width: "100%", padding: "10px 13px", border: `2.5px solid ${T.border}`, borderRadius: S.input, fontSize: 14, fontFamily: F1, fontWeight: 600, outline: "none", boxSizing: "border-box", background: T.card, color: T.text, ...x });

  // ─── Persistence ───
  const sr = useRef(null);
  const allState = { tasks, places, bgt, moods, diary, chat, fd, phase, phases, qa, rc, kd, goals, arrivalDate, themeId, shapeId, txns, departed, savings, italyBgt };
  const doSave = useCallback(() => { if (!ok) return; try { window.storage?.set("fc8", JSON.stringify(allState)); } catch {} }, [ok, ...Object.values(allState)]);
  useEffect(() => { clearTimeout(sr.current); sr.current = setTimeout(doSave, 500); }, [doSave]);
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage?.get("fc8");
        if (r?.value) {
          const d = JSON.parse(r.value);
          if (d.tasks) setTasks(d.tasks); if (d.places) setPlaces(d.places); if (d.bgt) setBgt(d.bgt);
          if (d.moods) setMoods(d.moods); if (d.diary) setDiary(d.diary); if (d.chat) setChat(d.chat);
          if (d.fd) setFd(d.fd); if (d.phase) setPhase(d.phase); if (d.phases) setPhases(d.phases);
          if (d.qa != null) setQa(d.qa); if (d.rc != null) setRc(d.rc); if (d.kd) setKd(d.kd);
          if (d.goals) setGoals(d.goals); if (d.arrivalDate) setArrivalDate(d.arrivalDate);
          if (d.themeId) setThemeId(d.themeId); if (d.shapeId) setShapeId(d.shapeId);
          if (d.txns) setTxns(d.txns);
          if (d.departed != null) setDeparted(d.departed); if (d.savings != null) setSavings(d.savings);
          if (d.italyBgt) setItalyBgt(d.italyBgt);
        }
      } catch {}
      setOk(true);
    })();
  }, []);
  useEffect(() => { fetch("https://api.open-meteo.com/v1/forecast?latitude=52.41&longitude=16.93&current=temperature_2m,weathercode&timezone=Europe/Warsaw").then(r => r.json()).then(d => { if (d?.current) { const c = d.current.weathercode; setWx({ t: Math.round(d.current.temperature_2m), i: c <= 1 ? "☀️" : c <= 3 ? "⛅" : c <= 49 ? "🌫️" : c <= 69 ? "🌧️" : "🌨️" }); } }).catch(() => {}); }, []);
  useEffect(() => { if (tab === "chat") chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, tab]);

  // ─── Handlers ───
  const handlePhoto = (e) => { const f = e.target.files?.[0]; if (!f || !photoPlace) return; const r = new FileReader(); r.onload = (ev) => { setPlaces(p => p.map(x => x.id === photoPlace ? { ...x, photos: [...x.photos, { id: uid(), src: ev.target.result, who: cWho, date: nowD() }] } : x)); setPhotoPlace(null); }; r.readAsDataURL(f); e.target.value = ""; };
  const handleChatFile = (e, type) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { setChatAttach({ type, src: ev.target.result, name: f.name, mime: f.type }); setChatMenu(false); }; r.readAsDataURL(f); e.target.value = ""; };
  const startRec = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const mr = new MediaRecorder(stream); recChunks.current = []; mr.ondataavailable = (e) => { if (e.data.size > 0) recChunks.current.push(e.data); }; mr.onstop = () => { const blob = new Blob(recChunks.current, { type: "audio/webm" }); const r = new FileReader(); r.onload = (ev) => setChatAttach({ type: "audio", src: ev.target.result, name: `Vocale ${nowT()}`, mime: "audio/webm" }); r.readAsDataURL(blob); stream.getTracks().forEach(t => t.stop()); clearInterval(recTimer.current); setRecTime(0); }; mr.start(); mediaRec.current = mr; setRecording(true); setChatMenu(false); let t = 0; recTimer.current = setInterval(() => { t++; setRecTime(t); }, 1000); } catch { alert("Permesso microfono negato"); } };
  const stopRec = () => { if (mediaRec.current?.state !== "inactive") mediaRec.current?.stop(); setRecording(false); };
  const sendChat = () => { if (!chatTxt.trim() && !chatAttach) return; const msg = { id: uid(), who: chatWho, text: chatTxt, time: nowT(), date: nowD() }; if (chatAttach) msg.attach = chatAttach; setChat(p => [...p, msg]); setChatTxt(""); setChatAttach(null); };
  const checkGoal = (goalId) => { const today = isoDay(); setGoals(prev => prev.map(g => { if (g.id !== goalId) return g; if (g.lastDone === today) return { ...g, streak: Math.max(0, g.streak - 1), lastDone: null }; const y = new Date(); y.setDate(y.getDate() - 1); return { ...g, streak: g.lastDone === y.toISOString().slice(0, 10) ? g.streak + 1 : 1, lastDone: today }; })); };
  const startQ = () => { const q = QUIZ[Math.floor(Math.random() * QUIZ.length)]; setQQ({ pl: q[0], it: q[1], sh: [...q[2]].sort(() => Math.random() - 0.5) }); setQA(null); };

  // ─── Computed ───
  const dl = Math.max(0, Math.ceil((new Date(fd + "T06:00:00") - new Date()) / 86400000));
  const d = doy(); const h = new Date().getHours();
  const phr = PHRASES[phase] || PHRASES._default;
  const phrase = phr[d % phr.length];
  const greet = h < 6 ? "Buonanotte" : h < 12 ? "Buongiorno" : h < 18 ? "Ciao" : "Buonasera";
  const pComp = (pid) => { const t = tasks.filter(x => x.phase === pid); return t.length ? (t.filter(x => x.done).length / t.length) * 100 : 0; };
  const gPts = (fid) => tasks.filter(t => t.done && (t.assignee === fid || !t.assignee)).reduce((s, t) => s + (t.assignee === fid ? t.pts : Math.round(t.pts / 4)), 0);
  const fPts = FAM.map(f => ({ ...f, pts: gPts(f.id) })).sort((a, b) => b.pts - a.pts);
  const vi = places.filter(p => p.visited).length;
  const totalPhotos = places.reduce((s, p) => s + (p.photos?.length || 0), 0);
  const bTot = (s) => bgt[s]?.items?.reduce((a, i) => a + i.p, 0) || 0;
  const bSp = (s) => bgt[s]?.items?.reduce((a, i) => a + i.s, 0) || 0;
  const mIn = 2300, mOut = bTot("mensile"), mBal = mIn - mOut;
  const proj = []; let bal = 130000 - bTot("partenza") - bTot("arrivo");
  for (let m = 0; m <= 12; m++) { proj.push({ m: m === 0 ? "Start" : `M${m}`, v: Math.round(bal) }); bal += mBal; }
  const smart = tasks.filter(t => t.phase === phase && !t.done).slice(0, 3);
  const daysSinceArrival = Math.floor((new Date() - new Date(arrivalDate)) / 86400000);
  const unlockedMilestones = MILESTONES.filter(m => daysSinceArrival >= m.days);
  const nextMilestone = MILESTONES.find(m => daysSinceArrival < m.days);
  const oyaStr = (() => { const o = new Date(); o.setFullYear(o.getFullYear() - 1); return o.toLocaleDateString("it-IT", { day: "numeric", month: "short" }); })();
  const memories = diary.filter(e => e.date === oyaStr);
  const maxStreak = goals.reduce((mx, g) => Math.max(mx, g.streak), 0);
  const BADGES = [["👣","Primo Passo",tasks.some(t=>t.done)],["🗺️","Esploratore",vi>=5],["🇵🇱","Poliglotta",qa>=10],["👨‍🍳","Chef",rc>=3],["💛","Uniti",moods.length>=7],["📔","Scrittore",diary.length>=10],["🏅","Metà!",tasks.filter(t=>t.done).length>=tasks.length*.5],["🏆","500pt",Math.max(0,...FAM.map(f=>gPts(f.id)))>=500],["⭐","Master",vi>=15],["💬","Social",chat.length>=20],["📸","Reporter",totalPhotos>=5],["🔥","On Fire",maxStreak>=7]];
  const moodAvg = moods.length > 0 ? moods.slice(0, 30).map(m => { const avg = FAM.reduce((s, f) => s + (m.m?.[f.id] || 0), 0) / 4; return { date: m.date, avg: Math.round(avg * 10) / 10 }; }).reverse() : [];

  // Italy budget computations
  const itIn = italyBgt.filter(i => i.type === "in").reduce((s, i) => s + i.p, 0);
  const itOut = italyBgt.filter(i => i.type === "out").reduce((s, i) => s + i.p, 0);
  const itBal = itIn - itOut;
  const savPct = Math.min(100, (savings / 130000) * 100);
  const monthsToTarget = itBal > 0 ? Math.ceil((130000 - savings) / itBal) : "∞";
  const prepTasks = tasks.filter(t => t.phase === "prima");
  const prepDone = prepTasks.filter(t => t.done).length;
  const prepPct = prepTasks.length ? (prepDone / prepTasks.length) * 100 : 0;

  // Transaction computations
  const todayStr = nowD();
  const monthStr = new Date().toLocaleDateString("it-IT", { month: "short" });
  const txToday = txns.filter(t => t.date === todayStr);
  const txMonth = txns.filter(t => t.date?.includes(monthStr));
  const todayIn = txToday.filter(t => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const todayOut = txToday.filter(t => t.type === "out").reduce((s, t) => s + t.amount, 0);
  const monthIn = txMonth.filter(t => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const monthOut = txMonth.filter(t => t.type === "out").reduce((s, t) => s + t.amount, 0);
  const TX_CATS = [["🛒","Spesa"],["🍕","Cibo"],["🏠","Casa"],["🚋","Trasporti"],["👶","Bimbi"],["🎮","Svago"],["💊","Salute"],["📱","Tech"],["📚","Scuola"],["💼","Lavoro"],["🎁","Altro"],["💰","Stipendio"]];

  // ─── Helpers ───
  const Avatar = ({ fid, size = 30 }) => { const f = FAM.find(x => x.id === fid) || FAM[0]; return <div style={{ width: size, height: size, borderRadius: size * S.av, background: f.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * .55, flexShrink: 0, boxShadow: `0 2px 6px ${f.color}25` }}>{f.emoji}</div>; };
  const Pill = ({ t, c }) => <span style={{ padding: "2px 7px", borderRadius: S.pill, background: `${c}12`, color: c, fontSize: 10, fontWeight: 700, fontFamily: F1 }}>{t}</span>;
  const Card = ({ children, style = {} }) => <div className="gl fu" style={{ background: T.card, borderRadius: S.card, padding: 16, ...style }}>{children}</div>;

  if (!ok) return <div style={{ fontFamily: F1, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: 24, background: T.bg }}>🇵🇱</div>;

  return (
    <div style={{ fontFamily: F1, background: T.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 90, color: T.text, transition: "background .3s, color .3s" }}>
      <style>{css}</style>
      <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
      <input ref={chatPhotoRef} type="file" accept="image/*" capture="environment" onChange={e => handleChatFile(e, "photo")} style={{ display: "none" }} />
      <input ref={chatVideoRef} type="file" accept="video/*" capture="environment" onChange={e => handleChatFile(e, "video")} style={{ display: "none" }} />
      <input ref={chatDocRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" onChange={e => handleChatFile(e, "doc")} style={{ display: "none" }} />

      {/* ═══ HEADER ═══ */}
      <div style={{ background: headerGrad, padding: "18px 16px 14px", borderRadius: `0 0 ${S.header}px ${S.header}px`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%,rgba(255,255,255,0.15),transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, margin: 0, color: "#fff" }}>Famiglia Cozza</h1>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2, display: "flex", gap: 8, fontWeight: 700 }}>
                <span>{departed ? "🇵🇱 Poznań" : "🇮🇹 Cosenza"}</span>{wx && departed && <span>{wx.i} {wx.t}°C</span>}
                {departed && daysSinceArrival > 0 && <span>📅 Giorno {daysSinceArrival}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {/* Theme button */}
              <button onClick={() => setShowSettings(!showSettings)} className="ch" style={{ width: 36, height: 36, borderRadius: S.btn, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>🎨</button>
              {/* Days counter */}
              <div onClick={() => setEDate(!eDate)} style={{ cursor: "pointer", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", borderRadius: S.btn, padding: "6px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: F2, color: "#fff" }}>{dl}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>giorni</div>
              </div>
            </div>
          </div>
          {eDate && <div onClick={e => e.stopPropagation()} style={{ marginTop: 10, background: T.card, borderRadius: S.card, padding: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: pc, marginBottom: 6 }}>Data volo ✈️</div>
            <input type="date" value={fd} onChange={e => setFd(e.target.value)} style={inp({ borderColor: pc })} />
            <div style={{ fontSize: 11, fontWeight: 700, color: pc, margin: "8px 0 4px" }}>Data arrivo 📅</div>
            <input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} style={inp({ borderColor: pc })} />
            <button onClick={() => setEDate(false)} style={{ width: "100%", marginTop: 8, padding: 9, background: pg, color: "#fff", border: "none", borderRadius: S.btn, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: F1 }}>Fatto ✓</button>
          </div>}
          {/* Phase nav */}
          <div style={{ display: "flex", gap: 4, marginTop: 12, overflowX: "auto", paddingBottom: 2 }}>
            {phases.map(p => {
              const a = phase === p.id;
              return <button key={p.id} onClick={() => setPhase(p.id)} className="ch" style={{ minWidth: 60, flex: "0 0 auto", padding: "8px 6px 6px", border: "none", borderRadius: S.btn, background: a ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, backdropFilter: "blur(6px)" }}>
                <span style={{ fontSize: 14 }}>{p.icon}</span>
                <span style={{ fontSize: 7, fontWeight: 800, color: a ? p.color : "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>{p.label}</span>
                <div style={{ width: "75%", height: 3, background: a ? T.border : "rgba(255,255,255,0.25)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pComp(p.id)}%`, height: "100%", background: a ? p.color : "rgba(255,255,255,0.7)", transition: "width .4s" }} />
                </div>
              </button>;
            })}
            <button onClick={() => setAPhase(!aPhase)} className="ch" style={{ minWidth: 40, flex: "0 0 auto", padding: "8px 10px", border: "none", borderRadius: S.btn, background: "rgba(255,255,255,0.15)", cursor: "pointer", color: "rgba(255,255,255,0.8)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        </div>
      </div>

      {/* ═══ SETTINGS PANEL ═══ */}
      {showSettings && <div style={{ margin: "12px 12px 0" }}>
        <Card style={{ border: `2px solid ${pc}20` }}>
          <div style={{ fontFamily: F2, fontSize: 16, fontWeight: 900, marginBottom: 12 }}>🎨 Personalizza</div>
          {/* Themes */}
          <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>Tema & Colori</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
            {THEMES.map(th => {
              const act = th.id === themeId;
              return <button key={th.id} onClick={() => setThemeId(th.id)} className="ch" style={{ padding: "10px 4px", borderRadius: S.btn, border: act ? `3px solid ${pc}` : `2px solid ${T.border}`, background: act ? `${pc}10` : T.card, cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 20 }}>{th.icon}</div>
                <div style={{ fontSize: 8, fontWeight: 800, color: act ? pc : T.muted, marginTop: 2 }}>{th.name}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: th.bg, border: "1px solid #0001" }} />
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: th.accent || "#F5A623" }} />
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: th.card, border: "1px solid #0001" }} />
                </div>
              </button>;
            })}
          </div>
          {/* Shapes */}
          <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>Forma</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
            {SHAPES.map(sh => {
              const act = sh.id === shapeId;
              return <button key={sh.id} onClick={() => setShapeId(sh.id)} className="ch" style={{ padding: "10px 4px", borderRadius: S.btn, border: act ? `3px solid ${pc}` : `2px solid ${T.border}`, background: act ? `${pc}10` : T.card, cursor: "pointer", textAlign: "center" }}>
                <div style={{ width: 32, height: 22, borderRadius: sh.card, background: `${pc}30`, margin: "0 auto 4px", border: `2px solid ${pc}60` }} />
                <div style={{ fontSize: 8, fontWeight: 800, color: act ? pc : T.muted }}>{sh.name}</div>
              </button>;
            })}
          </div>
          {/* Preview */}
          <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>Anteprima</div>
          <div style={{ background: T.bg, borderRadius: S.card, padding: 12, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {FAM.map(f => <Avatar key={f.id} fid={f.id} size={28} />)}
            </div>
            <div style={{ background: T.card, borderRadius: S.card, padding: 10, marginBottom: 6, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Card di esempio</div>
              <div style={{ fontSize: 11, color: T.sub }}>Così appare l'app</div>
            </div>
            <button style={{ padding: "8px 16px", borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 12, fontWeight: 800, fontFamily: F1 }}>Bottone</button>
          </div>
          <button onClick={() => setShowSettings(false)} style={{ width: "100%", marginTop: 10, padding: 11, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: F1 }}>Chiudi ✓</button>
        </Card>
      </div>}

      {/* Add phase modal */}
      {aPhase && <div style={{ margin: "12px 12px 0" }}><Card style={{ border: `2px solid ${pc}25` }}>
        <div style={{ fontFamily: F2, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>✨ Nuova Fase</div>
        <input value={npLabel} onChange={e => setNpLabel(e.target.value)} placeholder="Nome fase..." style={inp({ marginBottom: 8 })} />
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 4 }}>Icona:</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {PHASE_ICONS.map(ic => <button key={ic} onClick={() => setNpIcon(ic)} style={{ width: 34, height: 34, borderRadius: S.btn, border: npIcon === ic ? `2.5px solid ${pc}` : `2.5px solid ${T.border}`, background: npIcon === ic ? `${pc}10` : T.card, cursor: "pointer", fontSize: 16 }}>{ic}</button>)}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 4 }}>Colore:</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {PHASE_COLORS.map(c => <button key={c} onClick={() => setNpColor(c)} style={{ width: 28, height: 28, borderRadius: S.btn, background: c, border: npColor === c ? "3px solid #1C1C1E" : "3px solid transparent", cursor: "pointer" }} />)}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { if (npLabel.trim()) { const id = "c_" + uid(); setPhases(p => [...p, { id, label: npLabel, icon: npIcon, color: npColor }]); setPhase(id); setNpLabel(""); setAPhase(false); } }} style={{ flex: 1, padding: 11, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: F1 }}>Crea</button>
          <button onClick={() => setAPhase(false)} style={{ padding: "11px 16px", borderRadius: S.btn, background: T.bg, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F1, color: T.muted }}>Annulla</button>
        </div>
      </Card></div>}

      <div style={{ padding: "12px 12px 0" }}>

        {/* ═══ HOME ═══ */}
        {tab === "home" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* ═══ PRE-DEPARTURE: COSENZA ═══ */}
          {!departed && <>
            {/* Header Cosenza */}
            <Card style={{ background: "linear-gradient(135deg,#FF8C42,#F5A623)", color: "#fff", position: "relative", overflow: "hidden", padding: 20 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%,rgba(255,255,255,0.15),transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>📍 Siamo ancora a Cosenza</div>
                <div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>Preparando<br/>l'Avventura</div>
                <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{dl}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>giorni al volo</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{prepDone}/{prepTasks.length}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>task fatti</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{Math.round(savPct)}%</div>
                    <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>risparmi</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Savings tracker */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>💰 Obiettivo Risparmi</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: pc }}>€{savings.toLocaleString()} / €130.000</span>
              </div>
              <div style={{ height: 14, background: T.bg, borderRadius: S.btn, overflow: "hidden", position: "relative", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${savPct}%`, background: savPct >= 100 ? "linear-gradient(90deg,#6BC986,#47C5D8)" : "linear-gradient(90deg,#F5A623,#FF8C42)", borderRadius: S.btn, transition: "width .6s", position: "relative" }}>
                  <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 8, fontWeight: 900, color: "#fff" }}>{Math.round(savPct)}%</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {[500, 1000, 2000, 5000].map(v => (
                  <button key={v} onClick={() => setSavings(s => s + v)} className="ch" style={{ flex: 1, padding: "8px 2px", borderRadius: S.btn, border: `1.5px solid #6BC98630`, background: "#6BC98606", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#6BC986" }}>+€{v}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[500, 1000, 2000].map(v => (
                  <button key={v} onClick={() => setSavings(s => Math.max(0, s - v))} className="ch" style={{ flex: 1, padding: "8px 2px", borderRadius: S.btn, border: `1.5px solid #E2555530`, background: "#E2555506", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#E25555" }}>-€{v}</div>
                  </button>
                ))}
                <input type="number" placeholder="€ custom" value="" onChange={e => { const v = parseFloat(e.target.value); if (v) setSavings(s => Math.max(0, s + v)); e.target.value = ""; }} style={inp({ flex: 1, padding: "6px 8px", fontSize: 11, textAlign: "center" })} />
              </div>
              {savings < 130000 && <div style={{ marginTop: 8, fontSize: 11, color: T.sub, textAlign: "center" }}>
                Mancano <strong style={{ color: pc }}>€{(130000 - savings).toLocaleString()}</strong>
                {itBal > 0 && <span> · risparmiando €{itBal}/mese → <strong style={{ color: "#6BC986" }}>{monthsToTarget} mesi</strong></span>}
              </div>}
              {savings >= 130000 && <div style={{ marginTop: 8, fontSize: 13, fontWeight: 800, color: "#6BC986", textAlign: "center" }}>🎉 Obiettivo raggiunto! Siete pronti!</div>}
            </Card>

            {/* Italy monthly budget */}
            <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🇮🇹 Budget Mensile Italia</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <div style={{ flex: 1, padding: "8px 10px", background: "#6BC98608", borderRadius: S.btn, textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#6BC986" }}>ENTRATE</div>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: "#6BC986" }}>+€{itIn}</div>
                </div>
                <div style={{ flex: 1, padding: "8px 10px", background: "#E2555508", borderRadius: S.btn, textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#E25555" }}>USCITE</div>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: "#E25555" }}>-€{itOut}</div>
                </div>
                <div style={{ flex: 1, padding: "8px 10px", background: `${pc}08`, borderRadius: S.btn, textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: pc }}>RISPARMIO</div>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: itBal >= 0 ? "#6BC986" : "#E25555" }}>€{itBal}</div>
                </div>
              </div>
              {italyBgt.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.border}15` }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: item.type === "in" ? "#6BC986" : "#E25555", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.n}</span>
                  <input type="number" value={item.p} onChange={e => setItalyBgt(p => p.map(x => x.id === item.id ? { ...x, p: parseFloat(e.target.value) || 0 } : x))} style={inp({ width: 70, flex: "none", padding: "4px 6px", fontSize: 13, fontWeight: 800, textAlign: "right", color: item.type === "in" ? "#6BC986" : "#E25555" })} />
                  <button onClick={() => setItalyBgt(p => p.filter(x => x.id !== item.id))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                <button onClick={() => setItalyBgt(p => [...p, { id: uid(), n: "Nuova voce", type: "in", p: 0 }])} className="ch" style={{ flex: 1, padding: 8, borderRadius: S.btn, border: `1.5px dashed #6BC98640`, background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#6BC986", fontFamily: F1 }}>+ Entrata</button>
                <button onClick={() => setItalyBgt(p => [...p, { id: uid(), n: "Nuova voce", type: "out", p: 0 }])} className="ch" style={{ flex: 1, padding: 8, borderRadius: S.btn, border: `1.5px dashed #E2555540`, background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#E25555", fontFamily: F1 }}>+ Uscita</button>
              </div>
            </Card>

            {/* Prep tasks */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>📋 Preparativi</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: pc }}>{prepDone}/{prepTasks.length}</span>
              </div>
              <div style={{ height: 6, background: T.bg, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${prepPct}%`, background: prepPct >= 100 ? "linear-gradient(90deg,#6BC986,#47C5D8)" : pg, borderRadius: 3, transition: "width .5s" }} />
              </div>
              {prepTasks.map(t => {
                const w = t.assignee ? FAM.find(f => f.id === t.assignee) : null;
                return <div key={t.id} className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: t.done ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 4, cursor: "pointer" }}>
                  <div style={{ width: 22, height: 22, borderRadius: S.btn, border: `2.5px solid ${t.done ? pc : T.border}`, background: t.done ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{t.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
                  <span style={{ fontSize: 13, flex: 1, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text }}>{t.text}</span>
                  {w && <Avatar fid={w.id} size={22} />}<Pill t={`${t.pts}pt`} c={pc} />
                </div>;
              })}
            </Card>

            {/* Morning phrase */}
            <Card><div style={{ fontSize: 10, fontWeight: 800, color: pc, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{greet}, Cozza</div><div style={{ fontFamily: F2, fontSize: 17, fontWeight: 900, lineHeight: 1.3, marginBottom: 6 }}>"{phrase.t}"</div><div style={{ fontSize: 12, color: T.sub, fontStyle: "italic", paddingLeft: 10, borderLeft: `3px solid ${pc}40`, lineHeight: 1.4 }}>{phrase.s}</div></Card>

            {/* PARTIAMO! button */}
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {!showPartiamo ? (
                <button onClick={() => setShowPartiamo(true)} className="ch" style={{ width: "100%", padding: "20px 16px", background: "linear-gradient(135deg,#FF6B35,#F5A623,#FFD700)", border: "none", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%,rgba(255,255,255,0.15),transparent 70%)" }} />
                  <div style={{ position: "relative" }}>
                    <div style={{ fontSize: 32 }}>✈️</div>
                    <div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 4 }}>PARTIAMO!</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 700, marginTop: 4 }}>Quando siete pronti, inizia l'avventura</div>
                  </div>
                </button>
              ) : (
                <div style={{ padding: 20, textAlign: "center", background: "linear-gradient(135deg,#FF6B3510,#F5A62308)" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🛫</div>
                  <div style={{ fontFamily: F2, fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Siete sicuri?</div>
                  <div style={{ fontSize: 13, color: T.sub, marginBottom: 12, lineHeight: 1.4 }}>
                    Passerete alla fase "Arrivati a Poznań".<br/>
                    La fase Cosenza verrà completata.
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>
                    💰 Risparmi: <strong>€{savings.toLocaleString()}</strong> · 📋 Task: <strong>{prepDone}/{prepTasks.length}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button onClick={() => {
                      setDeparted(true);
                      setPhase("arrivati");
                      setArrivalDate(isoDay());
                      // Mark all prep tasks as done
                      setTasks(p => p.map(t => t.phase === "prima" ? { ...t, done: true } : t));
                      setShowPartiamo(false);
                      setChat(p => [...p, { id: uid(), who: "fabio", text: "✈️ SIAMO PARTITI! Poznań, arriviamo! 🇵🇱", time: nowT(), date: nowD() }]);
                    }} className="ch" style={{ padding: "12px 28px", borderRadius: S.btn, background: "linear-gradient(135deg,#FF6B35,#F5A623)", color: "#fff", border: "none", fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: F1, boxShadow: "0 4px 15px rgba(245,166,35,0.4)" }}>
                      🛫 PARTIAMO!
                    </button>
                    <button onClick={() => setShowPartiamo(false)} className="ch" style={{ padding: "12px 20px", borderRadius: S.btn, background: T.bg, color: T.muted, border: `2px solid ${T.border}`, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: F1 }}>
                      Non ancora
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* Leaderboard (always visible) */}
            <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏆 Classifica</div>
              {fPts.map((f, i) => <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px", background: i === 0 ? `${f.color}06` : "transparent", borderRadius: S.btn, marginBottom: 2 }}>
                <div style={{ width: 24, height: 24, borderRadius: S.btn, background: i === 0 ? "linear-gradient(135deg,#FFD700,#FFAA00)" : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: i === 0 ? "#fff" : T.muted }}>{i === 0 ? "👑" : i + 1}</div>
                <Avatar fid={f.id} size={30} /><span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{f.name}</span><span style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: f.color }}>{f.pts}</span>
              </div>)}
            </Card>
          </>}

          {/* ═══ POST-DEPARTURE: POZNAŃ ═══ */}
          {departed && <>
          {/* Morning */}
          <Card><div style={{ fontSize: 10, fontWeight: 800, color: pc, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{greet}, Cozza</div><div style={{ fontFamily: F2, fontSize: 17, fontWeight: 900, lineHeight: 1.3, marginBottom: 6 }}>"{phrase.t}"</div><div style={{ fontSize: 12, color: T.sub, fontStyle: "italic", paddingLeft: 10, borderLeft: `3px solid ${pc}40`, lineHeight: 1.4 }}>{phrase.s}</div></Card>
          {/* Memories */}
          {memories.length > 0 && <Card style={{ background: `linear-gradient(135deg,#FFD70015,#F5A62310)`, border: "1.5px solid #FFD70040" }}>
            <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📅 Un anno fa oggi...</div>
            {memories.slice(0, 2).map(m => <div key={m.id} style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: T.sub }}>{FAM.find(f => f.id === m.who)?.emoji} "{m.text}"</div>)}
          </Card>}
          {/* Milestones */}
          {(nextMilestone || unlockedMilestones.length > 0) && <Card>
            <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏅 Traguardi</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              {MILESTONES.map(m => { const done = daysSinceArrival >= m.days; const isN = m === nextMilestone; return <div key={m.days} style={{ minWidth: 64, padding: "8px 6px", borderRadius: S.btn, background: done ? `${pc}10` : isN ? "#FFF9E6" : T.bg, textAlign: "center", border: isN ? "2px solid #FFD700" : done ? `2px solid ${pc}20` : "2px solid transparent", opacity: done ? 1 : isN ? 1 : 0.3 }}><div style={{ fontSize: 22 }}>{m.icon}</div><div style={{ fontSize: 8, fontWeight: 800, color: done ? pc : isN ? "#F5A623" : T.muted, marginTop: 2 }}>{m.name}</div>{isN && <div style={{ fontSize: 8, fontWeight: 700, color: "#F5A623" }}>tra {m.days - daysSinceArrival}g</div>}{done && <div style={{ fontSize: 8, color: pc }}>✓</div>}</div>; })}
            </div>
          </Card>}
          {/* Goals */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>🔥 Obiettivi</span>
              <button onClick={() => setAGoal(!aGoal)} style={{ width: 28, height: 28, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 16, cursor: "pointer" }}>+</button>
            </div>
            {aGoal && <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <input value={ngTxt} onChange={e => setNgTxt(e.target.value)} placeholder="Nuovo obiettivo..." style={inp()} />
              <div style={{ display: "flex", gap: 4 }}>{["daily", "weekly"].map(f => <button key={f} onClick={() => setNgFreq(f)} style={{ flex: 1, padding: 8, borderRadius: S.btn, border: ngFreq === f ? `2.5px solid ${pc}` : `2.5px solid ${T.border}`, background: ngFreq === f ? `${pc}08` : T.card, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: F1, color: ngFreq === f ? pc : T.muted }}>{f === "daily" ? "Giornaliero" : "Settimanale"}</button>)}</div>
              <button onClick={() => { if (ngTxt.trim()) { setGoals(p => [...p, { id: uid(), text: ngTxt, freq: ngFreq, streak: 0, lastDone: null, icon: "⭐" }]); setNgTxt(""); setAGoal(false); } }} style={{ padding: 10, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: F1 }}>Aggiungi</button>
            </div>}
            {goals.map(g => { const dt = g.lastDone === isoDay(); return <div key={g.id} className="ch" onClick={() => checkGoal(g.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: dt ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 5, cursor: "pointer", border: `1.5px solid ${dt ? `${pc}25` : "transparent"}` }}>
              <div style={{ width: 28, height: 28, borderRadius: S.btn, border: `2.5px solid ${dt ? pc : T.border}`, background: dt ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{dt ? <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span> : <span style={{ fontSize: 14 }}>{g.icon}</span>}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: dt ? T.muted : T.text }}>{g.text}</div><div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{g.freq === "daily" ? "Ogni giorno" : "Ogni settimana"}</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: g.streak >= 7 ? "#E25555" : g.streak >= 3 ? "#F5A623" : pc }}>{g.streak}</div><div style={{ fontSize: 8, color: T.muted, fontWeight: 700 }}>🔥</div></div>
              <button onClick={e => { e.stopPropagation(); setGoals(p => p.filter(x => x.id !== g.id)); }} style={{ background: "none", border: "none", fontSize: 10, color: T.border, cursor: "pointer" }}>✕</button>
            </div>; })}
          </Card>
          {/* 💸 Quick Transactions */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>💸 Entrate / Uscite</span>
              <button onClick={() => setTxOpen(!txOpen)} style={{ width: 28, height: 28, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 16, cursor: "pointer" }}>{txOpen ? "−" : "+"}</button>
            </div>
            {/* Summary row */}
            <div style={{ display: "flex", gap: 6, marginBottom: txOpen ? 10 : 0 }}>
              <div style={{ flex: 1, padding: "8px 10px", background: "#E8F5E910", borderRadius: S.btn, border: "1.5px solid #6BC98625" }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#6BC986", textTransform: "uppercase" }}>Oggi ↑</div>
                <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: "#6BC986" }}>+€{todayIn}</div>
              </div>
              <div style={{ flex: 1, padding: "8px 10px", background: "#FFEBEE10", borderRadius: S.btn, border: "1.5px solid #E2555525" }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#E25555", textTransform: "uppercase" }}>Oggi ↓</div>
                <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: "#E25555" }}>-€{todayOut}</div>
              </div>
              <div style={{ flex: 1, padding: "8px 10px", background: `${pc}08`, borderRadius: S.btn, border: `1.5px solid ${pc}20` }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: pc, textTransform: "uppercase" }}>Mese</div>
                <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: monthIn - monthOut >= 0 ? "#6BC986" : "#E25555" }}>{monthIn - monthOut >= 0 ? "+" : ""}€{monthIn - monthOut}</div>
              </div>
            </div>
            {/* Quick add form */}
            {txOpen && <div>
              {/* Type toggle */}
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                <button onClick={() => setTxType("out")} className="ch" style={{ flex: 1, padding: "10px 4px", borderRadius: S.btn, border: txType === "out" ? "2.5px solid #E25555" : `2.5px solid ${T.border}`, background: txType === "out" ? "#E2555508" : T.card, cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 18 }}>📤</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: txType === "out" ? "#E25555" : T.muted }}>Uscita</div>
                </button>
                <button onClick={() => setTxType("in")} className="ch" style={{ flex: 1, padding: "10px 4px", borderRadius: S.btn, border: txType === "in" ? "2.5px solid #6BC986" : `2.5px solid ${T.border}`, background: txType === "in" ? "#6BC98608" : T.card, cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 18 }}>📥</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: txType === "in" ? "#6BC986" : T.muted }}>Entrata</div>
                </button>
              </div>
              {/* Amount */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, fontWeight: 900, color: txType === "out" ? "#E25555" : "#6BC986" }}>€</span>
                  <input type="number" value={txAmt} onChange={e => setTxAmt(e.target.value)} placeholder="0" style={inp({ paddingLeft: 30, fontSize: 20, fontWeight: 900, fontFamily: F2, borderColor: txType === "out" ? "#E2555540" : "#6BC98640", textAlign: "right" })} />
                </div>
              </div>
              {/* Quick amounts */}
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {(txType === "out" ? [5, 10, 20, 50, 100] : [100, 500, 900, 1400, 2300]).map(v => (
                  <button key={v} onClick={() => setTxAmt(String(v))} className="ch" style={{ flex: 1, padding: "6px 2px", borderRadius: S.btn, border: `1.5px solid ${T.border}`, background: txAmt === String(v) ? `${pc}08` : T.card, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: F1, color: txAmt === String(v) ? pc : T.muted }}>{v}</button>
                ))}
              </div>
              {/* Category */}
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
                {TX_CATS.map(([ic, lb]) => (
                  <button key={ic} onClick={() => setTxCat(ic)} className="ch" style={{ padding: "5px 8px", borderRadius: S.btn, border: txCat === ic ? `2.5px solid ${pc}` : `1.5px solid ${T.border}`, background: txCat === ic ? `${pc}08` : T.card, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 14 }}>{ic}</span>
                    <span style={{ fontWeight: 700, color: txCat === ic ? pc : T.muted, fontFamily: F1 }}>{lb}</span>
                  </button>
                ))}
              </div>
              {/* Note */}
              <input value={txNote} onChange={e => setTxNote(e.target.value)} placeholder="Nota (opzionale)" style={inp({ marginBottom: 8 })} />
              {/* Submit */}
              <button onClick={() => {
                const amt = parseFloat(txAmt);
                if (!amt || amt <= 0) return;
                setTxns(p => [{ id: uid(), type: txType, amount: amt, note: txNote, cat: txCat, date: nowD(), who: "fabio" }, ...p]);
                setTxAmt(""); setTxNote(""); setTxOpen(false);
              }} style={{ width: "100%", padding: 12, borderRadius: S.btn, background: txType === "out" ? "linear-gradient(135deg,#E25555,#FF7B7B)" : "linear-gradient(135deg,#6BC986,#47C5D8)", color: "#fff", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: F1 }}>
                {txType === "out" ? "📤 Registra Uscita" : "📥 Registra Entrata"}
              </button>
            </div>}
            {/* Recent transactions */}
            {txns.length > 0 && !txOpen && <div style={{ marginTop: 6 }}>
              {txns.slice(0, 4).map(tx => (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.border}08` }}>
                  <span style={{ fontSize: 16 }}>{tx.cat}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.note || TX_CATS.find(c => c[0] === tx.cat)?.[1] || "—"}</div>
                    <div style={{ fontSize: 9, color: T.muted }}>{tx.date}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 900, fontFamily: F2, color: tx.type === "in" ? "#6BC986" : "#E25555" }}>
                    {tx.type === "in" ? "+" : "-"}€{tx.amount}
                  </span>
                  <button onClick={() => setTxns(p => p.filter(x => x.id !== tx.id))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button>
                </div>
              ))}
              {txns.length > 4 && <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textAlign: "center", marginTop: 4, cursor: "pointer" }} onClick={() => setTab("budget")}>Vedi tutti ({txns.length}) →</div>}
            </div>}
          </Card>
          {/* Smart todo */}
          {smart.length > 0 && <Card>
            <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🎯 Oggi</div>
            {smart.map(t => { const w = t.assignee ? FAM.find(f => f.id === t.assignee) : null; return <div key={t.id} className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: t.done ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 4, cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: S.btn, border: `2.5px solid ${t.done ? pc : T.border}`, background: t.done ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{t.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
              <span style={{ fontSize: 13, flex: 1, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text }}>{t.text}</span>
              {w && <Avatar fid={w.id} size={22} />}<Pill t={`${t.pts}`} c={pc} />
            </div>; })}
          </Card>}
          {/* Leaderboard */}
          <Card>
            <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏆 Classifica</div>
            {fPts.map((f, i) => <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px", background: i === 0 ? `${f.color}06` : "transparent", borderRadius: S.btn, marginBottom: 2 }}>
              <div style={{ width: 24, height: 24, borderRadius: S.btn, background: i === 0 ? "linear-gradient(135deg,#FFD700,#FFAA00)" : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: i === 0 ? "#fff" : T.muted }}>{i === 0 ? "👑" : i + 1}</div>
              <Avatar fid={f.id} size={30} /><span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{f.name}</span><span style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: f.color }}>{f.pts}</span>
            </div>)}
          </Card>
          {/* Badges */}
          <Card>
            <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🎖️ Badge <span style={{ color: pc, fontSize: 12 }}>{BADGES.filter(b => b[2]).length}/{BADGES.length}</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{BADGES.map(([icon, name, ok2], i) => <div key={i} style={{ width: 48, padding: "6px 2px", borderRadius: S.btn, background: ok2 ? `${pc}08` : T.bg, textAlign: "center", opacity: ok2 ? 1 : 0.25 }}><div style={{ fontSize: 20 }}>{icon}</div><div style={{ fontSize: 7, fontWeight: 800, color: ok2 ? pc : T.muted }}>{name}</div></div>)}</div>
          </Card>
          {/* Converter */}
          <Card style={{ padding: 14, cursor: "pointer" }}>
            <div onClick={() => setSConv(!sConv)} style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 13, fontWeight: 800 }}>💱 EUR→PLN</span><span style={{ fontSize: 10, color: T.muted, fontWeight: 700, background: T.bg, padding: "2px 8px", borderRadius: S.pill }}>1€={EUR_PLN}zł</span></div>
            {sConv && <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10 }}>
              <input type="number" value={eurA} onChange={e => setEurA(e.target.value)} placeholder="€" style={inp({ borderColor: pc })} />
              <span style={{ color: pc }}>→</span>
              <div style={{ flex: 1, padding: "10px", background: pg, borderRadius: S.btn, fontSize: 16, fontWeight: 900, color: "#fff", textAlign: "center" }}>{eurA ? (parseFloat(eurA) * EUR_PLN).toFixed(2) : "0"} zł</div>
            </div>}
          </Card>
          </>}
        </div>}

        {/* ═══ CHAT ═══ */}
        {tab === "chat" && <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 175px)" }}>
          <div style={{ fontFamily: F2, fontSize: 17, fontWeight: 900, marginBottom: 8 }}>💬 Chat Famiglia</div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
            {chat.length === 0 && <div style={{ textAlign: "center", padding: 30, color: T.muted }}><div style={{ fontSize: 36, marginBottom: 6 }}>💬</div><div style={{ fontSize: 13, fontWeight: 700 }}>Chat vuota!</div><div style={{ fontSize: 11, color: T.border }}>Foto, video, vocali, documenti...</div></div>}
            {chat.map(msg => { const f = FAM.find(x => x.id === msg.who) || FAM[0]; const isR = msg.who === "fabio"; const att = msg.attach; return <div key={msg.id} style={{ display: "flex", flexDirection: isR ? "row-reverse" : "row", gap: 6, alignItems: "flex-end" }} className="fu">
              <Avatar fid={msg.who} size={26} />
              <div style={{ maxWidth: "75%", padding: att && !msg.text ? "4px" : "9px 13px", borderRadius: isR ? `${S.card}px ${S.card}px 4px ${S.card}px` : `${S.card}px ${S.card}px ${S.card}px 4px`, background: isR ? f.grad : T.card, color: isR ? "#fff" : T.text, boxShadow: isR ? `0 2px 8px ${f.color}20` : `0 1px 6px ${T.dark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.04)"}`, overflow: "hidden" }}>
                {!isR && <div style={{ fontSize: 9, fontWeight: 800, color: f.color, marginBottom: 2, padding: att && !msg.text ? "5px 9px 0" : 0 }}>{f.name}</div>}
                {att?.type === "photo" && <div style={{ margin: msg.text ? "0 -13px 6px" : "0" }}><img src={att.src} style={{ width: "100%", maxWidth: 260, borderRadius: msg.text ? 0 : S.card, display: "block" }} /></div>}
                {att?.type === "video" && <div style={{ margin: msg.text ? "0 -13px 6px" : "0" }}><video src={att.src} controls style={{ width: "100%", maxWidth: 260, borderRadius: msg.text ? 0 : S.card, display: "block" }} /></div>}
                {att?.type === "audio" && <div style={{ padding: "6px 9px", display: "flex", alignItems: "center", gap: 8 }}><div style={{ fontSize: 20 }}>🎤</div><div style={{ flex: 1 }}><audio src={att.src} controls style={{ width: "100%", height: 32 }} /><div style={{ fontSize: 8, opacity: 0.7 }}>{att.name}</div></div></div>}
                {att?.type === "doc" && <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 36, height: 36, borderRadius: S.btn, background: isR ? "rgba(255,255,255,0.2)" : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📄</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</div><div style={{ fontSize: 9, opacity: 0.6 }}>Documento</div></div></div>}
                {msg.text && <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{msg.text}</div>}
                <div style={{ fontSize: 8, opacity: 0.6, marginTop: 2, textAlign: "right", padding: att && !msg.text ? "0 9px 5px" : 0 }}>{msg.time}</div>
              </div>
            </div>; })}
            <div ref={chatEnd} />
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8, background: T.bg }}>
            {recording && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#FEE2E2", borderRadius: S.btn, marginBottom: 6 }}><div style={{ width: 10, height: 10, borderRadius: 5, background: "#E25555", animation: "pulse 0.8s ease infinite" }} /><span style={{ fontSize: 13, fontWeight: 700, color: "#E25555", flex: 1 }}>Registrazione... {Math.floor(recTime / 60)}:{String(recTime % 60).padStart(2, "0")}</span><button onClick={stopRec} style={{ padding: "6px 14px", borderRadius: S.btn, background: "#E25555", color: "#fff", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: F1 }}>⏹ Stop</button></div>}
            {chatAttach && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: T.cardHov, borderRadius: S.btn, marginBottom: 6 }}><div style={{ fontSize: 18 }}>{chatAttach.type === "photo" ? "📸" : chatAttach.type === "video" ? "🎥" : chatAttach.type === "audio" ? "🎤" : "📄"}</div>{chatAttach.type === "photo" && <img src={chatAttach.src} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: S.btn }} />}<div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chatAttach.name || chatAttach.type}</div><div style={{ fontSize: 9, color: T.muted }}>Pronto</div></div><button onClick={() => setChatAttach(null)} style={{ width: 24, height: 24, borderRadius: 12, background: "#E25555", color: "#fff", border: "none", fontSize: 11, cursor: "pointer" }}>✕</button></div>}
            {chatMenu && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 8, padding: "10px 6px", background: T.card, borderRadius: S.card, boxShadow: `0 4px 16px ${T.dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)"}` }}>
              {[["📸", "Foto", () => chatPhotoRef.current?.click()], ["🎥", "Video", () => chatVideoRef.current?.click()], ["🎤", "Vocale", () => { setChatMenu(false); startRec(); }], ["📄", "Doc", () => chatDocRef.current?.click()]].map(([ic, lb, fn], i) => <button key={i} onClick={fn} className="ch" style={{ padding: "12px 4px", borderRadius: S.btn, border: "none", background: `${pc}06`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><span style={{ fontSize: 22 }}>{ic}</span><span style={{ fontSize: 9, fontWeight: 800, color: pc, fontFamily: F1 }}>{lb}</span></button>)}
            </div>}
            <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>{FAM.map(f => <button key={f.id} onClick={() => setChatWho(f.id)} className="ch" style={{ flex: 1, padding: "5px 2px", borderRadius: S.btn, border: chatWho === f.id ? `2.5px solid ${f.color}` : `2.5px solid ${T.border}`, background: chatWho === f.id ? `${f.color}08` : T.card, cursor: "pointer", fontSize: 16 }}>{f.emoji}</button>)}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
              <button onClick={() => setChatMenu(!chatMenu)} style={{ width: 42, height: 42, borderRadius: 21, background: chatMenu ? pg : T.cardHov, color: chatMenu ? "#fff" : pc, border: "none", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>+</button>
              <input value={chatTxt} onChange={e => setChatTxt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendChat(); }} placeholder={chatAttach ? "Aggiungi messaggio..." : "Scrivi..."} style={inp({ borderRadius: S.card, padding: "10px 14px", flex: 1 })} />
              <button onClick={sendChat} style={{ width: 42, height: 42, borderRadius: 21, background: (chatTxt.trim() || chatAttach) ? FAM.find(f => f.id === chatWho)?.grad : T.border, color: "#fff", border: "none", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>↑</button>
            </div>
          </div>
        </div>}

        {/* ═══ PLACES ═══ */}
        {tab === "places" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ fontFamily: F2, fontSize: 17, fontWeight: 900, margin: 0 }}>📍 Luoghi</h2><button onClick={() => setAPlace(!aPlace)} style={{ width: 30, height: 30, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 16, cursor: "pointer" }}>+</button></div>
          <Card style={{ padding: "9px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 6, background: T.bg, borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${places.length ? (vi / places.length) * 100 : 0}%`, height: "100%", background: "linear-gradient(90deg,#6BC986,#47C5D8)", borderRadius: 3, transition: "width .5s" }} /></div><span style={{ fontSize: 12, fontWeight: 900, color: "#6BC986" }}>{vi}/{places.length}</span><span style={{ fontSize: 10, color: T.muted }}>📸{totalPhotos}</span></div>
          </Card>
          <div style={{ display: "flex", gap: 4 }}>{["all", "todo", "visited"].map(f => <button key={f} onClick={() => setPFilt(f)} style={{ flex: 1, padding: 7, borderRadius: S.btn, fontSize: 10, fontWeight: 700, border: "none", background: pFilt === f ? pg : T.card, color: pFilt === f ? "#fff" : T.muted, cursor: "pointer", fontFamily: F1 }}>{f === "all" ? "Tutti" : f === "todo" ? "Da Vedere" : "Visitati"}</button>)}</div>
          {aPlace && <Card style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <input value={nP} onChange={e => setNP(e.target.value)} placeholder="Nome..." style={inp()} />
            <input value={nPD} onChange={e => setNPD(e.target.value)} placeholder="Descrizione..." style={inp()} />
            <button onClick={() => { if (nP.trim()) { setPlaces(p => [...p, { id: uid(), name: nP, desc: nPD, visited: false, rating: 0, comments: [], photos: [] }]); setNP(""); setNPD(""); setAPlace(false); } }} style={{ padding: 10, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Aggiungi 📍</button>
          </Card>}
          {places.filter(p => pFilt === "all" || (pFilt === "visited" ? p.visited : !p.visited)).map(place => { const exp = xPlace === place.id; return <div key={place.id} className="gl" style={{ background: T.card, borderRadius: S.card, overflow: "hidden" }}>
            <div onClick={() => setXPlace(exp ? null : place.id)} style={{ padding: "11px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9 }}>
              <div onClick={e => { e.stopPropagation(); setPlaces(p => p.map(x => x.id === place.id ? { ...x, visited: !x.visited } : x)); }} style={{ width: 32, height: 32, borderRadius: S.btn, background: place.visited ? "linear-gradient(135deg,#6BC986,#47C5D8)" : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 900, flexShrink: 0 }}>{place.visited ? "✓" : "📍"}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{place.name}</div><div style={{ fontSize: 10, color: T.muted }}>{place.desc}</div>{place.rating > 0 && <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 11, filter: s <= place.rating ? "none" : "grayscale(1) opacity(.15)" }}>⭐</span>)}</div>}</div>
              <div style={{ display: "flex", gap: 3 }}>{(place.photos?.length || 0) > 0 && <Pill t={`📸${place.photos.length}`} c={T.muted} />}{place.comments.length > 0 && <Pill t={`💬${place.comments.length}`} c={T.muted} />}</div>
            </div>
            {exp && <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${T.border}` }}>
              <div style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>Voto:</span>{[1,2,3,4,5].map(s => <span key={s} onClick={() => setPlaces(p => p.map(x => x.id === place.id ? { ...x, rating: s } : x))} style={{ fontSize: 20, cursor: "pointer", filter: s <= place.rating ? "none" : "grayscale(1) opacity(.15)" }}>⭐</span>)}</div>
              {(place.photos?.length || 0) > 0 && <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 6, marginBottom: 6 }}>{place.photos.map(ph => <div key={ph.id} style={{ position: "relative", flexShrink: 0 }}><img src={ph.src} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: S.btn }} /><div style={{ position: "absolute", bottom: 3, left: 3, background: "rgba(0,0,0,0.5)", borderRadius: 5, padding: "1px 5px", fontSize: 8, color: "#fff", fontWeight: 700 }}>{FAM.find(f => f.id === ph.who)?.emoji}</div></div>)}</div>}
              <button onClick={() => { setPhotoPlace(place.id); photoRef.current?.click(); }} style={{ width: "100%", padding: 9, borderRadius: S.btn, background: `${pc}08`, color: pc, border: `2px dashed ${pc}35`, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F1, marginBottom: 6 }}>📸 Aggiungi Foto</button>
              {place.comments.map(c => <div key={c.id} style={{ padding: "6px 8px", background: T.cardHov, borderRadius: S.btn, marginBottom: 3, fontSize: 12, display: "flex", gap: 6 }}><Avatar fid={c.who} size={20} /><div><span style={{ fontWeight: 700, color: FAM.find(f => f.id === c.who)?.color, fontSize: 10 }}>{FAM.find(f => f.id === c.who)?.name}</span> <span style={{ color: T.muted, fontSize: 8 }}>{c.date}</span><div style={{ marginTop: 1 }}>{c.text}</div></div></div>)}
              <div style={{ display: "flex", gap: 3, margin: "6px 0" }}>{FAM.map(f => <button key={f.id} onClick={() => setCWho(f.id)} style={{ flex: 1, padding: 3, borderRadius: S.btn, border: cWho === f.id ? `2px solid ${f.color}` : `2px solid ${T.border}`, background: cWho === f.id ? `${f.color}08` : T.card, cursor: "pointer", fontSize: 14 }}>{f.emoji}</button>)}</div>
              <div style={{ display: "flex", gap: 5 }}><input value={cTxt} onChange={e => setCTxt(e.target.value)} placeholder="Cosa ne pensate?" style={inp({ borderRadius: S.card })} /><button onClick={() => { if (cTxt.trim()) { setPlaces(p => p.map(x => x.id === place.id ? { ...x, comments: [...x.comments, { id: uid(), text: cTxt, who: cWho, date: nowD() }] } : x)); setCTxt(""); } }} style={{ padding: "0 12px", borderRadius: S.btn, background: pg, color: "#fff", border: "none", cursor: "pointer" }}>💬</button></div>
              <button onClick={() => { setPlaces(p => p.filter(x => x.id !== place.id)); setXPlace(null); }} style={{ marginTop: 8, padding: "4px 10px", borderRadius: S.btn, background: "none", border: `2px solid ${T.border}`, fontSize: 10, fontWeight: 700, color: "#E25555", cursor: "pointer" }}>Rimuovi</button>
            </div>}
          </div>; })}
        </div>}

        {/* ═══ BUDGET ═══ */}
        {tab === "budget" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Card style={{ background: headerGrad, color: "#fff", textAlign: "center", position: "relative", overflow: "hidden", padding: 18 }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 80%,rgba(255,255,255,0.12),transparent 50%)" }} />
            <div style={{ position: "relative" }}><div style={{ fontSize: 10, opacity: .8 }}>Risparmi</div><div style={{ fontSize: 34, fontWeight: 900, fontFamily: F2 }}>€130.000</div><div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 6 }}><div><div style={{ fontSize: 8, opacity: .7 }}>NASPI</div><div style={{ fontSize: 14, fontWeight: 800 }}>+€1.400</div></div><div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} /><div><div style={{ fontSize: 8, opacity: .7 }}>Affitto IT</div><div style={{ fontSize: 14, fontWeight: 800 }}>+€900</div></div></div><div style={{ marginTop: 6, background: "rgba(255,255,255,0.18)", borderRadius: S.btn, padding: "5px 10px", display: "inline-block" }}>Mensile: <strong>{mBal >= 0 ? "+" : ""}€{mBal}</strong></div></div>
          </Card>
          <Card>
            <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📈 12 Mesi</div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={proj} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={pc} stopOpacity={.2} /><stop offset="95%" stopColor={pc} stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="m" tick={{ fontSize: 8, fill: T.muted }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 8, fill: T.muted }} tickFormatter={v => `${Math.round(v / 1000)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`€${v.toLocaleString()}`, ""]} contentStyle={{ borderRadius: S.btn, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontFamily: F1, fontWeight: 700, fontSize: 11, background: T.card, color: T.text }} />
                <ReferenceLine y={0} stroke="#E25555" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="v" stroke={pc} strokeWidth={2.5} fill="url(#cg)" dot={{ r: 2, fill: T.card, stroke: pc, strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: proj[12]?.v > 0 ? "#6BC986" : "#E25555" }}>{proj[12]?.v > 0 ? `✅ +€${proj[12].v.toLocaleString()} dopo 12m` : `⚠️ Fondi esauriti mese ${proj.findIndex(d2 => d2.v < 0)}`}</div>
          </Card>
          {["partenza", "arrivo", "mensile"].map(sec => { const s = bgt[sec]; if (!s) return null; return <div key={sec}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 800 }}>{s.icon} {s.label}</span><div style={{ display: "flex", gap: 3 }}><span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>€{bSp(sec)}/€{bTot(sec)}</span><button onClick={() => setABgt(aBgt === sec ? null : sec)} style={{ width: 24, height: 24, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 14, cursor: "pointer" }}>+</button></div></div>
            {aBgt === sec && <div style={{ display: "flex", gap: 4, marginBottom: 4 }}><input value={nBN} onChange={e => setNBN(e.target.value)} placeholder="Nome" style={inp()} /><input type="number" value={nBA} onChange={e => setNBA(e.target.value)} placeholder="€" style={inp({ width: 65, flex: "none" })} /><button onClick={() => { if (nBN.trim()) { setBgt(p => ({ ...p, [sec]: { ...p[sec], items: [...p[sec].items, { id: uid(), n: nBN, p: parseFloat(nBA) || 0, s: 0 }] } })); setNBN(""); setNBA(""); setABgt(null); } }} style={{ padding: "0 10px", borderRadius: S.btn, background: pg, color: "#fff", border: "none", cursor: "pointer" }}>✓</button></div>}
            {s.items.map(item => { const pct = item.p ? (item.s / item.p) * 100 : 0; return <div key={item.id} className="gl" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: T.card, borderRadius: S.btn, marginBottom: 3 }}><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{item.n}</div><div style={{ height: 3, background: T.bg, borderRadius: 2, overflow: "hidden", marginTop: 2 }}><div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: item.s > item.p ? "#E25555" : pg, borderRadius: 2 }} /></div></div><span style={{ fontSize: 9, color: T.muted }}>€{item.p}</span><input type="number" placeholder="€" value={item.s || ""} onChange={e => setBgt(p => ({ ...p, [sec]: { ...p[sec], items: p[sec].items.map(i => i.id === item.id ? { ...i, s: parseFloat(e.target.value) || 0 } : i) } }))} style={inp({ width: 58, flex: "none", padding: "5px 6px", fontSize: 12, fontWeight: 700, textAlign: "right" })} /><button onClick={() => setBgt(p => ({ ...p, [sec]: { ...p[sec], items: p[sec].items.filter(i => i.id !== item.id) } }))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button></div>; })}
          </div>; })}
          {/* Transaction history */}
          {txns.length > 0 && <Card>
            <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📋 Movimenti</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <div style={{ flex: 1, textAlign: "center", padding: "6px", background: "#6BC98608", borderRadius: S.btn }}><div style={{ fontSize: 8, fontWeight: 700, color: "#6BC986" }}>ENTRATE MESE</div><div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: "#6BC986" }}>+€{monthIn}</div></div>
              <div style={{ flex: 1, textAlign: "center", padding: "6px", background: "#E2555508", borderRadius: S.btn }}><div style={{ fontSize: 8, fontWeight: 700, color: "#E25555" }}>USCITE MESE</div><div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: "#E25555" }}>-€{monthOut}</div></div>
            </div>
            {txns.slice(0, 20).map(tx => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.border}15` }}>
                <span style={{ fontSize: 18 }}>{tx.cat}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.note || TX_CATS.find(c => c[0] === tx.cat)?.[1] || "—"}</div><div style={{ fontSize: 9, color: T.muted }}>{tx.date}</div></div>
                <span style={{ fontSize: 14, fontWeight: 900, fontFamily: F2, color: tx.type === "in" ? "#6BC986" : "#E25555" }}>{tx.type === "in" ? "+" : "-"}€{tx.amount}</span>
                <button onClick={() => setTxns(p => p.filter(x => x.id !== tx.id))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button>
              </div>
            ))}
          </Card>}
        </div>}

        {/* ═══ EXTRA ═══ */}
        {tab === "more" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 3 }}>{[["quiz","🇵🇱"],["recipes","🍲"],["kids","💛"],["stats","📊"],["diary","📔"],["tips","💡"]].map(([id,ic]) => <button key={id} onClick={() => setSub(id)} style={{ flex: 1, padding: "8px 2px", borderRadius: S.btn, fontSize: 16, border: "none", background: sub === id ? pg : T.card, color: sub === id ? "#fff" : T.muted, cursor: "pointer", boxShadow: sub === id ? `0 3px 8px ${pc}20` : "none" }}>{ic}</button>)}</div>

          {/* Quiz */}
          {sub === "quiz" && <Card style={{ padding: 18 }}>
            <div style={{ fontFamily: F2, fontSize: 16, fontWeight: 900, marginBottom: 4 }}>🇵🇱 Quiz</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 10 }}>Corrette: <span style={{ color: pc, fontSize: 15, fontFamily: F2 }}>{qa}</span></div>
            {!qQ ? <button onClick={startQ} style={{ width: "100%", padding: 14, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Inizia! 🎯</button> : <div>
              <div style={{ textAlign: "center", padding: "16px 0", background: `${pc}06`, borderRadius: S.btn, marginBottom: 10 }}><div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginBottom: 3 }}>Traduci:</div><div style={{ fontSize: 26, fontWeight: 900, fontFamily: F2, color: pc }}>{qQ.pl}</div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>{qQ.sh.map((o, i) => { const ok2 = o === qQ.it, sel = qA === o, sh = qA !== null; return <button key={i} onClick={() => { if (!qA) { setQA(o); if (o === qQ.it) setQa(p => p + 1); } }} className="ch" style={{ padding: "13px 8px", borderRadius: S.btn, fontSize: 13, fontWeight: 700, fontFamily: F1, cursor: qA ? "default" : "pointer", border: "none", background: sh ? (ok2 ? "linear-gradient(135deg,#6BC986,#47C5D8)" : sel ? "linear-gradient(135deg,#E25555,#FF7B7B)" : T.cardHov) : T.cardHov, color: sh ? ((ok2 || sel) ? "#fff" : T.muted) : T.text }}>{o}</button>; })}</div>
              {qA && <div style={{ textAlign: "center", marginTop: 12 }}><div style={{ fontSize: 24, marginBottom: 4 }}>{qA === qQ.it ? "🎉" : "😅"}</div><button onClick={startQ} style={{ padding: "9px 20px", borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Avanti →</button></div>}
            </div>}
          </Card>}

          {/* Recipes */}
          {sub === "recipes" && RECIPES.map(r => <div key={r.id} className="gl" style={{ background: T.card, borderRadius: S.card, overflow: "hidden" }}>
            <div onClick={() => setXRec(xRec === r.id ? null : r.id)} style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 46, height: 46, borderRadius: S.btn, background: `${r.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{r.icon}</div><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 800 }}>{r.name}</div><div style={{ display: "flex", gap: 4, marginTop: 2 }}><Pill t={r.time} c={r.color} /><Pill t={"⭐".repeat(r.diff)} c={T.muted} /></div></div></div>
            {xRec === r.id && <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, marginTop: 8, marginBottom: 4, color: r.color }}>Ingredienti 🇮🇹→🇵🇱</div>
              {r.ing.map(([it, pl, q], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}><span>{it} <span style={{ color: r.color, fontWeight: 700 }}>({pl})</span></span><span style={{ color: T.muted, fontWeight: 700 }}>{q}</span></div>)}
              <div style={{ fontSize: 11, fontWeight: 800, marginTop: 8, marginBottom: 4, color: r.color }}>Preparazione</div>
              {r.steps.map((s2, i) => <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5, fontSize: 12, lineHeight: 1.4 }}><span style={{ width: 20, height: 20, borderRadius: S.btn, background: `${r.color}12`, color: r.color, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span><span>{s2}</span></div>)}
              <button onClick={() => setRc(p => p + 1)} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: S.btn, background: `linear-gradient(135deg,${r.color},${r.color}CC)`, color: "#fff", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Cucinata! 👨‍🍳</button>
            </div>}
          </div>)}

          {/* Kids */}
          {sub === "kids" && <div>
            <Card style={{ padding: 18 }}>
              <div style={{ fontFamily: F2, fontSize: 16, fontWeight: 900, marginBottom: 8 }}>💛 Come Stai?</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>{FAM.filter(f => f.id === "walter" || f.id === "lucrezia").map(f => <button key={f.id} onClick={() => setKW(f.id)} className="ch" style={{ flex: 1, padding: "10px 4px", borderRadius: S.btn, border: kW === f.id ? `2.5px solid ${f.color}` : `2.5px solid ${T.border}`, background: kW === f.id ? `${f.color}06` : T.card, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><Avatar fid={f.id} size={36} /><span style={{ fontSize: 11, fontWeight: 800, color: kW === f.id ? f.color : T.muted }}>{f.name}</span></button>)}</div>
              <div style={{ background: `${pc}06`, borderRadius: S.btn, padding: 14, marginBottom: 10, textAlign: "center" }}><div style={{ fontSize: 8, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3 }}>Domanda</div><div style={{ fontFamily: F2, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{KIDS_QS[d % KIDS_QS.length]}</div></div>
              <textarea value={kT} onChange={e => setKT(e.target.value)} placeholder="Risposta..." style={{ width: "100%", padding: 10, border: `2.5px solid ${T.border}`, borderRadius: S.btn, fontSize: 13, fontFamily: F1, resize: "vertical", minHeight: 50, outline: "none", boxSizing: "border-box", background: T.card, color: T.text }} />
              <button onClick={() => { if (kT.trim()) { setKd(p => [{ id: uid(), who: kW, text: kT, q: KIDS_QS[d % KIDS_QS.length], date: nowD() }, ...p]); setKT(""); } }} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: S.btn, background: FAM.find(f => f.id === kW)?.grad, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Salva 💛</button>
            </Card>
            {kd.slice(0, 4).map(e => { const w = FAM.find(f => f.id === e.who); return <Card key={e.id} style={{ padding: "10px 12px", marginTop: 5, borderLeft: `3px solid ${w?.color}` }}><div style={{ fontSize: 8, color: T.muted, fontWeight: 700 }}>{e.date} · {w?.emoji}</div><div style={{ fontSize: 11, fontStyle: "italic", color: pc, marginTop: 1 }}>"{e.q}"</div><div style={{ fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>{e.text}</div></Card>; })}
          </div>}

          {/* Stats */}
          {sub === "stats" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card>
              <div style={{ fontFamily: F2, fontSize: 16, fontWeight: 900, marginBottom: 10 }}>📊 La Vostra Storia</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{[[tasks.filter(t=>t.done).length,"Task","✅"],[vi,"Luoghi","📍"],[diary.length,"Diario","📔"],[chat.length,"Messaggi","💬"],[totalPhotos,"Foto","📸"],[qa,"Quiz","🇵🇱"],[rc,"Ricette","🍲"],[moods.length,"Mood","💛"],[Math.max(0,...goals.map(g=>g.streak)),"Max Streak","🔥"]].map(([val,label,icon],i) => <div key={i} style={{ textAlign: "center", padding: "10px 4px", background: T.cardHov, borderRadius: S.btn }}><div style={{ fontSize: 16 }}>{icon}</div><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2, color: pc }}>{val}</div><div style={{ fontSize: 8, fontWeight: 700, color: T.muted }}>{label}</div></div>)}</div>
            </Card>
            {moodAvg.length > 2 && <Card><div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>💛 Umore</div><ResponsiveContainer width="100%" height={100}><AreaChart data={moodAvg} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}><defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F5A623" stopOpacity={.2} /><stop offset="95%" stopColor="#F5A623" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="date" tick={{ fontSize: 7, fill: T.muted }} axisLine={false} tickLine={false} /><YAxis domain={[0, 5]} tick={{ fontSize: 7, fill: T.muted }} axisLine={false} tickLine={false} /><Area type="monotone" dataKey="avg" stroke="#F5A623" strokeWidth={2} fill="url(#mg)" dot={{ r: 2, fill: "#F5A623" }} /></AreaChart></ResponsiveContainer></Card>}
            <Card><div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏆 Punti</div><div style={{ display: "flex", gap: 10 }}>{FAM.map(f => { const pts = gPts(f.id); const mx = Math.max(1, ...FAM.map(x => gPts(x.id))); return <div key={f.id} style={{ flex: 1, textAlign: "center" }}><Avatar fid={f.id} size={28} /><div style={{ height: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}><div style={{ width: 20, height: `${Math.max(4, (pts / mx) * 60)}px`, background: f.grad, borderRadius: `${S.btn}px ${S.btn}px 0 0`, transition: "height .4s" }} /></div><div style={{ fontSize: 12, fontWeight: 900, color: f.color, fontFamily: F2, marginTop: 2 }}>{pts}</div><div style={{ fontSize: 8, color: T.muted, fontWeight: 700 }}>{f.name}</div></div>; })}</div></Card>
          </div>}

          {/* Diary */}
          {sub === "diary" && <div>
            <Card>
              <div style={{ fontFamily: F2, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📔 Diario</div>
              <button onClick={() => setSMood(!sMood)} style={{ width: "100%", padding: 9, borderRadius: S.btn, background: sMood ? T.bg : `${pc}06`, color: pc, border: `2px solid ${pc}18`, fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>{sMood ? "▲ Chiudi" : "💛 Mood"}</button>
              {sMood && <div style={{ marginBottom: 10 }}>
                {FAM.map(f => <div key={f.id} style={{ marginBottom: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}><Avatar fid={f.id} size={18} /><span style={{ fontSize: 11, fontWeight: 700 }}>{f.name}</span>{mPick[f.id] !== undefined && <span style={{ fontSize: 14, marginLeft: "auto" }}>{MOODS[mPick[f.id]]}</span>}</div><div style={{ display: "flex", gap: 3 }}>{MOODS.map((m, i) => <button key={i} onClick={() => setMPick(p => ({ ...p, [f.id]: i }))} style={{ flex: 1, padding: "5px 1px", fontSize: 18, borderRadius: S.btn, cursor: "pointer", border: mPick[f.id] === i ? `2.5px solid ${f.color}` : `2.5px solid ${T.border}`, background: mPick[f.id] === i ? `${f.color}08` : T.card, transform: mPick[f.id] === i ? "scale(1.08)" : "scale(1)", transition: "all .15s" }}>{m}</button>)}</div></div>)}
                <button disabled={Object.keys(mPick).length < 4} onClick={() => { if (Object.keys(mPick).length >= 4) { setMoods(p => [{ id: uid(), date: nowD(), m: { ...mPick } }, ...p]); setMPick({}); setSMood(false); } }} style={{ width: "100%", padding: 10, borderRadius: S.btn, background: Object.keys(mPick).length >= 4 ? pg : T.border, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: Object.keys(mPick).length >= 4 ? "pointer" : "default" }}>Salva ✨</button>
              </div>}
              <textarea value={dTxt} onChange={e => setDTxt(e.target.value)} placeholder="Oggi..." style={{ width: "100%", padding: 10, border: `2.5px solid ${T.border}`, borderRadius: S.btn, fontSize: 13, fontFamily: F1, resize: "vertical", minHeight: 45, outline: "none", boxSizing: "border-box", background: T.card, color: T.text }} />
              <div style={{ display: "flex", gap: 3, margin: "6px 0" }}>{FAM.map(f => <button key={f.id} onClick={() => setDWho(f.id)} style={{ flex: 1, padding: 4, borderRadius: S.btn, border: dWho === f.id ? `2.5px solid ${f.color}` : `2.5px solid ${T.border}`, background: dWho === f.id ? `${f.color}08` : T.card, cursor: "pointer", fontSize: 14 }}>{f.emoji}</button>)}</div>
              <button onClick={() => { if (dTxt.trim()) { setDiary(p => [{ id: uid(), text: dTxt, who: dWho, date: nowD(), phase }, ...p]); setDTxt(""); } }} style={{ width: "100%", padding: 10, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Salva</button>
            </Card>
            {diary.slice(0, 6).map(e => { const w = FAM.find(f => f.id === e.who); return <Card key={e.id} style={{ padding: "8px 12px", marginTop: 5, borderLeft: `3px solid ${phases.find(p => p.id === e.phase)?.color || pc}` }}><div style={{ fontSize: 8, color: T.muted, fontWeight: 700 }}>{e.date} · {w?.emoji} {w?.name}</div><div style={{ fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>{e.text}</div></Card>; })}
          </div>}

          {/* Tips */}
          {sub === "tips" && <div>
            {TIPS.map(([ic, tit, tip], i) => <Card key={i} style={{ padding: "10px 14px", marginBottom: 5, display: "flex", gap: 10 }}><div style={{ width: 38, height: 38, borderRadius: S.btn, background: `${pc}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div><div><div style={{ fontSize: 12, fontWeight: 800, marginBottom: 1 }}>{tit}</div><div style={{ fontSize: 11, color: T.sub, lineHeight: 1.3 }}>{tip}</div></div></Card>)}
            <Card style={{ padding: 14 }}><div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>📞 Emergenze</div>{[["🚨","112"],["🚑","999"],["🇮🇹","+48 61 855 70 31"]].map(([i,v],j) => <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}><span>{i}</span><span style={{ fontFamily: "monospace", fontWeight: 800, color: pc }}>{v}</span></div>)}</Card>
          </div>}
        </div>}
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: T.dark ? "rgba(20,20,24,0.95)" : "rgba(255,255,255,0.93)", backdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, display: "flex", padding: "4px 6px", paddingBottom: "max(4px,env(safe-area-inset-bottom))", zIndex: 100 }}>
        {[["home","🌅","Oggi"],["chat","💬","Chat"],["places","📍","Luoghi"],["budget","💰","Budget"],["more","⭐","Extra"]].map(([id,icon,l]) => { const a = tab === id; return <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "6px 2px", border: "none", background: a ? `${pc}08` : "transparent", borderRadius: S.btn, cursor: "pointer" }}><span style={{ fontSize: 19, transform: a ? "scale(1.15)" : "scale(1)", transition: "transform .25s cubic-bezier(.34,1.56,.64,1)" }}>{icon}</span><span style={{ fontSize: 8, fontWeight: a ? 800 : 600, color: a ? pc : T.muted, fontFamily: F1 }}>{l}</span>{a && <div style={{ width: 12, height: 2.5, borderRadius: 2, background: pg }} />}</button>; })}
      </div>
    </div>
  );
}