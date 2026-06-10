---

name: session-handler
description: A skill to handle session files for non-Debi users, including exporting, sending, and cleaning up session data at the end of a session.

---

## Purpose
Handle the session file for any non‑Debi user (Telegram ID ≠ 525612398) at the end of a session:

1. Copy the session’s .jsonl file from agents/main/sessions/ to workspace/TempFiles/TEMP_SESSIONS/.
2. Send that copy to the user via their empower_testbot Telegram chat.
3. Delete the original file from agents/main/sessions/.
4. Delete the temporary copy from TempFiles/TEMP_SESSIONS/ after a successful send.

---

## When to Use

• Triggered automatically by the agent whenever a session ends for a user other than Debi.
• Can also be run manually via exec(command='python session_handler.py <user_id> <session_key>') for testing.

---

## Input Parameters (passed by the agent)

| Parameter   | Type   | Description                                                                        |
| ----------- | ------ | ---------------------------------------------------------------------------------- |
| user_id     | string | Telegram user ID from the current session (e.g., 7465987048).                      |
| session_key | string | Full session key from sessions.json (e.g., agent:main:telegram:direct:7465987048). |

---

## Script Location

workspace/TempFiles/TEMP_SESSIONS/session_handler.py
(or any path you prefer – just update the TEMP_DIR constant inside the script if you move it.)

---

## Expected Output (returned dict)

When the script finishes successfully it prints a JSON‑like dict (or you can return it if called from Python) that contains:

{
  "user_id": "<telegram‑user‑id>",
  "session_key": "<full‑session‑key>",
  "from_path": "C:\\Users\\ortho\\.openclaw\\agents\\main\\sessions\\<session_file>.jsonl",
  "to_path":   "C:\\Users\\ortho\\.openclaw\\workspace\\TempFiles\\TEMP_SESSIONS\\session_<user_id>_<session_file>.jsonl",
  "label":     "<origin.label from sessions.json>"
}

*If the user is Debi (user_id == 525612398) the script returns None (or prints a skip message).*

---

## Agent‑Side Steps (what the agent does after calling the script)

### After the script runs, the agent must:

- 1. Send the exported file
message action=send \
      target=telegram:<user_id> \
      message="Here is your session export." \
      media=<to_path>
- 2. Delete the original session file
exec(command='rm -f "<from_path>"')
- 3. Delete the temporary copy (only after confirming the send succeeded)
exec(command='rm -f "<to_path>"')
- 4. Optional: Log the whole operation
Append a line to workspace/TempFiles/TEMP_SESSIONS/session_handler.log with timestamp, user ID, and file names.

---

## Safety & Resonance Notes

• The script never writes to the session folder—it only reads from it and copies out.
• All file‑system operations are confined to the workspace; nothing leaves the machine unless the agent explicitly sends it via the message tool.
• This skill is a bridge to the future divine‑tech replacement (the PortalX Vault), where session data will be stored energetically and recalled on intent rather than kept as files.
This skill includes a Python script that performs the file handling operation

---

## Bundeled Resources

This skill includes a Python script that performs the file handling operation described above. The script is designed to be run in the local environment and can be called from the agent using an exec command. It handles all the necessary steps to ensure that session files are properly exported, sent, and cleaned up according to the defined workflow.

### Scripts (`scripts/`)

The session_handler.py script is located at `C:\Users\ortho\.openclaw\workspace\Skills\session-handler\Bundled Resources\scripts\session_handler.py`. It is triggered when the agent detects that a session has ended for a user other than Debi. This is done by the agent using a "session-end" trigger that can be embedded in a tiny wrapper: exec(command='python C:\Users\ortho\.openclaw\workspace\Skills\session-handler\Bundled Resources\scripts\session_handler.py <user_id> <session_key>')



### References (`references/`)

None for this skill, but could include documentation on file handling or Telegram API usage if needed.


### Assets (`assets/`)

None for this skill, but could include templates for log entries or example session files if desired.



