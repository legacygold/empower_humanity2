#!/usr/bin/env python3
import os, pathlib, time, shutil
from pdfminer.high_level import extract_text
WORKSPACE = pathlib.Path(r"C:\Users\ortho\.openclaw\workspace")
PDF_DIR    = WORKSPACE / "PDF"
MEMORY_DIR = WORKSPACE / "memory" / "hmp"
PDF_DIR.mkdir(parents=True, exist_ok=True)
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

def extract(pdf_path):
    txt_path = pdf_path.with_suffix('.txt')
    txt_path.parent.mkdir(parents=True, exist_ok=True)
    txt = extract_text(str(pdf_path))
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(txt[:5000])          # keep first ~5 KB (good for quick read)
    return txt_path

def process_new_files():
    for pdf in PDF_DIR.rglob('*.pdf'):
        extract(pdf)

process_new_files()
print('[HMP-Agent] Done')