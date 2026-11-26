#!/bin/bash
# wrapper: bash scripts/tts.sh <script.json> <voice_dir>
cd ~/goc-nhin && exec ~/VieNeu-TTS/.venv/bin/python scripts/tts_batch.py "$@"
