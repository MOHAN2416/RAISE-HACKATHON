import os
import json
from openai import OpenAI
from dotenv import load_dotenv
import tools

load_dotenv()

groq_api_key = os.environ.get("GROQ_API_KEY")
if not groq_api_key or groq_api_key == "YOUR_GROQ_API_KEY_HERE":
    print("WARNING: GROQ_API_KEY is not set or is set to placeholder.")

# Initialize the OpenAI client pointing to Groq
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=groq_api_key if groq_api_key else "dummy_key"
)

# Groq model
MODEL = "llama-3.3-70b-versatile"

# Define our tools in the OpenAI format
agent_tools = [
    {
        "type": "function",
        "function": {
            "name": "get_balances",
            "description": "Returns the current bank account balances.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_surplus",
            "description": "Determines investable surplus beyond the $500k policy threshold.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "execute_sweep",
            "description": "Simulates sweeping funds and calculating resulting yield.",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number", "description": "The amount of funds to sweep"},
                    "destination": {"type": "string", "description": "The destination account or asset"}
                },
                "required": ["amount", "destination"]
            }
        }
    }
]

system_prompt = """You are a treasury risk agent.
1. Check balances.
2. Determine investable surplus. The policy is: Maintain $500k in operating accounts. Any surplus must be swept into 4% yield bonds.
3. Execute the sweep to 4% yield bonds to maximize yield.
Explain your reasoning clearly. Start by calling get_balances."""

def run_treasury_agent(stream_callback=None):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Please assess our current bank balances. Calculate the surplus and execute a sweep to maximize yield."}
    ]
    
    final_summary = ""
    
    while True:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=agent_tools,
            tool_choice="auto"
        )
        
        response_message = response.choices[0].message
        
        # Avoid passing empty content field back if it's None to some strict APIs
        msg_to_append = {
            "role": "assistant"
        }
        if response_message.content:
            msg_to_append["content"] = response_message.content
        if response_message.tool_calls:
            msg_to_append["tool_calls"] = []
            for tc in response_message.tool_calls:
                msg_to_append["tool_calls"].append({
                    "id": tc.id,
                    "type": tc.type,
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                })
        
        messages.append(msg_to_append)
        
        if response_message.content:
            if stream_callback:
                stream_callback(f"**Agent:** {response_message.content}")
            final_summary += response_message.content + " "
            
        tool_calls = response_message.tool_calls
        if tool_calls:
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                try:
                    args = json.loads(tool_call.function.arguments)
                    if not isinstance(args, dict):
                        args = {}
                except:
                    args = {}
                
                if stream_callback:
                    stream_callback(f"**Action:** Calling `{function_name}` with {args}")
                
                if function_name == "get_balances":
                    result = tools.get_balances()
                elif function_name == "calculate_surplus":
                    result = tools.calculate_surplus(**args)
                elif function_name == "execute_sweep":
                    result = tools.execute_sweep(**args)
                else:
                    result = {"error": "Unknown function"}
                    
                if stream_callback:
                    stream_callback(f"**Tool Result:** `{result}`")
                    
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(result)
                })
        else:
            # If no tool calls, the agent has finished its task
            break
            
    return messages, final_summary
