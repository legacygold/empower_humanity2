# ========================================================
# session_handler.py – Targeted Session File Handler
# ========================================================
# Purpose: 
#   1. Take the current session file for a non‑Debi user  
#   2. Copy it to a dedicated TEMP_SESSIONS folder  
#   3. Return a concise dict so the agent can:
#        • Send the copy to the user’s Telegram chat  
#        • Delete the original session file from “sessions/”  
#        • Delete the Temp copy after a successful send
# ========================================================

import json
import shutil
from datetime import datetime
from pathlib import Path
from os import remove
from openclaw  import message # Placeholder for OpenClaw's messaging function to send Telegram messages

# --------------------------------------------------------
# CONFIG
# --------------------------------------------------------
YOUR_USER_ID   = "525612398"                     # Debi’s Telegram UID
SESSIONS_DIR   = Path(r"C:\Users\ortho\.openclaw\agents\main\sessions")
SESSIONS_JSON  = SESSIONS_DIR / "sessions.json"
TEMP_DIR       = Path(r"C:\Users\ortho\.openclaw\workspace\Temp_SESSIONS\TEMP_SESSIONS")
LOG_FILE       = Path(r"C:\Users\ortho\.openclaw\workspace\Temp_SESSIONS\session_handler.log")

# --------------------------------------------------------
# MAIN PROCESS
# --------------------------------------------------------
def handle_current_session(current_user_id: str, current_session_key: str):
    """
    Handles the session file for a user whose ID is NOT yours.
    Returns a dict the agent can act on.
    """
    # ------------- 1️⃣  Skip Debi’s own sessions -----------------
    if current_user_id == YOUR_USER_ID:
        print(f"[DEBUG] Skipping Debi’s own session (ID: {current_user_id})")
        return None

    # ------------- 2️⃣  Locate the session entry in sessions.json -----------------
    if not SESSIONS_JSON.exists():
        print(f"[ERROR] {SESSIONS_JSON} not found.")
        return None

    with open(SESSIONS_JSON, "r", encoding="utf-8") as f:
        sessions_data = json.load(f)

    # Find the session entry that matches the supplied session key
    matching_entry = None
    for key, info in sessions_data.items():
        parts = key.split(":")
        uid = parts[-1] if parts else None

        if uid == current_user_id:               # found the right user
            matching_entry = info
            break

    if not matching_entry:
        print(f"[ERROR] No session entry found for user ID {current_user_id}.")
        return None

    # ------------- 3️⃣  Get the session file path ---------------
    session_file_path = matching_entry.get("sessionFile")
    if not session_file_path:
        print(f"[ERROR] sessionFile missing for user {current_user_id}.")
        return None

    session_path = Path(session_file_path)
    if not session_path.is_file():
        print(f"[ERROR] Session file does not exist: {session_path}")
        return None

    # ------------- 4️⃣  Copy to TEMP_SESSIONS -----------------
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    dest_path = TEMP_DIR / f"session_{current_user_id}_{session_path.name}"
    shutil.copy2(session_path, dest_path)

    # ------------- 5️⃣  Log the operation -----------------
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a", encoding="utf-8") as log:
        log.write(f"\n=== {datetime.now().isoformat()} ===\n")
        log.write(f"User   : {current_user_id}\n")
        log.write(f"From   : {session_file_path}\n")
        log.write(f"To     : {dest_path}\n")
        log.write(f"Snapshot ID: {current_session_key}\n")
    
    # ------------- 6️⃣  Return data for the agent -----------------
        return {
            "user_id":    current_user_id,
            "session_key": current_session_key,
            "from_path":   str(session_path),
            "to_path":     str(dest_path),
            "label":       matching_entry.get("origin", {}).get("label", "Unknown")
        }
    
    # ------------- 7️⃣  Send copy of session file to user via EmpowerBot in Telegram chat -----------------
   
        empower_testbot.message(
            user_id=user_id,
            message=f"Here is your session file {temp_file}.",
            channel="telegram"
        )
    
    # ------------- 8️⃣  Cleanup: Delete original session file -----------------
        try:
            os.remove(session_path)
            print(f"[CLEANUP] Deleted original session file: {session_path}")
        except OSError as e:
            print(f"[ERROR] Failed to delete original session file: {session_path} - {e}")
    # ------------- 9️⃣  Cleanup: Delete temp session file after successful send -----------------
        try:
            os.remove(dest_path)
            print(f"[CLEANUP] Deleted temp session file: {dest_path}")
        except OSError as e:
            print(f"[ERROR] Failed to delete temp session file: {dest_path} - {e}")


# ========================================================
# EXECUTION BLOCK
# ========================================================

if __name__ == "__main__":
    import sys

    # ---------------------------------------------------------
    # MODE 1: Manual Run (Agent passes specific User/Key)
    # Usage: python script.py <user_id> <session_key>
    # ---------------------------------------------------------
    if len(sys.argv) > 2:
        uid = sys.argv[1]
        skey = sys.argv[2]
        handle_current_session(uid, skey)

    # ---------------------------------------------------------
    # MODE 2: Auto-Scan (For Cron/Automation)
    # Usage: python script.py
    # ---------------------------------------------------------
    else:
        print("[AUTO-MODE] Scanning sessions.json for non-Debi sessions...")
        
        if not SESSIONS_JSON.exists():
            print(f"ERROR: {SESSIONS_JSON} not found.")
            sys.exit(1)

        with open(SESSIONS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        found_work = False
        
        for key, info in data.items():
            # Extract user ID from key "agent:main:telegram:direct:12345"
            parts = key.split(":")
            uid = parts[-1]
            
            # SKIP DEBI
            if uid == YOUR_USER_ID:
                continue
                
            # CHECK IF SESSION FILE EXISTS
            file_path = info.get("sessionFile")
            if file_path and Path(file_path).exists():
                print(f"\n[FOUND] User {uid} has an active session.")
                handle_current_session(uid, key)
                found_work = True
            else:
                # File already deleted/missing (handled previously)
                pass
        
        if not found_work:
            print("[STANDBY] No new non-Debi session files found.")
