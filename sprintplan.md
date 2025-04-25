Hackathon Goal: Demonstrate a functional desktop prototype that can listen via microphone, perform basic (potentially simulated) mood detection based on audio input, and automatically play a corresponding pre-defined sound through the computer speakers.

Sprint Name: BabySoothe AI - Hackathon MVP Sprint
Duration: 1 Day (Approx. 8-10 working hours)
Team: (Specify roles if multiple people, e.g., UI Dev, Audio/AI Dev)
Key Assumptions:

Development environment (Python/JS/etc., necessary libraries) can be set up quickly.

Working microphone available on the development machine.

A few sample audio files (crying, calm, white noise) are readily available.

Focus is on local execution, no cloud/Supabase integration for this hackathon.

"AI" might be simplified to basic audio level/frequency analysis or even mocked logic initially.

Sprint Backlog (Prioritized Tasks):

(Estimates are very rough & depend on team skill/tools)

Task ID	Task Description	Est. Hours	Priority	Owner(s)	Status	Notes
SETUP						
H-01	Setup Dev Environment & Core Libraries (Audio, UI)	1.0 - 1.5	Critical	All	To Do	Target framework (Python/PyQt, Electron/JS, etc.) decided.
CORE LOOP						
H-02	Create Basic UI Window Shell	0.5	Critical	UI Dev	To Do	Just a window, placeholder for status, Start/Stop button.
H-03	Implement Basic Audio Input (Listen to Microphone)	1.0 - 1.5	Critical	Audio/AI	To Do	Capture audio stream, maybe show basic level meter.
H-04	Implement Basic Audio Output (Play Sound File)	0.5 - 1.0	Critical	Audio/AI	To Do	Function to play a specific WAV/MP3 file.
H-05	Implement Simplified Mood Detection Logic	1.5 - 2.0	Critical	Audio/AI	To Do	Hackathon Focus: Rule-based (e.g., if avg volume > threshold -> Crying) OR just mock/cycle moods.
H-06	Connect Detection to Playback (Core Logic)	0.5 - 1.0	Critical	All	To Do	When "Crying" detected -> play "White Noise"; "Calm" -> stop.
H-07	Implement Start/Stop Button Functionality	0.5	Critical	UI/All	To Do	Button starts/stops microphone listening & processing loop.
H-08	Display Basic Status in UI	0.5	High	UI Dev	To Do	Show "Listening", "Detected: Crying", "Playing: White Noise".
REFINEMENTS (If Time Allows)						
H-09	Add Manual Sound Selection/Playback Buttons	0.5 - 1.0	Medium	UI/All	To Do	Buttons for manually playing Sound A, Sound B.
H-10	Add Basic Volume Control Slider (In-App)	0.5	Medium	UI/All	To Do	Control playback volume within the app.
H-11	Package/Prepare for Demo	0.5	High	All	To Do	Ensure it runs easily for the demo.
STRETCH GOALS (Likely Out of Scope)						
H-12	Integrate a pre-trained simple audio classifier	(2.0+)	Low	Audio/AI	---	If a suitable model is found quickly.
H-13	Add Timer Functionality	(1.0+)	Low	UI/All	---	
H-14	Save/Load Basic Settings (Volume)	(0.5+)	Low	All	---	
Proposed Timeline (Example 8-Hour Day):

Hour 0-1.5: Setup & Sync (Task H-01). Goal: Everyone has a running environment. Quick team sync on approach.

Hour 1.5-3.0: Core I/O & UI Shell (Tasks H-02, H-03, H-04). Goal: Can record audio, can play a sound file manually, basic window exists.

Hour 3.0-5.0: Simplified Detection & Core Logic (Tasks H-05, H-06). Critical Integration Point. Goal: Audio triggers basic classification (even if mocked), which in turn triggers sound playback.

Hour 5.0-6.0: Controls & Status (Tasks H-07, H-08). Goal: Can start/stop the process, UI shows what's happening. Core Loop Demoable.

Hour 6.0-7.0: Refinements or Buffer/Debugging (Tasks H-09, H-10 or catch-up). Goal: Add manual playback/volume if core loop stable. Fix critical bugs.

Hour 7.0-8.0: Demo Prep & Final Polish (Task H-11). Goal: Ensure it runs smoothly for the demo, final code cleanup/comments.

Check-in Points:

After Setup (Hour 1.5)

After Core I/O (Hour 3.0)

After Core Logic Integration (Hour 5.0) - Key Go/No-Go for refinements.

Final Hour Check-in

Hackathon Definition of Done (DoD):

Code runs on at least one developer machine.

Application window launches.

Start button activates microphone listening (visual feedback if possible).

Simulated loud input (or actual clap/noise) triggers "Crying" state detection (shown in UI).

"Crying" state triggers automatic playback of a designated soothing sound.

Simulated quiet input triggers "Calm" state (shown in UI).

"Calm" state stops playback (or plays nothing).

Stop button deactivates listening.

Code is minimally commented and understandable.

Potential Risks & Mitigations:

Risk: Environment/Library setup takes too long. Mitigation: Pre-hackathon check, use simpler/familiar tools, have backup libraries.

Risk: Audio handling is complex/buggy. Mitigation: Use established audio libraries (e.g., sounddevice + soundfile in Python, Web Audio API in Electron), simplify requirements (mono, fixed sample rate).

Risk: "AI" detection too complex for 1 day. Mitigation: Use simplified logic (volume threshold) or mock the detection entirely (e.g., cycle moods every 10 seconds) just to prove the playback logic works. Do not get stuck here.

Risk: Integration points fail. Mitigation: Frequent small commits, test interfaces between modules early, keep coupling loose.

Demo Plan:

Launch the application.

Click "Start Listening". Show UI indicating "Listening".

Make a loud noise near the microphone. Show UI update to "Detected: Crying" and hear the soothing sound start automatically.

Be quiet. Show UI update to "Detected: Calm" and hear the sound stop.

(If implemented) Demonstrate manual sound playback buttons.

Click "Stop Listening". Show UI indicating "Idle".

This plan is aggressive but focuses on achieving the core demonstrable goal within the tight timeframe. Flexibility and ruthless prioritization are key!
