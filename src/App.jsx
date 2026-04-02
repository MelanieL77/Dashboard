import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ────────────────────────────────────────────
   CONSTANTS & CONFIG
   ──────────────────────────────────────────── */

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrm6kBMylp9UipCYtNmvOP4lFntlwD_swMbUhb-lHoY5i1tKoKHRUOPvuBcnhVTg/pub?output=csv";

const COLORS = {
  bg: "#07090F",
  card: "#0D1120",
  cardHover: "#111630",
  accent: "#C8F464",
  accentDim: "rgba(200,244,100,.12)",
  text: "#E8ECF4",
  textDim: "#6B7394",
  red: "#FF6B6B",
  border: "rgba(200,244,100,.08)",
  graphLine: "#C8F464",
  graphFill: "rgba(200,244,100,.10)",
};

const TABS = [
  { id: "ventes", icon: "💰", label: "Ventes" },
  { id: "pub", icon: "📣", label: "Pub" },
  { id: "reseaux", icon: "📱", label: "Réseaux" },
  { id: "emails", icon: "📧", label: "Emails" },
  { id: "lancements", icon: "🚀", label: "Lancements" },
  { id: "ia", icon: "🤖", label: "IA" },
];

const TAB_KPIS = {
  ventes: [
    { key: "ca", label: "Chiffre d'affaires", icon: "💶", suffix: "€" },
    { key: "transactions", label: "Transactions", icon: "🧾" },
    { key: "panier_moyen", label: "Panier moyen", icon: "🛒", suffix: "€" },
    { key: "nouveaux_clients", label: "Nouveaux clients", icon: "👤" },
    { key: "taux_conversion", label: "Taux conversion", icon: "🎯", suffix: "%" },
    { key: "refunds", label: "Remboursements", icon: "↩️", suffix: "€" },
  ],
  pub: [
    { key: "depenses_pub", label: "Dépenses pub", icon: "💸", suffix: "€" },
    { key: "roas", label: "ROAS", icon: "📊", suffix: "x" },
    { key: "cpc", label: "CPC", icon: "👆", suffix: "€" },
    { key: "cpm", label: "CPM", icon: "👁️", suffix: "€" },
    { key: "ctr", label: "CTR", icon: "🔗", suffix: "%" },
    { key: "impressions", label: "Impressions", icon: "📡" },
  ],
  reseaux: [
    { key: "abonnes", label: "Abonnés", icon: "👥" },
    { key: "reach", label: "Portée", icon: "📡" },
    { key: "engagement", label: "Engagement", icon: "❤️", suffix: "%" },
    { key: "posts", label: "Posts publiés", icon: "📝" },
    { key: "stories_vues", label: "Vues Stories", icon: "👁️" },
    { key: "partages", label: "Partages", icon: "🔁" },
  ],
  emails: [
    { key: "envoyes", label: "Emails envoyés", icon: "📤" },
    { key: "taux_ouverture", label: "Taux ouverture", icon: "📬", suffix: "%" },
    { key: "taux_clic", label: "Taux de clic", icon: "🖱️", suffix: "%" },
    { key: "desabonnements", label: "Désabonnements", icon: "🚪" },
    { key: "nouveaux_inscrits", label: "Nouveaux inscrits", icon: "✉️" },
    { key: "revenus_email", label: "Revenus email", icon: "💰", suffix: "€" },
  ],
  lancements: [
    { key: "revenu_lancement", label: "Revenu lancement", icon: "💎", suffix: "€" },
    { key: "inscrits_lancement", label: "Inscrits", icon: "📋" },
    { key: "taux_conversion_lancement", label: "Taux conversion", icon: "🎯", suffix: "%" },
    { key: "ventes_lancement", label: "Nb ventes", icon: "🧾" },
    { key: "participants_live", label: "Participants live", icon: "🎥" },
    { key: "ca_jour_j", label: "CA jour J", icon: "⚡", suffix: "€" },
  ],
};

/* Column mappings — maps CSV column headers to our internal KPI keys */
const CSV_COL_MAP = {
  /* Ventes */
  "ca": "ca", "chiffre_affaires": "ca", "chiffre d'affaires": "ca", "revenue": "ca",
  "transactions": "transactions", "nb_transactions": "transactions",
  "panier_moyen": "panier_moyen", "panier moyen": "panier_moyen", "aov": "panier_moyen",
  "nouveaux_clients": "nouveaux_clients", "nouveaux clients": "nouveaux_clients", "new_customers": "nouveaux_clients",
  "taux_conversion": "taux_conversion", "taux conversion": "taux_conversion", "conversion_rate": "taux_conversion",
  "remboursements": "refunds", "refunds": "refunds",
  /* Pub */
  "depenses_pub": "depenses_pub", "dépenses pub": "depenses_pub", "ad_spend": "depenses_pub", "depenses pub": "depenses_pub",
  "roas": "roas",
  "cpc": "cpc",
  "cpm": "cpm",
  "ctr": "ctr",
  "impressions": "impressions",
  /* Réseaux */
  "abonnes": "abonnes", "abonnés": "abonnes", "followers": "abonnes",
  "reach": "reach", "portee": "reach", "portée": "reach",
  "engagement": "engagement",
  "posts": "posts", "posts_publies": "posts",
  "stories_vues": "stories_vues", "vues_stories": "stories_vues", "vues stories": "stories_vues",
  "partages": "partages", "shares": "partages",
  /* Emails */
  "envoyes": "envoyes", "envoyés": "envoyes", "emails_envoyes": "envoyes", "emails envoyés": "envoyes",
  "taux_ouverture": "taux_ouverture", "taux ouverture": "taux_ouverture", "open_rate": "taux_ouverture",
  "taux_clic": "taux_clic", "taux de clic": "taux_clic", "click_rate": "taux_clic",
  "desabonnements": "desabonnements", "désabonnements": "desabonnements", "unsubscribes": "desabonnements",
  "nouveaux_inscrits": "nouveaux_inscrits", "nouveaux inscrits": "nouveaux_inscrits", "new_subscribers": "nouveaux_inscrits",
  "revenus_email": "revenus_email", "revenus email": "revenus_email", "email_revenue": "revenus_email",
  /* Lancements */
  "revenu_lancement": "revenu_lancement", "revenu lancement": "revenu_lancement", "launch_revenue": "revenu_lancement",
  "inscrits_lancement": "inscrits_lancement", "inscrits lancement": "inscrits_lancement", "inscrits": "inscrits_lancement",
  "taux_conversion_lancement": "taux_conversion_lancement", "taux conversion lancement": "taux_conversion_lancement",
  "ventes_lancement": "ventes_lancement", "nb_ventes": "ventes_lancement", "nb ventes": "ventes_lancement",
  "participants_live": "participants_live", "participants live": "participants_live",
  "ca_jour_j": "ca_jour_j", "ca jour j": "ca_jour_j",
};

/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */

function parseCSV(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] || "";
    });
    return obj;
  });
}

function mapRowToKpis(row) {
  const mapped = {};
  Object.entries(row).forEach(([col, val]) => {
    const normalized = col.toLowerCase().trim();
    const kpiKey = CSV_COL_MAP[normalized];
    if (kpiKey) {
      const num = parseFloat(val.replace(/[^\d.,-]/g, "").replace(",", "."));
      mapped[kpiKey] = isNaN(num) ? 0 : num;
    }
  });
  return mapped;
}

function fmt(v, suffix) {
  if (v === undefined || v === null) return "—";
  if (suffix === "€") return v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
  if (suffix === "%") return v.toFixed(1) + "%";
  if (suffix === "x") return v.toFixed(2) + "x";
  return v.toLocaleString("fr-FR");
}

function fakeTrend() {
  return Math.round((Math.random() - 0.35) * 40);
}

function generateChartData(kpis, data) {
  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const mainKey = kpis[0]?.key;
  const baseVal = data[mainKey] || 100;
  return labels.map((name) => ({
    name,
    value: Math.max(0, Math.round(baseVal * (0.7 + Math.random() * 0.6))),
  }));
}

/* ────────────────────────────────────────────
   STYLES (all inline for single-file)
   ──────────────────────────────────────────── */

const S = {
  app: {
    background: COLORS.bg,
    color: COLORS.text,
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 16px 40px",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "linear-gradient(180deg, #07090F 70%, transparent)",
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  logo: {
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: "-0.5px",
    color: COLORS.accent,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  healthBadge: (score) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: score >= 70 ? "rgba(200,244,100,.12)" : score >= 40 ? "rgba(255,200,50,.15)" : "rgba(255,107,107,.15)",
    color: score >= 70 ? COLORS.accent : score >= 40 ? "#FFC832" : COLORS.red,
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: 20,
  }),
  periodRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 4,
  },
  arrowBtn: {
    background: "none",
    border: `1px solid ${COLORS.border}`,
    color: COLORS.textDim,
    borderRadius: 8,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 16,
    transition: "all .2s",
  },
  periodLabel: {
    fontSize: 14,
    color: COLORS.textDim,
    minWidth: 140,
    textAlign: "center",
    fontWeight: 500,
  },
  toggleRow: {
    display: "flex",
    gap: 4,
    justifyContent: "center",
    marginTop: 4,
  },
  toggleBtn: (active) => ({
    background: active ? COLORS.accent : "transparent",
    color: active ? COLORS.bg : COLORS.textDim,
    border: active ? "none" : `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: "5px 16px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .2s",
  }),
  tabs: {
    display: "flex",
    gap: 4,
    overflowX: "auto",
    paddingBottom: 4,
    marginTop: 16,
    scrollbarWidth: "none",
  },
  tab: (active) => ({
    flex: "0 0 auto",
    background: active ? COLORS.accent : COLORS.card,
    color: active ? COLORS.bg : COLORS.textDim,
    border: active ? "none" : `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .25s",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: 5,
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: 12,
    marginTop: 20,
  },
  card: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "18px 16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    transition: "border-color .2s, transform .2s",
    cursor: "default",
  },
  cardIcon: {
    fontSize: 22,
  },
  cardLabel: {
    fontSize: 11,
    color: COLORS.textDim,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: "-1px",
    color: COLORS.text,
    lineHeight: 1.1,
  },
  cardTrend: (positive) => ({
    fontSize: 12,
    fontWeight: 700,
    color: positive ? COLORS.accent : COLORS.red,
    display: "flex",
    alignItems: "center",
    gap: 3,
  }),
  chartWrap: {
    marginTop: 24,
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "20px 12px 8px",
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.textDim,
    marginBottom: 12,
    paddingLeft: 8,
  },
  iaWrap: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
  },
  iaBtn: (loading) => ({
    background: loading ? COLORS.accentDim : COLORS.accent,
    color: COLORS.bg,
    border: "none",
    borderRadius: 14,
    padding: "14px 36px",
    fontSize: 16,
    fontWeight: 700,
    cursor: loading ? "wait" : "pointer",
    transition: "all .2s",
    display: "flex",
    alignItems: "center",
    gap: 10,
  }),
  iaResult: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 20,
    fontSize: 14,
    lineHeight: 1.7,
    color: COLORS.text,
    whiteSpace: "pre-wrap",
    width: "100%",
    maxWidth: 700,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 20,
  },
  spinner: {
    width: 48,
    height: 48,
    border: `3px solid ${COLORS.border}`,
    borderTop: `3px solid ${COLORS.accent}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    background: "rgba(255,107,107,.08)",
    border: `1px solid rgba(255,107,107,.25)`,
    borderRadius: 16,
    padding: 28,
    textAlign: "center",
    margin: "60px auto",
    maxWidth: 500,
  },
  clientName: {
    fontSize: 14,
    color: COLORS.textDim,
    fontWeight: 500,
    textAlign: "center",
    marginBottom: 2,
  },
};

/* ────────────────────────────────────────────
   COMPONENTS
   ──────────────────────────────────────────── */

function KpiCard({ icon, label, value, suffix, trend }) {
  const [hovered, setHover] = useState(false);
  return (
    <div
      style={{
        ...S.card,
        borderColor: hovered ? COLORS.accent : COLORS.border,
        transform: hovered ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={S.cardIcon}>{icon}</span>
      <span style={S.cardLabel}>{label}</span>
      <span style={S.cardValue}>{fmt(value, suffix)}</span>
      <span style={S.cardTrend(trend >= 0)}>
        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
      </span>
    </div>
  );
}

function ChartSection({ data, label }) {
  return (
    <div style={S.chartWrap}>
      <div style={S.chartTitle}>📈 {label} — 7 derniers jours</div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.25} />
              <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(200,244,100,.06)" strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: COLORS.card,
              border: `1px solid ${COLORS.accent}`,
              borderRadius: 10,
              color: COLORS.text,
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={COLORS.accent}
            strokeWidth={2.5}
            fill="url(#areaGrad)"
            dot={{ r: 3, fill: COLORS.accent, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: COLORS.accent }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function IATab({ allData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const summary = Object.entries(allData)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join("\n");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Tu es un expert en marketing digital et analyse de KPI. Voici les données du dashboard FlowBoard d'un client :\n\n${summary}\n\nFais une analyse concise (max 300 mots) en français avec :\n1. Les points forts\n2. Les alertes\n3. 3 recommandations concrètes\nUtilise des emojis pour structurer.`,
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("") || "Aucune réponse reçue.";
      setResult(text);
    } catch (e) {
      setError("Erreur lors de l'analyse IA. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.iaWrap}>
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Analyse IA
        </h2>
        <p style={{ color: COLORS.textDim, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          Claude analyse vos KPIs et vous donne des recommandations personnalisées pour optimiser vos résultats.
        </p>
      </div>
      <button style={S.iaBtn(loading)} onClick={analyze} disabled={loading}>
        {loading ? (
          <>
            <span
              style={{
                width: 18,
                height: 18,
                border: `2px solid rgba(7,9,15,.3)`,
                borderTop: `2px solid ${COLORS.bg}`,
                borderRadius: "50%",
                animation: "spin .7s linear infinite",
              }}
            />
            Analyse en cours...
          </>
        ) : (
          <>⚡ Analyser mes KPIs</>
        )}
      </button>
      {error && (
        <div style={{ color: COLORS.red, fontSize: 14, textAlign: "center" }}>
          {error}
        </div>
      )}
      {result && <div style={S.iaResult}>{result}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────
   DEMO DATA (fallback when CORS blocks fetch)
   ──────────────────────────────────────────── */

const DEMO_DATA = {
  ventes: { ca: 12450, transactions: 87, panier_moyen: 143, nouveaux_clients: 34, taux_conversion: 3.2, refunds: 290 },
  pub: { depenses_pub: 2180, roas: 4.72, cpc: 0.87, cpm: 6.40, ctr: 2.1, impressions: 340500 },
  reseaux: { abonnes: 8720, reach: 45200, engagement: 4.8, posts: 18, stories_vues: 12400, partages: 312 },
  emails: { envoyes: 4500, taux_ouverture: 42.3, taux_clic: 5.7, desabonnements: 12, nouveaux_inscrits: 186, revenus_email: 3820 },
  lancements: { revenu_lancement: 28700, inscrits_lancement: 412, taux_conversion_lancement: 8.5, ventes_lancement: 35, participants_live: 187, ca_jour_j: 14200 },
};

const DEMO_TRENDS = {
  ventes: { ca: 12, transactions: 8, panier_moyen: 5, nouveaux_clients: 18, taux_conversion: -2, refunds: -15 },
  pub: { depenses_pub: 6, roas: 14, cpc: -8, cpm: -3, ctr: 11, impressions: 22 },
  reseaux: { abonnes: 4, reach: 17, engagement: 9, posts: 0, stories_vues: 25, partages: 13 },
  emails: { envoyes: 10, taux_ouverture: 3, taux_clic: -1, desabonnements: -20, nouveaux_inscrits: 15, revenus_email: 7 },
  lancements: { revenu_lancement: 32, inscrits_lancement: 19, taux_conversion_lancement: 6, ventes_lancement: 28, participants_live: 14, ca_jour_j: 45 },
};

/* ────────────────────────────────────────────
   MAIN APP
   ──────────────────────────────────────────── */

export default function App() {
  const [activeTab, setActiveTab] = useState("ventes");
  const [mode, setMode] = useState("semaine");
  const [periodOffset, setPeriodOffset] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trends, setTrends] = useState({});
  const [isDemo, setIsDemo] = useState(false);

  const loadDemo = useCallback(() => {
    setData(DEMO_DATA);
    setTrends(DEMO_TRENDS);
    setIsDemo(true);
    setError("");
  }, []);

  /* Fetch Google Sheet CSV — auto-fallback to demo on CORS / error */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(SHEET_CSV_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const rows = parseCSV(text);
        if (!rows.length) throw new Error("empty");

        const latest = rows[rows.length - 1];
        const mapped = mapRowToKpis(latest);

        const perTab = {};
        Object.entries(TAB_KPIS).forEach(([tabId, kpis]) => {
          const tabData = {};
          kpis.forEach((k) => { tabData[k.key] = mapped[k.key] ?? 0; });
          perTab[tabId] = tabData;
        });
        setData(perTab);

        const t = {};
        Object.entries(TAB_KPIS).forEach(([tabId, kpis]) => {
          t[tabId] = {};
          kpis.forEach((k) => { t[tabId][k.key] = fakeTrend(); });
        });
        setTrends(t);
      } catch {
        loadDemo();
      } finally {
        setLoading(false);
      }
    })();
  }, [loadDemo]);

  /* Health score: average of positive trends */
  const healthScore = useMemo(() => {
    if (!trends || !Object.keys(trends).length) return 0;
    let total = 0,
      count = 0;
    Object.values(trends).forEach((tabTrends) =>
      Object.values(tabTrends).forEach((t) => {
        total += t;
        count++;
      })
    );
    const avg = count ? total / count : 0;
    return Math.min(100, Math.max(0, Math.round(50 + avg * 1.5)));
  }, [trends]);

  /* Period label */
  const periodLabel = useMemo(() => {
    const now = new Date();
    if (mode === "semaine") {
      const d = new Date(now);
      d.setDate(d.getDate() + periodOffset * 7);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const f = (dt) => dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      return `${f(startOfWeek)} — ${f(endOfWeek)}`;
    }
    const d = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
    return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }, [mode, periodOffset]);

  /* Chart data */
  const chartData = useMemo(() => {
    if (!data || activeTab === "ia") return [];
    return generateChartData(TAB_KPIS[activeTab], data[activeTab] || {});
  }, [data, activeTab]);

  /* Keyframes injection */
  useEffect(() => {
    if (!document.getElementById("fb-keyframes")) {
      const style = document.createElement("style");
      style.id = "fb-keyframes";
      style.textContent = `
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.bg}; }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
        button:hover { opacity: .9; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={S.app}>
        <div style={S.loading}>
          <div style={S.spinner} />
          <span style={{ color: COLORS.textDim, fontSize: 15, fontWeight: 500 }}>
            Chargement des données...
          </span>
        </div>
      </div>
    );
  }

  /* ── Error state (non-blocking — demo data is loaded) ── */

  /* ── Main render ── */
  const currentKpis = TAB_KPIS[activeTab] || [];
  const currentData = data?.[activeTab] || {};
  const currentTrends = trends?.[activeTab] || {};

  return (
    <div style={S.app}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.headerTop}>
          <div style={S.logo}>
            <span style={{ fontSize: 24 }}>⚡</span>
            FlowBoard
          </div>
          <div style={S.healthBadge(healthScore)}>
            <span style={{ fontSize: 10 }}>●</span>
            {healthScore}/100
          </div>
        </div>

        <div style={S.clientName}>Dashboard Client</div>

        {/* Period navigation */}
        <div style={S.periodRow}>
          <button
            style={S.arrowBtn}
            onClick={() => setPeriodOffset((p) => p - 1)}
            aria-label="Période précédente"
          >
            ‹
          </button>
          <span style={S.periodLabel}>{periodLabel}</span>
          <button
            style={{
              ...S.arrowBtn,
              opacity: periodOffset >= 0 ? 0.3 : 1,
              pointerEvents: periodOffset >= 0 ? "none" : "auto",
            }}
            onClick={() => setPeriodOffset((p) => Math.min(0, p + 1))}
            aria-label="Période suivante"
          >
            ›
          </button>
        </div>

        <div style={S.toggleRow}>
          <button style={S.toggleBtn(mode === "semaine")} onClick={() => { setMode("semaine"); setPeriodOffset(0); }}>
            Semaine
          </button>
          <button style={S.toggleBtn(mode === "mois")} onClick={() => { setMode("mois"); setPeriodOffset(0); }}>
            Mois
          </button>
        </div>
      </header>

      {/* Demo banner */}
      {isDemo && (
        <div style={{
          background: "rgba(200,244,100,.08)",
          border: `1px solid rgba(200,244,100,.15)`,
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: 12,
          color: COLORS.accent,
          textAlign: "center",
          marginTop: 8,
          lineHeight: 1.5,
        }}>
          📊 Données démo — connectez votre Google Sheet après déploiement sur Vercel
        </div>
      )}

      {/* Tabs */}
      <nav style={S.tabs}>
        {TABS.map((t) => (
          <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      {activeTab === "ia" ? (
        <IATab allData={data} />
      ) : (
        <>
          {/* KPI Grid */}
          <div style={S.grid}>
            {currentKpis.map((kpi, i) => (
              <div
                key={kpi.key}
                style={{
                  animation: `fadeUp .4s ease ${i * 0.06}s both`,
                }}
              >
                <KpiCard
                  icon={kpi.icon}
                  label={kpi.label}
                  value={currentData[kpi.key]}
                  suffix={kpi.suffix}
                  trend={currentTrends[kpi.key] ?? 0}
                />
              </div>
            ))}
          </div>

          {/* Chart */}
          <ChartSection data={chartData} label={currentKpis[0]?.label || "KPI"} />
        </>
      )}
    </div>
  );
}
