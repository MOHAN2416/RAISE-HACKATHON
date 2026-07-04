export type LogStep = 
  | { type: 'Action'; text: string }
  | { type: 'JsonResult'; data: any }
  | { type: 'TextResult'; text: string; success?: boolean }
  | { type: 'Synthesis'; title: string; text: string }
  | { type: 'Status'; state: 'pending' | 'error' | 'success'; message: string };

export const mockBalances = {
  "Operating Main": 1240492.00,
  "Operating Secondary": 312000.45,
  "Payroll Account": 500000.00,
  "Tax Reserve": 185200.12,
  "Vendor Payments": 42110.88,
};

export const mockKpis = {
  totalCash: "$2.27M",
  surplus: "+$1.77M",
  policyMin: "$500K",
  yieldGen: "4.82%",
};

export const yieldSeries = [
  { day: 'Day 1', yield: 4.05 },
  { day: 'Day 2', yield: 4.07 },
  { day: 'Day 3', yield: 4.08 },
  { day: 'Day 4', yield: 4.12 },
  { day: 'Day 5', yield: 4.10 },
  { day: 'Day 6', yield: 4.15 },
  { day: 'Day 7', yield: 4.18 },
  { day: 'Day 8', yield: 4.20 },
  { day: 'Day 9', yield: 4.22 },
  { day: 'Day 10', yield: 4.25 },
  { day: 'Day 11', yield: 4.28 },
  { day: 'Day 12', yield: 4.31 },
  { day: 'Day 13', yield: 4.29 },
  { day: 'Day 14', yield: 4.33 },
  { day: 'Day 15', yield: 4.36 },
  { day: 'Day 16', yield: 4.41 },
  { day: 'Day 17', yield: 4.45 },
  { day: 'Day 18', yield: 4.50 },
  { day: 'Day 19', yield: 4.48 },
  { day: 'Day 20', yield: 4.55 },
  { day: 'Day 21', yield: 4.60 },
  { day: 'Day 22', yield: 4.65 },
  { day: 'Day 23', yield: 4.70 },
  { day: 'Day 24', yield: 4.75 },
  { day: 'Day 25', yield: 4.80 },
  { day: 'Day 26', yield: 4.85 },
  { day: 'Day 27', yield: 4.90 },
  { day: 'Day 28', yield: 4.95 },
  { day: 'Day 29', yield: 5.00 },
  { day: 'Day 30', yield: 5.05 }
];

export const mockLogSteps: LogStep[] = [
  { type: 'Action', text: 'Calling get_balances() with scope {"all_accounts": true}' },
  { type: 'JsonResult', data: { status: "success", data: { operating_main: 1240492, payroll: 500000 } } },
  { type: 'Action', text: 'Executing calculate_surplus()' },
  { type: 'TextResult', text: 'Total investable surplus identified: $1,772,603.33', success: true },
  { type: 'Action', text: 'Initiating trade execute_sweep()' },
  { type: 'JsonResult', data: { instrument: "US_TREASURY_REPO_4.25", amount: 1200000.00, order_id: "TRD-99812-AX" } },
  { type: 'Synthesis', title: 'AGENT SYNTHESIS', text: 'Analysis complete. Based on the Treasury Policy (Min Runway: $500,000), ApexLiquidity has identified $1.77M in idle capital. I have executed a sweep of $1.2M into the Treasury Repo pool to capture 4.25% yield while maintaining immediate liquidity for payroll obligations. Estimated monthly yield increase: +$4,250.' },
  { type: 'Status', state: 'pending', message: 'Synthesizing Voice Report...' },
  { type: 'Status', state: 'error', message: 'API_ERR: Gradium TTS unreachable (404)' },
];
