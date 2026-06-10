# ========================================================
# session_handler.py – Targeted Session File Handler
# ========================================================
# Purpose: Handle the current session file for a non-Debi user
#          (user ID ≠ 525612398) by copying, sending, and deleting.
#
# Usage: Run via exec → agent then uses message tool to send
#        copies to each user's Telegram chat via empower_testbot.
# ========================================================

import json
import os
import shutil
from datetime import datetime
from pathlib import Path

# --------------------------------------------------------
# CONFIG
# --------------------------------------------------------
YOUR_USER_ID = "525612398"  # Debi's Telegram ID
SESSIONS_DIR = Path(r"C:\Users\ortho\.openclaw\agents\main\sessions")
SESSIONS_JSON = SESSIONS_DIR / "sessions.json"
TEMP_FILES_DIR = Path(r"C:\Users\ortho\.openclaw\workspace\TempFiles\TEMP_SESSIONS")
LOG_FILE = Path(r"C:\Users\ortho\.openclaw\workspace\TempFiles\TEMP_SESSIONS\session_handler.log")

# --------------------------------------------------------
# MAIN
# --------------------------------------------------------
def handle_current_session(current_user_id: str, current_session_key: str):
    """
    Handle the current session file for a non-Debi user.
    """
    if current_user_id == YOUR_USER_ID:
        print(f"✅ Skipping - this is Debi's session (ID: {current_user_id})")
        return None

    # Read sessions.json to find the session file for this user
    if not SESSIONS_JSON.exists():
        print(f" ERROR: {SESSIONS_JSON} not found.")
        return None

    with open(SESSIONS_JSON, "r", encoding="utf-8") as f:
        sessions_data = json.load(f)

    # Find the session entry for this user
    session_info = None
    for session_key, info in sessions_data.items():
        # Extract user ID from session key like "agent:main:telegram:direct:7465987048"
        parts = session_key.split(":")
        user_id = parts[-1] if parts else None

        if user_id == current_user_id:
            session_info = info
            break

    if not session_info:
        print(f" ERROR: No session found for user ID: {current_user_id}")
        return None

    # Get the session file path
    session_file = session_info.get("sessionFile")
    if not session_file:
        print(f" ERROR: No sessionFile path found for user ID: {current_user_id}")
        return None

    session_path = Path(session_file)
    if not session_path.exists():
        print(f" ERROR: Session file not found: {session_file}")
        return None

    # Copy to TempFiles
    TEMP_FILES_DIR.mkdir(parents=True, exist_ok=True)

    dest_name = f"session_{current_user_id}_{session_path.name}"
    dest_path = TEMP_FILES_DIR / dest_name
    shutil.copy2(session_path, dest_path)

    # Log the action
    with open(LOG_FILE, "a", encoding="utf-8") as log:
        log.write(f"\n=== {datetime.now().isoformat()} ===\n")
        log.write(f"USER: {current_user_id}\n")
        log.write(f"  FROM: {session_file}\n")
        log.write(f"  TO:   {dest_path}\n")

    # Return info for the agent to use
    return {
        "user_id": current_user_id,
        "session_key": current_session_key,
        "session_file": str(session_file),
        "exported_file": str(dest_path),
        "label": session_info.get("origin", {}).get("label", "Unknown")
    }

# --------------------------------------------------------
if __name__ == "__main__":
    # Example usage - in reality the agent would call this with real data
    # current_user_id = "7465987048"  # Ben's ID
    # current_session_key = "agent:main:telegram:direct:7465987048"
    # result = handle_current_session(current_user_id, current_session_key)
    # print(result)
    pass