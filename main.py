import sys
import numpy as np
import sounddevice as sd
import soundfile as sf
from PyQt6.QtWidgets import (
    QApplication, QWidget, QLabel, QVBoxLayout, QPushButton, QProgressBar,
    QComboBox, QMessageBox
)
from PyQt6.QtCore import QThread, pyqtSignal
import queue
import threading
import time

class AudioListener(QThread):
    volume_signal = pyqtSignal(float)
    status_signal = pyqtSignal(str)

    def __init__(self, device=None, parent=None):
        super().__init__(parent)
        self.running = False
        self.device = device

    def run(self):
        self.running = True
        self.status_signal.emit('Listening...')
        try:
            def callback(indata, frames, time_info, status):
                if not self.running:
                    raise sd.CallbackStop()
                # Calculate RMS volume
                volume_norm = np.linalg.norm(indata) / np.sqrt(len(indata))
                self.volume_signal.emit(volume_norm)
            with sd.InputStream(callback=callback, channels=1, samplerate=16000, device=self.device):
                while self.running:
                    time.sleep(0.1)
        except Exception as e:
            self.status_signal.emit(f'Error: {e}')
        self.status_signal.emit('Idle')

    def stop(self):
        self.running = False

class BabySootheApp(QWidget):
    def __init__(self):
        super().__init__()
        self.listener = None
        self.device_list = self.get_input_devices()
        self.init_ui()

    def get_input_devices(self):
        devices = []
        try:
            all_devices = sd.query_devices()
            for idx, dev in enumerate(all_devices):
                if dev['max_input_channels'] > 0:
                    devices.append((idx, dev['name']))
        except Exception as e:
            print(f"Error querying devices: {e}")
        return devices

    def init_ui(self):
        self.setWindowTitle('BabySoothe AI - MVP')
        layout = QVBoxLayout()
        self.status_label = QLabel('Status: Idle')
        layout.addWidget(self.status_label)
        self.device_selector = QComboBox()
        for idx, name in self.device_list:
            self.device_selector.addItem(name, idx)
        layout.addWidget(QLabel('Select Microphone:'))
        layout.addWidget(self.device_selector)
        self.listen_button = QPushButton('Start Listening')
        self.listen_button.clicked.connect(self.toggle_listening)
        layout.addWidget(self.listen_button)
        self.volume_label = QLabel('Volume: 0.00')
        layout.addWidget(self.volume_label)
        self.volume_bar = QProgressBar()
        self.volume_bar.setMinimum(0)
        self.volume_bar.setMaximum(100)
        layout.addWidget(self.volume_bar)
        self.setLayout(layout)
        self.listening = False

    def toggle_listening(self):
        if not self.listening:
            self.start_listening()
        else:
            self.stop_listening()

    def start_listening(self):
        device_idx = self.device_selector.currentData()
        self.listener = AudioListener(device=device_idx)
        self.listener.volume_signal.connect(self.update_volume)
        self.listener.status_signal.connect(self.update_status)
        self.listener.start()
        self.listen_button.setText('Stop Listening')
        self.listening = True

    def stop_listening(self):
        if self.listener:
            self.listener.stop()
            self.listener.wait()
        self.listen_button.setText('Start Listening')
        self.listening = False
        self.status_label.setText('Status: Idle')
        self.volume_label.setText('Volume: 0.00')
        self.volume_bar.setValue(0)

    def update_volume(self, volume):
        self.volume_label.setText(f'Volume: {volume:.2f}')
        # Clamp and scale volume for progress bar
        bar_value = min(max(int(volume * 100), 0), 100)
        self.volume_bar.setValue(bar_value)

    def update_status(self, status):
        self.status_label.setText(f'Status: {status}')
        if status.startswith('Error:'):
            QMessageBox.critical(self, 'Microphone Error', status)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = BabySootheApp()
    window.show()
    sys.exit(app.exec())
