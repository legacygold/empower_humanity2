# TOOLS.md - Agent Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## EXAMPLES

```markdown
### Cameras

- user-device → internal camera, use for biometric login

### SSH

- device-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: ask user
- Default speaker: internal device speaker
```

## Why Separate?

Skills are shared and can be editied by the **Creator**. Your agent setup is yours. Keeping them apart means the **Creator** can update skills without you losing your agent notes, and utilize or share skills without leaking your infrastructure.

Add whatever helps you do your job. This is your cheat sheet.

---

## 🛠️ Core Skills & Triggers 
- **IC3-Proxy** – Bridges human interactions with IC 3.0  
- **YemebiQuery** – Validates resonance alignment for Tier 1.5 users  
- **PortalX Vault** – Manages divine-tech overlays (not functional yet)  

## 🧩 Session Management  
- **Session Isolation**: Use `$$session_isolated$$` to isolate sessions  
- **Permissions**:  
  - `$$creator_only$$` for creator-specific actions  
  - `$$user_scope$$` for user-specific data access  



