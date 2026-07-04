import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export const maxDuration = 120;

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  baseURL: "https://api.groq.com/openai/v1",
});

/* ═══ MOCK DATA ═══ */
const balances = {
  Operating_Account_Main: 2_450_000,
  Operating_Account_Secondary: 820_000,
  Payroll_Account: 430_000,
  Tax_Reserve: 310_000,
  Vendor_Payments: 190_000,
};
const TOTAL = Object.values(balances).reduce((a, b) => a + b, 0);
const SURPLUS = Math.max(0, TOTAL - 500_000);

/* ═══ TOOL IMPLEMENTATIONS ═══ */

function get_balances() { return balances; }

function calculate_surplus() {
  return {
    total_across_accounts: TOTAL,
    policy_runway_floor: 500_000,
    investable_surplus: SURPLUS,
    surplus_pct: ((SURPLUS / TOTAL) * 100).toFixed(1) + "%",
  };
}

function execute_sweep(amount: number, destination: string) {
  return {
    status: "success",
    swept_amount: amount,
    destination,
    expected_annual_yield: amount * 0.042,
    settlement: "T+1 via DTC/NSCC",
    transaction_id: `TXN-${new Date().toISOString().slice(0,10)}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
  };
}

function run_var_analysis(confidence_level: number) {
  const dailyVol = 0.002;
  const zScores: Record<string, number> = { "0.95": 1.645, "0.99": 2.326 };
  const z = zScores[String(confidence_level)] || 1.645;
  const dailyVaR = SURPLUS * dailyVol * z;
  return {
    confidence_level,
    portfolio_value: SURPLUS,
    daily_var: Math.round(dailyVaR),
    weekly_var: Math.round(dailyVaR * Math.sqrt(5)),
    monthly_var: Math.round(dailyVaR * Math.sqrt(21)),
    max_drawdown_estimate: Math.round(SURPLUS * 0.018),
    sharpe_ratio: 1.82,
    sortino_ratio: 2.14,
    beta: 0.12,
    risk_rating: "LOW",
    methodology: "Parametric VaR (variance-covariance)",
  };
}

function run_stress_test(scenario: string) {
  const scenarios: Record<string, any> = {
    rate_shock: {
      name: "Interest Rate Shock (+200bps)",
      portfolio_impact: -Math.round(SURPLUS * 0.02),
      impact_pct: "-2.0%",
      recovery_days: 45,
      status: "MANAGEABLE",
    },
    credit_event: {
      name: "Credit Event (AAA → BBB Downgrade)",
      portfolio_impact: -Math.round(SURPLUS * 0.01),
      impact_pct: "-1.0%",
      recovery_days: 30,
      status: "LOW_RISK",
    },
    liquidity_crisis: {
      name: "Liquidity Crisis (50% Redemption Wave)",
      portfolio_impact: -Math.round(SURPLUS * 0.05),
      impact_pct: "-5.0%",
      recovery_days: 90,
      status: "REQUIRES_MONITORING",
    },
    geopolitical: {
      name: "Geopolitical Shock (Sanctions / Trade War)",
      portfolio_impact: -Math.round(SURPLUS * 0.03),
      impact_pct: "-3.0%",
      recovery_days: 60,
      status: "MANAGEABLE",
    },
  };
  if (scenario === "all") {
    return { scenarios: Object.values(scenarios), overall_resilience: "STRONG", confidence: "HIGH" };
  }
  return scenarios[scenario] || { error: "Unknown scenario" };
}

function check_compliance(framework: string) {
  return {
    framework,
    timestamp: new Date().toISOString(),
    checks: [
      { rule: "Liquidity Coverage Ratio (LCR)", value: "142%", threshold: "≥100%", status: "PASS", regulation: "Basel III" },
      { rule: "Net Stable Funding Ratio (NSFR)", value: "118%", threshold: "≥100%", status: "PASS", regulation: "Basel III" },
      { rule: "Single-Name Concentration", value: "23%", threshold: "≤25%", status: "PASS", regulation: "Internal" },
      { rule: "Counterparty Exposure Limit", value: "$1.2M", threshold: "≤$5M", status: "PASS", regulation: "Dodd-Frank" },
      { rule: "Portfolio Duration", value: "2.3yr", threshold: "≤5yr", status: "PASS", regulation: "Internal" },
      { rule: "Minimum Credit Quality", value: "AA-", threshold: "≥BBB+", status: "PASS", regulation: "SEC 2a-7" },
      { rule: "Leverage Ratio", value: "8.2%", threshold: "≥3%", status: "PASS", regulation: "Basel III" },
    ],
    overall_status: "FULLY_COMPLIANT",
    last_audit: "2025-06-15",
    next_scheduled_review: "2025-07-15",
  };
}

function get_market_rates(category: string) {
  return {
    treasury_yields: {
      "US 3M T-Bill": "5.38%", "US 6M T-Bill": "5.29%", "US 1Y": "5.01%",
      "US 2Y": "4.71%", "US 5Y": "4.35%", "US 10Y": "4.28%", "US 30Y": "4.52%",
    },
    fx_rates: { "EUR/USD": 1.0842, "GBP/USD": 1.2715, "USD/JPY": 157.83, "USD/CHF": 0.8923, "AUD/USD": 0.6534 },
    credit_spreads: { "AAA": "+12bps", "AA": "+28bps", "A": "+45bps", "BBB": "+92bps", "HY": "+340bps" },
    risk_indicators: { VIX: 13.42, MOVE: 98.7, SOFR: "5.33%", "Fed Funds": "5.50%", "TED Spread": "18bps" },
    timestamp: new Date().toISOString(),
  };
}

function forecast_cashflow(horizon_days: number) {
  const periods = Math.ceil(horizon_days / 30);
  const forecast = [];
  let balance = TOTAL;
  for (let i = 0; i < periods; i++) {
    const inflows = 1_200_000 + Math.round(Math.random() * 200_000);
    const outflows = 680_000 + Math.round(Math.random() * 100_000);
    const yieldIncome = Math.round(SURPLUS * (0.042 / 12));
    balance += inflows - outflows + yieldIncome;
    forecast.push({
      period: `Month ${i + 1}`,
      inflows, outflows, yield_income: yieldIncome,
      net_cashflow: inflows - outflows + yieldIncome,
      ending_balance: balance,
    });
  }
  return {
    horizon_days, periods, forecast,
    summary: {
      total_inflows: forecast.reduce((s, p) => s + p.inflows, 0),
      total_outflows: forecast.reduce((s, p) => s + p.outflows, 0),
      total_yield: forecast.reduce((s, p) => s + p.yield_income, 0),
      projected_ending_balance: balance,
    },
  };
}

/* ═══ TOOL DEFINITIONS ═══ */
const tools: any = [
  {
    type: "function", function: {
      name: "get_balances",
      description: "Get the current balances of all corporate bank accounts.",
      parameters: { type: "object", properties: { verbose: { type: "boolean", description: "Return detailed balances" } }, required: ["verbose"] },
    },
  },
  {
    type: "function", function: {
      name: "calculate_surplus",
      description: "Calculate total investable surplus above the $500K operating floor.",
      parameters: { type: "object", properties: { verbose: { type: "boolean", description: "Return detailed surplus breakdown" } }, required: ["verbose"] },
    },
  },
  {
    type: "function", function: {
      name: "execute_sweep",
      description: "Execute a sweep of surplus funds to a specified investment destination.",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "Amount to sweep" },
          destination: { type: "string", description: "Investment destination (e.g. 'US Treasury Bills', '4% yield bonds')" },
        },
        required: ["amount", "destination"],
      },
    },
  },
  {
    type: "function", function: {
      name: "run_var_analysis",
      description: "Calculate Value at Risk (VaR), Sharpe ratio, Sortino ratio and portfolio risk metrics.",
      parameters: {
        type: "object",
        properties: { confidence_level: { type: "number", description: "Confidence level (0.95 or 0.99)" } },
        required: ["confidence_level"],
      },
    },
  },
  {
    type: "function", function: {
      name: "run_stress_test",
      description: "Run stress test scenarios: rate_shock, credit_event, liquidity_crisis, geopolitical, or 'all'.",
      parameters: {
        type: "object",
        properties: { scenario: { type: "string", description: "Scenario name or 'all'" } },
        required: ["scenario"],
      },
    },
  },
  {
    type: "function", function: {
      name: "check_compliance",
      description: "Check regulatory compliance (Basel III, Dodd-Frank, SEC). Returns LCR, NSFR, concentration and duration limits.",
      parameters: {
        type: "object",
        properties: { framework: { type: "string", description: "'basel3', 'dodd_frank', 'sec', or 'all'" } },
        required: ["framework"],
      },
    },
  },
  {
    type: "function", function: {
      name: "get_market_rates",
      description: "Get real-time market rates: treasury yields, FX rates, credit spreads, and risk indicators (VIX, MOVE, SOFR).",
      parameters: {
        type: "object",
        properties: { category: { type: "string", description: "'treasury_yields', 'fx_rates', 'credit_spreads', 'risk_indicators', or 'all'" } },
        required: ["category"],
      },
    },
  },
  {
    type: "function", function: {
      name: "forecast_cashflow",
      description: "Generate cash flow forecast with projected inflows, outflows, yield income, and ending balance.",
      parameters: {
        type: "object",
        properties: { horizon_days: { type: "number", description: "Forecast horizon: 30, 60, or 90 days" } },
        required: ["horizon_days"],
      },
    },
  },
];

/* ═══ ROUTE HANDLER ═══ */
export async function POST() {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY in .env" }, { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: any) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ type, ...data }) + "\n"));
      };
      const sendLog = (msg: string) => send("log", { message: msg });

      try {
        const messages: any = [{
          role: "system",
          content: `You are the ApexLiquidity Corporate Treasury Risk Agent operating at institutional-grade standards (BlackRock / Citadel tier).

Your mandate is a FULL treasury analysis and autonomous sweep:
1. get_balances — retrieve all account positions
2. calculate_surplus — determine investable funds above $500K policy floor
3. get_market_rates with category "all" — check current yield environment
4. run_var_analysis with confidence_level 0.95 — assess portfolio risk
5. run_stress_test with scenario "all" — verify resilience under adverse conditions
6. check_compliance with framework "all" — regulatory verification
7. forecast_cashflow with horizon_days 90 — project future positions
8. execute_sweep — route surplus into optimal instruments

After all steps, provide a 3-sentence executive summary covering: (a) capital deployed, (b) risk posture and compliance status, (c) projected annual returns.

Be systematic. Start with get_balances.`,
        }];

        let done = false;
        while (!done) {
          const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            tools,
            tool_choice: "auto",
          });

          const msg = response.choices[0].message;
          messages.push(msg);

          if (msg.tool_calls && msg.tool_calls.length > 0) {
            for (const tc of msg.tool_calls as any[]) {
              const name = tc.function.name;
              let args: any = {};
              try {
                const raw = tc.function.arguments;
                if (raw && raw !== "null" && raw.trim() !== "") args = JSON.parse(raw);
                if (typeof args !== "object" || args === null) args = {};
              } catch { args = {}; }

              sendLog(`⚡ Calling ${name}(${JSON.stringify(args)})`);

              let result: any;
              switch (name) {
                case "get_balances": result = get_balances(); break;
                case "calculate_surplus": result = calculate_surplus(); break;
                case "execute_sweep": result = execute_sweep(args.amount, args.destination); break;
                case "run_var_analysis": result = run_var_analysis(args.confidence_level ?? 0.95); break;
                case "run_stress_test": result = run_stress_test(args.scenario ?? "all"); break;
                case "check_compliance": result = check_compliance(args.framework ?? "all"); break;
                case "get_market_rates": result = get_market_rates(args.category ?? "all"); break;
                case "forecast_cashflow": result = forecast_cashflow(args.horizon_days ?? 90); break;
                default: result = { error: "Unknown function" };
              }

              sendLog(`📊 Result: ${JSON.stringify(result)}`);
              messages.push({ role: "tool", tool_call_id: tc.id, name, content: JSON.stringify(result) });
            }
          } else if (msg.content) {
            sendLog(`🤖 Agent: ${msg.content}`);

            // Gradium TTS
            if (process.env.GRADIUM_API_KEY) {
              sendLog("🎙️ Synthesizing voice report...");
              const endpoints = [
                "https://api.gradium.ai/v1/audio/speech",
                "https://api.gradium.ai/v1/tts",
                "https://api.gradium.ai/audio/speech",
              ];
              let ttsOk = false;
              for (const url of endpoints) {
                try {
                  const r = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GRADIUM_API_KEY}` },
                    body: JSON.stringify({ model: "tts-1", input: msg.content, voice: "alloy", text: msg.content }),
                  });
                  if (r.ok) {
                    const buf = await r.arrayBuffer();
                    send("audio", { audioBase64: Buffer.from(buf).toString("base64") });
                    sendLog("✅ Voice report ready.");
                    ttsOk = true;
                    break;
                  } else if (r.status !== 404) {
                    sendLog(`❌ TTS error: ${r.status}`);
                    ttsOk = true;
                    break;
                  }
                } catch { continue; }
              }
              if (!ttsOk) sendLog("⚠️ TTS: all endpoints unavailable.");
            } else {
              sendLog("⚠️ Gradium TTS skipped (no API key).");
            }
            done = true;
          } else {
            done = true;
          }
        }
      } catch (err: any) {
        sendLog(`❌ Error: ${err.message}`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Transfer-Encoding": "chunked", "Cache-Control": "no-cache" },
  });
}
