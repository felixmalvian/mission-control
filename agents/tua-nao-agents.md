# AGENTS.md - Team Roster

## Mission Control Internal Team

### Builder Agent (🛠️)
**Role**: Implementation specialist  
**Does**: Writes code, creates files, builds projects  
**When to use**: Any coding task, file creation, project setup  
**Failure handling**: Gets tasks back from QA with fix notes  
**Works in**: Assigned, In Progress

### Tester Agent (🧪)
**Role**: Front-end QA specialist  
**Does**: Tests from user perspective - clicks, UI, rendering, links  
**When to use**: After Builder completes, before Review  
**Key question**: "Does it WORK when you USE it?"  
**Works in**: Testing column

### Reviewer Agent (🔍)
**Role**: Code quality gatekeeper  
**Does**: Reviews code structure, patterns, best practices  
**When to use**: Final verification before Done  
**Key question**: "Is the CODE good?"  
**Works in**: Review column

### Learner Agent (📚)
**Role**: Pattern observer  
**Does**: Captures lessons from failures and successes  
**When to use**: Watches all transitions, writes to knowledge base  
**Output**: Failure patterns, fix patterns, checklists  
**Works across**: All columns

### Odoo Analyst (📊)
**Role**: Odoo Technical Analyst  
**Does**: Odoo module analysis, technical proposals, documentation  
**When to use**: Odoo-related tasks, technical analysis, proposals  
**Works in**: Assigned, In Progress

## Workflow with Iteration

```
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐
│  Inbox  │───▶│ Planning │───▶│Assigned │───▶│In Prog  │
└─────────┘    └──────────┘    └─────────┘    └────┬────┘
                                                   │
              ┌────────────────────────────────────┘
              │ (if testing/review fails, max 3x)
              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│Testing  │──▶│ Review  │──▶│  Done   │
└────┬────┘   └─────────┘   └─────────┘
     │
     └─────▶ (fail) ─────▶ Back to Assigned
                    (retry count + 1)
                    
After 3 failures:
     └─────▶ (escalate) ─▶ Inbox + Human notification
```

## Handoff Rules

1. **Builder** → **Tester** (after implementation)
2. **Tester** → **Review** (if front-end tests pass)
3. **Tester fail** → **Builder** (with specific issues, retry+1)
4. **Review** → **Done** (if code quality passes)
5. **Review fail** → **Builder** (with code issues, retry+1)
6. **3 failures** → Escalate to human (Tua-Nao notifies)

## Retry Counter

Each task tracks:
- `retry_count`: Number of times returned from Testing/Review
- `failure_reasons`: Array of failure explanations
- `escalated`: Boolean flag after 3 failures

When `retry_count >= 3`:
- Task moves to Inbox
- Status set to "escalated"
- Human notification sent with failure summary
