# ApexLiquidity | Corporate Treasury Risk Agent

ApexLiquidity is an autonomous, AI-driven corporate treasury optimization platform. It continuously monitors corporate banking nodes, enforces safety baselines and concentration risk limits, and autonomously proposes or executes capital sweeps into high-yield vehicles to maximize treasury efficiency.

## 🌟 Key Features

* **Real-time LLM Optimization Engine:** Powered by `llama-3.3-70b-versatile` via the Groq API. The agent can dynamically execute tools, check balances, and calculate yields.
* **Interactive Treasury Dashboard:** A sleek, cyberpunk-inspired dark mode terminal UI built with Next.js and Tailwind CSS.
* **Dynamic Scenarios:** Live-edit your corporate checking and savings balances in the UI to instantly see how the AI agent adjusts its sweeping strategy.
* **Autonomous Rule Enforcement:** Hardcoded policy prompts ensure the agent maintains a strict $1.5M safety runway across operating checking accounts and adheres to a 40% single-product concentration limit.
* **Voice Synthesis Reporting:** Integrates with Gradium AI's TTS endpoint to deliver a synthesized auditory briefing of the agent's actions at the end of each run.
* **Streaming `ndjson` Architecture:** The agent's thought process and tool execution logs are streamed chunk-by-chunk in real time to the frontend terminal.

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router & API Routes)
* **Bundler:** Turbopack
* **Styling:** Tailwind CSS v3 + PostCSS
* **AI Provider (LLM):** [Groq](https://groq.com/) (Llama 3.3 70B)
* **AI Provider (Voice):** [Gradium AI](https://gradium.ai/) TTS API
* **Icons:** Lucide React
* **Charts:** Recharts

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/MOHAN2416/RAISE-HACKATHON.git
cd RAISE-HACKATHON
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
GRADIUM_API_KEY=your_gradium_api_key_here
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the ApexLiquidity dashboard.

## 🧠 How the Agent Works

When you click **"Engage Nexus Sweep"**:
1. The frontend packages the exact balances from your UI and POSTs them to `/api/agent`.
2. The Agent connects to Groq with access to three internal tools: `get_balances`, `calculate_surplus`, and `execute_sweep`.
3. It evaluates the balances against the hardcoded prompt rules (maintaining $1.5M in checking).
4. If a surplus exists, it sweeps the excess into the Vultr Secure Yield Engine (5.42% APY).
5. The frontend streams the execution log live into the Terminal UI.
6. Once complete, a 2-sentence summary is passed to Gradium AI to generate and play an audio report.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/MOHAN2416/RAISE-HACKATHON/issues).

---
*Built for the RAISE Hackathon.*
