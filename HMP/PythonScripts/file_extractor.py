#!/usr/bin/env python3
import os, pathlib, asyncio, logging, re, sys
from telegram import Update, Bot
from telegram.ext import Application, MessageHandler, filters, ContextTypes
from pdfminer.high_level import extract_text

# ---------- CONFIG ----------
BOT_TOKEN = "8496467683:AAExXTbitdxJhp3IVUID8zFiPjiO8KBygT4"  # Your bot token
WORKSPACE_ROOT = pathlib.Path(r"C:\Users\ortho\.openclaw\workspace")
PDF_DIR = WORKSPACE_ROOT / "PDF"
HMP_DIR = WORKSPACE_ROOT / "memory" / "hmp"
FULL_TEXT_DIR = HMP_DIR / "full-text"

PDF_DIR.mkdir(parents=True, exist_ok=True)
HMP_DIR.mkdir(parents=True, exist_ok=True)
FULL_TEXT_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

async def download_file(bot: Bot, file_id: str, dest: pathlib.Path):
    try:
        file_path = await bot.get_file(file_id)
        await file_path.download_to_drive(custom_path=str(dest))
        logger.info(f"✅ Saved original → {dest}")
    except Exception as e:
        logger.error(f"❌ Failed to download file: {e}")

def extract_text_excerpt(pdf_path: pathlib.Path):
    try:
        txt = extract_text(str(pdf_path))
        excerpt = txt[:5000]
        excerpt_path = HMP_DIR / f"{pdf_path.stem}_excerpt.md"
        excerpt_path.write_text(f"# Excerpt from {pdf_path.name}\n\n{excerpt}", encoding="utf-8")
        full_path = FULL_TEXT_DIR / f"{pdf_path.stem}.txt"
        full_path.write_text(txt, encoding="utf-8")
        logger.info(f"✅ Excerpt → {excerpt_path} | Full → {full_path}")
    except Exception as e:
        logger.error(f"❌ Extraction failed for {pdf_path.name}: {e}")

# ---------- HANDLER FOR @empower_testbot ----------
FILE_NAME_RE = re.compile(r'@empower_testbot\s+([\x00-\x7F]+\.pdf|[^\\x80-\\xFF]+\.md)', re.IGNORECASE)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text or ""
    m = FILE_NAME_RE.search(text)
    if not m:
        return
    filename = m.group(1)
    doc = update.message.document
    if not doc:
        await update.message.reply_text(f"⚠️ File *{filename}* not attached. Please upload the file, then mention me again.")
        return
    logger.info(f"Downloading {filename}")
    await download_file(context.bot, doc.file_id, PDF_DIR / filename)
    logger.info(f"Extracting text from {filename}")
    extract_text_excerpt(PDF_DIR / filename)
    await update.message.reply_text(f"✅ *{filename}* archived & indexed for HMP. Excerpt saved to `memory/hmp/`.")

# ---------- MAIN ----------
def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(MessageHandler(filters.TEXT & filters.Regex(FILE_NAME_RE), handle_message))
    app.run_polling(drop_pending_updates=True)  # Add this to avoid conflicts

if __name__ == "__main__":
    asyncio.run(main())


