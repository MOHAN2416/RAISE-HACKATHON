import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow 60 seconds for serverless function

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  baseURL: "https://api.groq.com/openai/v1",
});

const balances = {
  Operating_Account_Main: 650000,
  Operating_Account_Secondary: 120000,
  Payroll_Account: 300000,
  Tax_Reserve: 150000,
  Vendor_Payments: 80000,
};

function get_balances() {
  return balances;
}

function calculate_surplus() {
  const total = Object.values(balances).reduce((a, b) => a + b, 0);
  return Math.max(0, total - 500000);
}

function execute_sweep(amount: number, destination: string) {
  return {
    status: "success",
    swept_amount: amount,
    destination: destination,
    expected_annual_yield: amount * 0.04,
  };
}

const tools: any = [
  {
    type: "function",
    function: {
      name: "get_balances",
      description: "Get the current balances of all corporate bank accounts.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_surplus",
      description: "Calculate the total investable surplus cash based on the corporate policy of keeping a 500k runway.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_sweep",
      description: "Execute a sweep of funds to a specified destination.",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "The amount to sweep." },
          destination: { type: "string", description: "The investment destination." },
        },
        required: ["amount", "destination"],
      },
    },
  },
];

export async function POST() {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY in .env" }, { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendLog = (msg: string) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "log", message: msg }) + "\n"));
      };

      try {
        const messages: any = [
          {
            role: "system",
            content: "You are the ApexLiquidity Corporate Treasury Risk Agent. We must maintain exactly $500,000 across all operating accounts. Check balances, calculate surplus, and sweep any excess into 4% yield bonds. Finally, provide a 2 sentence summary of what you did.",
          },
        ];

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
            for (const toolCall of msg.tool_calls) {
              const name = toolCall.function.name;
              let args = {};
              try {
                if (toolCall.function.arguments && toolCall.function.arguments !== "null") {
                  args = JSON.parse(toolCall.function.arguments);
                }
              } catch (e) {}

              sendLog(`Action: Calling ${name} with ${JSON.stringify(args)}`);

              let result;
              if (name === "get_balances") result = get_balances();
              else if (name === "calculate_surplus") result = calculate_surplus();
              else if (name === "execute_sweep") result = execute_sweep((args as any).amount, (args as any).destination);

              sendLog(`Tool Result: ${JSON.stringify(result)}`);

              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: name,
                content: JSON.stringify(result),
              });
            }
          } else if (msg.content) {
            sendLog(`Agent: ${msg.content}`);
            
            sendLog("🎙️ Synthesizing Voice Report...");
            if (process.env.GRADIUM_API_KEY) {
              const ttsRes = await fetch("https://api.gradium.ai/v1/audio/speech", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${process.env.GRADIUM_API_KEY}`,
                },
                body: JSON.stringify({
                  model: "tts-1",
                  input: msg.content,
                  voice: "alloy"
                }),
              });
              
              if (ttsRes.ok) {
                const arrayBuffer = await ttsRes.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ type: "audio", audioBase64: base64 }) + "\n"));
                sendLog("✅ Voice generated successfully.");
              } else {
                 const errTxt = await ttsRes.text();
                 sendLog(`❌ Gradium TTS failed: ${ttsRes.status} ${errTxt}`);
              }
            } else {
               sendLog("⚠️ Gradium TTS skipped: No API Key provided.");
            }
            done = true;
          } else {
            done = true;
          }
        }
      } catch (err: any) {
        sendLog(`Error: ${err.message}`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
