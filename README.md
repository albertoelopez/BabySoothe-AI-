# BabySoothe AI - Desktop Hackathon MVP
You can watch the video here: [Watch the video](https://drive.google.com/file/d/1QK3HllJHI51-Omz8SNjG9MysLgsXFAll/view?usp=sharing)



![Baby Icon Placeholder](https://via.placeholder.com/100x100.png?text=BabySootheAI) <!-- Replace with a real logo/icon if you have one -->

**A desktop application prototype created during a 1-day hackathon.**

This project explores the concept of an AI-powered baby soothing application for desktop computers. It aims to listen for baby sounds via the computer's microphone, perform *basic* (simulated or rule-based) mood detection (e.g., crying vs. calm based on volume), and automatically play pre-defined soothing sounds through the computer's speakers.

**🚨 DISCLAIMER: This is a proof-of-concept built rapidly during a hackathon. It is highly experimental, likely contains bugs, and uses simplified logic. It is NOT intended for real-world use, especially not for monitoring or ensuring a baby's safety or well-being. Always prioritize direct parental care and attention. 🚨**

---

## ✨ Features (Hackathon MVP Goal)

*   **Audio Input:** Captures audio from the default system microphone.
*   **Simplified "Mood" Detection:** Implements a basic mechanism (e.g., volume threshold analysis or mocked states) to differentiate between a "Crying/Distressed" state and a "Calm" state.
*   **Automatic Sound Playback:** Plays a pre-defined soothing sound (e.g., white noise) when "Crying" is detected.
*   **Stops Playback:** Stops the soothing sound when the state returns to "Calm".
*   **Basic UI:** Provides a minimal window with:
    *   Start/Stop listening button.
    *   Status indicator (e.g., "Idle", "Listening", "Detected: Crying", "Playing Sound").
*   **(Potential Refinement):** Manual buttons to play specific sounds.
*   **(Potential Refinement):** Basic in-app volume control slider.

---

## ⚠️ Project Status

*   **Status:** Hackathon Prototype - Proof of Concept
*   **Development Stage:** Highly Experimental
*   **Limitations:**
    *   The "AI" is extremely basic and **not** a reliable indicator of a baby's actual mood or needs.
    *   Error handling is likely minimal.
    *   Limited sound library.
    *   No configuration persistence (settings are not saved).
    *   Requires manual setup and running from source.

---

## 💻 Tech Stack (Example - Fill in your actual choices)

*   **Language:** Python 3.9+
*   **UI Framework:** PyQt6 (or Tkinter, PySide6, Kivy, etc.)
*   **Audio Handling:** `sounddevice`, `soundfile` (or `pyaudio`, etc.)
*   **Basic Analysis:** `numpy` (if used for volume calculation)
*   **(Alternative Stack):** JavaScript/Node.js with Electron, Web Audio API

---

## 🚀 Getting Started

### Prerequisites

*   Git
*   [Python 3.9+](https://www.python.org/) (or Node.js/npm if using JS stack)
*   `pip` (Python package installer)
*   A working microphone connected to your computer.
*   Sample audio files (e.g., `cry.wav`, `calm.wav`, `white_noise.wav`) placed in a designated folder (e.g., `sounds/`). *(Specify where)*

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd baby-soothe-ai-desktop-hackathon
    ```

2.  **Set up a virtual environment (Recommended for Python):**
    ```bash
    python -m venv venv
    # Activate the virtual environment
    # On Windows:
    # venv\Scripts\activate
    # On macOS/Linux:
    # source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    # Or if using Node.js:
    # npm install
    ```
    *(Make sure `requirements.txt` or `package.json` lists all necessary libraries)*

4.  **Place sample audio files:**
    *   Ensure you have `.wav` or `.mp3` files for testing (e.g., a crying sound, a white noise sound).
    *   Place them in the `sounds/` directory (or update the code with the correct paths).

### Running the Application

1.  **Ensure your virtual environment is activated (if using Python).**
2.  **Navigate to the project root directory.**
3.  **Run the main script:**
    ```bash
    python main.py
    # Or if using Node.js/Electron:
    # npm start
    ```
4.  **Interact with the UI:**
    *   Click the "Start Listening" button.
    *   Make noise near your microphone (or play a sample crying sound). Observe if the status changes and the soothing sound plays.
    *   Be quiet (or play a calm sound). Observe if the status changes and the sound stops.
    *   Click the "Stop Listening" button.

---

## ‼️ Critical Limitations & Warnings

*   **NOT A SAFETY DEVICE:** This application cannot determine *why* a baby is crying (hunger, pain, diaper, illness, etc.) and is absolutely **no substitute** for checking on and caring for your baby directly.
*   **AI INACCURACY:** The detection logic is rudimentary. It will make mistakes and cannot understand the nuances of baby vocalizations.
*   **VOLUME HAZARD:** Be extremely cautious with your computer's system volume. Start with a very low volume and increase gradually. This prototype lacks robust safeguards against potentially harmful volume levels. Keep speakers at a safe distance from the baby.
*   **PRIVACY:** This hackathon version processes audio locally. No audio data is sent externally.

---

## 💡 Future Ideas (Post-Hackathon)

*   Integrate a proper Machine Learning model for cry/mood detection.
*   Implement user feedback mechanisms.
*   Expand the sound library and allow user uploads/recordings.
*   Add robust volume limiting and safety features.
*   Develop configuration saving/loading.
*   Improve UI/UX.
*   Consider cloud integration (e.g., Supabase) for user accounts and settings persistence (as planned initially).
*   Cross-platform packaging.

---

## 📜 License
MIT
