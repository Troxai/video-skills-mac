#!/bin/bash
# wrapper: bash scripts/words.sh <voice_dir>
cd ~/goc-nhin && exec ~/whisper-venv/bin/python scripts/word_times.py "$@"
