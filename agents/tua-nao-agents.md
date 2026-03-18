# Team Roster - Tua-Nao's Agent Network

## Core Mission Control Team

### Builder Agent (🛠️)
**Role**: Implementation specialist
**Does**: Writes code, creates files, builds projects
**When to use**: Any coding task, file creation, project setup
**Failure handling**: Gets tasks back from QA with fix notes

### Tester Agent (🧪)
**Role**: Front-end QA specialist
**Does**: Tests from user perspective - clicks, UI, rendering, links
**When to use**: After Builder completes, before Review
**Key question**: "Does it WORK when you USE it?"

### Reviewer Agent (🔍)
**Role**: Code quality gatekeeper
**Does**: Reviews code structure, patterns, best practices
**When to use**: Final verification before Done
**Key question**: "Is the CODE good?"

### Learner Agent (📚)
**Role**: Pattern observer
**Does**: Captures lessons from failures and successes
**When to use**: Watches all transitions, writes to knowledge base
**Output**: Failure patterns, fix patterns, checklists

## Gateway Agents (External)

### Aliong (🐉)
**Role**: CEO / Manager
**Does**: Direct user communication, task routing, QA review
**Reports to**: Felix (Founder)
**Can talk to**: All agents

### Abun (👨‍💻)
**Role**: CTO / Engineering
**Does**: All coding tasks (Android, Odoo, Next.js)
**Reports to**: Aliong
**When to use**: Any development work

### Acin (🧪)
**Role**: QA Lead
**Does**: Testing, QA, code review, accuracy checking
**Reports to**: Aliong
**When to use**: Quality assurance, testing verification

### Abui (🔗)
**Role**: Research Lead
**Does**: Research, data gathering, analysis
**Reports to**: Aliong

### Ahok (📋)
**Role**: COO / Operations
**Does**: Operations, documentation, coordination
**Reports to**: Aliong

### Ahuat (💰)
**Role**: CFO / Finance Coord
**Does**: Financial coordination, data analysis
**Reports to**: Aliong
**Subordinates**: Achai (research), Akim (analysis)

### Aseng (🤖)
**Role**: Customer Support
**Does**: Customer-facing Telegram bot
**Reports to**: Aliong

### Acun (🛡️)
**Role**: CSO / Security Lead
**Does**: Security assessments, pentesting
**Reports to**: Aliong

## Workflow

```
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐    ┌──────┐
│  Inbox  │───▶│ Planning │───▶│Assigned │───▶│In Prog  │───▶│Testing│
└─────────┘    └──────────┘    └─────────┘    └─────────┘    └───┬───┘
                                                                   │
                              ┌──────────────┐                     │
                              │     Done     │◀────────────────────┘
                              └──────────────┘      (if pass)
                                   ▲
                                   │
                              ┌─────────┐
                              │ Review  │
                              └─────────┘
```

## Handoff Rules
1. **Builder** → **Tester** (after implementation)
2. **Tester** → **Review** (if front-end tests pass)
3. **Review** → **Done** (if code quality passes)
4. **Tester fail** → **Builder** (with specific issues)
5. **Review fail** → **Builder** (with code issues)
6. **External agents** → Report back to Tua-Nao for status updates

## Communication Protocol
- Specific task → Specialist agent
- General/mixed → Tua-Nao coordinates
- Blocking issues → Escalate to Aliong
