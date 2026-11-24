"""
Records pronunciations with Piper (offline neural TTS) and the public-domain LJSpeech voice.
Reads JSON lines {file, slug, text} on stdin (from audio-words.ts), writes small mono MP3s and
records what each file says in public/audio/index.json.

Setup once:  python3 -m venv .venv-audio && .venv-audio/bin/pip install piper-tts
Needs ffmpeg on PATH. The voice model (~110 MB) is downloaded to ~/.cache/piper on first run.
"""
import json
import os
import subprocess
import sys
import tempfile
import urllib.request
import wave

from piper import PiperVoice, SynthesisConfig

VOICE = "en_US-ljspeech-high"
BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/high/"
CACHE = os.path.expanduser("~/.cache/piper")


def model_path() -> str:
    os.makedirs(CACHE, exist_ok=True)
    for ext in (".onnx", ".onnx.json"):
        dest = os.path.join(CACHE, VOICE + ext)
        if not os.path.exists(dest):
            print(f"downloading {VOICE}{ext}…", file=sys.stderr)
            urllib.request.urlretrieve(BASE + VOICE + ext, dest)
    return os.path.join(CACHE, VOICE + ".onnx")


def pace(text: str) -> float:
    """Slower than conversational so every syllable is audible; the model rushes short words most."""
    n = len(text.replace(" ", ""))
    return 1.45 if n <= 4 else 1.25 if n <= 7 else 1.1


def main() -> None:
    jobs = [json.loads(line) for line in sys.stdin if line.strip()]
    if not jobs:
        print("all terms already have audio", file=sys.stderr)
        return
    voice = PiperVoice.load(model_path())
    index_file = os.path.join(os.path.dirname(jobs[0]["file"]), "index.json")
    index = json.load(open(index_file)) if os.path.exists(index_file) else {}
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = os.path.join(tmp, "w.wav")
        for i, job in enumerate(jobs, 1):
            with wave.open(wav_path, "wb") as wav:
                voice.synthesize_wav(job["text"], wav, syn_config=SynthesisConfig(length_scale=pace(job["text"])))
            os.makedirs(os.path.dirname(job["file"]), exist_ok=True)
            subprocess.run(
                ["ffmpeg", "-loglevel", "error", "-y", "-i", wav_path,
                 # trim the model's silence so playback starts the moment you tap, then keep a
                 # short lead-in/out: phones can swallow the first few ms of a clip
                 "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
                        "adelay=60:all=1,apad=pad_dur=0.1,"
                        # ffmpeg 9's mp3 encoder rejects the filters' float frames ("inadequate plane padding")
                        "aformat=sample_fmts=s16p",
                 "-ac", "1", "-ar", "22050", "-b:a", "40k", job["file"]],
                check=True,
            )
            index[job["slug"]] = job["text"]
            if i % 50 == 0 or i == len(jobs):
                with open(index_file, "w") as f:
                    json.dump(dict(sorted(index.items())), f, ensure_ascii=False, indent=0)
                print(f"{i}/{len(jobs)}", file=sys.stderr)


if __name__ == "__main__":
    main()
