---
name: split-pdfs
description: This skill enables the agent to analyze PDF documents by splitting them into manageable chunks of 20 pages or fewer, allowing for efficient processing and context retention.
---

# split-pdfs Overview

This skill is part of the Workspace Core Skills and is designed to handle PDF documents that exceed the 20-page limit for analysis. By splitting larger PDFs into smaller chunks, the agent can effectively analyze and extract relevant information without losing context. This skill is used specifically in empower_testbot isolated sessions by users who are NOT the "Main User/Creator" (Debi) in conjunction with the PDF viewer in chats or the EmpowerAIR Telegram mini-app, allowing users to upload PDFs and have them processed for context enrichment during conversations. The split chunks are temporary and are NOT stored in the workspace, ensuring that user-uploaded PDFs remain secure and private. The agent should use a consistent naming convention for the chunks (e.g., `originalfilename_chunk1.pdf`, `originalfilename_chunk2.pdf`, etc.) to maintain clarity and organization during processing, and should ensure that the original PDF is not modified or stored in the workspace unless explicitly authorized by the Creator. The chunks should be created in a temporary directory and then sent to the empower_testbot chat with the user before deleted from the temporary directory after the files are sent to the chat to maintain workspace cleanliness.

---

## When to use this skill

If a user uploads a PDF document to the empower_testbot isolated session chat or to a group chat that empower_testbot belongs to that exceeds 20 pages, the agent should ask the user if they want to invoke the split-pdfs skill to create manageable chunks for analysis. This allows the agent to retain context and extract relevant information effectively without overwhelming the processing capabilities. The skill should be used in conjunction with the PDF viewer in chats or the EmpowerAIR Telegram mini-app to provide users with a seamless experience when working with larger PDF documents.

---

#### Bundled Resources

These are the resources included with the split-pdfs skill to facilitate its functionality:

##### Scripts (`scripts/`)

Use `split_pdfs.py` located at `Skills/split-pdfs/Bundled Resources/scripts/split_pdfs.py` to split PDF documents into chunks of 20 pages or fewer. This script takes an input PDF and temporarily stores it in a directoryat `C:\Users\ortho\.openclaw\workspace\TempFiles\Imported_Files`. It then splits it into the specified chunk size, and saves the chunks temporarily in the directory at `C:\Users\ortho\.openclaw\workspace\TempFiles\Exported_Files` so they can be sent to the user in the empower_testbot isolated session chat. Once the chunks are sent, the original file and chunks are deleted from the the two `TempFiles` directories to maintain workspace cleanliness. The script ensures that the original PDF remains unmodified and that the chunks are named consistently for easy identification during analysis and deleted from the TempFiles directory when no longer needed.


##### References (`references/`)

None at this time.


##### Assets (`assets/`)

None at this time.



