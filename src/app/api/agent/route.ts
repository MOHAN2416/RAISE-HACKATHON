import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow 60 seconds for serverless function

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  baseURL: "https://api.groq.com/openai/v1",
});

const DEFAULT_BALANCES = {
  "Silicon Valley Bank": 4500000,
  "Chase Bank": 1200000,
  "Vultr Treasury": 300000
};


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
      description: "Calculate the total investable surplus cash based on the corporate policy of keeping a 1.5M runway.",
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
          source: { type: "string", description: "The source checking account to withdraw from." },
          destination: { type: "string", description: "The investment destination." },
        },
        required: ["amount", "source", "destination"],
      },
    },
  },
];



export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Missing GROQ_API_KEY in .env" }, { status: 500 });
  }

  let balances: Record<string, number> = DEFAULT_BALANCES;
  try {
    const body = await req.json();
    if (body.balances) {
      balances = body.balances;
    }
  } catch (e) {}

  function get_balances() {
    return balances;
  }

  function calculate_surplus() {
    const checking_total = Object.entries(balances)
      .filter(([k]) => k !== 'Vultr Treasury')
      .reduce((sum, [_, v]) => sum + v, 0);
    return Math.max(0, checking_total - 1500000);
  }

  function execute_sweep(amount: number, destination: string, source: string) {
    return {
      status: "success",
      swept_amount: amount,
      source: source || "Silicon Valley Bank",
      destination: destination,
      expected_annual_yield: amount * 0.0542,
    };
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
            content: "You are the ApexLiquidity Corporate Treasury Risk Agent. We must maintain exactly $1,500,000 across all operating checking accounts. Check balances, calculate surplus, and sweep any excess into Vultr Secure Yield Engine (5.42% APY). Remember the single-product concentration limit of 40%. Finally, provide a 2 sentence summary of what you did. Use the execute_sweep tool with the correct source account (e.g. 'Silicon Valley Bank').",
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
              else if (name === "execute_sweep") result = execute_sweep((args as any).amount, (args as any).destination, (args as any).source);

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
              const ttsRes = await fetch("https://api.gradium.ai/api/post/speech/tts", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": process.env.GRADIUM_API_KEY,
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
