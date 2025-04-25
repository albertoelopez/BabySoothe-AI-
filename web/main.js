const listenBtn = document.getElementById('listen-btn');
const statusDiv = document.getElementById('status');
const volumeBar = document.getElementById('volume-bar');
const volumeValue = document.getElementById('volume-value');
const errorDiv = document.getElementById('error-message');
const moodDiv = document.getElementById('mood');
const lullabyAudio = document.getElementById('audio-lullaby');
const whiteNoiseAudio = document.getElementById('audio-white-noise');
const soothingAudio = document.getElementById('audio-soothing');
const soundStatus = document.getElementById('sound-status');

let listening = false;
let audioContext, analyser, micStream, dataArray, rafId;
// For fallback mood detection: keep a sliding window of recent volume values
const volumeHistory = [];
const HISTORY_DURATION_MS = 1000; // 1 second window
let lastTimestamp = null;

// ML model state
let yamnetModel = null;
let mlMood = 'Unknown';
let mlInferenceInterval = null;

// Try to load YAMNet model if available
async function loadYamnetModel() {
    if (window.yamnet) {
        yamnetModel = await window.yamnet.load();
        console.log('YAMNet model loaded');
    } else {
        console.warn('YAMNet not available');
    }
}
loadYamnetModel();

function setStatus(text) {
    statusDiv.textContent = `Status: ${text}`;
}

// Manual playback button handlers
const playWhiteNoiseBtn = document.getElementById('play-white-noise');
const playLullabyBtn = document.getElementById('play-lullaby');

if (playWhiteNoiseBtn) {
    playWhiteNoiseBtn.addEventListener('click', () => {
        playSoundFile('sounds/white_noise.mp3');
        soundStatus.textContent = 'Sound: White Noise (Manual)';
        setStatus('Manual: Playing White Noise');
        startWaveform(whiteNoiseAudio);
    });
}
if (playLullabyBtn) {
    playLullabyBtn.addEventListener('click', () => {
        playSoundFile('sounds/lullaby.mp3');
        soundStatus.textContent = 'Sound: Lullaby (Manual)';
        setStatus('Manual: Playing Lullaby');
        startWaveform(lullabyAudio);
    });
}

// Helper to update status based on mood and playback
function updateStatus(mood, playingSound) {
    if (!listening) {
        setStatus('Idle');
        return;
    }
    if (mood === 'crying, baby') {
        setStatus('Detected: Crying' + (playingSound ? `, Playing: ${playingSound}` : ''));
    } else if (mood === 'neutral') {
        setStatus('Detected: Neutral' + (playingSound ? `, Playing: ${playingSound}` : ''));
    } else if (mood === 'calm' || mood === 'silence') {
        setStatus('Detected: Calm');
    } else {
        setStatus('Listening...');
    }
}


function setError(text) {
    errorDiv.textContent = text;
    if (text) setStatus('Error');
}

function updateVolumeMeter() {
    if (!analyser) return;
    analyser.getByteTimeDomainData(dataArray);
    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        let val = (dataArray[i] - 128) / 128;
        sum += val * val;
    }
    let rms = Math.sqrt(sum / dataArray.length);
    volumeBar.value = rms;
    volumeValue.textContent = rms.toFixed(2);

    // --- ML Mood Detection (YAMNet) ---
    let detectedMood = null;
    if (yamnetModel && mlMood !== 'Unknown') {
        detectedMood = mlMood;
        moodDiv.textContent = `Mood: ${mlMood}`;
    } else {
        // Fallback: basic rule-based mood detection
        const now = Date.now();
        while (volumeHistory.length && now - volumeHistory[0].ts > HISTORY_DURATION_MS) {
            volumeHistory.shift();
        }
        volumeHistory.push({ ts: now, val: rms });
        const avg = volumeHistory.reduce((acc, v) => acc + v.val, 0) / (volumeHistory.length || 1);
        let mood = 'Unknown';
        if (avg > 0.01) {
            mood = 'crying, baby';
        } else if (avg < 0.005) {
            mood = 'calm';
        } else {
            mood = 'neutral';
        }
        detectedMood = mood;
        moodDiv.textContent = `Mood: ${mood}`;
    }
    // Debug: log mood state
    console.log('detectedMood:', detectedMood, 'lastDetectedMood:', lastDetectedMood, 'moodStableSince:', moodStableSince, 'detectionPaused:', detectionPaused);

    // Always show the relevant sound for the detected mood
    let relevantSound = 'None';
    if (detectedMood === 'crying, baby') {
        relevantSound = 'Lullaby';
    } else if (detectedMood === 'neutral') {
        relevantSound = 'White Noise';
    }
    soundStatus.textContent = `Sound: ${relevantSound}`;

    // Play sound based on detected mood (debounced)
    playSoundForMood(detectedMood);
    // --- End Mood Detection ---

    rafId = requestAnimationFrame(updateVolumeMeter);
}

async function startListening() {
    setError('');
    setStatus('Listening...');
    listenBtn.textContent = 'Stop Listening';
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(micStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        dataArray = new Uint8Array(analyser.fftSize);
        source.connect(analyser);
        updateVolumeMeter();
        listening = true;
        // Start ML inference interval if YAMNet is loaded
        if (yamnetModel) {
            startMLInference(source);
        }
    } catch (err) {
        setError('Microphone access denied or not available.');
        stopListening();
    }
}

function stopListening() {
    // Robustly stop all app activity and reset UI (Issue #7)
    setStatus('Idle');
    listenBtn.textContent = 'Start Listening';
    if (rafId) cancelAnimationFrame(rafId);
    if (mlInferenceInterval) clearInterval(mlInferenceInterval);
    if (micStream && micStream.getTracks) {
        micStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext && audioContext.close) {
        audioContext.close();
    }
    // Stop all sound and waveform
    stopAllSounds();
    stopWaveform();
    // Cancel any sound timeouts
    if (window.soundTimeout) {
        clearTimeout(window.soundTimeout);
        window.soundTimeout = null;
    }
    // Reset UI and state
    volumeBar.value = 0;
    volumeValue.textContent = '0.00';
    mlMood = 'Unknown';
    moodDiv.textContent = 'Mood: Unknown';
    soundStatus.textContent = 'Sound: None';
    listening = false;
    lastPlayedMood = null;
    lastDetectedMood = null;
    moodStableSince = null;
}

listenBtn.addEventListener('click', async () => {
    // --- Fix: Resume audio contexts on user gesture for autoplay policy ---
    if (wfAudioCtx && wfAudioCtx.state === 'suspended') {
        try { await wfAudioCtx.resume(); } catch (e) {}
    }
    if (audioContext && audioContext.state === 'suspended') {
        try { await audioContext.resume(); } catch (e) {}
    }
    if (!listening) {
        startListening();
    } else {
        stopListening();
    }
});

// Automatic sound playback based on mood
let currentSound = null;

function stopAllSounds() {
    [lullabyAudio, whiteNoiseAudio, soothingAudio].forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    currentSound = null;
    soundStatus.textContent = 'Sound: None';
}

// Set default volumes to maximum for all audio tracks
lullabyAudio.volume = 1.0;
whiteNoiseAudio.volume = 1.0;
soothingAudio.volume = 1.0;

// --- General-purpose audio playback function ---
function playSoundFile(filePath) {
    // Try to reuse existing audio elements if possible
    let audioElem = null;
    if (filePath.endsWith('lullaby.mp3')) {
        audioElem = lullabyAudio;
    } else if (filePath.endsWith('white_noise.mp3')) {
        audioElem = whiteNoiseAudio;
    } else if (filePath.endsWith('soothing.mp3')) {
        audioElem = soothingAudio;
    }
    if (!audioElem) {
        // Create a temporary audio element for arbitrary files
        audioElem = new Audio(filePath);
        audioElem.volume = 1.0;
        audioElem.onended = () => { audioElem.remove(); };
        document.body.appendChild(audioElem);
    }
    audioElem.currentTime = 0;
    audioElem.play();
}

// --- UI for manual sound selection ---
const soundSelector = document.getElementById('sound-selector');
const playSelectedBtn = document.getElementById('play-selected-btn');
if (soundSelector && playSelectedBtn) {
    playSelectedBtn.addEventListener('click', () => {
        const file = soundSelector.value;
        if (file) playSoundFile(file);
    });
}


// --- Waveform Visualization ---
const waveformCanvas = document.getElementById('waveform-canvas');
const wfCtx = waveformCanvas.getContext('2d');
let wfAudioCtx = null;
let wfAnalyser = null;
let wfSource = null;
let wfAnimationId = null;

function drawWaveform() {
    if (!wfAnalyser) return;
    const bufferLength = wfAnalyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    wfAnalyser.getByteTimeDomainData(dataArray);
    wfCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    wfCtx.beginPath();
    const sliceWidth = waveformCanvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * waveformCanvas.height) / 2;
        if (i === 0) {
            wfCtx.moveTo(x, y);
        } else {
            wfCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    wfCtx.strokeStyle = '#4f8cff';
    wfCtx.lineWidth = 2;
    wfCtx.stroke();
    wfAnimationId = requestAnimationFrame(drawWaveform);
}

function startWaveform(audioElem) {
    stopWaveform();
    try {
        wfAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        wfAnalyser = wfAudioCtx.createAnalyser();
        wfAnalyser.fftSize = 512;
        wfSource = wfAudioCtx.createMediaElementSource(audioElem);
        wfSource.connect(wfAnalyser);
        wfAnalyser.connect(wfAudioCtx.destination);
        drawWaveform();
    } catch (e) {
        // Ignore errors if context can't be created
    }
}

function stopWaveform() {
    if (wfAnimationId) cancelAnimationFrame(wfAnimationId);
    wfAnimationId = null;
    if (wfAudioCtx) wfAudioCtx.close();
    wfAudioCtx = null;
    wfAnalyser = null;
    wfSource = null;
    wfCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
}


let lastPlayedMood = null;
let lastDetectedMood = null;
let moodStableSince = null;
const MOOD_STABLE_MS = 4000; // Require 4s of stable mood before triggering

let detectionPaused = false;
const SOUND_PLAY_DURATION_MS = 7000; // Play sound for 7 seconds, then resume detection

function playSoundForMood(mood) {
    if (detectionPaused) return;
    // Only trigger if mood is stable for MOOD_STABLE_MS
    const now = Date.now();
    if (mood !== lastDetectedMood) {
        lastDetectedMood = mood;
        moodStableSince = now;
        return;
    }
    if (mood === lastPlayedMood) return;
    if (!moodStableSince || now - moodStableSince < MOOD_STABLE_MS) return;
    stopAllSounds();

    // --- Connect detection to playback ---
    if (mood === 'crying, baby') {
        playSoundFile('sounds/lullaby.mp3'); // or 'sounds/soothing.mp3' if preferred
        startWaveform(lullabyAudio);
        soundStatus.textContent = 'Sound: Lullaby';
        updateStatus(mood, 'Lullaby');
    } else if (mood === 'neutral') {
        playSoundFile('sounds/white_noise.mp3');
        startWaveform(whiteNoiseAudio);
        soundStatus.textContent = 'Sound: White Noise';
        updateStatus(mood, 'White Noise');
    } else if (mood === 'calm' || mood === 'silence') {
        // Stop all playback for calm
        stopAllSounds();
        stopWaveform();
        soundStatus.textContent = 'Sound: None';
        updateStatus(mood);
    } else {
        updateStatus(mood);
    }
    lastPlayedMood = mood;
    detectionPaused = true;
    setTimeout(() => {
        detectionPaused = false;
        lastPlayedMood = null; // Allow new mood triggers
    }, SOUND_PLAY_DURATION_MS);
}

// ML inference: run YAMNet on live audio every 1s
function startMLInference(source) {
    if (!yamnetModel) return;
    const processor = audioContext.createScriptProcessor(1024, 1, 1);
    source.connect(processor);
    processor.connect(audioContext.destination);
    let buffer = [];
    processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        buffer = buffer.concat(Array.from(input));
        // YAMNet expects 0.975s (15600 samples at 16kHz)
        if (buffer.length >= 15600) {
            const chunk = buffer.slice(0, 15600);
            buffer = buffer.slice(15600);
            runYamnetInference(chunk);
        }
    };
    mlInferenceInterval = processor;
}

async function runYamnetInference(audioSamples) {
    if (!yamnetModel) return;
    try {
        // YAMNet expects Float32Array at 16kHz mono
        // Downsample if needed (assume input is 44.1kHz or 48kHz)
        let inputArr = Float32Array.from(audioSamples);
        let input16k = inputArr;
        // Downsample to 16kHz if needed
        if (audioContext.sampleRate !== 16000) {
            input16k = downsampleBuffer(inputArr, audioContext.sampleRate, 16000);
        }
        const scores = await yamnetModel.predict(input16k);
        const top = scores.topK(1);
        mlMood = top.indices.length > 0 ? yamnetModel.classNames[top.indices[0]] : 'Unknown';
    } catch (err) {
        mlMood = 'Unknown';
        console.error('YAMNet inference error:', err);
    }
}

// Downsample Float32Array buffer
function downsampleBuffer(buffer, sampleRate, outRate) {
    if (outRate === sampleRate) return buffer;
    const ratio = sampleRate / outRate;
    const newLen = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLen);
    for (let i = 0; i < newLen; i++) {
        result[i] = buffer[Math.round(i * ratio)] || 0;
    }
    return result;
}
