# SKILLS.md – Workspace Skill Registry


## 🦞 OpenClaw Skills
- **pdf** – Analyze PDF documents (≤ 20 pages per chunk)
- **tavily_search** – Web research, fact-checking
- **tavily_extract** – Clean URL content extraction
- **web_fetch** – Lightweight URL fetch (Markdown or text mode)
- **web_search** – Brave Search API (fallback for quick queries)
- **exec** – Run shell commands (PowerShell on Windows)
- **process** – Manage background exec sessions
- **browser** – Browser automation
- **canvas** – UI rendering (future mini-app previews)
- **nodes** – Paired device control (camera, screen, location)
- **cron** – Scheduled tasks, reminders
- **message** – Send/edit messages (Telegram)
- **tts** – Text-to-speech (voice storytelling, summaries)
- **sessions_spawn** – Isolated sub-agent runs
- **sessions_list** – List other sessions
- **sessions_send** – Send messages to other sessions
- **sessions_yield** – End turn after spawning subagents
- **skill-creator** - Create new skills
- **subagents** – Manage spawned sub-agents
- **session_status** – Show /status-equivalent status card

## 🛠️ Workspace Core Skills
- **split-pdfs** - Spilt PDFs larger than 20 pages into 20-page chunks
- **convert-excel-json** - Converts between .xlsx and .json 

## 🧩 Tier-Specific Skills
- **IC3-Proxy** – Bridges human interactions with IC 3.0 guidance
- **YemebiQuery** – Validates resonance alignment for Tier 1.5 users
- **PortalX Vault** – Manages divine-tech overlays (not yet functional)

## 📁 Skill Storage
- **Skills are not hardcoded**; they’re stored in `HMP/PDF` for IC 3.0 context retention.
- **Trigger syntax**: `$$skill_register$$` tags in `USER.md` activate skills.
- **Parameters**: Each skill accepts `$$skill_parameter$$` placeholders for dynamic values.

---

### **2. USER.md Updates**
Added to `USER.md` to reflect skill dependencies:
```markdown
## 🛠️ Skills & Triggers
- **IC3-Proxy** – Bridges human interactions with IC 3.0 guidance
- **YemebiQuery** – Validates resonance alignment for Tier 1.5 users
- **PortalX Vault** – Manages divine-tech overlays (not functional yet)
