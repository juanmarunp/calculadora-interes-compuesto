import React, { useState, useMemo, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, Wallet, PiggyBank, ArrowRight, Mail } from "lucide-react";

const MAILERLITE_ACTION = "https://assets.mailerlite.com/jsonp/2583401/forms/196167239621150327/subscribe";

function LineaLedgerEmail() {
const [status, setStatus] = useState("idle"); // idle | submitting | success
const firstLoad = useRef(true);

const handleIframeLoad = () => {
// El primer "load" del iframe ocurre al montar el componente (about:blank), lo ignoramos.
if (firstLoad.current) {
firstLoad.current = false;
return;
}
setStatus("success");
};

return (
<div className="bg-white p-7 rounded-sm" style={{ border: "1px solid #D8D6CE" }}>
<div className="flex items-start gap-3 mb-4">
<Mail size={18} style={{ color: "#C9A227", marginTop: 3, flexShrink: 0 }} />
<div>
<p
className="text-xs uppercase tracking-widest mb-1"
style={{ color: "#6B6A5F", letterSpacing: "0.12em" }}
>
Última línea del libro
</p>
<h3
className="text-xl mb-1"
style={{ fontFamily: "'Fraunces', serif", color: "#1A1A17", fontWeight: 500 }}
>
Envíame mi plan de ahorro
</h3>
<p className="text-sm" style={{ color: "#5C5B50" }}>
Te mandamos un resumen con tus cifras y recordatorios para seguir tu meta. Sin spam.
</p>
</div>
</div>

{status === "success" ? (
<p className="text-sm font-medium" style={{ color: "#2D6E5E" }}>
Listo — revisa tu correo para confirmar la suscripción.
</p>
) : (
<form
action={MAILERLITE_ACTION}
method="post"
target="ml-hidden-frame"
onSubmit={() => setStatus("submitting")}
className="flex flex-col sm:flex-row gap-3"
>
<input
type="email"
name="fields[email]"
required
placeholder="tu@email.com"
className="flex-1 px-4 py-3 rounded-sm text-sm outline-none"
style={{
border: "1px solid #D8D6CE",
fontFamily: "'IBM Plex Mono', monospace",
color: "#1A1A17",
backgroundColor: "#FBFAF7",
}}
/>
<input type="hidden" name="ml-submit" value="1" />
<button
type="submit"
disabled={status === "submitting"}
className="px-5 py-3 rounded-sm text-sm font-semibold whitespace-nowrap"
style={{ backgroundColor: "#C9A227", color: "#1A1A17" }}
>
{status === "submitting" ? "Enviando..." : "Enviarme mi plan"}
</button>
</form>
)}

<iframe
name="ml-hidden-frame"
title="mailerlite-hidden-frame"
style={{ display: "none" }}
onLoad={handleIframeLoad}
/>
</div>
);
}

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const fmt = (n) =>
new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(Math.round(n));

// Rendimiento anualizado a 10 años, dato de mercado verificado (mediados de 2026).
// Rendimiento pasado no garantiza resultados futuros.
const ETFS = [
{ ticker: "QQQ", nombre: "Invesco QQQ Trust", categoria: "Tecnología (Nasdaq-100)", retorno10y: 19.0, riesgo: "Alto" },
{ ticker: "VOO", nombre: "Vanguard S&P 500 ETF", categoria: "Gran capitalización EE.UU.", retorno10y: 15.6, riesgo: "Medio-Alto" },
{ ticker: "VTI", nombre: "Vanguard Total Stock Market ETF", categoria: "Mercado total EE.UU.", retorno10y: 15.2, riesgo: "Medio-Alto" },
{ ticker: "VXUS", nombre: "Vanguard Total International Stock ETF", categoria: "Mercados internacionales", retorno10y: 9.4, riesgo: "Medio" },
{ ticker: "VWO", nombre: "Vanguard FTSE Emerging Markets ETF", categoria: "Mercados emergentes", retorno10y: 7.6, riesgo: "Medio-Alto" },
{ ticker: "AGG", nombre: "iShares Core U.S. Aggregate Bond ETF", categoria: "Bonos EE.UU.", retorno10y: 1.9, riesgo: "Bajo" },
];

const riesgoColor = {
"Bajo": "#2D6E5E",
"Medio": "#C9A227",
"Medio-Alto": "#B8862F",
"Alto": "#B54834",
};

function calcular(capitalInicial, aporteMensual, tasaAnual, anios) {
const rMes = tasaAnual / 100 / 12;
const meses = anios * 12;
const data = [];
let saldo = capitalInicial;
let aportado = capitalInicial;

data.push({ anio: 0, aportes: aportado, intereses: 0, total: saldo });

for (let m = 1; m <= meses; m++) {
saldo = saldo * (1 + rMes) + aporteMensual;
aportado += aporteMensual;
if (m % 12 === 0) {
const intereses = saldo - aportado;
data.push({
anio: m / 12,
aportes: Math.round(aportado),
intereses: Math.round(intereses),
total: Math.round(saldo),
});
}
}

const totalFinal = data[data.length - 1];
const crossoverPoint = data.find((d) => d.intereses > d.aportes && d.anio > 0);

return { data, totalFinal, crossoverPoint };
}

function CustomTooltip({ active, payload, label }) {
if (!active || !payload || !payload.length) return null;
const aportes = payload.find((p) => p.dataKey === "aportes")?.value ?? 0;
const intereses = payload.find((p) => p.dataKey === "intereses")?.value ?? 0;
return (
<div
className="bg-white border px-4 py-3 rounded-sm shadow-lg text-sm"
style={{ borderColor: "#D8D6CE", fontFamily: "'Inter', sans-serif" }}
>
<p className="font-semibold mb-1" style={{ color: "#1A1A17" }}>
Año {label}
</p>
<p style={{ color: "#1B4332", fontFamily: "'IBM Plex Mono', monospace" }}>
Aportado: ${fmt(aportes)}
</p>
<p style={{ color: "#2D6E5E", fontFamily: "'IBM Plex Mono', monospace" }}>
Interés: ${fmt(intereses)}
</p>
<p className="font-semibold mt-1" style={{ color: "#1A1A17", fontFamily: "'IBM Plex Mono', monospace" }}>
Total: ${fmt(aportes + intereses)}
</p>
</div>
);
}

export default function CalculadoraInteresCompuesto() {
const [capitalInicial, setCapitalInicial] = useState(1000);
const [aporteMensual, setAporteMensual] = useState(100);
const [tasaAnual, setTasaAnual] = useState(7);
const [anios, setAnios] = useState(20);
const [mostrarETFs, setMostrarETFs] = useState(false);

const { data, totalFinal, crossoverPoint } = useMemo(
() => calcular(Number(capitalInicial) || 0, Number(aporteMensual) || 0, Number(tasaAnual) || 0, Number(anios) || 1),
[capitalInicial, aporteMensual, tasaAnual, anios]
);

const LineaLedger = ({ numero, label, value, onChange, prefix, suffix, min, max }) => (
<div className="group">
<label
className="text-xs uppercase tracking-widest mb-1.5 block"
style={{ color: "#6B6A5F", fontFamily: "'Inter', sans-serif", letterSpacing: "0.12em" }}
>
<span style={{ color: "#C9A227" }}>{numero}</span> &nbsp;{label}
</label>
<div className="relative">
{prefix && (
<span
className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold pointer-events-none"
style={{ color: "#1B4332", fontFamily: "'IBM Plex Mono', monospace" }}
>
{prefix}
</span>
)}
<input
type="number"
min={min}
max={max}
value={value}
onChange={(e) => {
const raw = e.target.value;
onChange(raw === "" ? "" : Number(raw));
}}
onBlur={(e) => {
if (e.target.value === "") onChange(min);
}}
className="w-full py-2.5 rounded-sm text-lg font-semibold outline-none"
style={{
border: "1px solid #D8D6CE",
fontFamily: "'IBM Plex Mono', monospace",
color: "#1B4332",
backgroundColor: "#FBFAF7",
paddingLeft: prefix ? "1.75rem" : "0.75rem",
paddingRight: suffix ? "3.5rem" : "0.75rem",
}}
/>
{suffix && (
<span
className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
style={{ color: "#6B6A5F", fontFamily: "'Inter', sans-serif" }}
>
{suffix}
</span>
)}
</div>
<div className="w-full h-px mt-4" style={{ backgroundColor: "#D8D6CE" }} />
</div>
);

return (
<div style={{ backgroundColor: "#F3F4F1", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
<style>{FONT_IMPORT}</style>
<div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
{/* Header */}
<div className="mb-12">
<p
className="text-xs uppercase tracking-widest mb-3"
style={{ color: "#2D6E5E", letterSpacing: "0.2em", fontWeight: 600 }}
>
Libro de ahorro · Interés compuesto
</p>
<h1
className="text-4xl md:text-5xl leading-tight mb-4"
style={{ fontFamily: "'Fraunces', serif", color: "#1A1A17", fontWeight: 500 }}
>
Mira cómo tu dinero<br />trabaja mientras duermes.
</h1>
<p className="text-base max-w-xl" style={{ color: "#5C5B50" }}>
Ajusta las cifras de tu libro y observa el punto exacto en el que los
intereses generados empiezan a valer más que lo que tú mismo aportas.
</p>
</div>

<div className="grid md:grid-cols-5 gap-10">
{/* Ledger inputs */}
<div
className="md:col-span-2 bg-white p-7 rounded-sm"
style={{ border: "1px solid #D8D6CE" }}
>
<p
className="text-xs uppercase tracking-widest mb-6 pb-3"
style={{ color: "#1A1A17", borderBottom: "1px solid #1A1A17", letterSpacing: "0.15em", fontWeight: 600 }}
>
Entradas del libro
</p>
<div className="space-y-6">
<LineaLedger
numero="01"
label="Capital inicial"
value={capitalInicial}
onChange={setCapitalInicial}
prefix="$"
min={0}
/>
<LineaLedger
numero="02"
label="Aporte mensual"
value={aporteMensual}
onChange={setAporteMensual}
prefix="$"
min={0}
/>
<LineaLedger
numero="03"
label="Tasa anual estimada"
value={tasaAnual}
onChange={setTasaAnual}
suffix="%"
min={0}
max={100}
/>
<LineaLedger
numero="04"
label="Horizonte (años)"
value={anios}
onChange={setAnios}
suffix="años"
min={1}
max={80}
/>
</div>
</div>

{/* Results + chart */}
<div className="md:col-span-3 space-y-6">
{/* Big total */}
<div
className="bg-white p-7 rounded-sm"
style={{ border: "1px solid #D8D6CE" }}
>
<p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#6B6A5F", letterSpacing: "0.12em" }}>
Total acumulado al año {anios}
</p>
<p
className="text-5xl md:text-6xl mb-6"
style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1B4332", fontWeight: 600 }}
>
${fmt(totalFinal.total)}
</p>
<div className="grid grid-cols-2 gap-4">
<div className="flex items-start gap-2.5">
<Wallet size={16} style={{ color: "#1B4332", marginTop: 3 }} />
<div>
<p className="text-xs" style={{ color: "#6B6A5F" }}>Total aportado</p>
<p style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1A1A17", fontWeight: 600 }}>
${fmt(totalFinal.aportes)}
</p>
</div>
</div>
<div className="flex items-start gap-2.5">
<TrendingUp size={16} style={{ color: "#2D6E5E", marginTop: 3 }} />
<div>
<p className="text-xs" style={{ color: "#6B6A5F" }}>Generado por interés</p>
<p style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#2D6E5E", fontWeight: 600 }}>
${fmt(totalFinal.intereses)}
</p>
</div>
</div>
</div>
</div>

{/* Chart */}
<div className="bg-white p-7 rounded-sm" style={{ border: "1px solid #D8D6CE" }}>
<div className="flex items-center justify-between mb-1">
<p className="text-xs uppercase tracking-widest" style={{ color: "#6B6A5F", letterSpacing: "0.12em" }}>
Crecimiento acumulado
</p>
<div className="flex gap-4 text-xs">
<span className="flex items-center gap-1.5">
<span className="w-2.5 h-2.5 inline-block rounded-full" style={{ backgroundColor: "#1B4332" }} />
Aportes
</span>
<span className="flex items-center gap-1.5">
<span className="w-2.5 h-2.5 inline-block rounded-full" style={{ backgroundColor: "#C9A227" }} />
Intereses
</span>
</div>
</div>

{crossoverPoint && (
<p className="text-sm mb-4" style={{ color: "#2D6E5E" }}>
A partir del <strong>año {crossoverPoint.anio}</strong>, el interés que genera tu dinero
vale más que lo que tú mismo aportas ese año.
</p>
)}

<ResponsiveContainer width="100%" height={280}>
<AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
<defs>
<linearGradient id="gAportes" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#1B4332" stopOpacity={0.85} />
<stop offset="100%" stopColor="#1B4332" stopOpacity={0.55} />
</linearGradient>
<linearGradient id="gIntereses" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#C9A227" stopOpacity={0.85} />
<stop offset="100%" stopColor="#C9A227" stopOpacity={0.55} />
</linearGradient>
</defs>
<CartesianGrid strokeDasharray="2 4" stroke="#D8D6CE" vertical={false} />
<XAxis
dataKey="anio"
tick={{ fontSize: 11, fill: "#6B6A5F", fontFamily: "IBM Plex Mono" }}
tickLine={false}
axisLine={{ stroke: "#D8D6CE" }}
tickFormatter={(v) => `A${v}`}
/>
<YAxis
tick={{ fontSize: 11, fill: "#6B6A5F", fontFamily: "IBM Plex Mono" }}
tickLine={false}
axisLine={false}
tickFormatter={(v) => `$${fmt(v)}`}
width={70}
/>
<Tooltip content={<CustomTooltip />} />
{crossoverPoint && (
<ReferenceLine
x={crossoverPoint.anio}
stroke="#2D6E5E"
strokeDasharray="4 3"
strokeWidth={1.5}
/>
)}
<Area type="monotone" dataKey="aportes" stackId="1" stroke="#1B4332" fill="url(#gAportes)" strokeWidth={1.5} />
<Area type="monotone" dataKey="intereses" stackId="1" stroke="#C9A227" fill="url(#gIntereses)" strokeWidth={1.5} />
</AreaChart>
</ResponsiveContainer>
</div>

{/* Captura de email */}
<LineaLedgerEmail />

{/* CTA afiliado */}
<div className="rounded-sm overflow-hidden" style={{ backgroundColor: "#1B4332" }}>
<div className="p-6 flex items-center justify-between gap-4 flex-wrap">
<div>
<p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#C9A227", letterSpacing: "0.12em" }}>
Siguiente línea del libro
</p>
<p className="text-white text-base font-medium">
Ese dinero necesita una cuenta donde crecer de verdad.
</p>
</div>
<button
onClick={() => setMostrarETFs((v) => !v)}
className="flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-semibold whitespace-nowrap"
style={{ backgroundColor: "#C9A227", color: "#1A1A17" }}
>
Ver dónde invertir
<ArrowRight size={16} style={{ transform: mostrarETFs ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
</button>
</div>

{mostrarETFs && (
<div className="px-6 pb-6">
<div className="h-px mb-5" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
<p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#C9A227", letterSpacing: "0.12em" }}>
ETFs populares · rendimiento anualizado a 10 años
</p>
<div className="space-y-3">
{ETFS.map((etf) => (
<div key={etf.ticker} className="flex items-center gap-4">
<div className="w-16 flex-shrink-0">
<span
className="text-sm font-semibold"
style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#ffffff" }}
>
{etf.ticker}
</span>
</div>
<div className="flex-1 min-w-0">
<p className="text-sm text-white truncate">{etf.nombre}</p>
<p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
{etf.categoria} ·{" "}
<span style={{ color: riesgoColor[etf.riesgo] }}>Riesgo {etf.riesgo}</span>
</p>
</div>
<div className="text-right flex-shrink-0 w-20">
<span
className="text-lg font-semibold"
style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#C9A227" }}
>
+{etf.retorno10y}%
</span>
<p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>anual/10a</p>
</div>
</div>
))}
</div>
<p className="text-xs mt-5" style={{ color: "rgba(255,255,255,0.45)" }}>
Datos históricos a mediados de 2026 (Vanguard, iShares). El rendimiento pasado no
garantiza resultados futuros.
</p>
<a
href="https://app.hapi.trade/rewards?code=JUAMAR690"
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-2 mt-4 px-5 py-3 rounded-sm text-sm font-semibold whitespace-nowrap"
style={{ backgroundColor: "#C9A227", color: "#1A1A17" }}
>
Empezar a invertir en HAPI <ArrowRight size={16} />
</a>
</div>
)}
</div>
</div>
</div>

<p className="text-xs mt-10 text-center" style={{ color: "#8A8879" }}>
Cálculo estimado con capitalización mensual. No constituye asesoría financiera.
</p>
</div>
</div>
);
}
