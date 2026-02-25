import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://kmmtpgpgwgehlzwnqmsb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXRwZ3Bnd2dlaGx6d25xbXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTcxMDQsImV4cCI6MjA4NzU5MzEwNH0.f8v0iF2jV6XL5LVzU7fUWfk0Oz2goZKJ4a80ZGHoBaw');

const PINS = { "1226": "fabio", "2808": "lidia", "1510": "walter", "2301": "lucrezia" };

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
  // PIN Login with "Remember Me"
  const [currentUser, setCurrentUser] = useState(() => {
    // Check "ricordami" (remember me) first
    const remembered = localStorage.getItem("fc_remember");
    if (remembered) { sessionStorage.setItem("fc_user", remembered); return remembered; }
    return sessionStorage.getItem("fc_user") || null;
  });
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioUsers, setBioUsers] = useState(() => { try { return JSON.parse(localStorage.getItem("fc_bio") || "{}"); } catch { return {}; } });
  const [bioStatus, setBioStatus] = useState(""); // "" | "scanning" | "ok" | "fail"

  // Check biometric availability
  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then(ok2 => { setBioAvailable(ok2); })
        .catch(() => {});
    }
  }, []);

  const handlePin = (digit) => {
    const next = pin + digit;
    setPin(next);
    setPinError(false);
    if (next.length === 4) {
      if (PINS[next]) {
        const u = PINS[next];
        sessionStorage.setItem("fc_user", u);
        localStorage.setItem("fc_remember", u); // Always remember
        setCurrentUser(u);
        setPin("");
      } else {
        setPinError(true);
        setTimeout(() => { setPin(""); setPinError(false); }, 800);
      }
    }
  };

  // Biometric registration - minimal WebAuthn
  const registerBio = async (userId) => {
    if (!window.PublicKeyCredential) return false;
    try {
      setBioStatus("scanning");
      const id = new TextEncoder().encode(userId);
      const cred = await navigator.credentials.create({ publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "Famiglia Cozza" },
        user: { id, name: userId, displayName: FAM.find(f => f.id === userId)?.name || userId },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000,
      }});
      if (cred) {
        // Store credential ID as hex string (safer than btoa for binary)
        const rawId = new Uint8Array(cred.rawId);
        const hex = Array.from(rawId).map(b => b.toString(16).padStart(2, "0")).join("");
        const newBio = { ...bioUsers, [userId]: { hex, ts: Date.now() } };
        setBioUsers(newBio);
        localStorage.setItem("fc_bio", JSON.stringify(newBio));
        setBioStatus("ok");
        setTimeout(() => setBioStatus(""), 2000);
        return true;
      }
    } catch (e) { console.warn("Bio reg:", e.name, e.message); }
    setBioStatus("fail");
    setTimeout(() => setBioStatus(""), 2000);
    return false;
  };

  // Biometric login
  const loginBio = async () => {
    if (!window.PublicKeyCredential) return;
    try {
      setBioStatus("scanning");
      const allowList = Object.entries(bioUsers).map(([, v]) => {
        // Support both hex (new) and btoa (old) formats
        let bytes;
        if (v.hex) {
          bytes = new Uint8Array(v.hex.match(/.{2}/g).map(b => parseInt(b, 16)));
        } else if (v.credId) {
          const raw = atob(v.credId);
          bytes = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        } else return null;
        return { type: "public-key", id: bytes };
      }).filter(Boolean);
      if (allowList.length === 0) { setBioStatus(""); return; }
      const assertion = await navigator.credentials.get({ publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: allowList,
        userVerification: "required",
        timeout: 60000,
      }});
      if (assertion) {
        const matchHex = Array.from(new Uint8Array(assertion.rawId)).map(b => b.toString(16).padStart(2, "0")).join("");
        const matchUser = Object.entries(bioUsers).find(([, v]) => v.hex === matchHex);
        if (matchUser) {
          sessionStorage.setItem("fc_user", matchUser[0]);
          setCurrentUser(matchUser[0]);
          setBioStatus("ok");
          return;
        }
        // Fallback: try btoa match for old registrations
        const matchBtoa = btoa(Array.from(new Uint8Array(assertion.rawId)).map(b => String.fromCharCode(b)).join(""));
        const matchOld = Object.entries(bioUsers).find(([, v]) => v.credId === matchBtoa);
        if (matchOld) {
          sessionStorage.setItem("fc_user", matchOld[0]);
          setCurrentUser(matchOld[0]);
          setBioStatus("ok");
          return;
        }
      }
      setBioStatus("fail");
      setTimeout(() => setBioStatus(""), 2000);
    } catch (e) {
      console.warn("Bio login:", e.name, e.message);
      setBioStatus(e.name === "NotAllowedError" ? "" : "fail");
      if (e.name !== "NotAllowedError") setTimeout(() => setBioStatus(""), 2000);
    }
  };

  // Theme
  const [themeId, setThemeId] = useState("caldo");
  const [shapeId, setShapeId] = useState("morbido");
  const [showSettings, setShowSettings] = useState(false);
  const T = THEMES.find(t => t.id === themeId) || THEMES[0];
  const S = SHAPES.find(s => s.id === shapeId) || SHAPES[0];
  const F1 = T.f1, F2 = T.f2;

  // Core state
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false); // prevents transition flash on mount
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fc_offline_q") || "[]"); } catch { return []; }
  });
  const [syncStatus, setSyncStatus] = useState(""); // "" | "syncing" | "done"
  const [notifs, setNotifs] = useState([]); // in-app notifications
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
  const [savings, setSavings] = useState(85000);
  const [savingsTarget, setSavingsTarget] = useState(130000);
  const [monthlyBudget, setMonthlyBudget] = useState(4000); // monthly spending limit €
  const [editingBudget, setEditingBudget] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("fabio");
  const [newTaskPhase, setNewTaskPhase] = useState("prima");
  const [newTaskPts, setNewTaskPts] = useState(10);
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
  const [showPartiamo, setShowPartiamo] = useState(false);
  const [fab, setFab] = useState(false);
  const [fabTxType, setFabTxType] = useState("out");
  const [fabAmt, setFabAmt] = useState("");
  const [fabNote, setFabNote] = useState("");
  const [fabCat, setFabCat] = useState("🛒");
  const [fabMsg, setFabMsg] = useState("");
  const [fabMode, setFabMode] = useState(null);
  // ═══ CALENDARIO ═══
  const [calEvents, setCalEvents] = useState([]);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calSelDay, setCalSelDay] = useState(null);
  const [calView, setCalView] = useState("week"); // "day" | "week" | "month"
  const [calFilterWho, setCalFilterWho] = useState("all"); // "all" | member id
  const [budgetView, setBudgetView] = useState("month");
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const [budgetMonth, setBudgetMonth] = useState(new Date().getMonth());
  const [budgetDay, setBudgetDay] = useState(new Date().getDate());
  const [geoPos, setGeoPos] = useState(null); // {lat, lng, acc}
  const [geoWatch, setGeoWatch] = useState(null);
  const [geoName, setGeoName] = useState("");
  const [homeView, setHomeView] = useState("oggi"); // "oggi" | phase ids
  const [collapsed, setCollapsed] = useState({}); // { sectionKey: true/false }
  const tog = (k) => setCollapsed(p => ({ ...p, [k]: !p[k] }));
  const isOpen = (k) => !collapsed[k]; // default open
  const [showNewEvt, setShowNewEvt] = useState(false);
  // ═══ PERSONAL FEATURES ═══
  // Lidia: Digiuno intermittente
  const [fasting, setFasting] = useState({ active: false, start: null, protocol: "16:8", history: [], streak: 0, bestStreak: 0 });
  const [fastNow, setFastNow] = useState(0); // elapsed seconds (updated by interval)
  // Lidia: Ciclo
  const [cycle, setCycle] = useState({ lastPeriod: null, cycleLength: 28, periodLength: 5, history: [], symptoms: [] });
  // Walter: Sport & Missioni
  const [walterData, setWalterData] = useState({ xp: 0, level: 1, sports: [], missions: [], records: [], dailyDone: [] });
  // Lucrezia: Diario Creativo & Stelline
  const [lucreziaData, setLucreziaData] = useState({ stars: 0, journal: [], stickers: [], streakDays: 0, lastEntry: null });
  const [newEvt, setNewEvt] = useState({ title: "", date: isoDay(), time: "09:00", assignTo: "fabio", assignBy: "", color: "#F5A623", note: "", type: "task" });

  // UI state
  const [sub, setSub] = useState("quiz");
  const [meSub, setMeSub] = useState(() => currentUser === "lidia" ? "fasting" : currentUser === "walter" ? "walter" : currentUser === "lucrezia" ? "lucrezia" : "stats");
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
  const [chatTxt, setChatTxt] = useState(""); const [chatWho, setChatWho] = useState(null);
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

  // ─── CSS: separate fonts (static, loaded once) from dynamic styles ───
  // Set background on html/body immediately to prevent flash
  useLayoutEffect(() => {
    document.documentElement.style.background = T.bg;
    document.body.style.background = T.bg;
    document.body.style.margin = "0";
    // Remove HTML splash screen
    const sp = document.getElementById("splash");
    if (sp) sp.remove();
    const meta = document.querySelector('meta[name="theme-color"]') || (() => { const m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); return m; })();
    meta.content = T.dark ? "#141418" : T.bg;
  }, [T.bg, T.dark]);

  const lastFontRef = useRef("");
  useLayoutEffect(() => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${T.fonts}&display=swap`;
    if (fontUrl !== lastFontRef.current) {
      lastFontRef.current = fontUrl;
      let link = document.getElementById("fc-fonts");
      if (!link) { link = document.createElement("link"); link.id = "fc-fonts"; link.rel = "stylesheet"; document.head.appendChild(link); }
      link.href = fontUrl;
    }
  }, [T.fonts]);

  const cssRef = useRef("");
  const newCss = `*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}img{image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges}@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes fabPulse{0%,100%{box-shadow:0 4px 20px ${pc}66}50%{box-shadow:0 4px 30px ${pc}99}}.fu{animation:fu .3s ease both}.ch:active{transform:scale(0.97)}.gl{box-shadow:0 2px 14px ${T.dark?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.05)"}}input,textarea{-webkit-appearance:none;color:${T.text}}`;
  useLayoutEffect(() => {
    if (newCss === cssRef.current) return; // skip if unchanged
    cssRef.current = newCss;
    let el = document.getElementById("fc-theme-css");
    if (!el) { el = document.createElement("style"); el.id = "fc-theme-css"; document.head.appendChild(el); }
    el.textContent = newCss;
  });
  const inp = (x = {}) => ({ width: "100%", padding: "10px 13px", border: `2.5px solid ${T.border}`, borderRadius: S.input, fontSize: 14, fontFamily: F1, fontWeight: 600, outline: "none", boxSizing: "border-box", background: T.card, color: T.text, ...x });

  // ─── Supabase Persistence ───
  const sr = useRef(null);
  const skipSync = useRef(false);
  const lastSaveTs = useRef(0); // track our last save to ignore own updates

  // Save a key to Supabase app_state
  const saveKey = useCallback(async (key, value) => {
    try {
      await supabase.from('app_state').upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString(), updated_by: currentUser || 'system' });
    } catch {}
  }, [currentUser]);

  // Debounced save all state - use ref to avoid constant re-renders
  const allStateRef = useRef({});
  allStateRef.current = { tasks, places, bgt, moods, diary, fd, phase, phases, qa, rc, kd, goals, arrivalDate, themeId, shapeId, departed, savings, savingsTarget, italyBgt, calEvents, fasting, cycle, walterData, lucreziaData, monthlyBudget };

  // Save every 5 seconds via interval (not useEffect chain that causes flash)
  useEffect(() => {
    if (!ok) return;
    const interval = setInterval(() => {
      if (skipSync.current) return;
      const s = allStateRef.current;
      try { localStorage.setItem("fc_state_backup", JSON.stringify(s)); } catch {}
      if (navigator.onLine) {
        lastSaveTs.current = Date.now();
        saveKey('all', s);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [ok, saveKey]);

  // Save chat to Supabase (individual messages)
  const sendChatToDb = useCallback(async (msg) => {
    const data = { who: msg.who, text: msg.text || '', attach: msg.attach || null };
    if (!navigator.onLine) { setOfflineQueue(p => [...p, { table: "chat_messages", data, ts: Date.now() }]); return; }
    try { await supabase.from('chat_messages').insert(data); }
    catch { setOfflineQueue(p => [...p, { table: "chat_messages", data, ts: Date.now() }]); }
  }, []);

  // Save transaction to Supabase
  const sendTxToDb = useCallback(async (tx) => {
    const data = { type: tx.type, amount: tx.amount, note: tx.note || '', cat: tx.cat || '🛒', who: tx.who || currentUser || 'fabio', lat: tx.lat || null, lng: tx.lng || null };
    if (!navigator.onLine) { setOfflineQueue(p => [...p, { table: "transactions", data, ts: Date.now() }]); return; }
    try { await supabase.from('transactions').insert(data); }
    catch { setOfflineQueue(p => [...p, { table: "transactions", data, ts: Date.now() }]); }
  }, [currentUser]);

  // Load all data from Supabase (or localStorage if offline)
  const loadState = (d) => {
    if (d.tasks) setTasks(d.tasks); if (d.places) setPlaces(d.places); if (d.bgt) setBgt(d.bgt);
    if (d.moods) setMoods(d.moods); if (d.diary) setDiary(d.diary);
    if (d.fd) setFd(d.fd); if (d.phase) setPhase(d.phase); if (d.phases) setPhases(d.phases);
    if (d.qa != null) setQa(d.qa); if (d.rc != null) setRc(d.rc); if (d.kd) setKd(d.kd);
    if (d.goals) setGoals(d.goals); if (d.arrivalDate) setArrivalDate(d.arrivalDate);
    if (d.themeId) setThemeId(d.themeId); if (d.shapeId) setShapeId(d.shapeId);
    if (d.departed != null) setDeparted(d.departed); if (d.savings != null) setSavings(d.savings); if (d.savingsTarget) setSavingsTarget(d.savingsTarget);
    if (d.italyBgt) setItalyBgt(d.italyBgt); if (d.calEvents) setCalEvents(d.calEvents);
    if (d.fasting) setFasting(d.fasting); if (d.cycle) setCycle(d.cycle);
    if (d.walterData) setWalterData(d.walterData); if (d.lucreziaData) setLucreziaData(d.lucreziaData);
    if (d.monthlyBudget) setMonthlyBudget(d.monthlyBudget);
  };
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        if (!navigator.onLine) throw new Error("offline");
        const { data: stateRow } = await supabase.from('app_state').select('value').eq('key', 'all').single();
        if (stateRow?.value) {
          const d = typeof stateRow.value === 'string' ? JSON.parse(stateRow.value) : stateRow.value;
          loadState(d);
        }
        const { data: msgs } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(200);
        if (msgs) setChat(msgs.map(m => ({ id: m.id, who: m.who, text: m.text, attach: m.attach, time: new Date(m.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), date: new Date(m.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) })));
        const { data: txData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(200);
        if (txData) setTxns(txData.map(t => ({ id: t.id, type: t.type, amount: Number(t.amount), note: t.note, cat: t.cat, who: t.who, date: new Date(t.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" }), isoDate: t.created_at ? t.created_at.slice(0, 10) : isoDay(), lat: t.lat, lng: t.lng })));
      } catch (err) {
        console.warn('Loading from localStorage backup:', err);
        try {
          const backup = JSON.parse(localStorage.getItem("fc_state_backup") || "{}");
          if (backup && Object.keys(backup).length > 0) loadState(backup);
        } catch {}
      }
      setOk(true);
      setTimeout(() => setReady(true), 400);
    })();

    // ─── Realtime subscriptions (chat + transactions only) ───
    const channel = supabase.channel('famiglia')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const m = payload.new;
        setChat(prev => {
          // Dedup: check by who+text within last 10 seconds (local id ≠ supabase id)
          const isDup = prev.some(p => p.who === m.who && p.text === m.text && (Date.now() - (p._ts || 0)) < 10000);
          if (isDup || prev.some(p => p.id === m.id)) return prev;
          return [...prev, { id: m.id, who: m.who, text: m.text, attach: m.attach, time: new Date(m.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }), date: new Date(m.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) }];
        });
        // Notification if from someone else
        if (m.who !== currentUser) {
          const sender = FAM.find(f => f.id === m.who);
          setNotifs(p => [...p, { id: uid(), type: "chat", text: `${sender?.emoji || "💬"} ${sender?.name || ""}: ${(m.text || "📎").slice(0, 40)}`, ts: Date.now() }]);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        const t = payload.new;
        setTxns(prev => {
          const isDup = prev.some(p => p.who === t.who && p.amount === Number(t.amount) && p.cat === t.cat && (Date.now() - (p._ts || 0)) < 10000);
          if (isDup || prev.some(p => p.id === t.id)) return prev;
          return [{ id: t.id, type: t.type, amount: Number(t.amount), note: t.note, cat: t.cat, who: t.who, date: new Date(t.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" }), isoDate: t.created_at ? t.created_at.slice(0, 10) : isoDay(), lat: t.lat, lng: t.lng }, ...prev];
        });
        // Notification if from someone else
        if (t.who !== currentUser) {
          const sender = FAM.find(f => f.id === t.who);
          setNotifs(p => [...p, { id: uid(), type: "tx", text: `${sender?.emoji || "💰"} ${sender?.name || ""} ha speso ${t.cat} €${Number(t.amount)}`, ts: Date.now() }]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);
  useEffect(() => { fetch("https://api.open-meteo.com/v1/forecast?latitude=52.41&longitude=16.93&current=temperature_2m,weathercode&timezone=Europe/Warsaw").then(r => r.json()).then(d => { if (d?.current) { const c = d.current.weathercode; setWx({ t: Math.round(d.current.temperature_2m), i: c <= 1 ? "☀️" : c <= 3 ? "⛅" : c <= 49 ? "🌫️" : c <= 69 ? "🌧️" : "🌨️" }); } }).catch(() => {}); }, []);
  useEffect(() => { if (currentUser && !chatWho) setChatWho(currentUser); }, [currentUser]);
  useEffect(() => { if (tab === "chat") chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, tab]);
  // Fasting timer
  useEffect(() => {
    if (!fasting.active || !fasting.start) { setFastNow(0); return; }
    const iv = setInterval(() => setFastNow(Math.floor((Date.now() - fasting.start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [fasting.active, fasting.start]);
  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (notifs.length === 0) return;
    const t = setTimeout(() => setNotifs(p => p.slice(1)), 4000);
    return () => clearTimeout(t);
  }, [notifs]);
  // Online/Offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  // Save offline queue to localStorage
  useEffect(() => {
    localStorage.setItem("fc_offline_q", JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Sync offline queue when back online
  useEffect(() => {
    if (!isOnline || offlineQueue.length === 0) return;
    const syncAll = async () => {
      setSyncStatus("syncing");
      const remaining = [];
      for (const op of offlineQueue) {
        try {
          if (op.table === "transactions") {
            await supabase.from("transactions").insert(op.data);
          } else if (op.table === "chat_messages") {
            await supabase.from("chat_messages").insert(op.data);
          } else if (op.table === "app_state") {
            await supabase.from("app_state").upsert(op.data);
          }
        } catch { remaining.push(op); }
      }
      setOfflineQueue(remaining);
      setSyncStatus(remaining.length === 0 ? "done" : "");
      if (remaining.length === 0) setTimeout(() => setSyncStatus(""), 2000);
    };
    syncAll();
  }, [isOnline, offlineQueue.length]);

  // Queue operation for offline
  const queueOp = useCallback((table, data) => {
    setOfflineQueue(p => [...p, { table, data, ts: Date.now() }]);
  }, []);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setGeoPos({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy) }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
    setGeoWatch(id);
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // ─── Handlers ───
  const handlePhoto = (e) => { const f = e.target.files?.[0]; if (!f || !photoPlace) return; const r = new FileReader(); r.onload = (ev) => { setPlaces(p => p.map(x => x.id === photoPlace ? { ...x, photos: [...x.photos, { id: uid(), src: ev.target.result, who: cWho, date: nowD() }] } : x)); setPhotoPlace(null); }; r.readAsDataURL(f); e.target.value = ""; };
  const handleChatFile = (e, type) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { setChatAttach({ type, src: ev.target.result, name: f.name, mime: f.type }); setChatMenu(false); }; r.readAsDataURL(f); e.target.value = ""; };
  const startRec = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const mr = new MediaRecorder(stream); recChunks.current = []; mr.ondataavailable = (e) => { if (e.data.size > 0) recChunks.current.push(e.data); }; mr.onstop = () => { const blob = new Blob(recChunks.current, { type: "audio/webm" }); const r = new FileReader(); r.onload = (ev) => setChatAttach({ type: "audio", src: ev.target.result, name: `Vocale ${nowT()}`, mime: "audio/webm" }); r.readAsDataURL(blob); stream.getTracks().forEach(t => t.stop()); clearInterval(recTimer.current); setRecTime(0); }; mr.start(); mediaRec.current = mr; setRecording(true); setChatMenu(false); let t = 0; recTimer.current = setInterval(() => { t++; setRecTime(t); }, 1000); } catch { alert("Permesso microfono negato"); } };
  const stopRec = () => { if (mediaRec.current?.state !== "inactive") mediaRec.current?.stop(); setRecording(false); };
  const sendChat = () => { if (!chatTxt.trim() && !chatAttach) return; const msg = { id: uid(), who: currentUser, text: chatTxt, time: nowT(), date: nowD(), _ts: Date.now() }; if (chatAttach) msg.attach = chatAttach; setChat(p => [...p, msg]); sendChatToDb(msg); setChatTxt(""); setChatAttach(null); };
  const checkGoal = (goalId) => { const today = isoDay(); setGoals(prev => prev.map(g => { if (g.id !== goalId) return g; if (g.lastDone === today) return { ...g, streak: Math.max(0, g.streak - 1), lastDone: null }; const y = new Date(); y.setDate(y.getDate() - 1); return { ...g, streak: g.lastDone === y.toISOString().slice(0, 10) ? g.streak + 1 : 1, lastDone: today }; })); };
  const startQ = () => { const q = QUIZ[Math.floor(Math.random() * QUIZ.length)]; setQQ({ pl: q[0], it: q[1], sh: [...q[2]].sort(() => Math.random() - 0.5) }); setQA(null); };

  // ─── Computed ───
  const dl = Math.max(0, Math.ceil((new Date(fd + "T06:00:00") - new Date()) / 86400000));
  const d = doy(); const h = new Date().getHours();
  const phr = PHRASES[phase] || PHRASES._default;
  const phrase = phr[d % phr.length];
  const greet = h < 6 ? "Buonanotte" : h < 12 ? "Buongiorno" : h < 18 ? "Ciao" : "Buonasera";
  const me = FAM.find(f => f.id === currentUser) || FAM[0];
  const isKid = currentUser === "walter" || currentUser === "lucrezia";
  const isParent = !isKid;
  const myTasks = tasks.filter(t => t.assignee === currentUser && !t.done);
  const myEvents = calEvents.filter(e => e.assignTo === currentUser && !e.done).sort((a, b) => a.date.localeCompare(b.date));
  const pComp = (pid) => { const t = tasks.filter(x => x.phase === pid); return t.length ? (t.filter(x => x.done).length / t.length) * 100 : 0; };
  const gPts = (fid) => tasks.filter(t => t.done && (t.assignee === fid || !t.assignee)).reduce((s, t) => s + (t.assignee === fid ? t.pts : Math.round(t.pts / 4)), 0);
  const fPts = FAM.map(f => ({ ...f, pts: gPts(f.id) })).sort((a, b) => b.pts - a.pts);
  const vi = places.filter(p => p.visited).length;
  const totalPhotos = places.reduce((s, p) => s + (p.photos?.length || 0), 0);
  const bTot = (s) => bgt[s]?.items?.reduce((a, i) => a + i.p, 0) || 0;
  const bSp = (s) => bgt[s]?.items?.reduce((a, i) => a + i.s, 0) || 0;
  const mIn = 2300, mOut = bTot("mensile"), mBal = mIn - mOut;
  const proj = []; let bal = savingsTarget - bTot("partenza") - bTot("arrivo");
  for (let m = 0; m <= 12; m++) { proj.push({ m: m === 0 ? "Start" : `M${m}`, v: Math.round(bal) }); bal += mBal; }
  const smart = tasks.filter(t => t.phase === phase && !t.done).slice(0, 6);
  const todayEvents = calEvents.filter(e => e.date === isoDay()).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const todayMyEvents = todayEvents.filter(e => e.assignTo === currentUser);
  const phaseTasks = (pid) => tasks.filter(t => t.phase === pid);
  const phaseTasksDone = (pid) => phaseTasks(pid).filter(t => t.done).length;
  const phaseEvents = (pid) => calEvents.filter(e => !e.done && (pid === "oggi" ? e.date === isoDay() : true));
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
  const savPct = Math.min(100, (savings / savingsTarget) * 100);
  const monthsToTarget = itBal > 0 ? Math.ceil((savingsTarget - savings) / itBal) : "∞";
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

  // Loading overlay is rendered inside main app now

  // Bio is available as manual button on login screen

  // ═══ PIN LOGIN SCREEN ═══
  if (!currentUser) {
    const curFam = pin.length === 4 && PINS[pin] ? FAM.find(f => f.id === PINS[pin]) : null;
    return (
      <div style={{ fontFamily: "'Nunito',sans-serif", background: "linear-gradient(135deg,#F5F3EE,#FFF5F0)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 50, marginBottom: 8 }}>🇮🇹→🇵🇱</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, margin: "0 0 4px" }}>Famiglia Cozza</h1>
          <p style={{ color: "#8A8780", fontSize: 14 }}>Inserisci il tuo PIN</p>
        </div>
        {/* PIN dots */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: pinError ? "#E25555" : pin.length > i ? "#F5A623" : "#E8E5E0", transition: "all .2s", transform: pinError ? "translateX(" + (i % 2 ? "3" : "-3") + "px)" : "none" }} />
          ))}
        </div>
        {pinError && <div style={{ color: "#E25555", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>PIN sbagliato!</div>}
        {/* Number pad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 260, width: "100%" }}>
          {[1,2,3,4,5,6,7,8,9,null,0,"⌫"].map((n, i) => (
            n === null ? <div key={i} /> :
            <button key={i} onClick={() => {
              if (n === "⌫") { setPin(p => p.slice(0, -1)); setPinError(false); }
              else if (pin.length < 4) handlePin(String(n));
            }} style={{ width: "100%", aspectRatio: "1", borderRadius: 16, border: "none", background: n === "⌫" ? "transparent" : "#fff", boxShadow: n === "⌫" ? "none" : "0 2px 10px rgba(0,0,0,0.06)", fontSize: n === "⌫" ? 22 : 26, fontWeight: 700, fontFamily: "'Nunito',sans-serif", cursor: "pointer", color: "#1C1C1E", display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</button>
          ))}
        </div>
        {/* Family avatars - tap to quick login */}
        <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
          {FAM.map(f => <button key={f.id} onClick={() => { sessionStorage.setItem("fc_user", f.id); localStorage.setItem("fc_remember", f.id); setCurrentUser(f.id); }} style={{ textAlign: "center", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <div style={{ width: 48, height: 48, borderRadius: 18, background: f.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 3px 12px ${f.color}30` }}>{f.emoji}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#8A8780", marginTop: 3 }}>{f.name}</div>
            </button>)}
        </div>
        {/* Bio login option */}
        {bioAvailable && Object.keys(bioUsers).length > 0 && <button onClick={loginBio} disabled={bioStatus === "scanning"} style={{ marginTop: 14, padding: "12px 28px", borderRadius: 24, background: bioStatus === "ok" ? "#6BC986" : bioStatus === "fail" ? "#E25555" : "linear-gradient(135deg,#5B8DEF,#3B6FD4)", color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 15px rgba(91,141,239,0.2)", opacity: bioStatus === "scanning" ? 0.7 : 1 }}>
          <span style={{ fontSize: 20 }}>{bioStatus === "scanning" ? "⏳" : "🔐"}</span>
          {bioStatus === "scanning" ? "Verifica..." : "Face ID / Impronta"}
        </button>}
        <div style={{ marginTop: 12, fontSize: 9, color: "#C4C0B8", textAlign: "center" }}>
          Tocca il tuo avatar per entrare subito
        </div>
      </div>
    );
  }

  // ═══ NO SEPARATE LOADING SCREEN - prevents DOM swap flash ═══
  // Loading overlay is rendered INSIDE the main app instead

  return (
    <div style={{ fontFamily: F1, background: T.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 90, color: T.text, transition: "none" }}>
      {/* Loading overlay - fades out when data is ready */}
      {!ok && currentUser && <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "opacity .3s" }}>
        <div style={{ fontSize: 50, animation: "pulse 1.5s infinite" }}>🇮🇹→🇵🇱</div>
        <div style={{ fontFamily: F2, fontSize: 18, fontWeight: 900, color: T.text, marginTop: 12 }}>Caricamento...</div>
      </div>}
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
              <h1 style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, margin: 0, color: "#fff" }}>{greet}, {me.name}!</h1>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2, display: "flex", gap: 8, fontWeight: 700 }}>
                <span>{departed ? "🇵🇱 Poznań" : "🇮🇹 Cosenza"}</span>{wx && departed && <span>{wx.i} {wx.t}°C</span>}
                {departed && daysSinceArrival > 0 && <span>📅 Giorno {daysSinceArrival}</span>}
                {!isOnline && <span style={{ background: "#E25555", padding: "1px 6px", borderRadius: 6, fontSize: 9, color: "#fff" }}>⚡ Offline</span>}
                {syncStatus === "syncing" && <span style={{ background: "#F5A623", padding: "1px 6px", borderRadius: 6, fontSize: 9, color: "#fff" }}>🔄 Sync...</span>}
                {syncStatus === "done" && <span style={{ background: "#6BC986", padding: "1px 6px", borderRadius: 6, fontSize: 9, color: "#fff" }}>✅ Sync!</span>}
                {offlineQueue.length > 0 && isOnline && syncStatus !== "syncing" && <span style={{ background: "#F5A623", padding: "1px 6px", borderRadius: 6, fontSize: 9, color: "#fff" }}>📤 {offlineQueue.length}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {/* Theme button */}
              <button onClick={() => setShowSettings(!showSettings)} className="ch" style={{ width: 36, height: 36, borderRadius: S.btn, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>🎨</button>
              {/* Current user */}
              <div style={{ width: 36, height: 36, borderRadius: S.btn * S.av * 3, background: FAM.find(f=>f.id===currentUser)?.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{FAM.find(f=>f.id===currentUser)?.emoji}</div>
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
          <button onClick={() => { sessionStorage.removeItem("fc_user"); localStorage.removeItem("fc_remember"); setCurrentUser(null); setPin(""); }} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: S.btn, background: "transparent", color: "#E25555", border: `2px solid #E2555530`, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F1 }}>🚪 Cambia Utente ({FAM.find(f=>f.id===currentUser)?.name})</button>
          {bioAvailable && <button onClick={async () => { const ok3 = await registerBio(currentUser); }} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: S.btn, background: bioStatus === "ok" ? "#6BC98615" : bioStatus === "scanning" ? `${pc}08` : bioUsers[currentUser] ? "#6BC98610" : "transparent", color: bioStatus === "ok" ? "#6BC986" : bioStatus === "fail" ? "#E25555" : bioUsers[currentUser] ? "#6BC986" : "#5B8DEF", border: `2px solid ${bioUsers[currentUser] ? "#6BC98630" : "#5B8DEF30"}`, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F1, transition: "all .3s" }}>{bioStatus === "scanning" ? "⏳ Verifica biometrica..." : bioStatus === "ok" ? "✅ Registrato!" : bioUsers[currentUser] ? "🔐 Face ID / Impronta ✓ (ri-registra)" : "🔐 Registra Face ID / Impronta"}</button>}
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

      {/* ═══ NOTIFICATION TOASTS ═══ */}
      {notifs.length > 0 && <div style={{ position: "fixed", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 999, display: "flex", flexDirection: "column", gap: 4, width: "calc(100% - 24px)", maxWidth: 440 }}>
        {notifs.slice(0, 3).map(n => <div key={n.id} onClick={() => { setNotifs(p => p.filter(x => x.id !== n.id)); if (n.type === "chat") setTab("chat"); if (n.type === "tx") setTab("budget"); }} className="fu" style={{ padding: "10px 14px", borderRadius: S.card, background: T.dark ? "#2A2A38" : "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.2)", border: `2px solid ${n.type === "chat" ? "#5B8DEF" : n.type === "tx" ? "#E25555" : pc}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 18 }}>{n.type === "chat" ? "💬" : n.type === "tx" ? "💸" : n.type === "task" ? "✅" : "📅"}</div>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.text}</div>
          <div style={{ fontSize: 9, color: T.muted }}>ora</div>
        </div>)}
      </div>}

      <div style={{ padding: "12px 12px 0" }}>

        {/* ═══ HOME ═══ */}
        {tab === "home" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Home sub-navigation */}
          <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 2 }}>
            <button onClick={() => setHomeView("oggi")} className="ch" style={{ padding: "7px 12px", borderRadius: S.btn, border: homeView === "oggi" ? `2px solid ${pc}` : `2px solid ${T.border}`, background: homeView === "oggi" ? `${pc}10` : T.card, cursor: "pointer", fontSize: 11, fontWeight: 800, color: homeView === "oggi" ? pc : T.muted, whiteSpace: "nowrap", flexShrink: 0 }}>📅 Oggi</button>
            {phases.map(p => <button key={p.id} onClick={() => setHomeView(p.id)} className="ch" style={{ padding: "7px 12px", borderRadius: S.btn, border: homeView === p.id ? `2px solid ${p.color}` : `2px solid ${T.border}`, background: homeView === p.id ? `${p.color}10` : T.card, cursor: "pointer", fontSize: 11, fontWeight: 800, color: homeView === p.id ? p.color : T.muted, whiteSpace: "nowrap", flexShrink: 0 }}>{p.icon} {p.label} <span style={{ fontSize: 9, opacity: .7 }}>{Math.round(pComp(p.id))}%</span></button>)}
          </div>

          {/* ═══════════════════════════════ */}
          {/* ═══ HOME: OGGI ═══ */}
          {/* ═══════════════════════════════ */}
          {homeView === "oggi" && <>
            {/* Greeting + Weather */}
            <Card style={{ background: pg, color: "#fff", position: "relative", overflow: "hidden", padding: 18 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%,rgba(255,255,255,0.15),transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>{new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</div>
                    <div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginTop: 4 }}>{greet}, {me.name} {me.emoji}</div>
                  </div>
                  {wx && <div style={{ textAlign: "right" }}><div style={{ fontSize: 28 }}>{wx.i}</div><div style={{ fontSize: 12, fontWeight: 800 }}>{wx.t}°C</div></div>}
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2 }}>{todayMyEvents.filter(e => !e.done).length}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>da fare oggi</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2 }}>{myTasks.length}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>compiti aperti</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2 }}>{dl}</div>
                    <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>giorni al volo</div>
                  </div>
                  {geoPos && <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 14 }}>📍</div>
                    <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>{geoPos.lat.toFixed(2)},{geoPos.lng.toFixed(2)}</div>
                  </div>}
                </div>
              </div>
            </Card>

            {/* Today's events for everyone */}
            <Card>
              <div className="ch" onClick={() => tog("oggi_fam")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen("oggi_fam") ? 8 : 0, cursor: "pointer" }}>
                <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>📅 Oggi in famiglia</span>
                <span style={{ fontSize: 12, color: T.muted, transition: "transform .2s", transform: isOpen("oggi_fam") ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
              </div>
              {isOpen("oggi_fam") && <>{todayEvents.length === 0 && <div style={{ textAlign: "center", padding: 8, color: T.muted, fontSize: 11 }}>Nessun impegno per oggi — aggiungine dal calendario!</div>}
              {FAM.map(f => {
                const fEvts = todayEvents.filter(e => e.assignTo === f.id && !e.done);
                if (fEvts.length === 0) return null;
                return <div key={f.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <Avatar fid={f.id} size={22} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: f.color }}>{f.name}</span>
                  </div>
                  {fEvts.map(e => { const ab = e.assignBy && e.assignBy !== e.assignTo ? FAM.find(x => x.id === e.assignBy) : null; return <div key={e.id} className="ch" onClick={() => setCalEvents(p => p.map(x => x.id === e.id ? { ...x, done: !x.done } : x))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: T.cardHov, borderRadius: S.btn, marginBottom: 3, cursor: "pointer", borderLeft: `3px solid ${f.color}` }}>
                    <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${f.color}`, background: e.done ? f.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0 }}>{e.done ? "✓" : ""}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{e.type === "task" ? "✅" : e.type === "scadenza" ? "⚠️" : "📅"} {e.title}</div>
                      <div style={{ fontSize: 9, color: T.muted }}>{e.time ? `🕐 ${e.time}` : ""}{ab ? ` · da ${ab.emoji} ${ab.name}` : ""}</div>
                    </div>
                  </div>; })}
                </div>;
              })}
              </>}
            </Card>
            {(() => {
              const next7 = calEvents.filter(e => !e.done && e.date >= isoDay() && e.date <= (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); })()).sort((a, b) => a.date.localeCompare(b.date));
              return next7.length > 0 && <Card>
                <div className="ch" onClick={() => tog("next7")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen("next7") ? 8 : 0, cursor: "pointer" }}>
                  <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>📋 Prossimi 7 giorni ({next7.length})</span>
                  <span style={{ fontSize: 12, color: T.muted, transition: "transform .2s", transform: isOpen("next7") ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
                </div>
                {isOpen("next7") && next7.slice(0, 8).map(e => { const to = FAM.find(f => f.id === e.assignTo); const ab = e.assignBy && e.assignBy !== e.assignTo ? FAM.find(x => x.id === e.assignBy) : null; return <div key={e.id} className="ch" onClick={() => setCalEvents(p => p.map(x => x.id === e.id ? { ...x, done: !x.done } : x))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: T.cardHov, borderRadius: S.btn, marginBottom: 3, cursor: "pointer", borderLeft: `3px solid ${to?.color || pc}` }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${to?.color || pc}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{e.type === "task" ? "✅" : e.type === "scadenza" ? "⚠️" : "📅"} {e.title}</div><div style={{ fontSize: 9, color: T.muted }}>{e.date.slice(5)} {e.time} → {to?.emoji} {to?.name}{ab ? ` · da ${ab.emoji}` : ""}</div></div>
                </div>; })}
              </Card>;
            })()}

            {/* ALL open prep tasks - always visible */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen("tasks") ? 8 : 0 }}>
                <div className="ch" onClick={() => tog("tasks")} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flex: 1 }}>
                  <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>🎯 Task aperti ({tasks.filter(t => !t.done).length})</span>
                  <span style={{ fontSize: 12, color: T.muted, transition: "transform .2s", transform: isOpen("tasks") ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
                </div>
                <button onClick={() => { setShowNewEvt(true); setNewEvt(e => ({ ...e, type: "task", assignBy: currentUser || "fabio", assignTo: currentUser || "fabio", date: isoDay() })); }} className="ch" style={{ width: 26, height: 26, borderRadius: 13, background: pg, color: "#fff", border: "none", fontSize: 14, cursor: "pointer" }}>+</button>
              </div>
              {isOpen("tasks") && <>
              {/* Group by person */}
              {FAM.map(f => {
                const fTasks = tasks.filter(t => t.assignee === f.id && !t.done);
                if (fTasks.length === 0) return null;
                return <div key={f.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Avatar fid={f.id} size={20} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: f.color }}>{f.name}</span>
                    <span style={{ fontSize: 9, color: T.muted }}>{fTasks.length} task</span>
                  </div>
                  {fTasks.slice(0, 4).map(t => { const cr = t.createdBy && t.createdBy !== t.assignee ? FAM.find(x => x.id === t.createdBy) : null; return <div key={t.id} className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: T.cardHov, borderRadius: S.btn, marginBottom: 3, cursor: "pointer", borderLeft: `3px solid ${f.color}` }}>
                    <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${f.color}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{t.text}</span>
                    {cr && <span style={{ fontSize: 9, color: cr.color }}>da {cr.emoji}</span>}
                    <Pill t={`${t.pts}pt`} c={f.color} />
                  </div>; })}
                  {fTasks.length > 4 && <div style={{ fontSize: 9, color: T.muted, paddingLeft: 28 }}>+{fTasks.length - 4} altri</div>}
                </div>;
              })}
              {/* Unassigned */}
              {tasks.filter(t => !t.assignee && !t.done).length > 0 && <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, marginBottom: 4 }}>👥 Per tutti</div>
                {tasks.filter(t => !t.assignee && !t.done).map(t => <div key={t.id} className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: T.cardHov, borderRadius: S.btn, marginBottom: 3, cursor: "pointer" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${T.border}`, background: "transparent", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{t.text}</span>
                  <Pill t={`${t.pts}pt`} c={pc} />
                </div>)}
              </div>}
              {tasks.filter(t => !t.done).length === 0 && <div style={{ textAlign: "center", padding: 12, color: T.muted, fontSize: 12 }}>Tutto fatto! 🎉</div>}
              </>}
            </Card>

            {/* Progress per phase */}
            <Card>
              <div className="ch" onClick={() => tog("phases")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen("phases") ? 8 : 0, cursor: "pointer" }}>
                <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>📊 Progresso fasi</span>
                <span style={{ fontSize: 12, color: T.muted, transition: "transform .2s", transform: isOpen("phases") ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
              </div>
              {isOpen("phases") && phases.map(p => {
                const pct = pComp(p.id);
                const total = phaseTasks(p.id).length;
                const done = phaseTasksDone(p.id);
                return <div key={p.id} className="ch" onClick={() => setHomeView(p.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", cursor: "pointer", borderBottom: `1px solid ${T.border}10` }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{p.label}</span>
                      <span style={{ fontSize: 10, color: T.muted }}>{done}/{total}</span>
                    </div>
                    <div style={{ height: 6, background: T.bg, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: p.color, borderRadius: 3, transition: "width .5s" }} /></div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900, color: p.color, fontFamily: F2 }}>{Math.round(pct)}%</span>
                </div>;
              })}
            </Card>

            {/* Quick tx + Morning phrase */}
            <Card>
              <div className="ch" onClick={() => tog("phrase")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: pc, textTransform: "uppercase", letterSpacing: ".06em" }}>{greet}</div>
                <span style={{ fontSize: 12, color: T.muted, transition: "transform .2s", transform: isOpen("phrase") ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
              </div>
              {isOpen("phrase") && <><div style={{ fontFamily: F2, fontSize: 17, fontWeight: 900, lineHeight: 1.3, marginBottom: 6, marginTop: 6 }}>"{phrase.t}"</div><div style={{ fontSize: 12, color: T.sub, fontStyle: "italic", paddingLeft: 10, borderLeft: `3px solid ${pc}40`, lineHeight: 1.4 }}>{phrase.s}</div></>}
            </Card>

            {/* 💸 Quick Transactions - solo genitori */}
            {isParent && <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen("tx") ? 8 : 0 }}>
                <div className="ch" onClick={() => tog("tx")} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flex: 1 }}>
                  <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>💸 Oggi</span>
                  <span style={{ fontSize: 12, color: T.muted, transition: "transform .2s", transform: isOpen("tx") ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
                </div>
                <button onClick={() => setTxOpen(!txOpen)} style={{ width: 28, height: 28, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 16, cursor: "pointer" }}>{txOpen ? "−" : "+"}</button>
              </div>
              {isOpen("tx") && <>
              <div style={{ display: "flex", gap: 6, marginBottom: txOpen ? 10 : 0 }}>
                <div style={{ flex: 1, padding: "8px 10px", background: "#6BC98608", borderRadius: S.btn, textAlign: "center" }}><div style={{ fontSize: 8, fontWeight: 700, color: "#6BC986" }}>ENTRATE</div><div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: "#6BC986" }}>+€{todayIn}</div></div>
                <div style={{ flex: 1, padding: "8px 10px", background: "#E2555508", borderRadius: S.btn, textAlign: "center" }}><div style={{ fontSize: 8, fontWeight: 700, color: "#E25555" }}>USCITE</div><div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: "#E25555" }}>-€{todayOut}</div></div>
                <div style={{ flex: 1, padding: "8px 10px", background: `${pc}08`, borderRadius: S.btn, textAlign: "center" }}><div style={{ fontSize: 8, fontWeight: 700, color: pc }}>MESE</div><div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: monthIn - monthOut >= 0 ? "#6BC986" : "#E25555" }}>{monthIn - monthOut >= 0 ? "+" : ""}€{monthIn - monthOut}</div></div>
              </div>
              {txOpen && <div>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}><button onClick={() => setTxType("out")} className="ch" style={{ flex: 1, padding: "10px 4px", borderRadius: S.btn, border: txType === "out" ? "2.5px solid #E25555" : `2.5px solid ${T.border}`, background: txType === "out" ? "#E2555508" : T.card, cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 18 }}>📤</div><div style={{ fontSize: 10, fontWeight: 800, color: txType === "out" ? "#E25555" : T.muted }}>Uscita</div></button><button onClick={() => setTxType("in")} className="ch" style={{ flex: 1, padding: "10px 4px", borderRadius: S.btn, border: txType === "in" ? "2.5px solid #6BC986" : `2.5px solid ${T.border}`, background: txType === "in" ? "#6BC98608" : T.card, cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 18 }}>📥</div><div style={{ fontSize: 10, fontWeight: 800, color: txType === "in" ? "#6BC986" : T.muted }}>Entrata</div></button></div>
                <div style={{ position: "relative", marginBottom: 8 }}><span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, fontWeight: 900, color: txType === "out" ? "#E25555" : "#6BC986" }}>€</span><input type="number" value={txAmt} onChange={e => setTxAmt(e.target.value)} placeholder="0" style={inp({ paddingLeft: 30, fontSize: 20, fontWeight: 900, fontFamily: F2, textAlign: "right" })} /></div>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>{(txType === "out" ? [5, 10, 20, 50, 100] : [100, 500, 900, 1400, 2300]).map(v => <button key={v} onClick={() => setTxAmt(String(v))} className="ch" style={{ flex: 1, padding: "6px 2px", borderRadius: S.btn, border: `1.5px solid ${T.border}`, background: txAmt === String(v) ? `${pc}08` : T.card, cursor: "pointer", fontSize: 11, fontWeight: 700, color: txAmt === String(v) ? pc : T.muted }}>{v}</button>)}</div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>{TX_CATS.map(([ic, lb]) => <button key={ic} onClick={() => setTxCat(ic)} className="ch" style={{ padding: "5px 8px", borderRadius: S.btn, border: txCat === ic ? `2.5px solid ${pc}` : `1.5px solid ${T.border}`, background: txCat === ic ? `${pc}08` : T.card, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 14 }}>{ic}</span><span style={{ fontWeight: 700, color: txCat === ic ? pc : T.muted }}>{lb}</span></button>)}</div>
                <input value={txNote} onChange={e => setTxNote(e.target.value)} placeholder="Nota (opzionale)" style={inp({ marginBottom: 8 })} />
                {geoPos && <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><span>📍</span> Posizione registrata</div>}
                <button onClick={() => { const amt = parseFloat(txAmt); if (!amt || amt <= 0) return; const tx = { id: uid(), type: txType, amount: amt, note: txNote, cat: txCat, date: nowD(), who: currentUser || "fabio", isoDate: isoDay(), _ts: Date.now(), lat: geoPos?.lat, lng: geoPos?.lng }; setTxns(p => [tx, ...p]); sendTxToDb(tx); setTxAmt(""); setTxNote(""); setTxOpen(false); }} style={{ width: "100%", padding: 12, borderRadius: S.btn, background: txType === "out" ? "linear-gradient(135deg,#E25555,#FF7B7B)" : "linear-gradient(135deg,#6BC986,#47C5D8)", color: "#fff", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>{txType === "out" ? "📤 Registra Uscita" : "📥 Registra Entrata"}</button>
              </div>}
              {txns.length > 0 && !txOpen && <div style={{ marginTop: 6 }}>{txns.slice(0, 3).map(tx => { const tw = FAM.find(f => f.id === tx.who); return <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: `1px solid ${T.border}08` }}><div style={{ width: 22, height: 22, borderRadius: 11, background: tw?.grad || T.cardHov, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{tw?.emoji || "👤"}</div><span style={{ fontSize: 16 }}>{tx.cat}</span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.note || "—"}</div><div style={{ fontSize: 9, color: T.muted }}>{tx.date} · {tw?.name}</div></div><span style={{ fontSize: 14, fontWeight: 900, fontFamily: F2, color: tx.type === "in" ? "#6BC986" : "#E25555" }}>{tx.type === "in" ? "+" : "-"}€{tx.amount}</span></div>; })}</div>}
              </>}
            </Card>}

            {/* Leaderboard */}
            <Card>
              <div className="ch" onClick={() => tog("board")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen("board") ? 8 : 0, cursor: "pointer" }}>
                <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>🏆 Classifica</span>
                <span style={{ fontSize: 12, color: T.muted, transition: "transform .2s", transform: isOpen("board") ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
              </div>
              {isOpen("board") && fPts.map((f, i) => <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px", background: i === 0 ? `${f.color}06` : "transparent", borderRadius: S.btn, marginBottom: 2 }}>
                <div style={{ width: 24, height: 24, borderRadius: S.btn, background: i === 0 ? "linear-gradient(135deg,#FFD700,#FFAA00)" : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: i === 0 ? "#fff" : T.muted }}>{i === 0 ? "👑" : i + 1}</div>
                <Avatar fid={f.id} size={30} /><span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{f.name}</span><span style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: f.color }}>{f.pts}</span>
              </div>)}
            </Card>
          </>}

          {/* ═══════════════════════════════ */}
          {/* ═══ HOME: PARTENZA (prima) ═══ */}
          {/* ═══════════════════════════════ */}
          {homeView === "prima" && <>
            <Card style={{ background: pg, color: "#fff", position: "relative", overflow: "hidden", padding: 18 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%,rgba(255,255,255,0.15),transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>📦 Fase Partenza</div>
                <div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginTop: 4 }}>Preparando l'Avventura</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{dl}</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>giorni al volo</div></div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{prepDone}/{prepTasks.length}</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>task fatti</div></div>
                  {isParent && <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{Math.round(savPct)}%</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>risparmi</div></div>}
                </div>
              </div>
            </Card>

            {/* Savings - solo genitori */}
            {isParent && <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>💰 Obiettivo Risparmi</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 12, fontWeight: 800, color: pc }}>€{savings.toLocaleString()} / </span><input type="number" value={savingsTarget} onChange={e => setSavingsTarget(parseFloat(e.target.value) || 0)} style={inp({ width: 80, padding: "2px 6px", fontSize: 12, fontWeight: 800, color: pc, textAlign: "right", background: "transparent", border: `1.5px dashed ${pc}40` })} /></div>
              </div>
              <div style={{ height: 14, background: T.bg, borderRadius: S.btn, overflow: "hidden", position: "relative", marginBottom: 10 }}><div style={{ height: "100%", width: `${savPct}%`, background: savPct >= 100 ? "linear-gradient(90deg,#6BC986,#47C5D8)" : pg, borderRadius: S.btn, transition: "width .6s", position: "relative" }}><div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 8, fontWeight: 900, color: "#fff" }}>{Math.round(savPct)}%</div></div></div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>{[500, 1000, 2000, 5000].map(v => <button key={v} onClick={() => setSavings(s => s + v)} className="ch" style={{ flex: 1, padding: "8px 2px", borderRadius: S.btn, border: `1.5px solid #6BC98630`, background: "#6BC98606", cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 11, fontWeight: 800, color: "#6BC986" }}>+€{v}</div></button>)}</div>
              <div style={{ display: "flex", gap: 4 }}>{[500, 1000, 2000].map(v => <button key={v} onClick={() => setSavings(s => Math.max(0, s - v))} className="ch" style={{ flex: 1, padding: "8px 2px", borderRadius: S.btn, border: `1.5px solid #E2555530`, background: "#E2555506", cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 11, fontWeight: 800, color: "#E25555" }}>-€{v}</div></button>)}<input type="number" placeholder="€ custom" value="" onChange={e => { const v = parseFloat(e.target.value); if (v) setSavings(s => Math.max(0, s + v)); e.target.value = ""; }} style={inp({ flex: 1, padding: "6px 8px", fontSize: 11, textAlign: "center" })} /></div>
              {savings < savingsTarget && <div style={{ marginTop: 8, fontSize: 11, color: T.sub, textAlign: "center" }}>Mancano <strong style={{ color: pc }}>€{(savingsTarget - savings).toLocaleString()}</strong>{itBal > 0 && <span> · €{itBal}/mese → <strong style={{ color: "#6BC986" }}>{monthsToTarget} mesi</strong></span>}</div>}
              {savings >= savingsTarget && <div style={{ marginTop: 8, fontSize: 13, fontWeight: 800, color: "#6BC986", textAlign: "center" }}>🎉 Obiettivo raggiunto!</div>}
            </Card>}

            {/* Italy budget */}
            {isParent && <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🇮🇹 Budget Mensile Italia</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <div style={{ flex: 1, padding: "8px 10px", background: "#6BC98608", borderRadius: S.btn, textAlign: "center" }}><div style={{ fontSize: 8, fontWeight: 700, color: "#6BC986" }}>ENTRATE</div><div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: "#6BC986" }}>+€{itIn}</div></div>
                <div style={{ flex: 1, padding: "8px 10px", background: "#E2555508", borderRadius: S.btn, textAlign: "center" }}><div style={{ fontSize: 8, fontWeight: 700, color: "#E25555" }}>USCITE</div><div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: "#E25555" }}>-€{itOut}</div></div>
                <div style={{ flex: 1, padding: "8px 10px", background: `${pc}08`, borderRadius: S.btn, textAlign: "center" }}><div style={{ fontSize: 8, fontWeight: 700, color: pc }}>RISPARMIO</div><div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: itBal >= 0 ? "#6BC986" : "#E25555" }}>€{itBal}</div></div>
              </div>
              {italyBgt.map(item => <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.border}15` }}><div style={{ width: 8, height: 8, borderRadius: 4, background: item.type === "in" ? "#6BC986" : "#E25555", flexShrink: 0 }} /><span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.n}</span><input type="number" value={item.p} onChange={e => setItalyBgt(p => p.map(x => x.id === item.id ? { ...x, p: parseFloat(e.target.value) || 0 } : x))} style={inp({ width: 70, flex: "none", padding: "4px 6px", fontSize: 13, fontWeight: 800, textAlign: "right", color: item.type === "in" ? "#6BC986" : "#E25555" })} /><button onClick={() => setItalyBgt(p => p.filter(x => x.id !== item.id))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button></div>)}
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}><button onClick={() => setItalyBgt(p => [...p, { id: uid(), n: "Nuova voce", type: "in", p: 0 }])} className="ch" style={{ flex: 1, padding: 8, borderRadius: S.btn, border: `1.5px dashed #6BC98640`, background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#6BC986" }}>+ Entrata</button><button onClick={() => setItalyBgt(p => [...p, { id: uid(), n: "Nuova voce", type: "out", p: 0 }])} className="ch" style={{ flex: 1, padding: 8, borderRadius: S.btn, border: `1.5px dashed #E2555540`, background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#E25555" }}>+ Uscita</button></div>
            </Card>}

            {/* Prep tasks */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>📋 Preparativi</span><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 11, fontWeight: 800, color: pc }}>{prepDone}/{prepTasks.length}</span><button onClick={() => setShowAddTask(!showAddTask)} className="ch" style={{ width: 26, height: 26, borderRadius: 13, background: showAddTask ? T.muted : pg, color: "#fff", border: "none", fontSize: 14, cursor: "pointer" }}>{showAddTask ? "✕" : "+"}</button></div></div>
              <div style={{ height: 6, background: T.bg, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}><div style={{ height: "100%", width: `${prepPct}%`, background: prepPct >= 100 ? "linear-gradient(90deg,#6BC986,#47C5D8)" : pg, borderRadius: 3, transition: "width .5s" }} /></div>
              {showAddTask && <div style={{ padding: 12, background: `${pc}06`, borderRadius: S.btn, marginBottom: 8, border: `1.5px dashed ${pc}30` }}>
                <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Nuovo compito..." autoFocus style={inp({ marginBottom: 6, fontSize: 13, fontWeight: 600 })} />
                <div style={{ fontSize: 10, fontWeight: 700, color: T.sub, marginBottom: 4 }}>Assegna a:</div>
                <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>{FAM.map(f => <button key={f.id} onClick={() => setNewTaskAssignee(f.id)} className="ch" style={{ flex: 1, padding: "6px 2px", borderRadius: S.btn, border: newTaskAssignee === f.id ? `2.5px solid ${f.color}` : `2px solid ${T.border}`, background: newTaskAssignee === f.id ? `${f.color}10` : T.card, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}><span style={{ fontSize: 18 }}>{f.emoji}</span><span style={{ fontSize: 8, fontWeight: 700, color: newTaskAssignee === f.id ? f.color : T.muted }}>{f.name}</span></button>)}</div>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}><select value={newTaskPhase} onChange={e => setNewTaskPhase(e.target.value)} style={inp({ flex: 1, fontSize: 11 })}>{phases.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}</select><div style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>Punti:</span>{[5, 10, 20, 30].map(p => <button key={p} onClick={() => setNewTaskPts(p)} className="ch" style={{ padding: "3px 8px", borderRadius: S.btn, border: newTaskPts === p ? `2px solid ${pc}` : `1.5px solid ${T.border}`, background: newTaskPts === p ? `${pc}08` : T.card, fontSize: 10, fontWeight: 700, color: newTaskPts === p ? pc : T.muted, cursor: "pointer" }}>{p}</button>)}</div></div>
                <button onClick={() => { if (!newTaskText.trim()) return; setTasks(p => [...p, { id: uid(), text: newTaskText, phase: newTaskPhase, cat: "task", pts: newTaskPts, done: false, assignee: newTaskAssignee, createdBy: currentUser }]); setNewTaskText(""); setShowAddTask(false); }} style={{ width: "100%", padding: 10, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>✅ Aggiungi → {FAM.find(f => f.id === newTaskAssignee)?.emoji}</button>
              </div>}
              {prepTasks.map(t => { const w = t.assignee ? FAM.find(f => f.id === t.assignee) : null; const cr = t.createdBy && t.createdBy !== t.assignee ? FAM.find(x => x.id === t.createdBy) : null; return <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: t.done ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 4 }}>
                <div className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ width: 22, height: 22, borderRadius: S.btn, border: `2.5px solid ${t.done ? pc : T.border}`, background: t.done ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{t.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
                <span style={{ fontSize: 13, flex: 1, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text }}>{t.text}</span>
                {w && <div className="ch" onClick={() => { const idx = FAM.findIndex(f => f.id === w.id); const next = FAM[(idx + 1) % FAM.length]; setTasks(p => p.map(x => x.id === t.id ? { ...x, assignee: next.id } : x)); }} style={{ cursor: "pointer" }}><Avatar fid={w.id} size={22} /></div>}
                <Pill t={`${t.pts}pt`} c={pc} />
                <button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button>
              </div>; })}
            </Card>

            {/* PARTIAMO button */}
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {!showPartiamo ? <button onClick={() => setShowPartiamo(true)} className="ch" style={{ width: "100%", padding: "20px 16px", background: pg, border: "none", cursor: "pointer", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%,rgba(255,255,255,0.15),transparent 70%)" }} /><div style={{ position: "relative" }}><div style={{ fontSize: 32 }}>✈️</div><div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 4 }}>PARTIAMO!</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 700, marginTop: 4 }}>Quando siete pronti, inizia l'avventura</div></div></button>
              : <div style={{ padding: 20, textAlign: "center", background: `${pc}08` }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🛫</div>
                <div style={{ fontFamily: F2, fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Siete sicuri?</div>
                <div style={{ fontSize: 13, color: T.sub, marginBottom: 12, lineHeight: 1.4 }}>Passerete alla fase "Arrivati a Poznań".</div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>💰 Risparmi: <strong>€{savings.toLocaleString()}</strong> · 📋 Task: <strong>{prepDone}/{prepTasks.length}</strong></div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={() => { setDeparted(true); setPhase("arrivati"); setArrivalDate(isoDay()); setTasks(p => p.map(t => t.phase === "prima" ? { ...t, done: true } : t)); setShowPartiamo(false); setHomeView("arrivati"); const pm = { id: uid(), who: currentUser || "fabio", text: "✈️ SIAMO PARTITI! Poznań, arriviamo! 🇵🇱", time: nowT(), date: nowD() }; setChat(p => [...p, pm]); sendChatToDb(pm); }} className="ch" style={{ padding: "12px 28px", borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 16, fontWeight: 900, cursor: "pointer", boxShadow: `0 4px 15px ${pc}66` }}>🛫 PARTIAMO!</button>
                  <button onClick={() => setShowPartiamo(false)} className="ch" style={{ padding: "12px 20px", borderRadius: S.btn, background: T.bg, color: T.muted, border: `2px solid ${T.border}`, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Non ancora</button>
                </div>
              </div>}
            </Card>
          </>}

          {/* ═══════════════════════════════ */}
          {/* ═══ HOME: ARRIVATI ═══ */}
          {/* ═══════════════════════════════ */}
          {homeView === "arrivati" && <>
            <Card style={{ background: pg, color: "#fff", position: "relative", overflow: "hidden", padding: 18 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%,rgba(255,255,255,0.15),transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>✈️ Fase Arrivati</div>
                <div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginTop: 4 }}>Benvenuti a Poznań!</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{daysSinceArrival}</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>giorni in PL</div></div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{phaseTasksDone("arrivati")}/{phaseTasks("arrivati").length}</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>task fatti</div></div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{Math.round(pComp("arrivati"))}%</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>completato</div></div>
                </div>
              </div>
            </Card>

            {/* Milestones */}
            {(nextMilestone || unlockedMilestones.length > 0) && <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏅 Traguardi</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>{MILESTONES.map(m => { const done = daysSinceArrival >= m.days; const isN = m === nextMilestone; return <div key={m.days} style={{ minWidth: 64, padding: "8px 6px", borderRadius: S.btn, background: done ? `${pc}10` : isN ? "#FFF9E6" : T.bg, textAlign: "center", border: isN ? "2px solid #FFD700" : done ? `2px solid ${pc}20` : "2px solid transparent", opacity: done ? 1 : isN ? 1 : 0.3 }}><div style={{ fontSize: 22 }}>{m.icon}</div><div style={{ fontSize: 8, fontWeight: 800, color: done ? pc : isN ? "#F5A623" : T.muted, marginTop: 2 }}>{m.name}</div>{isN && <div style={{ fontSize: 8, fontWeight: 700, color: "#F5A623" }}>tra {m.days - daysSinceArrival}g</div>}{done && <div style={{ fontSize: 8, color: pc }}>✓</div>}</div>; })}</div>
            </Card>}

            {/* Arrivati tasks */}
            <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📋 Da fare all'arrivo</div>
              {phaseTasks("arrivati").map(t => { const w = t.assignee ? FAM.find(f => f.id === t.assignee) : null; const cr = t.createdBy && t.createdBy !== t.assignee ? FAM.find(x => x.id === t.createdBy) : null; return <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: t.done ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 4 }}>
                <div className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ width: 22, height: 22, borderRadius: S.btn, border: `2.5px solid ${t.done ? pc : T.border}`, background: t.done ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{t.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
                <span style={{ fontSize: 13, flex: 1, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text }}>{t.text}</span>
                {w && <Avatar fid={w.id} size={22} />}{cr && <span style={{ fontSize: 9, color: cr.color }}>da {cr.emoji}</span>}
                <Pill t={`${t.pts}pt`} c={pc} />
              </div>; })}
            </Card>

            {/* Memories */}
            {memories.length > 0 && <Card style={{ background: `${pc}08`, border: `1.5px solid ${pc}30` }}><div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📅 Un anno fa oggi...</div>{memories.slice(0, 2).map(m => <div key={m.id} style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: T.sub }}>{FAM.find(f => f.id === m.who)?.emoji} "{m.text}"</div>)}</Card>}
          </>}

          {/* ═══════════════════════════════ */}
          {/* ═══ HOME: WEEKEND ═══ */}
          {/* ═══════════════════════════════ */}
          {homeView === "weekend" && <>
            <Card style={{ background: pg, color: "#fff", position: "relative", overflow: "hidden", padding: 18 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%,rgba(255,255,255,0.15),transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>🗺️ Fase Weekend</div>
                <div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginTop: 4 }}>Esplorare Poznań!</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{vi}</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>posti visitati</div></div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{totalPhotos}</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>foto</div></div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{Math.round(pComp("weekend"))}%</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>completato</div></div>
                </div>
              </div>
            </Card>
            <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🗺️ Avventure weekend</div>
              {phaseTasks("weekend").length === 0 && <div style={{ textAlign: "center", padding: 12, color: T.muted, fontSize: 12 }}>Nessun task weekend — aggiungine! 🎉</div>}
              {phaseTasks("weekend").map(t => { const w = t.assignee ? FAM.find(f => f.id === t.assignee) : null; const cr = t.createdBy && t.createdBy !== t.assignee ? FAM.find(x => x.id === t.createdBy) : null; return <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: t.done ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 4 }}>
                <div className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ width: 22, height: 22, borderRadius: S.btn, border: `2.5px solid ${t.done ? pc : T.border}`, background: t.done ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{t.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
                <span style={{ fontSize: 13, flex: 1, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text }}>{t.text}</span>
                {w && <Avatar fid={w.id} size={22} />}{cr && <span style={{ fontSize: 9, color: cr.color }}>da {cr.emoji}</span>}
                <Pill t={`${t.pts}pt`} c={pc} />
              </div>; })}
            </Card>
            {/* Converter */}
            <Card style={{ padding: 14, cursor: "pointer" }}><div onClick={() => setSConv(!sConv)} style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 13, fontWeight: 800 }}>💱 EUR→PLN</span><span style={{ fontSize: 10, color: T.muted, fontWeight: 700, background: T.bg, padding: "2px 8px", borderRadius: S.pill }}>1€={EUR_PLN}zł</span></div>{sConv && <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10 }}><input type="number" value={eurA} onChange={e => setEurA(e.target.value)} placeholder="€" style={inp({ borderColor: pc })} /><span style={{ color: pc }}>→</span><div style={{ flex: 1, padding: "10px", background: pg, borderRadius: S.btn, fontSize: 16, fontWeight: 900, color: "#fff", textAlign: "center" }}>{eurA ? (parseFloat(eurA) * EUR_PLN).toFixed(2) : "0"} zł</div></div>}</Card>
          </>}

          {/* ═══════════════════════════════ */}
          {/* ═══ HOME: VITA ═══ */}
          {/* ═══════════════════════════════ */}
          {homeView === "vita" && <>
            <Card style={{ background: pg, color: "#fff", position: "relative", overflow: "hidden", padding: 18 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%,rgba(255,255,255,0.15),transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>🏠 Nuova Vita</div>
                <div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900, lineHeight: 1.2, marginTop: 4 }}>Casa a Poznań</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{goals.length}</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>obiettivi</div></div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{Math.round(pComp("vita"))}%</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>completato</div></div>
                </div>
              </div>
            </Card>

            {/* Goals */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>🔥 Obiettivi</span><button onClick={() => setAGoal(!aGoal)} style={{ width: 28, height: 28, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 16, cursor: "pointer" }}>+</button></div>
              {aGoal && <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 6 }}><input value={ngTxt} onChange={e => setNgTxt(e.target.value)} placeholder="Nuovo obiettivo..." style={inp()} /><div style={{ display: "flex", gap: 4 }}>{["daily", "weekly"].map(f => <button key={f} onClick={() => setNgFreq(f)} style={{ flex: 1, padding: 8, borderRadius: S.btn, border: ngFreq === f ? `2.5px solid ${pc}` : `2.5px solid ${T.border}`, background: ngFreq === f ? `${pc}08` : T.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: ngFreq === f ? pc : T.muted }}>{f === "daily" ? "Giornaliero" : "Settimanale"}</button>)}</div><button onClick={() => { if (ngTxt.trim()) { setGoals(p => [...p, { id: uid(), text: ngTxt, freq: ngFreq, streak: 0, lastDone: null, icon: "⭐" }]); setNgTxt(""); setAGoal(false); } }} style={{ padding: 10, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Aggiungi</button></div>}
              {goals.map(g => { const dt = g.lastDone === isoDay(); return <div key={g.id} className="ch" onClick={() => checkGoal(g.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: dt ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 5, cursor: "pointer", border: `1.5px solid ${dt ? `${pc}25` : "transparent"}` }}>
                <div style={{ width: 28, height: 28, borderRadius: S.btn, border: `2.5px solid ${dt ? pc : T.border}`, background: dt ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{dt ? <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span> : <span style={{ fontSize: 14 }}>{g.icon}</span>}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: dt ? T.muted : T.text }}>{g.text}</div><div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{g.freq === "daily" ? "Ogni giorno" : "Ogni settimana"}</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: g.streak >= 7 ? "#E25555" : g.streak >= 3 ? "#F5A623" : pc }}>{g.streak}</div><div style={{ fontSize: 8, color: T.muted, fontWeight: 700 }}>🔥</div></div>
                <button onClick={e => { e.stopPropagation(); setGoals(p => p.filter(x => x.id !== g.id)); }} style={{ background: "none", border: "none", fontSize: 10, color: T.border, cursor: "pointer" }}>✕</button>
              </div>; })}
            </Card>

            {/* Vita tasks */}
            <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏠 Routine e vita</div>
              {phaseTasks("vita").map(t => { const w = t.assignee ? FAM.find(f => f.id === t.assignee) : null; const cr = t.createdBy && t.createdBy !== t.assignee ? FAM.find(x => x.id === t.createdBy) : null; return <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: t.done ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 4 }}>
                <div className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ width: 22, height: 22, borderRadius: S.btn, border: `2.5px solid ${t.done ? pc : T.border}`, background: t.done ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{t.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
                <span style={{ fontSize: 13, flex: 1, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text }}>{t.text}</span>
                {w && <Avatar fid={w.id} size={22} />}{cr && <span style={{ fontSize: 9, color: cr.color }}>da {cr.emoji}</span>}
                <Pill t={`${t.pts}pt`} c={pc} />
              </div>; })}
            </Card>

            {/* Badges */}
            <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🎖️ Badge <span style={{ color: pc, fontSize: 12 }}>{BADGES.filter(b => b[2]).length}/{BADGES.length}</span></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{BADGES.map(([icon, name, ok2], i) => <div key={i} style={{ width: 48, padding: "6px 2px", borderRadius: S.btn, background: ok2 ? `${pc}08` : T.bg, textAlign: "center", opacity: ok2 ? 1 : 0.25 }}><div style={{ fontSize: 20 }}>{icon}</div><div style={{ fontSize: 7, fontWeight: 800, color: ok2 ? pc : T.muted }}>{name}</div></div>)}</div>
            </Card>
          </>}

          {/* ═══ GENERIC PHASE HOME (custom phases) ═══ */}
          {homeView !== "oggi" && homeView !== "prima" && homeView !== "arrivati" && homeView !== "weekend" && homeView !== "vita" && (() => {
            const ph = phases.find(p => p.id === homeView);
            if (!ph) return null;
            const phTasks = phaseTasks(homeView);
            return <>
              <Card style={{ background: pg, color: "#fff", position: "relative", overflow: "hidden", padding: 18 }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%,rgba(255,255,255,0.15),transparent 60%)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontFamily: F2, fontSize: 22, fontWeight: 900 }}>{ph.icon} {ph.label}</div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{phTasks.filter(t => t.done).length}/{phTasks.length}</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>task fatti</div></div>
                    <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: S.btn, padding: "6px 12px" }}><div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2 }}>{Math.round(pComp(homeView))}%</div><div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>completato</div></div>
                  </div>
                </div>
              </Card>
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{ph.icon} Task</div>
                {phTasks.length === 0 && <div style={{ textAlign: "center", padding: 12, color: T.muted, fontSize: 12 }}>Nessun task per questa fase</div>}
                {phTasks.map(t => { const w = t.assignee ? FAM.find(f => f.id === t.assignee) : null; const cr = t.createdBy && t.createdBy !== t.assignee ? FAM.find(x => x.id === t.createdBy) : null; return <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: t.done ? `${pc}06` : T.cardHov, borderRadius: S.btn, marginBottom: 4 }}>
                  <div className="ch" onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ width: 22, height: 22, borderRadius: S.btn, border: `2.5px solid ${t.done ? pc : T.border}`, background: t.done ? pg : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{t.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
                  <span style={{ fontSize: 13, flex: 1, fontWeight: 600, textDecoration: t.done ? "line-through" : "none", color: t.done ? T.muted : T.text }}>{t.text}</span>
                  {w && <Avatar fid={w.id} size={22} />}{cr && <span style={{ fontSize: 9, color: cr.color }}>da {cr.emoji}</span>}
                  <Pill t={`${t.pts}pt`} c={pc} />
                </div>; })}
              </Card>
            </>;
          })()}

        </div>}

        {/* ═══ CHAT ═══ */}
        {tab === "chat" && <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 175px)" }}>
          <div style={{ fontFamily: F2, fontSize: 17, fontWeight: 900, marginBottom: 8 }}>💬 Chat Famiglia</div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
            {chat.length === 0 && <div style={{ textAlign: "center", padding: 30, color: T.muted }}><div style={{ fontSize: 36, marginBottom: 6 }}>💬</div><div style={{ fontSize: 13, fontWeight: 700 }}>Chat vuota!</div><div style={{ fontSize: 11, color: T.border }}>Foto, video, vocali, documenti...</div></div>}
            {chat.map(msg => { const f = FAM.find(x => x.id === msg.who) || FAM[0]; const isR = msg.who === currentUser; const att = msg.attach; return <div key={msg.id} style={{ display: "flex", flexDirection: isR ? "row-reverse" : "row", gap: 6, alignItems: "flex-end" }} className="fu">
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
              {[["📷", "Foto", () => chatPhotoRef.current?.click()], ["🎬", "Video", () => chatVideoRef.current?.click()], ["🎙️", "Vocale", () => { setChatMenu(false); startRec(); }], ["📎", "File", () => chatDocRef.current?.click()]].map(([ic, lb, fn], i) => <button key={i} onClick={fn} className="ch" style={{ padding: "12px 4px", borderRadius: S.btn, border: "none", background: `${pc}06`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><span style={{ fontSize: 24 }}>{ic}</span><span style={{ fontSize: 10, fontWeight: 800, color: pc, fontFamily: F1 }}>{lb}</span></button>)}
            </div>}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => setChatMenu(!chatMenu)} style={{ width: 38, height: 38, borderRadius: 19, background: chatMenu ? pg : T.card, color: chatMenu ? "#fff" : pc, border: `1.5px solid ${chatMenu ? "transparent" : T.border}`, fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>{chatMenu ? "✕" : "+"}</button>
              <input value={chatTxt} onChange={e => setChatTxt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendChat(); }} placeholder="Scrivi..." style={inp({ borderRadius: 22, padding: "10px 16px", flex: 1 })} />
              <button onClick={sendChat} style={{ width: 38, height: 38, borderRadius: 19, background: (chatTxt.trim() || chatAttach) ? me.grad : T.border, color: "#fff", border: "none", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>↑</button>
            </div>
          </div>
        </div>}

        {/* ═══ PLACES ═══ */}
        {/* ═══ CALENDARIO TAB ═══ */}
        {tab === "cal" && (() => {
          const MESI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
          const GIORNI = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
          const GIORNI_FULL = ["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"];
          const todayStr = isoDay();
          const todayDate = new Date();
          const dayStr = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const evtsFor = (ds) => {
            let evts = calEvents.filter(e => e.date === ds);
            if (calFilterWho !== "all") evts = evts.filter(e => e.assignTo === calFilterWho);
            return evts.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
          };

          // Week helpers
          const getWeekDays = () => {
            const d = calSelDay ? new Date(`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(calSelDay).padStart(2,"0")}`) : todayDate;
            const day = (d.getDay() + 6) % 7;
            const mon = new Date(d); mon.setDate(d.getDate() - day);
            return Array.from({ length: 7 }, (_, i) => { const dd = new Date(mon); dd.setDate(mon.getDate() + i); return dd; });
          };

          // Event card component
          const EvtCard = ({ e, compact }) => {
            const to = FAM.find(f => f.id === e.assignTo); const by = FAM.find(f => f.id === e.assignBy);
            return <div style={{ display: "flex", alignItems: "center", gap: 8, padding: compact ? "6px 10px" : "10px 14px", background: T.card, borderRadius: S.btn, borderLeft: `4px solid ${to?.color || pc}`, marginBottom: 4, opacity: e.done ? 0.5 : 1, boxShadow: `0 1px 4px ${T.dark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.04)"}` }}>
              <button onClick={() => setCalEvents(p => p.map(x => x.id === e.id ? { ...x, done: !x.done } : x))} className="ch" style={{ width: compact ? 22 : 26, height: compact ? 22 : 26, borderRadius: 13, border: `2px solid ${to?.color || pc}`, background: e.done ? to?.color || pc : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", flexShrink: 0 }}>{e.done ? "✓" : ""}</button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: compact ? 12 : 13, fontWeight: 700, textDecoration: e.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.type === "task" ? "✅" : e.type === "scadenza" ? "⚠️" : "📅"} {e.title}</div>
                <div style={{ fontSize: 10, color: T.muted, display: "flex", gap: 6, flexWrap: "wrap", marginTop: 1 }}>
                  {e.time && <span>🕐 {e.time}</span>}
                  <span style={{ color: to?.color, fontWeight: 700 }}>→ {to?.emoji} {to?.name}</span>
                  {by && by.id !== e.assignTo && <span style={{ color: by.color }}>da {by.emoji}</span>}
                </div>
                {!compact && e.note && <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>{e.note}</div>}
              </div>
              <button onClick={() => setCalEvents(p => p.filter(x => x.id !== e.id))} style={{ background: "none", border: "none", fontSize: 12, cursor: "pointer", color: T.muted, flexShrink: 0 }}>✕</button>
            </div>;
          };

          return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* View switcher + filter */}
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {["day","week","month"].map(v => <button key={v} onClick={() => setCalView(v)} className="ch" style={{ flex: 1, padding: "8px 4px", borderRadius: S.btn, border: calView === v ? `2px solid ${pc}` : `2px solid ${T.border}`, background: calView === v ? `${pc}10` : T.card, cursor: "pointer", fontSize: 12, fontWeight: 800, color: calView === v ? pc : T.muted }}>{v === "day" ? "📅 Giorno" : v === "week" ? "📆 Settimana" : "🗓️ Mese"}</button>)}
              <button onClick={() => { setShowNewEvt(true); setNewEvt(e => ({ ...e, assignBy: currentUser || "fabio", assignTo: currentUser || "fabio", date: isoDay() })); }} className="ch" style={{ width: 36, height: 36, borderRadius: 18, background: pg, color: "#fff", border: "none", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>+</button>
            </div>

            {/* Who filter */}
            <div style={{ display: "flex", gap: 3 }}>
              <button onClick={() => setCalFilterWho("all")} className="ch" style={{ padding: "5px 10px", borderRadius: S.btn, border: calFilterWho === "all" ? `2px solid ${pc}` : `2px solid ${T.border}`, background: calFilterWho === "all" ? `${pc}10` : T.card, cursor: "pointer", fontSize: 11, fontWeight: 700, color: calFilterWho === "all" ? pc : T.muted }}>Tutti</button>
              {FAM.map(f => <button key={f.id} onClick={() => setCalFilterWho(calFilterWho === f.id ? "all" : f.id)} className="ch" style={{ flex: 1, padding: "5px 2px", borderRadius: S.btn, border: calFilterWho === f.id ? `2.5px solid ${f.color}` : `2px solid ${T.border}`, background: calFilterWho === f.id ? `${f.color}12` : T.card, cursor: "pointer", fontSize: 16, position: "relative" }}>{f.emoji}{calFilterWho === f.id && <div style={{ position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)", width: 12, height: 3, borderRadius: 2, background: f.color }} />}</button>)}
            </div>

            {/* ═══ DAY VIEW ═══ */}
            {calView === "day" && (() => {
              const selDate = calSelDay ? new Date(calYear, calMonth, calSelDay) : todayDate;
              const ds = calSelDay ? dayStr(calYear, calMonth, calSelDay) : todayStr;
              const isToday = ds === todayStr;
              const dayName = GIORNI_FULL[(selDate.getDay() + 6) % 7];
              const dayEvts = evtsFor(ds);
              const prevDay = () => { const d = new Date(selDate); d.setDate(d.getDate() - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); setCalSelDay(d.getDate()); };
              const nextDay = () => { const d = new Date(selDate); d.setDate(d.getDate() + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); setCalSelDay(d.getDate()); };
              return <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <button onClick={prevDay} className="ch" style={{ width: 34, height: 34, borderRadius: 17, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>←</button>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: F2, fontSize: 20, fontWeight: 900, color: isToday ? pc : T.text }}>{selDate.getDate()} {MESI[selDate.getMonth()]}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>{dayName} {isToday ? "· Oggi" : ""}</div>
                  </div>
                  <button onClick={nextDay} className="ch" style={{ width: 34, height: 34, borderRadius: 17, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>→</button>
                </div>
                {!isToday && <button onClick={() => { setCalSelDay(null); setCalMonth(todayDate.getMonth()); setCalYear(todayDate.getFullYear()); }} style={{ width: "100%", padding: 6, borderRadius: S.btn, background: "transparent", border: `1px dashed ${T.border}`, cursor: "pointer", fontSize: 11, color: T.muted, fontWeight: 700, marginBottom: 6 }}>↩ Torna a oggi</button>}
                {dayEvts.length === 0 && <Card style={{ padding: 24, textAlign: "center" }}><div style={{ fontSize: 28, marginBottom: 4 }}>🌤️</div><div style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>Giornata libera!</div></Card>}

                {/* Group by person */}
                {FAM.map(f => {
                  const personEvts = dayEvts.filter(e => e.assignTo === f.id);
                  if (personEvts.length === 0) return null;
                  return <div key={f.id} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 12, background: f.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{f.emoji}</div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: f.color }}>{f.name}</span>
                      <span style={{ fontSize: 10, color: T.muted }}>{personEvts.length} {personEvts.length === 1 ? "compito" : "compiti"}</span>
                    </div>
                    {personEvts.map(e => <EvtCard key={e.id} e={e} />)}
                  </div>;
                })}
              </div>;
            })()}

            {/* ═══ WEEK VIEW ═══ */}
            {calView === "week" && (() => {
              const weekDays = getWeekDays();
              return <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <button onClick={() => { const d = new Date(weekDays[0]); d.setDate(d.getDate() - 7); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); setCalSelDay(d.getDate()); }} className="ch" style={{ width: 34, height: 34, borderRadius: 17, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>←</button>
                  <div style={{ fontFamily: F2, fontSize: 15, fontWeight: 900 }}>{weekDays[0].getDate()} - {weekDays[6].getDate()} {MESI[weekDays[6].getMonth()]}</div>
                  <button onClick={() => { const d = new Date(weekDays[0]); d.setDate(d.getDate() + 7); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); setCalSelDay(d.getDate()); }} className="ch" style={{ width: 34, height: 34, borderRadius: 17, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>→</button>
                </div>
                {weekDays.map((wd, i) => {
                  const ds = wd.toISOString().slice(0, 10);
                  const isToday = ds === todayStr;
                  const dayEvts = evtsFor(ds);
                  return <div key={i} style={{ marginBottom: 6 }}>
                    <div className="ch" onClick={() => { setCalView("day"); setCalYear(wd.getFullYear()); setCalMonth(wd.getMonth()); setCalSelDay(wd.getDate()); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer", borderBottom: `1px solid ${T.border}15` }}>
                      <div style={{ width: 40, textAlign: "center" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: isToday ? pc : T.muted }}>{GIORNI[i]}</div>
                        <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: isToday ? pc : T.text, background: isToday ? `${pc}15` : "transparent", borderRadius: 10, padding: "2px 6px" }}>{wd.getDate()}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {dayEvts.length === 0 && <span style={{ fontSize: 11, color: T.muted }}>—</span>}
                        {dayEvts.slice(0, 4).map(e => {
                          const to = FAM.find(f => f.id === e.assignTo);
                          return <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 0" }}>
                            <div style={{ width: 4, height: 4, borderRadius: 2, background: to?.color || pc, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: e.done ? "line-through" : "none", color: e.done ? T.muted : T.text }}>{e.title}</span>
                            <span style={{ fontSize: 10, color: T.muted }}>{e.time}</span>
                            <span style={{ fontSize: 12 }}>{to?.emoji}</span>
                          </div>;
                        })}
                        {dayEvts.length > 4 && <span style={{ fontSize: 9, color: T.muted }}>+{dayEvts.length - 4} altri</span>}
                      </div>
                    </div>
                  </div>;
                })}
              </div>;
            })()}

            {/* ═══ MONTH VIEW ═══ */}
            {calView === "month" && (() => {
              const firstDay = new Date(calYear, calMonth, 1);
              const startOfs = (firstDay.getDay() + 6) % 7;
              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
              const cells = [];
              for (let i = 0; i < startOfs; i++) cells.push(null);
              for (let d = 1; d <= daysInMonth; d++) cells.push(d);
              while (cells.length % 7 !== 0) cells.push(null);
              return <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }} className="ch" style={{ width: 34, height: 34, borderRadius: 17, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>←</button>
                  <div style={{ fontFamily: F2, fontSize: 18, fontWeight: 900 }}>{MESI[calMonth]} {calYear}</div>
                  <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }} className="ch" style={{ width: 34, height: 34, borderRadius: 17, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>→</button>
                </div>
                <Card style={{ padding: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
                    {GIORNI.map(g => <div key={g} style={{ textAlign: "center", fontSize: 9, fontWeight: 800, color: T.muted, padding: "3px 0" }}>{g}</div>)}
                    {cells.map((d, i) => {
                      if (d === null) return <div key={`e${i}`} />;
                      const ds = dayStr(calYear, calMonth, d);
                      const isToday = ds === todayStr;
                      const dayEvts = evtsFor(ds);
                      return <div key={i} onClick={() => { setCalView("day"); setCalSelDay(d); }} className="ch" style={{ textAlign: "center", padding: "4px 1px", borderRadius: 8, cursor: "pointer", background: isToday ? `${pc}15` : "transparent", minHeight: 38 }}>
                        <div style={{ fontSize: 12, fontWeight: isToday ? 900 : 500, color: isToday ? pc : T.text }}>{d}</div>
                        {dayEvts.length > 0 && <div style={{ display: "flex", gap: 1, justifyContent: "center", marginTop: 1, flexWrap: "wrap" }}>
                          {dayEvts.slice(0, 3).map((e, j) => { const f = FAM.find(m => m.id === e.assignTo); return <div key={j} style={{ width: 5, height: 5, borderRadius: 3, background: f?.color || pc }} />; })}
                          {dayEvts.length > 3 && <div style={{ fontSize: 7, color: T.muted }}>+{dayEvts.length - 3}</div>}
                        </div>}
                      </div>;
                    })}
                  </div>
                </Card>
              </div>;
            })()}

            {/* Family overview - who does what */}
            <Card style={{ padding: 12 }}>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 900, marginBottom: 8 }}>👥 Chi deve fare cosa</div>
              {FAM.map(f => {
                const myEvts = calEvents.filter(e => e.assignTo === f.id && !e.done);
                const myDone = calEvents.filter(e => e.assignTo === f.id && e.done).length;
                return <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${T.border}10` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: f.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{f.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{f.name}</span>
                      <span style={{ fontSize: 10, color: T.muted }}>{myEvts.length} aperti · {myDone} fatti</span>
                    </div>
                    {myEvts.length > 0 && <div style={{ marginTop: 3 }}>{myEvts.slice(0, 2).map(e => <div key={e.id} style={{ fontSize: 10, color: T.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>· {e.type === "task" ? "✅" : "📅"} {e.title} <span style={{ color: T.muted }}>{e.date.slice(5)}</span></div>)}{myEvts.length > 2 && <div style={{ fontSize: 9, color: T.muted }}>+{myEvts.length - 2} altri</div>}</div>}
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 15, background: myEvts.length === 0 ? "#6BC98620" : `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: myEvts.length === 0 ? "#6BC986" : f.color }}>{myEvts.length === 0 ? "✓" : myEvts.length}</div>
                </div>;
              })}
            </Card>
          </div>;
        })()}

        {/* ═══ BUDGET ═══ */}
        {tab === "budget" && isParent && (() => {
          const [bView, setBView] = [budgetView, setBudgetView];
          const now = new Date();
          const MESI = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];

          // Parse transaction dates
          const parseTxDate = (tx) => {
            if (tx.isoDate) return tx.isoDate;
            return tx.created_at ? tx.created_at.slice(0, 10) : isoDay();
          };
          const txWithDates = txns.map(tx => ({ ...tx, _d: parseTxDate(tx) }));

          // Period filtering
          const periodStart = (() => {
            const d = new Date(budgetYear, budgetMonth, 1);
            if (bView === "day") return new Date(budgetYear, budgetMonth, budgetDay || now.getDate()).toISOString().slice(0, 10);
            if (bView === "week") {
              const wd = new Date(budgetYear, budgetMonth, budgetDay || now.getDate());
              const day = (wd.getDay() + 6) % 7;
              wd.setDate(wd.getDate() - day);
              return wd.toISOString().slice(0, 10);
            }
            if (bView === "month") return `${budgetYear}-${String(budgetMonth + 1).padStart(2, "0")}-01`;
            return `${budgetYear}-01-01`;
          })();
          const periodEnd = (() => {
            if (bView === "day") return periodStart;
            if (bView === "week") {
              const d = new Date(periodStart); d.setDate(d.getDate() + 6);
              return d.toISOString().slice(0, 10);
            }
            if (bView === "month") {
              const d = new Date(budgetYear, budgetMonth + 1, 0);
              return d.toISOString().slice(0, 10);
            }
            return `${budgetYear}-12-31`;
          })();

          const filtered = txWithDates.filter(tx => tx._d >= periodStart && tx._d <= periodEnd);
          const totIn = filtered.filter(t => t.type === "in").reduce((s, t) => s + t.amount, 0);
          const totOut = filtered.filter(t => t.type === "out").reduce((s, t) => s + t.amount, 0);

          // Category breakdown
          const catBreakdown = {};
          filtered.filter(t => t.type === "out").forEach(t => {
            const k = t.cat || "🎁";
            catBreakdown[k] = (catBreakdown[k] || 0) + t.amount;
          });
          const catSorted = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]);
          const catTotal = catSorted.reduce((s, [, v]) => s + v, 0) || 1;

          // Who spent what
          const whoSpent = {};
          filtered.filter(t => t.type === "out").forEach(t => {
            const k = t.who || "fabio";
            whoSpent[k] = (whoSpent[k] || 0) + t.amount;
          });

          // Navigation
          const nav = (dir) => {
            if (bView === "day") {
              const d = new Date(budgetYear, budgetMonth, (budgetDay || now.getDate()) + dir);
              setBudgetYear(d.getFullYear()); setBudgetMonth(d.getMonth()); setBudgetDay(d.getDate());
            } else if (bView === "week") {
              const d = new Date(periodStart); d.setDate(d.getDate() + dir * 7);
              setBudgetYear(d.getFullYear()); setBudgetMonth(d.getMonth()); setBudgetDay(d.getDate());
            } else if (bView === "month") {
              const m = budgetMonth + dir;
              if (m < 0) { setBudgetMonth(11); setBudgetYear(y => y - 1); }
              else if (m > 11) { setBudgetMonth(0); setBudgetYear(y => y + 1); }
              else setBudgetMonth(m);
            } else { setBudgetYear(y => y + dir); }
          };

          const periodLabel = (() => {
            if (bView === "day") { const d = new Date(periodStart); return `${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`; }
            if (bView === "week") { const s = new Date(periodStart); const e = new Date(periodEnd); return `${s.getDate()} - ${e.getDate()} ${MESI[e.getMonth()]}`; }
            if (bView === "month") return `${MESI[budgetMonth]} ${budgetYear}`;
            return `${budgetYear}`;
          })();

          return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Period selector */}
            <div style={{ display: "flex", gap: 3 }}>
              {["day","week","month","year"].map(v => <button key={v} onClick={() => setBView(v)} className="ch" style={{ flex: 1, padding: "7px 2px", borderRadius: S.btn, border: bView === v ? `2px solid ${pc}` : `2px solid ${T.border}`, background: bView === v ? `${pc}10` : T.card, cursor: "pointer", fontSize: 10, fontWeight: 800, color: bView === v ? pc : T.muted }}>{v === "day" ? "Giorno" : v === "week" ? "Settimana" : v === "month" ? "Mese" : "Anno"}</button>)}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => nav(-1)} className="ch" style={{ width: 34, height: 34, borderRadius: 17, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>←</button>
              <div style={{ fontFamily: F2, fontSize: 16, fontWeight: 900 }}>{periodLabel}</div>
              <button onClick={() => nav(1)} className="ch" style={{ width: 34, height: 34, borderRadius: 17, background: T.card, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 14 }}>→</button>
            </div>

            {/* Summary */}
            <div style={{ display: "flex", gap: 6 }}>
              <Card style={{ flex: 1, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#6BC986" }}>ENTRATE</div>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2, color: "#6BC986" }}>+€{totIn.toLocaleString()}</div>
              </Card>
              <Card style={{ flex: 1, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: "#E25555" }}>USCITE</div>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2, color: "#E25555" }}>-€{totOut.toLocaleString()}</div>
              </Card>
              <Card style={{ flex: 1, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: pc }}>BILANCIO</div>
                <div style={{ fontSize: 20, fontWeight: 900, fontFamily: F2, color: totIn - totOut >= 0 ? "#6BC986" : "#E25555" }}>{totIn - totOut >= 0 ? "+" : ""}€{(totIn - totOut).toLocaleString()}</div>
              </Card>
            </div>

            {/* ── BUDGET MENSILE LIMIT ── */}
            {(() => {
              // Always calculate current month spending regardless of selected period
              const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
              const monthEndD = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              const monthEnd = monthEndD.toISOString().slice(0, 10);
              const monthTx = txWithDates.filter(tx => tx._d >= monthStart && tx._d <= monthEnd);
              const monthSpent = monthTx.filter(t => t.type === "out").reduce((s, t) => s + t.amount, 0);
              const pctUsed = monthlyBudget > 0 ? Math.min(100, (monthSpent / monthlyBudget) * 100) : 0;
              const remaining = Math.max(0, monthlyBudget - monthSpent);
              const daysLeft = monthEndD.getDate() - now.getDate() + 1;
              const dailyBudget = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;
              const isOver = monthSpent > monthlyBudget;
              const isWarning = pctUsed > 80 && !isOver;
              const barColor = isOver ? "#E25555" : isWarning ? "#F5A623" : "#6BC986";
              const MESI_FULL = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

              return <Card style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>📊 Budget {MESI_FULL[now.getMonth()]}</div>
                  <button onClick={() => setEditingBudget(!editingBudget)} className="ch" style={{ padding: "3px 10px", borderRadius: S.pill, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 10, fontWeight: 800, color: T.muted, cursor: "pointer" }}>✏️ {editingBudget ? "Chiudi" : "Modifica"}</button>
                </div>

                {editingBudget && <div style={{ display: "flex", gap: 4, marginBottom: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Limite:</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: pc }}>€</span>
                  <input type="number" value={monthlyBudget} onChange={e => setMonthlyBudget(Math.max(0, parseInt(e.target.value) || 0))} style={inp({ width: 100, flex: "none", fontSize: 16, fontWeight: 900, fontFamily: F2, textAlign: "center", padding: "6px 8px" })} />
                  <div style={{ display: "flex", gap: 3 }}>
                    {[2000, 3000, 4000, 5000, 6000].map(v => <button key={v} onClick={() => setMonthlyBudget(v)} className="ch" style={{ padding: "4px 8px", borderRadius: S.pill, border: monthlyBudget === v ? `2px solid ${pc}` : `1.5px solid ${T.border}`, background: monthlyBudget === v ? `${pc}08` : T.card, fontSize: 9, fontWeight: 800, color: monthlyBudget === v ? pc : T.muted, cursor: "pointer" }}>{v / 1000}k</button>)}
                  </div>
                </div>}

                {/* Progress bar */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ height: 12, background: `${T.border}30`, borderRadius: 6, overflow: "hidden", position: "relative" }}>
                    <div style={{ width: `${Math.min(100, pctUsed)}%`, height: "100%", background: `linear-gradient(90deg, ${barColor}, ${barColor}CC)`, borderRadius: 6, transition: "width .5s ease" }} />
                    {monthlyBudget > 0 && <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 8, fontWeight: 900, color: pctUsed > 60 ? "#fff" : T.muted }}>{Math.round(pctUsed)}%</div>}
                  </div>
                </div>

                {/* Numbers */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontSize: 22, fontWeight: 900, fontFamily: F2, color: barColor }}>€{monthSpent.toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}> / €{monthlyBudget.toLocaleString()}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {isOver ? <div style={{ fontSize: 12, fontWeight: 800, color: "#E25555" }}>⚠️ Sforato di €{(monthSpent - monthlyBudget).toLocaleString()}!</div>
                    : <div style={{ fontSize: 12, fontWeight: 700, color: "#6BC986" }}>Restano €{remaining.toLocaleString()}</div>}
                  </div>
                </div>

                {/* Daily allowance */}
                {!isOver && remaining > 0 && <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: S.btn, background: `${barColor}08`, border: `1px solid ${barColor}15`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.sub }}>💡 Puoi spendere</span>
                  <span style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, color: barColor }}>€{dailyBudget}/giorno</span>
                  <span style={{ fontSize: 10, color: T.muted }}>({daysLeft} gg rimasti)</span>
                </div>}

                {isOver && <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: S.btn, background: "#E2555508", border: "1px solid #E2555520", textAlign: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#E25555" }}>🚨 Budget superato! Riduci le spese per il resto del mese.</span>
                </div>}
              </Card>;
            })()}

            {/* Category breakdown */}
            {catSorted.length > 0 && <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📊 Dove hai speso</div>
              {/* Bar chart */}
              <div style={{ display: "flex", height: 14, borderRadius: S.btn, overflow: "hidden", marginBottom: 8 }}>
                {catSorted.map(([cat, amt], i) => {
                  const colors = ["#E25555","#F5A623","#5B8DEF","#6BC986","#8B5CF6","#E07BAF","#47C5D8","#F2845C"];
                  return <div key={cat} style={{ width: `${(amt / catTotal) * 100}%`, background: colors[i % colors.length], height: "100%", minWidth: 3 }} title={`${cat} €${amt}`} />;
                })}
              </div>
              {catSorted.map(([cat, amt], i) => {
                const colors = ["#E25555","#F5A623","#5B8DEF","#6BC986","#8B5CF6","#E07BAF","#47C5D8","#F2845C"];
                const label = TX_CATS.find(c => c[0] === cat)?.[1] || cat;
                return <div key={cat} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: colors[i % colors.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 16 }}>{cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>€{amt.toLocaleString()}</span>
                  <span style={{ fontSize: 10, color: T.muted }}>{Math.round((amt / catTotal) * 100)}%</span>
                </div>;
              })}
            </Card>}

            {/* Who spent */}
            {Object.keys(whoSpent).length > 0 && <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>👥 Chi ha speso</div>
              {FAM.map(f => {
                const amt = whoSpent[f.id] || 0;
                if (amt === 0) return null;
                return <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 14, background: f.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{f.emoji}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{f.name}</span>
                  <div style={{ flex: 2 }}><div style={{ height: 6, background: T.bg, borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${(amt / totOut) * 100}%`, height: "100%", background: f.color, borderRadius: 3 }} /></div></div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#E25555", fontFamily: F2 }}>€{amt.toLocaleString()}</span>
                </div>;
              })}
            </Card>}

            {/* Projection chart */}
            <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📈 Proiezione 12 Mesi</div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={proj} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={pc} stopOpacity={.2} /><stop offset="95%" stopColor={pc} stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="m" tick={{ fontSize: 8, fill: T.muted }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 8, fill: T.muted }} tickFormatter={v => `${Math.round(v / 1000)}k`} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => [`€${v.toLocaleString()}`, ""]} contentStyle={{ borderRadius: S.btn, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontFamily: F1, fontWeight: 700, fontSize: 11, background: T.card, color: T.text }} />
                  <ReferenceLine y={0} stroke="#E25555" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="v" stroke={pc} strokeWidth={2.5} fill="url(#cg)" dot={{ r: 2, fill: T.card, stroke: pc, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Budget categories */}
            {["partenza", "arrivo", "mensile"].map(sec => { const s = bgt[sec]; if (!s) return null; return <div key={sec}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 800 }}>{s.icon} {s.label}</span><div style={{ display: "flex", gap: 3 }}><span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>€{bSp(sec)}/€{bTot(sec)}</span><button onClick={() => setABgt(aBgt === sec ? null : sec)} style={{ width: 24, height: 24, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 14, cursor: "pointer" }}>+</button></div></div>
              {aBgt === sec && <div style={{ display: "flex", gap: 4, marginBottom: 4 }}><input value={nBN} onChange={e => setNBN(e.target.value)} placeholder="Nome" style={inp()} /><input type="number" value={nBA} onChange={e => setNBA(e.target.value)} placeholder="€" style={inp({ width: 65, flex: "none" })} /><button onClick={() => { if (nBN.trim()) { setBgt(p => ({ ...p, [sec]: { ...p[sec], items: [...p[sec].items, { id: uid(), n: nBN, p: parseFloat(nBA) || 0, s: 0 }] } })); setNBN(""); setNBA(""); setABgt(null); } }} style={{ padding: "0 10px", borderRadius: S.btn, background: pg, color: "#fff", border: "none", cursor: "pointer" }}>✓</button></div>}
              {s.items.map(item => { const pct = item.p ? (item.s / item.p) * 100 : 0; return <div key={item.id} className="gl" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: T.card, borderRadius: S.btn, marginBottom: 3 }}><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{item.n}</div><div style={{ height: 3, background: T.bg, borderRadius: 2, overflow: "hidden", marginTop: 2 }}><div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: item.s > item.p ? "#E25555" : pg, borderRadius: 2 }} /></div></div><span style={{ fontSize: 9, color: T.muted }}>€{item.p}</span><input type="number" placeholder="€" value={item.s || ""} onChange={e => setBgt(p => ({ ...p, [sec]: { ...p[sec], items: p[sec].items.map(i => i.id === item.id ? { ...i, s: parseFloat(e.target.value) || 0 } : i) } }))} style={inp({ width: 58, flex: "none", padding: "5px 6px", fontSize: 12, fontWeight: 700, textAlign: "right" })} /><button onClick={() => setBgt(p => ({ ...p, [sec]: { ...p[sec], items: p[sec].items.filter(i => i.id !== item.id) } }))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button></div>; })}
            </div>; })}

            {/* Transaction list */}
            {filtered.length > 0 && <Card>
              <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📋 Movimenti ({filtered.length})</div>
              {filtered.slice(0, 30).map(tx => {
                const txWho = FAM.find(f => f.id === tx.who);
                return <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.border}15` }}>
                  <div style={{ width: 26, height: 26, borderRadius: 13, background: txWho?.grad || T.cardHov, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{txWho?.emoji || "👤"}</div>
                  <span style={{ fontSize: 18 }}>{tx.cat}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.note || TX_CATS.find(c => c[0] === tx.cat)?.[1] || "—"}</div><div style={{ fontSize: 9, color: T.muted }}>{tx.date} · {txWho?.name || "?"}{tx.lat ? " · 📍" : ""}</div></div>
                  <span style={{ fontSize: 14, fontWeight: 900, fontFamily: F2, color: tx.type === "in" ? "#6BC986" : "#E25555" }}>{tx.type === "in" ? "+" : "-"}€{tx.amount}</span>
                  <button onClick={() => setTxns(p => p.filter(x => x.id !== tx.id))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button>
                </div>;
              })}
            </Card>}

            {filtered.length === 0 && <Card style={{ padding: 24, textAlign: "center" }}><div style={{ fontSize: 28, marginBottom: 4 }}>📭</div><div style={{ fontSize: 13, color: T.muted }}>Nessun movimento in questo periodo</div></Card>}
          </div>;
        })()}

        {/* ═══ EXTRA ═══ */}

        {/* ═══ IO (Personal Tab) ═══ */}
        {tab === "me" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Sub-tab buttons per user */}
          {(() => {
            const tabs = currentUser === "lidia" ? [["fasting","🍽️","Digiuno"],["cycle","🌸","Ciclo"]] : currentUser === "walter" ? [["walter","⚽","Sport"]] : currentUser === "lucrezia" ? [["lucrezia","🎨","Diario"]] : [];
            return tabs.length > 1 ? <div style={{ display: "flex", gap: 4 }}>{tabs.map(([id,ic,lb]) => <button key={id} onClick={() => setMeSub(id)} className="ch" style={{ flex: 1, padding: "10px 4px", borderRadius: S.btn, border: meSub === id ? `2.5px solid ${pc}` : `2px solid ${T.border}`, background: meSub === id ? `${pc}10` : T.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><span style={{ fontSize: 18 }}>{ic}</span><span style={{ fontSize: 12, fontWeight: 800, color: meSub === id ? pc : T.muted }}>{lb}</span></button>)}</div> : null;
          })()}

          {/* Personal greeting header */}
          {(() => { const me = FAM.find(f => f.id === currentUser); return <Card style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: me?.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 4px 15px ${me?.color}30` }}>{me?.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2 }}>Ciao {me?.name}!</div>
              <div style={{ fontSize: 11, color: T.muted }}>Il tuo spazio personale ✨</div>
            </div>
            {bioAvailable && <button onClick={async () => { await registerBio(currentUser); }} style={{ width: 36, height: 36, borderRadius: 18, background: bioUsers[currentUser] ? "#6BC98615" : `${T.border}30`, border: bioUsers[currentUser] ? "2px solid #6BC98640" : `2px solid ${T.border}`, fontSize: 18, cursor: "pointer" }}>{bioStatus === "scanning" ? "⏳" : bioUsers[currentUser] ? "🔐" : "👆"}</button>}
          </Card>; })()}

          {/* ═══ FABIO: Produttività ═══ */}
          {currentUser === "fabio" && (() => {
            const todayTasks = tasks.filter(t => !t.done).length;
            const doneTasks = tasks.filter(t => t.done).length;
            const totalPts = tasks.filter(t => t.done).reduce((s, t) => s + (t.pts || 0), 0);
            const todayTxOut = txns.filter(t => t.isoDate === isoDay() && t.type === "out").reduce((s, t) => s + t.amount, 0);
            const todayTxIn = txns.filter(t => t.isoDate === isoDay() && t.type === "in").reduce((s, t) => s + t.amount, 0);
            const streakGoals = goals.filter(g => g.streak > 0).length;
            return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Card style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, marginBottom: 4 }}>🧰 Dashboard Fabio</div>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>Costruttore di sistemi</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ flex: 1, padding: 12, background: "#5B8DEF08", borderRadius: S.btn }}>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: F2, color: "#5B8DEF" }}>{todayTasks}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: T.muted }}>TASK APERTI</div>
                  </div>
                  <div style={{ flex: 1, padding: 12, background: "#6BC98608", borderRadius: S.btn }}>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: F2, color: "#6BC986" }}>{doneTasks}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: T.muted }}>COMPLETATI</div>
                  </div>
                  <div style={{ flex: 1, padding: 12, background: "#F5A62308", borderRadius: S.btn }}>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: F2, color: "#F5A623" }}>{totalPts}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: T.muted }}>PUNTI</div>
                  </div>
                </div>
              </Card>
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>💰 Oggi</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, padding: 10, background: "#6BC98608", borderRadius: S.btn, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: "#6BC986" }}>+€{todayTxIn}</div>
                    <div style={{ fontSize: 9, color: T.muted }}>Entrate</div>
                  </div>
                  <div style={{ flex: 1, padding: 10, background: "#E2555508", borderRadius: S.btn, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: "#E25555" }}>-€{todayTxOut}</div>
                    <div style={{ fontSize: 9, color: T.muted }}>Uscite</div>
                  </div>
                </div>
              </Card>
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🎯 Obiettivi attivi</div>
                {goals.map(g => <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.border}10` }}>
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{g.text}</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: g.streak > 0 ? "#6BC986" : T.muted }}>{g.streak} 🔥</span>
                </div>)}
              </Card>
            </div>;
          })()}

          {/* ═══ LIDIA: DIGIUNO INTERMITTENTE (Fastic-style) ═══ */}
          {meSub === "fasting" && (() => {
            const protocols = [["16:8",16,8],["18:6",18,6],["20:4",20,4],["14:10",14,10],["OMAD",23,1]];
            const curP = protocols.find(p => p[0] === fasting.protocol) || protocols[0];
            const targetSec = curP[1] * 3600;
            const eatWindowH = curP[2];
            const pct = fasting.active ? Math.min(100, (fastNow / targetSec) * 100) : 0;
            const remaining = Math.max(0, targetSec - fastNow);
            const rH = Math.floor(remaining / 3600); const rM = Math.floor((remaining % 3600) / 60); const rS = remaining % 60;
            const eH = Math.floor(fastNow / 3600); const eM = Math.floor((fastNow % 3600) / 60);
            const done = fastNow >= targetSec;

            // ─── FASTIC BODY PHASES ───
            const PHASES = [
              { name: "Fed", icon: "🍽️", color: "#F5A623", startH: 0, desc: "Digestione in corso", detail: "Il corpo sta processando l'ultimo pasto. Insulina elevata.", tip: "Bevi acqua per aiutare la digestione" },
              { name: "Sugar Burn", icon: "🔥", color: "#E8613A", startH: 4, desc: "Bruci zuccheri", detail: "Il glicogeno epatico si sta esaurendo. Il corpo inizia a cercare altre fonti di energia.", tip: "Questo è il momento in cui potresti sentire un po' di fame — è normale!" },
              { name: "Fat Burn", icon: "💪", color: "#E07BAF", startH: 8, desc: "Bruci grassi!", detail: "Il corpo è passato alla lipolisi! Sta usando i depositi di grasso come carburante.", tip: "L'energia dal grasso è stabile — niente più picchi glicemici!" },
              { name: "Ketosis", icon: "⚡", color: "#8B5CF6", startH: 12, desc: "Chetosi leggera", detail: "Il fegato produce chetoni dal grasso. Il cervello li usa come super-carburante.", tip: "Lucidità mentale al massimo! Molti sentono un boost cognitivo." },
              { name: "Autophagy", icon: "✨", color: "#3DBFA0", startH: 16, desc: "Autofagia attiva!", detail: "Le cellule stanno riciclando le componenti danneggiate. Rinnovamento cellulare profondo.", tip: "Questo è l'oro del digiuno — rigenerazione a livello cellulare!" },
              { name: "Deep Autophagy", icon: "🧬", color: "#2B7FD4", startH: 20, desc: "Autofagia profonda", detail: "Massima rigenerazione cellulare. Processi anti-invecchiamento al picco.", tip: "Sei una guerriera! Pochissimi arrivano qui." },
            ];
            const curPhase = [...PHASES].reverse().find(p => eH >= p.startH) || PHASES[0];
            const nextPhase = PHASES.find(p => p.startH > eH);
            const timeToNext = nextPhase ? (nextPhase.startH * 3600 - fastNow) : 0;
            const ntH = Math.floor(timeToNext / 3600); const ntM = Math.floor((timeToNext % 3600) / 60);
            const phaseProgress = nextPhase ? ((eH * 3600 + eM * 60 - (curPhase.startH * 3600)) / ((nextPhase.startH - curPhase.startH) * 3600)) * 100 : 100;

            // Water tracker
            const waterGoal = 8;
            const todayWater = (fasting.water || []).filter(w => w === isoDay()).length;

            // Gradient ring
            const radius = 105; const stroke = 12; const circ = 2 * Math.PI * radius;
            const dashOffset = circ - (pct / 100) * circ;

            // Phase dots for the ring
            const phaseDots = PHASES.filter(p => (p.startH / (curP[1])) <= 1).map(p => {
              const angle = ((p.startH / curP[1]) * 360 - 90) * (Math.PI / 180);
              return { ...p, x: 120 + radius * Math.cos(angle), y: 120 + radius * Math.sin(angle), reached: eH >= p.startH };
            });

            const startFast = () => setFasting(p => ({ ...p, active: true, start: Date.now() }));
            const stopFast = () => {
              const dur = Math.floor((Date.now() - fasting.start) / 1000);
              const completed = dur >= targetSec;
              const newHist = [...fasting.history, { date: isoDay(), dur, protocol: fasting.protocol, completed, phases: eH >= 16 ? "autophagy" : eH >= 12 ? "ketosis" : eH >= 8 ? "fatburn" : "basic" }].slice(-90);
              const newStreak = completed ? fasting.streak + 1 : 0;
              setFasting(p => ({ ...p, active: false, start: null, history: newHist, streak: newStreak, bestStreak: Math.max(p.bestStreak, newStreak) }));
            };
            const addWater = () => setFasting(p => ({ ...p, water: [...(p.water || []), isoDay()] }));

            const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });
            const weekHist = fasting.history.filter(h => { const ago = (Date.now() - new Date(h.date).getTime()) / 86400000; return ago < 7; });
            const avgDuration = fasting.history.length > 0 ? Math.round(fasting.history.slice(-14).reduce((s, h) => s + h.dur, 0) / Math.min(14, fasting.history.length) / 3600 * 10) / 10 : 0;

            return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* ── MAIN TIMER ── */}
              <Card style={{ padding: "20px 16px", textAlign: "center", overflow: "visible" }}>
                {/* Protocol pills */}
                <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 16 }}>
                  {protocols.map(([p]) => <button key={p} onClick={() => !fasting.active && setFasting(f => ({ ...f, protocol: p }))} className="ch" style={{ padding: "5px 12px", borderRadius: 20, border: fasting.protocol === p ? `2.5px solid ${curPhase.color}` : `1.5px solid ${T.border}`, background: fasting.protocol === p ? `${curPhase.color}12` : "transparent", fontSize: 12, fontWeight: 800, color: fasting.protocol === p ? curPhase.color : T.muted, cursor: fasting.active ? "default" : "pointer", transition: "all .3s" }}>{p}</button>)}
                </div>

                {/* Timer Ring */}
                <div style={{ position: "relative", width: 240, height: 240, margin: "0 auto 16px" }}>
                  <svg width="240" height="240" viewBox="0 0 240 240">
                    {/* Background ring */}
                    <circle cx="120" cy="120" r={radius} fill="none" stroke={T.border} strokeWidth={stroke} opacity={0.3} />
                    {/* Progress gradient ring */}
                    <defs>
                      <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={curPhase.color} />
                        <stop offset="100%" stopColor={nextPhase?.color || curPhase.color} />
                      </linearGradient>
                    </defs>
                    <circle cx="120" cy="120" r={radius} fill="none" stroke="url(#fg)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashOffset} transform="rotate(-90 120 120)" style={{ transition: "stroke-dashoffset 1s ease" }} />
                    {/* Phase dots on ring */}
                    {phaseDots.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.reached ? 7 : 5} fill={p.reached ? p.color : T.card} stroke={p.color} strokeWidth={2} />)}
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    {fasting.active ? <>
                      <div style={{ fontSize: 42, marginBottom: 2 }}>{curPhase.icon}</div>
                      <div style={{ fontSize: 36, fontWeight: 900, fontFamily: F2, color: done ? "#6BC986" : curPhase.color, letterSpacing: -1 }}>{done ? "FATTO!" : `${rH}:${String(rM).padStart(2,"0")}:${String(rS).padStart(2,"0")}`}</div>
                      <div style={{ fontSize: 10, color: T.muted, fontWeight: 700 }}>{done ? "Obiettivo raggiunto! 🎉" : `${eH}h ${eM}m di digiuno`}</div>
                    </> : <>
                      <div style={{ fontSize: 50 }}>🌙</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginTop: 4 }}>Pronta per iniziare?</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{curP[1]}h digiuno · {eatWindowH}h finestra</div>
                    </>}
                  </div>
                </div>

                {/* Body Phase Card */}
                {fasting.active && <div className="fu" style={{ padding: "14px 16px", borderRadius: S.card, background: `${curPhase.color}08`, border: `1.5px solid ${curPhase.color}25`, marginBottom: 14, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 24 }}>{curPhase.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: curPhase.color }}>{curPhase.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{curPhase.desc}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.5, marginBottom: 8 }}>{curPhase.detail}</div>
                  <div style={{ fontSize: 11, color: curPhase.color, fontWeight: 700, fontStyle: "italic" }}>💡 {curPhase.tip}</div>
                  {/* Phase progress bar */}
                  {nextPhase && <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: curPhase.color }}>{curPhase.icon} {curPhase.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: nextPhase.color }}>{nextPhase.icon} {nextPhase.name} tra {ntH}h {ntM}m</span>
                    </div>
                    <div style={{ height: 6, background: `${T.border}40`, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, phaseProgress)}%`, height: "100%", background: `linear-gradient(90deg,${curPhase.color},${nextPhase.color})`, borderRadius: 3, transition: "width 1s" }} />
                    </div>
                  </div>}
                </div>}

                {/* Timeline of all phases */}
                {fasting.active && <div style={{ display: "flex", gap: 2, marginBottom: 14, padding: "0 8px" }}>
                  {PHASES.filter(p => p.startH < curP[1]).map((p, i) => {
                    const reached = eH >= p.startH;
                    const active2 = curPhase.name === p.name;
                    return <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ height: 4, borderRadius: 2, background: reached ? p.color : `${T.border}40`, marginBottom: 4, transition: "background .5s" }} />
                      <div style={{ fontSize: 14, opacity: reached ? 1 : 0.3 }}>{p.icon}</div>
                      <div style={{ fontSize: 7, fontWeight: 800, color: active2 ? p.color : reached ? T.sub : T.muted }}>{p.startH}h</div>
                    </div>;
                  })}
                </div>}

                {/* Start/Stop Button */}
                <button onClick={fasting.active ? stopFast : startFast} className="ch" style={{ padding: "16px 50px", borderRadius: 30, background: fasting.active ? (done ? "linear-gradient(135deg,#6BC986,#3DBFA0)" : "linear-gradient(135deg,#E25555,#FF7B7B)") : "linear-gradient(135deg,#E07BAF,#8B5CF6)", color: "#fff", border: "none", fontSize: 16, fontWeight: 900, cursor: "pointer", boxShadow: `0 6px 25px ${fasting.active ? (done ? "#6BC98640" : "#E2555540") : "#E07BAF40"}`, letterSpacing: 0.5, transition: "all .3s" }}>
                  {fasting.active ? (done ? "🎉 Completa!" : "⏹ Termina") : "▶ Inizia Digiuno"}
                </button>
              </Card>

              {/* ── WATER TRACKER ── */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700 }}>💧 Acqua oggi</div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: todayWater >= waterGoal ? "#5B8DEF" : T.muted }}>{todayWater}/{waterGoal} bicchieri</span>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {Array.from({ length: waterGoal }, (_, i) => <div key={i} style={{ flex: 1, height: 32, borderRadius: 6, background: i < todayWater ? "linear-gradient(180deg,#5B8DEF,#47C5D8)" : `${T.border}30`, transition: "background .3s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{i < todayWater ? "💧" : ""}</div>)}
                  <button onClick={addWater} className="ch" style={{ width: 40, height: 32, borderRadius: 8, background: todayWater >= waterGoal ? "#6BC98615" : "#5B8DEF15", border: `2px solid ${todayWater >= waterGoal ? "#6BC986" : "#5B8DEF"}`, cursor: "pointer", fontSize: 16 }}>{todayWater >= waterGoal ? "✓" : "+"}</button>
                </div>
              </Card>

              {/* ── STATS ROW ── */}
              <div style={{ display: "flex", gap: 6 }}>
                <Card style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: F2, color: "#E07BAF" }}>{fasting.streak}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: T.muted }}>🔥 STREAK</div>
                </Card>
                <Card style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: F2, color: "#8B5CF6" }}>{fasting.bestStreak}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: T.muted }}>🏆 RECORD</div>
                </Card>
                <Card style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: F2, color: "#3DBFA0" }}>{avgDuration}h</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: T.muted }}>📊 MEDIA</div>
                </Card>
              </div>

              {/* ── WEEK CALENDAR ── */}
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📅 Questa settimana</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {weekDays.map((d, i) => { const ds = d.toISOString().slice(0, 10); const h = weekHist.find(x => x.date === ds); const isToday = ds === isoDay(); return <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: isToday ? curPhase.color : T.muted }}>{["Lu","Ma","Me","Gi","Ve","Sa","Do"][(d.getDay()+6)%7]}</div>
                    <div style={{ width: 36, height: 36, borderRadius: 18, margin: "6px auto", background: h?.completed ? `${h.phases === "autophagy" ? "#3DBFA0" : h.phases === "ketosis" ? "#8B5CF6" : "#E07BAF"}` : h ? "#E2555530" : isToday ? `${curPhase.color}15` : T.cardHov, border: isToday ? `2.5px solid ${curPhase.color}` : "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: h?.completed ? 14 : 11, color: h?.completed ? "#fff" : T.muted, fontWeight: 900, transition: "all .3s" }}>
                      {h?.completed ? "✓" : h ? "✗" : d.getDate()}
                    </div>
                    {h && <div style={{ fontSize: 8, fontWeight: 700, color: T.muted }}>{Math.round(h.dur / 3600)}h</div>}
                  </div>; })}
                </div>
              </Card>

              {/* ── HISTORY ── */}
              {fasting.history.length > 0 && <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📊 Ultimi digiuni</div>
                {fasting.history.slice(-8).reverse().map((h, i) => { const ph = h.phases === "autophagy" ? { c: "#3DBFA0", i: "✨" } : h.phases === "ketosis" ? { c: "#8B5CF6", i: "⚡" } : h.phases === "fatburn" ? { c: "#E07BAF", i: "💪" } : { c: "#F5A623", i: "🔥" }; return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 7 ? `1px solid ${T.border}10` : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: `${ph.c}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{ph.i}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{h.protocol} · {Math.floor(h.dur / 3600)}h {Math.floor((h.dur % 3600) / 60)}m</div>
                    <div style={{ fontSize: 10, color: T.muted }}>{h.date}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: h.completed ? "#6BC986" : "#E25555" }}>{h.completed ? "Completato ✓" : "Interrotto"}</div>
                </div>; })}
              </Card>}
            </div>;
          })()}

          {/* ═══ LIDIA: CICLO MESTRUALE (Flo-style) ═══ */}
          {meSub === "cycle" && (() => {
            const cLen = cycle.cycleLength || 28;
            const pLen = cycle.periodLength || 5;
            const lastP = cycle.lastPeriod ? new Date(cycle.lastPeriod) : null;
            const daysSince = lastP ? Math.floor((Date.now() - lastP.getTime()) / 86400000) : null;
            const dayInCycle = daysSince != null ? ((daysSince % cLen) || cLen) : null;
            const ovDay = Math.round(cLen - 14);
            const fertStart = ovDay - 3;
            const fertEnd = ovDay + 1;

            const getPhase = (d) => {
              if (!d) return { name: "—", icon: "🌙", color: T.muted, bg: T.cardHov, desc: "" };
              if (d <= pLen) return { name: "Mestruazione", icon: "🌹", color: "#E25555", bg: "#E2555508", desc: "Fase di rinnovamento. Concediti riposo, comfort e calore." };
              if (d <= 12) return { name: "Follicolare", icon: "🌱", color: "#6BC986", bg: "#6BC98608", desc: "Energia in crescita! Ottimo momento per iniziare cose nuove." };
              if (d >= fertStart && d <= fertEnd) return { name: "Ovulazione", icon: "🌸", color: "#E07BAF", bg: "#E07BAF08", desc: "Picco di energia, creatività e socievolezza." };
              return { name: "Luteale", icon: "🍂", color: "#F5A623", bg: "#F5A62308", desc: "Tempo di introspezione. Sii gentile con te stessa." };
            };

            const phase2 = getPhase(dayInCycle);
            const nextPeriod = lastP ? new Date(lastP.getTime() + cLen * 86400000) : null;
            const daysToNext = nextPeriod ? Math.max(0, Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000)) : null;

            // SVG ring for cycle day
            const ringR = 100; const ringStroke = 10; const ringCirc = 2 * Math.PI * ringR;
            const dayPct = dayInCycle ? (dayInCycle / cLen) * 100 : 0;

            // Symptom categories
            const SYMPTOM_CATS = [
              { cat: "Fisico", items: ["🤕 Mal di testa","💆 Crampi","🦵 Mal di schiena","🤢 Nausea","😴 Stanchezza","🌡️ Calore","🤧 Congestione","💪 Energia alta"] },
              { cat: "Umore", items: ["😊 Serena","😤 Irritabile","😢 Sensibile","💗 Romantica","😰 Ansiosa","🧘 Zen","😄 Felice","😶 Apatica"] },
              { cat: "Altro", items: ["🍫 Voglia dolci","💤 Sonno ok","🏃 Sport fatto","💊 Farmaco preso","🤱 Seno dolente","💧 Ritenzione","✨ Pelle bella","🍕 Fame extra"] }
            ];

            // Flow intensity
            const FLOW = [["🩸","Leggero","#E2555560"],["🩸🩸","Medio","#E25555"],["🩸🩸🩸","Abbondante","#C03030"]];
            const todayLog = cycle.symptoms?.find(s => s.date === isoDay()) || { date: isoDay(), items: [], flow: null, notes: "" };

            const logSymptom = (sym) => {
              const existing = cycle.symptoms?.find(s => s.date === isoDay());
              if (existing) {
                const has = existing.items?.includes(sym);
                setCycle(p => ({ ...p, symptoms: p.symptoms.map(s => s.date === isoDay() ? { ...s, items: has ? s.items.filter(x => x !== sym) : [...(s.items || []), sym] } : s) }));
              } else {
                setCycle(p => ({ ...p, symptoms: [...(p.symptoms || []), { date: isoDay(), items: [sym], flow: null, notes: "" }] }));
              }
            };
            const logFlow = (f) => {
              const existing = cycle.symptoms?.find(s => s.date === isoDay());
              if (existing) {
                setCycle(p => ({ ...p, symptoms: p.symptoms.map(s => s.date === isoDay() ? { ...s, flow: s.flow === f ? null : f } : s) }));
              } else {
                setCycle(p => ({ ...p, symptoms: [...(p.symptoms || []), { date: isoDay(), items: [], flow: f, notes: "" }] }));
              }
            };

            // Prediction calendar (next 35 days)
            const predict = (d) => {
              if (!lastP) return null;
              const ds = Math.floor((d.getTime() - lastP.getTime()) / 86400000);
              const dc = ((ds % cLen) || cLen);
              return getPhase(dc);
            };

            // Insights
            const recentSymp = (cycle.symptoms || []).slice(-14);
            const topSymptoms = {};
            recentSymp.forEach(s => (s.items || []).forEach(i => { topSymptoms[i] = (topSymptoms[i] || 0) + 1; }));
            const topSorted = Object.entries(topSymptoms).sort((a, b) => b[1] - a[1]).slice(0, 5);

            return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* ── MAIN PHASE DISPLAY ── */}
              <Card style={{ padding: "20px 16px", textAlign: "center" }}>
                {!lastP ? <>
                  <div style={{ fontSize: 50, marginBottom: 10 }}>🌸</div>
                  <div style={{ fontFamily: F2, fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Benvenuta</div>
                  <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Quando è iniziato l'ultimo ciclo?</div>
                  <input type="date" value={cycle.lastPeriod || ""} onChange={e => setCycle(p => ({ ...p, lastPeriod: e.target.value }))} style={inp({ maxWidth: 220, margin: "0 auto", textAlign: "center", fontSize: 16 })} />
                </> : <>
                  {/* Cycle ring */}
                  <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 12px" }}>
                    <svg width="220" height="220" viewBox="0 0 220 220">
                      <circle cx="110" cy="110" r={ringR} fill="none" stroke={`${T.border}30`} strokeWidth={ringStroke} />
                      {/* Colored sections for phases */}
                      {(() => {
                        const sections = [
                          { start: 0, end: pLen / cLen, color: "#E25555" },
                          { start: pLen / cLen, end: (fertStart - 1) / cLen, color: "#6BC986" },
                          { start: (fertStart - 1) / cLen, end: (fertEnd + 1) / cLen, color: "#E07BAF" },
                          { start: (fertEnd + 1) / cLen, end: 1, color: "#F5A623" },
                        ];
                        return sections.map((s, i) => {
                          const startAngle = s.start * 360 - 90;
                          const endAngle = s.end * 360 - 90;
                          const dashLen = (s.end - s.start) * ringCirc;
                          const dashOff = ringCirc - s.start * ringCirc;
                          return <circle key={i} cx="110" cy="110" r={ringR} fill="none" stroke={s.color} strokeWidth={ringStroke} strokeDasharray={`${dashLen} ${ringCirc - dashLen}`} strokeDashoffset={dashOff} transform="rotate(-90 110 110)" opacity={0.3} />;
                        });
                      })()}
                      {/* Current position indicator */}
                      {(() => {
                        const angle = ((dayInCycle / cLen) * 360 - 90) * (Math.PI / 180);
                        const x = 110 + ringR * Math.cos(angle);
                        const y = 110 + ringR * Math.sin(angle);
                        return <>
                          <circle cx={x} cy={y} r={14} fill={phase2.color} />
                          <circle cx={x} cy={y} r={10} fill={T.card} />
                          <circle cx={x} cy={y} r={7} fill={phase2.color} />
                        </>;
                      })()}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 40 }}>{phase2.icon}</div>
                      <div style={{ fontSize: 32, fontWeight: 900, fontFamily: F2, color: phase2.color }}>Giorno {dayInCycle}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>{phase2.name}</div>
                    </div>
                  </div>
                  {/* Phase description */}
                  <div className="fu" style={{ padding: "12px 16px", borderRadius: S.card, background: phase2.bg, border: `1.5px solid ${phase2.color}20`, marginBottom: 10, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: phase2.color }}>{phase2.icon} {phase2.desc}</div>
                  </div>
                  {/* Next period countdown */}
                  {daysToNext != null && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ fontSize: 11, color: T.muted }}>Prossimo ciclo tra</div>
                    <div style={{ padding: "4px 14px", borderRadius: 20, background: "#E2555510", border: "1.5px solid #E2555520" }}>
                      <span style={{ fontSize: 18, fontWeight: 900, fontFamily: F2, color: "#E25555" }}>{daysToNext}</span>
                      <span style={{ fontSize: 10, color: "#E25555", fontWeight: 700 }}> giorni</span>
                    </div>
                  </div>}
                </>}
              </Card>

              {/* ── FLOW INTENSITY (only during period phase) ── */}
              {lastP && dayInCycle && dayInCycle <= pLen + 2 && <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🩸 Intensità flusso oggi</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {FLOW.map(([ic, label, color], i) => { const sel = todayLog.flow === i; return <button key={i} onClick={() => logFlow(i)} className="ch" style={{ flex: 1, padding: "12px 4px", borderRadius: S.btn, border: sel ? `2.5px solid ${color}` : `2px solid ${T.border}`, background: sel ? `${color}12` : T.card, cursor: "pointer", transition: "all .2s" }}>
                    <div style={{ fontSize: 20, marginBottom: 2 }}>{ic}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: sel ? color : T.muted }}>{label}</div>
                  </button>; })}
                </div>
              </Card>}

              {/* ── SYMPTOM LOG ── */}
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>💭 Come ti senti oggi?</div>
                {SYMPTOM_CATS.map(cat => <div key={cat.cat} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{cat.cat}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {cat.items.map(s => { const sel = todayLog.items?.includes(s); return <button key={s} onClick={() => logSymptom(s)} className="ch" style={{ padding: "5px 10px", borderRadius: 20, border: sel ? `2px solid ${phase2.color}` : `1.5px solid ${T.border}`, background: sel ? `${phase2.color}12` : "transparent", fontSize: 11, fontWeight: 700, color: sel ? phase2.color : T.sub, cursor: "pointer", transition: "all .2s" }}>{s}</button>; })}
                  </div>
                </div>)}
              </Card>

              {/* ── PREDICTION CALENDAR ── */}
              {lastP && <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📅 Previsione</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {Array.from({ length: 35 }, (_, i) => {
                    const d = new Date(); d.setDate(d.getDate() + i);
                    const ph = predict(d);
                    const isToday = i === 0;
                    const isFert = (() => { const ds = Math.floor((d.getTime() - lastP.getTime()) / 86400000); const dc = ((ds % cLen) || cLen); return dc >= fertStart && dc <= fertEnd; })();
                    return <div key={i} style={{ width: 34, height: 38, borderRadius: 10, background: `${ph?.color}15`, border: isToday ? `2.5px solid ${ph?.color}` : "1.5px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: ph?.color || T.muted }}>{d.getDate()}</div>
                      <div style={{ fontSize: 7, color: T.muted }}>{["Lu","Ma","Me","Gi","Ve","Sa","Do"][(d.getDay()+6)%7]}</div>
                      {isFert && <div style={{ position: "absolute", top: 1, right: 2, fontSize: 7 }}>💗</div>}
                    </div>;
                  })}
                </div>
                {/* Legend */}
                <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {[["🌹","Mestr.","#E25555"],["🌱","Follicol.","#6BC986"],["🌸","Ovulaz.","#E07BAF"],["🍂","Luteale","#F5A623"],["💗","Fertilità","#E07BAF"]].map(([i,l,c]) => <div key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: `${c}50` }} /><span style={{ fontSize: 9, color: T.muted, fontWeight: 700 }}>{l}</span></div>)}
                </div>
              </Card>}

              {/* ── INSIGHTS ── */}
              {topSorted.length > 0 && <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🔍 I tuoi pattern (ultime 2 sett.)</div>
                {topSorted.map(([sym, count]) => <div key={sym} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <span style={{ fontSize: 13 }}>{sym}</span>
                  <div style={{ flex: 1, height: 6, background: `${T.border}30`, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${(count / 14) * 100}%`, height: "100%", background: phase2.color, borderRadius: 3, minWidth: 8 }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: T.muted }}>{count}x</span>
                </div>)}
              </Card>}

              {/* ── SETTINGS ── */}
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>⚙️ Impostazioni</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>Durata ciclo</span>
                  <button onClick={() => setCycle(p => ({ ...p, cycleLength: Math.max(21, p.cycleLength - 1) }))} className="ch" style={{ width: 32, height: 32, borderRadius: 16, border: `2px solid ${T.border}`, background: T.card, fontSize: 16, cursor: "pointer" }}>−</button>
                  <span style={{ fontSize: 20, fontWeight: 900, fontFamily: F2, width: 44, textAlign: "center", color: phase2.color }}>{cLen}</span>
                  <button onClick={() => setCycle(p => ({ ...p, cycleLength: Math.min(40, p.cycleLength + 1) }))} className="ch" style={{ width: 32, height: 32, borderRadius: 16, border: `2px solid ${T.border}`, background: T.card, fontSize: 16, cursor: "pointer" }}>+</button>
                  <span style={{ fontSize: 10, color: T.muted }}>gg</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>Durata mestruazione</span>
                  <button onClick={() => setCycle(p => ({ ...p, periodLength: Math.max(2, p.periodLength - 1) }))} className="ch" style={{ width: 32, height: 32, borderRadius: 16, border: `2px solid ${T.border}`, background: T.card, fontSize: 16, cursor: "pointer" }}>−</button>
                  <span style={{ fontSize: 20, fontWeight: 900, fontFamily: F2, width: 44, textAlign: "center", color: phase2.color }}>{pLen}</span>
                  <button onClick={() => setCycle(p => ({ ...p, periodLength: Math.min(10, p.periodLength + 1) }))} className="ch" style={{ width: 32, height: 32, borderRadius: 16, border: `2px solid ${T.border}`, background: T.card, fontSize: 16, cursor: "pointer" }}>+</button>
                  <span style={{ fontSize: 10, color: T.muted }}>gg</span>
                </div>
                {lastP && <button onClick={() => setCycle(p => ({ ...p, lastPeriod: isoDay(), history: [...(p.history || []), { date: isoDay() }].slice(-24) }))} className="ch" style={{ width: "100%", padding: 14, borderRadius: 30, background: "linear-gradient(135deg,#E25555,#E07BAF)", color: "#fff", border: "none", fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 15px #E2555530" }}>🌹 Segna inizio nuovo ciclo</button>}
              </Card>
            </div>;
          })()}

          {/* ═══ WALTER: SPORT & MISSIONI ═══ */}
          {meSub === "walter" && (() => {
            const lvl = Math.floor(walterData.xp / 100) + 1;
            const xpInLvl = walterData.xp % 100;
            const MISSIONS = [
              { id: "m1", text: "20 flessioni 💪", xp: 15, icon: "🏋️" },
              { id: "m2", text: "Corsa 15 min 🏃", xp: 20, icon: "🏃" },
              { id: "m3", text: "50 palleggi ⚽", xp: 15, icon: "⚽" },
              { id: "m4", text: "10 min stretching 🧘", xp: 10, icon: "🧘" },
              { id: "m5", text: "Sfida: 1 min plank 🔥", xp: 25, icon: "🔥" },
              { id: "m6", text: "Bici 20 min 🚲", xp: 20, icon: "🚲" },
            ];
            const todayMissions = walterData.dailyDone.filter(d => d.date === isoDay());
            const completeMission = (m) => {
              if (todayMissions.some(d => d.mid === m.id)) return;
              setWalterData(p => ({ ...p, xp: p.xp + m.xp, dailyDone: [...p.dailyDone, { date: isoDay(), mid: m.id, xp: m.xp }].slice(-100) }));
            };
            const addRecord = () => {
              const n = prompt("Nuovo record? (es. Flessioni: 30)");
              if (n?.trim()) setWalterData(p => ({ ...p, records: [...p.records, { id: uid(), text: n, date: isoDay() }] }));
            };
            const addSport = () => {
              const n = prompt("Che sport hai fatto? (es. Calcio 1h)");
              if (n?.trim()) { setWalterData(p => ({ ...p, xp: p.xp + 10, sports: [...p.sports, { id: uid(), text: n, date: isoDay() }].slice(-50) })); }
            };
            const badges = [["🥉",10,"Principiante"],["🥈",25,"Atleta"],["🥇",50,"Campione"],["💎",100,"Leggenda"],["👑",200,"Re dello Sport"]];
            const totalDone = walterData.dailyDone.length;
            return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* XP & Level */}
              <Card style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, marginBottom: 2 }}>⚽ Walter Arena</div>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>Diventa il più forte! 💪</div>
                <div style={{ fontSize: 56, marginBottom: 4 }}>{lvl >= 10 ? "👑" : lvl >= 5 ? "⭐" : "⚡"}</div>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: F2, color: "#47C5D8" }}>Livello {lvl}</div>
                <div style={{ height: 10, background: T.bg, borderRadius: 5, overflow: "hidden", margin: "8px auto", maxWidth: 250 }}>
                  <div style={{ width: `${xpInLvl}%`, height: "100%", background: "linear-gradient(90deg,#47C5D8,#5B8DEF)", borderRadius: 5, transition: "width .5s" }} />
                </div>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>{walterData.xp} XP · {xpInLvl}/100 al prossimo livello</div>
              </Card>
              {/* Daily missions */}
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🎯 Missioni del Giorno</div>
                {MISSIONS.map(m => { const done2 = todayMissions.some(d => d.mid === m.id); return <div key={m.id} className="ch" onClick={() => completeMission(m)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: done2 ? "#6BC98610" : T.cardHov, borderRadius: S.btn, marginBottom: 4, cursor: done2 ? "default" : "pointer", opacity: done2 ? 0.7 : 1, borderLeft: `3px solid ${done2 ? "#6BC986" : "#47C5D8"}` }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, textDecoration: done2 ? "line-through" : "none" }}>{m.text}</span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: done2 ? "#6BC986" : "#47C5D8" }}>+{m.xp} XP</span>
                  {done2 && <span style={{ fontSize: 16 }}>✅</span>}
                </div>; })}
              </Card>
              {/* Quick actions */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addSport} className="ch" style={{ flex: 1, padding: 12, borderRadius: S.btn, background: "linear-gradient(135deg,#47C5D8,#2BA8BC)", color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>⚽ Registra Sport</button>
                <button onClick={addRecord} className="ch" style={{ flex: 1, padding: 12, borderRadius: S.btn, background: "linear-gradient(135deg,#F5A623,#E8941A)", color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>🏆 Nuovo Record</button>
              </div>
              {/* Badges */}
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🏅 Badge</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  {badges.map(([ic, req, name]) => { const got = totalDone >= req; return <div key={name} style={{ textAlign: "center", opacity: got ? 1 : 0.3 }}>
                    <div style={{ fontSize: 28 }}>{ic}</div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: got ? pc : T.muted }}>{name}</div>
                    <div style={{ fontSize: 8, color: T.muted }}>{req}</div>
                  </div>; })}
                </div>
              </Card>
              {/* Recent sports */}
              {walterData.sports.length > 0 && <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📋 Attività recenti</div>
                {walterData.sports.slice(-8).reverse().map(s => <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                  <span>⚽</span><span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{s.text}</span><span style={{ fontSize: 9, color: T.muted }}>{s.date}</span>
                </div>)}
              </Card>}
              {/* Records */}
              {walterData.records.length > 0 && <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>🏆 I Miei Record</div>
                {walterData.records.slice(-6).reverse().map(r => <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: `1px solid ${T.border}10` }}>
                  <span style={{ fontSize: 16 }}>🌟</span><span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{r.text}</span><span style={{ fontSize: 9, color: T.muted }}>{r.date}</span>
                  <button onClick={() => setWalterData(p => ({ ...p, records: p.records.filter(x => x.id !== r.id) }))} style={{ background: "none", border: "none", fontSize: 9, color: T.border, cursor: "pointer" }}>✕</button>
                </div>)}
              </Card>}
            </div>;
          })()}

          {/* ═══ LUCREZIA: DIARIO CREATIVO & STELLINE ═══ */}
          {meSub === "lucrezia" && (() => {
            const PROMPTS = ["🦋 Disegna la tua giornata", "🌈 Cosa ti ha fatto sorridere?", "🐱 Inventa un animale magico", "🏰 Racconta un'avventura", "🎵 Quale canzone ti descrive?", "🌺 3 cose belle di oggi", "✨ Un desiderio per domani", "🎭 Come ti senti? Disegnalo!", "🌍 Un posto dove vorresti andare", "🍰 La ricetta della felicità"];
            const todayPrompt = PROMPTS[doy() % PROMPTS.length];
            const STICKERS = ["⭐","🦋","🌸","🎀","💎","🦄","🌈","🍭","🐱","🎨","👑","💖","🌺","🧚","🎪","🎠","🍬","🌙","🐰","🎁"];
            const addEntry = () => {
              const text = prompt("Scrivi il tuo pensiero di oggi... 🌸");
              if (text?.trim()) {
                const isStreak = lucreziaData.lastEntry === (() => { const y = new Date(); y.setDate(y.getDate() - 1); return y.toISOString().slice(0, 10); })();
                const newSticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];
                setLucreziaData(p => ({
                  ...p,
                  stars: p.stars + 5,
                  streakDays: isStreak || p.lastEntry === isoDay() ? p.streakDays + (p.lastEntry === isoDay() ? 0 : 1) : 1,
                  lastEntry: isoDay(),
                  journal: [...p.journal, { id: uid(), text, date: isoDay(), prompt: todayPrompt, sticker: newSticker }].slice(-50),
                  stickers: [...new Set([...p.stickers, newSticker])]
                }));
              }
            };
            const starLevel = lucreziaData.stars >= 200 ? { name: "Principessa delle Stelle 👑", icon: "👑" } : lucreziaData.stars >= 100 ? { name: "Collezionista Magica ✨", icon: "✨" } : lucreziaData.stars >= 50 ? { name: "Artista Creativa 🎨", icon: "🎨" } : { name: "Piccola Stella 🌟", icon: "🌟" };
            return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Header */}
              <Card style={{ textAlign: "center", padding: 20, background: "linear-gradient(135deg,#FFF5F8,#FFF0F5)" }}>
                <div style={{ fontSize: 16, fontWeight: 900, fontFamily: F2, marginBottom: 2 }}>🎨 Il Mondo di Lucrezia</div>
                <div style={{ fontSize: 12, color: "#E07BAF", marginBottom: 14 }}>Il tuo angolo speciale ✨</div>
                <div style={{ fontSize: 56, marginBottom: 4 }}>{starLevel.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#E07BAF" }}>{starLevel.name}</div>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: F2, color: "#F5A623", marginTop: 6 }}>⭐ {lucreziaData.stars}</div>
                <div style={{ fontSize: 10, color: T.muted }}>stelline raccolte</div>
              </Card>
              {/* Today's prompt */}
              <Card style={{ borderLeft: "4px solid #E07BAF" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#E07BAF", marginBottom: 4 }}>💭 SPUNTO DI OGGI</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{todayPrompt}</div>
                <button onClick={addEntry} className="ch" style={{ width: "100%", padding: 12, borderRadius: S.btn, background: "linear-gradient(135deg,#F2845C,#E07BAF)", color: "#fff", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>✏️ Scrivi nel diario (+5 ⭐)</button>
              </Card>
              {/* Stats */}
              <Card>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ flex: 1, textAlign: "center", padding: 10, background: "#F2845C08", borderRadius: S.btn }}>
                    <div style={{ fontSize: 22, fontWeight: 900, fontFamily: F2, color: "#F2845C" }}>{lucreziaData.journal.length}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.muted }}>PAGINE 📝</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", padding: 10, background: "#E07BAF08", borderRadius: S.btn }}>
                    <div style={{ fontSize: 22, fontWeight: 900, fontFamily: F2, color: "#E07BAF" }}>{lucreziaData.streakDays}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.muted }}>STREAK 🔥</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", padding: 10, background: "#F5A62308", borderRadius: S.btn }}>
                    <div style={{ fontSize: 22, fontWeight: 900, fontFamily: F2, color: "#F5A623" }}>{lucreziaData.stickers.length}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.muted }}>STICKER 🦋</div>
                  </div>
                </div>
              </Card>
              {/* Sticker collection */}
              <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🦋 Collezione Sticker</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  {STICKERS.map(s => { const got = lucreziaData.stickers.includes(s); return <div key={s} style={{ width: 40, height: 40, borderRadius: 20, background: got ? `#E07BAF10` : T.cardHov, border: got ? "2px solid #E07BAF40" : `2px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: got ? 22 : 16, opacity: got ? 1 : 0.25 }}>{got ? s : "?"}</div>; })}
                </div>
                <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: T.muted }}>{lucreziaData.stickers.length}/{STICKERS.length} sbloccati · scrivi nel diario per scoprirne di nuovi!</div>
              </Card>
              {/* Journal entries */}
              {lucreziaData.journal.length > 0 && <Card>
                <div style={{ fontFamily: F2, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📖 Il Mio Diario</div>
                {lucreziaData.journal.slice(-8).reverse().map(e => <div key={e.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}10` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 18 }}>{e.sticker}</span>
                    <span style={{ fontSize: 9, color: "#E07BAF", fontWeight: 700 }}>{e.prompt}</span>
                    <span style={{ fontSize: 9, color: T.muted, marginLeft: "auto" }}>{e.date}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, paddingLeft: 26 }}>{e.text}</div>
                </div>)}
              </Card>}
            </div>;
          })()}


        </div>}


        {tab === "more" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(() => {
            const shared = [["places","📍"],["quiz","🇵🇱"],["recipes","🍲"],["kids","💛"],["stats","📊"],["diary","📔"],["tips","💡"]];
            return <div style={{ display: "flex", gap: 3 }}>{shared.map(([id,ic]) => <button key={id} onClick={() => setSub(id)} style={{ flex: 1, padding: "8px 2px", borderRadius: S.btn, fontSize: 16, border: sub === id ? `2.5px solid ${pc}` : `2px solid ${T.border}`, background: sub === id ? `${pc}12` : T.card, color: sub === id ? pc : T.muted, cursor: "pointer", boxShadow: sub === id ? `0 3px 8px ${pc}20` : "none" }}>{ic}</button>)}</div>;
          })()}

          {/* Luoghi (moved from tab) */}
          {sub === "places" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ fontFamily: F2, fontSize: 17, fontWeight: 900, margin: 0 }}>📍 Luoghi</h2><button onClick={() => setAPlace(!aPlace)} style={{ width: 30, height: 30, borderRadius: S.btn, background: pg, color: "#fff", border: "none", fontSize: 16, cursor: "pointer" }}>+</button></div>
            <Card style={{ padding: "9px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 6, background: T.bg, borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${places.length ? (vi / places.length) * 100 : 0}%`, height: "100%", background: "linear-gradient(90deg,#6BC986,#47C5D8)", borderRadius: 3, transition: "width .5s" }} /></div><span style={{ fontSize: 12, fontWeight: 900, color: "#6BC986" }}>{vi}/{places.length}</span><span style={{ fontSize: 10, color: T.muted }}>📸{totalPhotos}</span></div>
            </Card>
            <div style={{ display: "flex", gap: 3 }}>{["all","visited","todo"].map(f => <button key={f} onClick={() => setPFilt(f)} className="ch" style={{ flex: 1, padding: "6px 2px", borderRadius: S.btn, fontSize: 11, fontWeight: 700, border: `1.5px solid ${pFilt === f ? pc : T.border}`, background: pFilt === f ? `${pc}08` : T.card, color: pFilt === f ? pc : T.muted, cursor: "pointer" }}>{f === "all" ? "Tutti" : f === "visited" ? "Visti ✓" : "Da fare"}</button>)}</div>
            {places.filter(p => pFilt === "all" || (pFilt === "visited" ? p.visited : !p.visited)).map(place => { const exp = xPlace === place.id; return <Card key={place.id} style={{ overflow: "hidden" }}>
              <div onClick={() => setXPlace(exp ? null : place.id)} className="ch" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", cursor: "pointer" }}>
                <span style={{ fontSize: 22 }}>{place.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{place.name}</div><div style={{ fontSize: 10, color: T.muted }}>{place.area}</div></div>
                <button onClick={e => { e.stopPropagation(); setPlaces(p => p.map(x => x.id === place.id ? { ...x, visited: !x.visited } : x)); }} style={{ width: 26, height: 26, borderRadius: 13, border: `2px solid ${place.visited ? "#6BC986" : T.border}`, background: place.visited ? "#6BC986" : "transparent", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{place.visited ? "✓" : ""}</button>
              </div>
            </Card>; })}
          </div>}

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

      {/* ═══ FAB MASTRO-STYLE ═══ */}
      {/* FAB */}
      {fab && tab !== "chat" && <div onClick={() => { setFab(false); setFabMode(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", zIndex: 200 }} />}
      {[
        { m: "task", ico: "✅", l: "Task", c: "#6BC986" },
        { m: "impegno", ico: "📅", l: "Impegno", c: "#5B8DEF" },
        { m: "msg", ico: "💬", l: "Messaggio", c: "#9B59B6" },
        isParent && { m: "txin", ico: "💰", l: "Entrata", c: pc },
        isParent && { m: "txout", ico: "💳", l: "Uscita", c: "#E25555" },
      ].filter(Boolean).map((item, i) => (
        <div key={item.m} onClick={() => {
          setFab(false); setFabMode(null);
          if (item.m === "msg") { setTab("chat"); }
          else if (item.m === "txout") { setFabMode("tx"); setFabTxType("out"); setFab(true); }
          else if (item.m === "txin") { setFabMode("tx"); setFabTxType("in"); setFab(true); }
          else if (item.m === "task" || item.m === "impegno") { setShowNewEvt(true); setNewEvt(e => ({ ...e, type: item.m === "task" ? "task" : "evento", assignBy: currentUser || "fabio", assignTo: currentUser || "fabio", date: isoDay() })); }
        }} style={{
          position: "fixed", bottom: 140 + (i + 1) * 56, right: "max(18px, calc((100vw - 480px)/2 + 18px))", zIndex: 210,
          display: "flex", alignItems: "center", gap: 10, flexDirection: "row-reverse",
          opacity: fab && !fabMode && tab !== "chat" ? 1 : 0, transform: fab && !fabMode && tab !== "chat" ? "translateY(0) scale(1)" : "translateY(30px) scale(0.5)",
          transition: `all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) ${fab ? i * 0.07 : 0}s`,
          pointerEvents: fab && !fabMode && tab !== "chat" ? "auto" : "none",
        }}>
          <div className="ch" style={{ width: 50, height: 50, borderRadius: "50%", background: item.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 4px 16px ${item.c}50`, cursor: "pointer", color: "#fff" }}>{item.ico}</div>
          <div style={{ padding: "7px 14px", borderRadius: 10, background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", fontSize: 13, fontWeight: 700, color: item.c, whiteSpace: "nowrap" }}>{item.l}</div>
        </div>
      ))}

      {/* FAB Sub-modal (tx only) */}
      {fab && fabMode === "tx" && tab !== "chat" && <div style={{ position: "fixed", bottom: 140, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 24px)", maxWidth: 456, zIndex: 215 }}>
        <div className="fu" style={{ background: T.card, borderRadius: S.card, padding: 16, boxShadow: `0 8px 40px ${T.dark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <button onClick={() => { setFabMode(null); }} style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", color: T.muted }}>← Indietro</button>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setFabTxType("out")} className="ch" style={{ padding: "5px 12px", borderRadius: S.btn, border: fabTxType === "out" ? "2px solid #E25555" : `2px solid ${T.border}`, background: fabTxType === "out" ? "#E2555508" : T.card, cursor: "pointer", fontSize: 12, fontWeight: 800, color: fabTxType === "out" ? "#E25555" : T.muted }}>💳 Uscita</button>
              <button onClick={() => setFabTxType("in")} className="ch" style={{ padding: "5px 12px", borderRadius: S.btn, border: fabTxType === "in" ? `2px solid ${pc}` : `2px solid ${T.border}`, background: fabTxType === "in" ? `${pc}08` : T.card, cursor: "pointer", fontSize: 12, fontWeight: 800, color: fabTxType === "in" ? pc : T.muted }}>💰 Entrata</button>
            </div>
          </div>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, fontWeight: 900, color: fabTxType === "out" ? "#E25555" : pc }}>€</span>
            <input type="number" value={fabAmt} onChange={e => setFabAmt(e.target.value)} placeholder="0" autoFocus style={inp({ paddingLeft: 36, fontSize: 24, fontWeight: 900, fontFamily: F2, borderColor: fabTxType === "out" ? "#E2555540" : `${pc}40`, textAlign: "right", padding: "12px 14px 12px 36px" })} />
          </div>
          <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
            {(fabTxType === "out" ? [5, 10, 20, 50, 100] : [100, 500, 900, 1400]).map(v => (
              <button key={v} onClick={() => setFabAmt(String(v))} className="ch" style={{ flex: 1, padding: "5px 2px", borderRadius: S.btn, border: `1.5px solid ${T.border}`, background: fabAmt === String(v) ? `${pc}08` : T.card, cursor: "pointer", fontSize: 11, fontWeight: 700, color: fabAmt === String(v) ? pc : T.muted }}>{v}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
            {TX_CATS.slice(0, 8).map(([ic]) => (
              <button key={ic} onClick={() => setFabCat(ic)} className="ch" style={{ padding: "4px 7px", borderRadius: S.btn, border: fabCat === ic ? `2px solid ${pc}` : `1.5px solid ${T.border}`, background: fabCat === ic ? `${pc}08` : T.card, cursor: "pointer", fontSize: 12 }}>{ic}</button>
            ))}
          </div>
          <input value={fabNote} onChange={e => setFabNote(e.target.value)} placeholder="Nota..." style={inp({ marginBottom: 8, fontSize: 13 })} />
          <button onClick={() => {
            const amt = parseFloat(fabAmt); if (!amt || amt <= 0) return;
            const tx = { id: uid(), type: fabTxType, amount: amt, note: fabNote, cat: fabCat, date: nowD(), who: currentUser || "fabio", isoDate: isoDay(), _ts: Date.now(), lat: geoPos?.lat, lng: geoPos?.lng };
            setTxns(p => [tx, ...p]); sendTxToDb(tx); setFabAmt(""); setFabNote(""); setFab(false); setFabMode(null);
          }} style={{ width: "100%", padding: 12, borderRadius: S.btn, background: fabTxType === "out" ? "linear-gradient(135deg,#E25555,#FF7B7B)" : pg, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            {fabTxType === "out" ? "💳 Registra Uscita" : "💰 Registra Entrata"}
          </button>
        </div>
      </div>}

      {/* ═══ MODAL NUOVO EVENTO/TASK ═══ */}
      {showNewEvt && <div onClick={() => setShowNewEvt(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ width: "calc(100% - 32px)", maxWidth: 440, background: T.card, borderRadius: S.card, padding: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ fontFamily: F2, fontSize: 18, fontWeight: 900, marginBottom: 14 }}>{newEvt.type === "task" ? "✅ Nuovo Task" : newEvt.type === "evento" ? "📅 Nuovo Impegno" : "⚠️ Nuova Scadenza"}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {["task","evento","scadenza"].map(t => <button key={t} onClick={() => setNewEvt(e => ({ ...e, type: t }))} className="ch" style={{ flex: 1, padding: "7px 4px", borderRadius: S.btn, border: newEvt.type === t ? `2px solid ${t === "task" ? "#6BC986" : t === "evento" ? "#5B8DEF" : "#E25555"}` : `2px solid ${T.border}`, background: newEvt.type === t ? `${t === "task" ? "#6BC986" : t === "evento" ? "#5B8DEF" : "#E25555"}10` : T.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: newEvt.type === t ? (t === "task" ? "#6BC986" : t === "evento" ? "#5B8DEF" : "#E25555") : T.muted }}>{t === "task" ? "✅ Task" : t === "evento" ? "📅 Impegno" : "⚠️ Scadenza"}</button>)}
          </div>
          <input value={newEvt.title} onChange={e => setNewEvt(v => ({ ...v, title: e.target.value }))} placeholder="Cosa devi fare?" autoFocus style={inp({ marginBottom: 8, fontSize: 14, fontWeight: 700 })} />
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <input type="date" value={newEvt.date} onChange={e => setNewEvt(v => ({ ...v, date: e.target.value }))} style={inp({ flex: 1 })} />
            <input type="time" value={newEvt.time} onChange={e => setNewEvt(v => ({ ...v, time: e.target.value }))} style={inp({ width: 100 })} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 6 }}>Per chi?</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>{FAM.map(f => <button key={f.id} onClick={() => setNewEvt(e => ({ ...e, assignTo: f.id }))} className="ch" style={{ flex: 1, padding: "10px 2px", borderRadius: S.btn, border: newEvt.assignTo === f.id ? `3px solid ${f.color}` : `2px solid ${T.border}`, background: newEvt.assignTo === f.id ? `${f.color}15` : T.card, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .2s" }}><span style={{ fontSize: 28 }}>{f.emoji}</span><span style={{ fontSize: 10, fontWeight: 800, color: newEvt.assignTo === f.id ? f.color : T.muted }}>{f.name}</span>{newEvt.assignTo === f.id && <div style={{ width: 20, height: 3, borderRadius: 2, background: f.color }} />}</button>)}</div>
          <input value={newEvt.note} onChange={e => setNewEvt(v => ({ ...v, note: e.target.value }))} placeholder="Note opzionali..." style={inp({ marginBottom: 12, fontSize: 13 })} />
          <button onClick={() => {
            if (!newEvt.title.trim()) return;
            const evt = { id: uid(), ...newEvt, assignBy: currentUser || "fabio", done: false, createdAt: new Date().toISOString() };
            setCalEvents(p => [...p, evt]); setShowNewEvt(false);
            setNewEvt({ title: "", date: isoDay(), time: "09:00", assignTo: currentUser || "fabio", assignBy: "", color: "#F5A623", note: "", type: "task" });
          }} style={{ width: "100%", padding: 13, borderRadius: S.btn, background: newEvt.type === "task" ? "linear-gradient(135deg,#6BC986,#47C5D8)" : newEvt.type === "evento" ? "linear-gradient(135deg,#5B8DEF,#3B6FD4)" : "linear-gradient(135deg,#E25555,#FF7B7B)", color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            {newEvt.type === "task" ? "✅ Crea Task" : newEvt.type === "evento" ? "📅 Crea Impegno" : "⚠️ Crea Scadenza"} → {FAM.find(f => f.id === newEvt.assignTo)?.emoji}
          </button>
        </div>
      </div>}

      {/* FAB Main Button */}
      {tab !== "chat" && <div onClick={() => { setFab(!fab); if (fab) setFabMode(null); }} style={{
        position: "fixed", bottom: 130, right: "max(18px, calc((100vw - 480px)/2 + 18px))", zIndex: 220,
        width: 50, height: 50, borderRadius: "50%",
        background: fab ? T.sub : pg,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 20px ${fab ? "rgba(0,0,0,0.25)" : pc + "50"}`,
        cursor: "pointer", transition: "all 0.3s",
      }}>
        <span style={{ color: "#fff", fontSize: fab ? 18 : 24, fontWeight: 300, transform: fab ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.3s", display: "block" }}>+</span>
      </div>}

      {/* ═══ TAB BAR ═══ */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: T.dark ? "rgba(20,20,24,0.95)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, display: "flex", padding: "4px 6px", paddingBottom: "max(4px,env(safe-area-inset-bottom))", zIndex: 100 }}>
        {[["home","🏠","Oggi"],["chat","💬","Chat"],["cal","📅","Calendario"],!isKid && ["budget","💰","Budget"],["me",FAM.find(f=>f.id===currentUser)?.emoji || "👤","Io"],["more","⭐","Extra"]].filter(Boolean).map(([id,icon,l]) => { const a = tab === id; return <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 2px", border: "none", background: a ? `${pc}08` : "transparent", borderRadius: S.btn, cursor: "pointer" }}><span style={{ fontSize: 22, transform: a ? "scale(1.1)" : "scale(1)", transition: "transform .25s cubic-bezier(.34,1.56,.64,1)", filter: a ? "none" : "grayscale(0.3) opacity(0.7)" }}>{icon}</span><span style={{ fontSize: 9, fontWeight: a ? 800 : 600, color: a ? pc : T.muted, fontFamily: F1 }}>{l}</span>{a && <div style={{ width: 16, height: 3, borderRadius: 2, background: pg }} />}</button>; })}
      </div>
    </div>
  );
}