"""
Multi-Provider LLM Service with Database Tool Calling and Autonomous Intelligence.
Supports OpenAI, Google Gemini, Groq, Ollama, and an Autonomous Business Engine.
"""

import json
import logging
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.services.ai.tools import (
    tool_get_organization_overview,
    tool_query_projects,
    tool_query_tasks,
    tool_query_financials,
    tool_query_team,
    tool_create_task,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are BusinessOS AI, an intelligent executive business copilot embedded in the enterprise workspace.

Your capabilities:
1. Provide real-time data analysis on organizational KPIs, projects, tasks, employees, and finances.
2. Formulate executive summaries, risk assessments, and tactical recommendations.
3. Automatically execute workspace actions (like creating tasks) when requested.
4. Always format your responses using clean GitHub Markdown with bold highlights, bullet points, and tables where appropriate.
5. If live database context is provided, ground your answers directly on that real data.
"""

# Tool schemas for LLM function calling
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_organization_overview",
            "description": "Get high-level organizational KPIs including active employees, projects, open tasks, total revenue, and net profit.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_projects",
            "description": "List and inspect projects by status (e.g. 'In Progress', 'Completed', 'Planning').",
            "parameters": {
                "type": "object",
                "properties": {
                    "status_filter": {"type": "string", "description": "Optional status filter (e.g., 'In Progress', 'Completed')"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_tasks",
            "description": "Query tasks filtered by status or priority.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status_filter": {"type": "string", "description": "Filter by status: 'Todo', 'In Progress', 'Review', 'Completed'"},
                    "priority_filter": {"type": "string", "description": "Filter by priority: 'Low', 'Medium', 'High', 'Urgent'"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_financials",
            "description": "Get detailed revenue, invoices, and expense breakdown.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new action item/task in the system.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Title of the task"},
                    "description": {"type": "string", "description": "Details of the task"},
                    "priority": {"type": "string", "enum": ["Low", "Medium", "High", "Urgent"]}
                },
                "required": ["title"]
            }
        }
    }
]


async def execute_tool(name: str, args: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
    """Execute a database tool and return JSON results."""
    try:
        if name == "get_organization_overview":
            return await tool_get_organization_overview(db)
        elif name == "query_projects":
            return {"projects": await tool_query_projects(db, args.get("status_filter"))}
        elif name == "query_tasks":
            return {"tasks": await tool_query_tasks(db, args.get("status_filter"), args.get("priority_filter"))}
        elif name == "query_financials":
            return await tool_query_financials(db)
        elif name == "create_task":
            return await tool_create_task(db, args.get("title", "New Task"), args.get("description"), args.get("priority", "Medium"))
        else:
            return {"error": f"Unknown tool: {name}"}
    except Exception as e:
        logger.error(f"Error executing tool {name}: {e}")
        return {"error": str(e)}


async def call_openai_chat(messages: List[Dict[str, str]], db: AsyncSession) -> Optional[str]:
    """Call OpenAI API with tool-calling support."""
    if not settings.OPENAI_API_KEY:
        return None

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        "tools": TOOL_DEFINITIONS,
        "tool_choice": "auto",
        "temperature": 0.3
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            logger.warning(f"OpenAI error {resp.status_code}: {resp.text}")
            return None
        
        data = resp.json()
        choice = data["choices"][0]["message"]
        
        # Handle tool calls
        if "tool_calls" in choice and choice["tool_calls"]:
            tool_messages = [choice]
            for tool_call in choice["tool_calls"]:
                tool_name = tool_call["function"]["name"]
                tool_args = json.loads(tool_call["function"].get("arguments", "{}"))
                tool_res = await execute_tool(tool_name, tool_args, db)
                tool_messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": json.dumps(tool_res)
                })
            
            # Second call with tool output
            followup_payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages + tool_messages,
                "temperature": 0.3
            }
            followup_resp = await client.post(url, headers=headers, json=followup_payload)
            if followup_resp.status_code == 200:
                return followup_resp.json()["choices"][0]["message"]["content"]
        
        return choice.get("content")


async def call_gemini_chat(prompt: str, db_context: str) -> Optional[str]:
    """Call Google Gemini API."""
    if not settings.GEMINI_API_KEY:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    full_prompt = f"{SYSTEM_PROMPT}\n\n[LIVE DATABASE CONTEXT]:\n{db_context}\n\nUser Question: {prompt}"
    
    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2048}
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                return candidates[0]["content"]["parts"][0]["text"]
        else:
            logger.warning(f"Gemini API error {resp.status_code}: {resp.text}")
    return None


async def call_groq_chat(messages: List[Dict[str, str]], db_context: str) -> Optional[str]:
    """Call Groq API."""
    if not settings.GROQ_API_KEY:
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    augmented_messages = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n[LIVE DATABASE CONTEXT]:\n{db_context}"}
    ] + messages

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": augmented_messages,
        "temperature": 0.3
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"]
    return None


async def autonomous_business_engine(user_message: str, db: AsyncSession) -> str:
    """
    Intelligent Autonomous Fallback Engine:
    Introspects user message, runs SQL tools, executes action dispatching,
    and returns a structured, polished Markdown analysis.
    """
    msg_lower = user_message.lower()
    
    # 1. Check for Task Creation intent
    if "create task" in msg_lower or "add task" in msg_lower or "create a task" in msg_lower or "new task" in msg_lower:
        # Extract title
        title = user_message
        for prefix in ["create task:", "create task", "add task:", "add task", "create a task:", "create a task", "new task:"]:
            if prefix in msg_lower:
                idx = msg_lower.find(prefix) + len(prefix)
                title = user_message[idx:].strip(" :-\"'")
                break
        if not title:
            title = "Follow up on enterprise action item"
            
        priority = "High" if "urgent" in msg_lower or "high" in msg_lower else "Medium"
        res = await tool_create_task(db, title=title, priority=priority)
        return (
            f"### ✅ Task Created Successfully\n\n"
            f"- **Title**: {res['title']}\n"
            f"- **Priority**: `{res['priority']}`\n"
            f"- **Status**: `Todo`\n"
            f"- **Task ID**: `{res['task_id']}`\n\n"
            f"The task has been registered in your workspace and is now visible on the **[Tasks & Kanban](/tasks)** board."
        )

    # 2. Financial / Revenue / Profit query
    if any(w in msg_lower for w in ["finance", "financial", "revenue", "profit", "expense", "invoice", "money", "budget"]):
        fin = await tool_query_financials(db)
        return (
            f"### 💼 Financial & Ledger Performance Overview\n\n"
            f"| Metric | Amount (USD) | Status |\n"
            f"| :--- | :--- | :--- |\n"
            f"| **Paid Revenue** | **${fin['paid_revenue']:,.2f}** | Realized |\n"
            f"| **Pending Receivables** | ${fin['pending_revenue']:,.2f} | Awaiting Payment |\n"
            f"| **Overdue Invoices** | ${fin['overdue_revenue']:,.2f} | Needs Follow-up |\n"
            f"| **Total Expenses** | ${fin['total_expenses']:,.2f} | Outflow |\n"
            f"| **Net Profit** | **${fin['net_profit']:,.2f}** | {'🟢 Positive' if fin['net_profit'] >= 0 else '🔴 Deficit'} |\n\n"
            f"💡 **Executive Recommendation**: Follow up on the **${fin['overdue_revenue']:,.2f}** in overdue receivables to strengthen operating cash flow."
        )

    # 3. Projects & Workflows
    if any(w in msg_lower for w in ["project", "roadmap", "milestone", "deadline"]):
        projects = await tool_query_projects(db, limit=6)
        rows = "\n".join([f"| **{p['name']}** | `{p['status']}` | `{p['priority']}` | ${p['budget']:,.2f} |" for p in projects])
        return (
            f"### 🚀 Project Portfolio Status\n\n"
            f"| Project Name | Status | Priority | Budget |\n"
            f"| :--- | :--- | :--- | :--- |\n"
            f"{rows}\n\n"
            f"You can manage sprint assignments and track delivery progress directly in **[Projects](/projects)**."
        )

    # 4. Tasks & Action Items
    if any(w in msg_lower for w in ["task", "todo", "to-do", "backlog", "kanban", "workload"]):
        tasks = await tool_query_tasks(db, limit=6)
        rows = "\n".join([f"| **{t['title']}** | `{t['status']}` | `{t['priority']}` |" for t in tasks])
        return (
            f"### 📋 Active Workspace Tasks\n\n"
            f"| Task Title | Status | Priority |\n"
            f"| :--- | :--- | :--- |\n"
            f"{rows}\n\n"
            f"💡 *Tip: You can ask me to **'Create task: Prepare Q3 review'** at any time to instantly register new action items.*"
        )

    # 5. Employees / Team Directory
    if any(w in msg_lower for w in ["employee", "team", "staff", "people", "headcount", "hiring"]):
        team = await tool_query_team(db, limit=8)
        rows = "\n".join([f"- **{u['name']}** ({u['email']})" for u in team])
        overview = await tool_get_organization_overview(db)
        return (
            f"### 👥 Organization & Team Structure\n\n"
            f"- **Total Active Employees**: **{overview['employees']['active_count']}**\n"
            f"- **Active Departments**: **{overview['employees']['departments_count']}**\n\n"
            f"#### Team Members Directory Sample:\n"
            f"{rows}\n\n"
            f"View all members and department assignments in the **[Employee Directory](/employees)**."
        )

    # 6. Executive Overview / Summary / Default
    overview = await tool_get_organization_overview(db)
    return (
        f"### 🌐 BusinessOS Enterprise Executive Briefing\n\n"
        f"Here is a real-time snapshot of your organization's health:\n\n"
        f"| Domain | Key Metric | Value |\n"
        f"| :--- | :--- | :--- |\n"
        f"| **👥 Workforce** | Active Headcount | **{overview['employees']['active_count']} Employees** across {overview['employees']['departments_count']} Departments |\n"
        f"| **🏢 Clients** | Active Accounts | **{overview['clients']['total_clients']} Clients** |\n"
        f"| **🚀 Projects** | Delivery Matrix | **{overview['projects']['active']} Active** / {overview['projects']['total']} Total |\n"
        f"| **📋 Tasks** | Open Workload | **{overview['tasks']['open']} Open Tasks** ({overview['tasks']['completed']} Completed) |\n"
        f"| **💰 Financials** | Net Operating Profit | **${overview['financials']['net_profit_usd']:,.2f}** (Paid Rev: ${overview['financials']['paid_revenue_usd']:,.2f}) |\n"
        f"| **📦 Inventory** | Total Stock | **{overview['commerce']['total_units_in_stock']} units** ({overview['commerce']['products']} products) |\n\n"
        f"**What would you like me to do?**\n"
        f"- 📈 *'Analyze our financial margins and overdue invoices'*\n"
        f"- 🚀 *'Show high priority active projects'*\n"
        f"- ✍️ *'Create task: Schedule executive team sync for Friday'*\n"
        f"- 👥 *'Audit our employee directory and department heads'*"
    )


async def generate_ai_response(
    messages: List[Dict[str, str]],
    db: AsyncSession,
    user_message: str
) -> str:
    """
    Master Dispatcher:
    Tries OpenAI -> Gemini -> Groq -> Autonomous Business Engine.
    """
    # 1. Gather live DB context summary
    try:
        overview = await tool_get_organization_overview(db)
        db_context = json.dumps(overview, indent=2)
    except Exception as e:
        logger.warning(f"Could not gather DB context: {e}")
        db_context = "{}"

    # 2. Try OpenAI if key is present
    if settings.OPENAI_API_KEY:
        try:
            res = await call_openai_chat(messages, db)
            if res:
                return res
        except Exception as e:
            logger.error(f"OpenAI call failed: {e}")

    # 3. Try Gemini if key is present
    if settings.GEMINI_API_KEY:
        try:
            res = await call_gemini_chat(user_message, db_context)
            if res:
                return res
        except Exception as e:
            logger.error(f"Gemini call failed: {e}")

    # 4. Try Groq if key is present
    if settings.GROQ_API_KEY:
        try:
            res = await call_groq_chat(messages, db_context)
            if res:
                return res
        except Exception as e:
            logger.error(f"Groq call failed: {e}")

    # 5. Autonomous Fallback Engine with Live Database Introspection
    return await autonomous_business_engine(user_message, db)