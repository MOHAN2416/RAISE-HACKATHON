import os
import requests

def generate_speech(text: str, output_path: str = "output.mp3") -> str:
    """
    Calls the Gradium API to generate speech from text.
    Returns the path to the generated audio file.
    """
    api_key = os.environ.get("GRADIUM_API_KEY")
    if not api_key or api_key == "YOUR_GRADIUM_API_KEY_HERE":
        raise ValueError("Gradium API Key is not configured.")
        
    url = "https://api.gradium.ai/v1/audio/speech" # common TTS endpoint format
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "tts-1",
        "voice": "alloy",
        "input": text
    }
    
    # Try OpenAI compatible endpoint first
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        with open(output_path, "wb") as f:
            f.write(response.content)
        return output_path
    except requests.exceptions.RequestException as e:
        # Fallback to another potential Gradium endpoint if OpenAI format fails
        # Assuming v1/tts is another possibility
        url = "https://api.gradium.ai/v1/tts"
        payload = {"text": text}
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            return output_path
        else:
            raise Exception(f"Gradium API error: {response.status_code} - {response.text}")
