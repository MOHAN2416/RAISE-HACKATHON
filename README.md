# RAISE-HACKATHON

The Verdict: Idea 3 (ApexLiquidity) is the Golden Ticket
You should build the Corporate Treasury Risk Agent.

Here is why this is the strategic winner:

The Logic is Math, Not Parsing: You are dealing with numerical thresholds (yield rates, burn rates, capital balances). Building a tool that calculates a risk-adjusted yield or flags a liquidity threshold is far more reliable to build fast than a system trying to interpret vague legal clauses in a 500-page medical PDF.

Zero UI Physics: Simulating a glowing, real-time network topology map (Idea 2) with WebSockets is a massive time sink. Financial dashboards, however, are just bar charts and data tables.

The "Magic Moment": The multi-step reasoning is incredibly clear: Check Balance → Read Policy (30-day runway) → Calculate Burn → Execute Trade. ### The Necessary Pivot: Kill the Full-Stack Overhead
Idea 3 lists Next.js, Shadcn/ui, and Vercel AI SDK. Do not use this tech stack. If you are sprinting in 5 hours, wrestling with React components, routing, and complex full-stack web frameworks will bleed your time dry.

Keep your architecture strictly localized to your core strengths in machine learning and backend logic:

The Backend: Stick purely to Python. Use LangGraph or just standard Python functions hooked into the Gemini API for tool calling.

The Interface: Swap Next.js for Streamlit. You can build a jaw-dropping financial dashboard with interactive charts in pure Python using st.bar_chart() and st.metrics(). It takes 20 lines of code instead of 200, and you don't have to write a single line of JavaScript.

Why the Others are Traps for a 5-Hour Sprint
Idea 1: InsurePulse (Healthcare)

The Trap: Unstructured Medical RAG. Pulling the exact right clause out of a dense, 500-page insurance PDF using a vector database (Pinecone/Chroma) is notoriously difficult to get right on the first try. You will spend 3 hours just tweaking the chunk size and embedding logic so the LLM doesn't hallucinate the medical codes.

Idea 2: SovereignNet (Telecom)

The Trap: The UI/Backend Bridge. To make a network map look cool, you need WebSockets streaming real-time data to a React frontend. If your WebSocket connection drops or the React state gets out of sync with your Python agent during the live demo, the entire dashboard freezes. It is too fragile for a rapid prototype.

The 5-Hour ApexLiquidity Execution Plan
If you choose Idea 3, here is how you build it right now:

Define the Mocks (Hour 1): Hardcode a Python dictionary with 5 bank account balances. Write a simple text file for the "Treasury Policy" stating: "Maintain $500k in operating accounts. Any surplus must be swept into 4% yield bonds."

Write the Tools (Hour 2): Write three Python functions: get_balances(), calculate_surplus(burn_rate), and execute_sweep(amount, destination).

Wire the Agent (Hour 3-4): Give the Gemini API access to those tools. Prompt it: "You are a treasury risk agent. Check balances, read the policy, and execute sweeps to maximize yield safely."

Wrap the UI (Hour 5): Run pip install streamlit. Use st.write to stream the agent's thought process live on screen, and use st.metric to show the "Yield Generated" ticker going up.
