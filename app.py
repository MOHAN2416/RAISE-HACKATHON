import streamlit as st
import time
from agent import run_treasury_agent
import mock_data
import os
from voice import generate_speech

st.set_page_config(page_title="ApexLiquidity", layout="wide", initial_sidebar_state="expanded")

st.title("💸 ApexLiquidity: Corporate Treasury Risk Agent")
st.markdown("Automated cash flow management and yield optimization using **Groq** and **Gradium Voice AI**.")

# Sidebar setup
st.sidebar.header("🏦 Current Bank Balances")
total_balance = 0
for account, balance in mock_data.BANK_BALANCES.items():
    st.sidebar.metric(label=account.replace("_", " "), value=f"${balance:,.2f}")
    total_balance += balance
st.sidebar.markdown("---")
st.sidebar.metric(label="Total Balance", value=f"${total_balance:,.2f}")

st.sidebar.header("📜 Treasury Policy")
try:
    with open("treasury_policy.txt", "r") as f:
        policy = f.read()
    st.sidebar.info(policy)
except Exception as e:
    st.sidebar.error("Could not load treasury policy.")

st.sidebar.header("🔥 Burn Rate")
st.sidebar.metric(label="Monthly Burn Rate", value=f"${mock_data.MONTHLY_BURN_RATE:,.2f}")

# Main content
st.subheader("Agent Execution Log")
log_container = st.container()

def stream_callback(message):
    with log_container:
        # Escape dollar signs so Streamlit doesn't parse them as LaTeX math
        st.markdown(message.replace("$", "\\$"))
        time.sleep(0.5) # Slight delay for visual effect

# Check for API keys
groq_key = os.environ.get("GROQ_API_KEY")
gradium_key = os.environ.get("GRADIUM_API_KEY")

if st.button("🚀 Run Treasury Risk Agent", type="primary"):
    if not groq_key or groq_key == "YOUR_GROQ_API_KEY_HERE":
        st.error("⚠️ GROQ_API_KEY is missing! Please configure it in the `.env` file before running.")
    else:
        with st.spinner("Agent is analyzing balances using Groq..."):
            try:
                # Clear previous logs visually
                st.empty()
                history, final_summary = run_treasury_agent(stream_callback=stream_callback)
                st.success("✅ Analysis Complete")
                st.balloons()
                
                # Now generate TTS using Gradium
                if gradium_key and gradium_key != "YOUR_GRADIUM_API_KEY_HERE" and final_summary.strip():
                    with st.spinner("Generating Voice Analysis with Gradium..."):
                        audio_path = generate_speech(final_summary)
                        st.audio(audio_path, format="audio/mp3", autoplay=True)
                elif not gradium_key or gradium_key == "YOUR_GRADIUM_API_KEY_HERE":
                    st.warning("GRADIUM_API_KEY is missing. Audio playback skipped.")
                    
            except Exception as e:
                st.error(f"❌ Error during execution: {e}")
