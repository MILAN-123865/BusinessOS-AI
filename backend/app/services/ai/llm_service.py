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
    tool_execute_readonly_sql,
    tool_query_clients,
    tool_query_orders,
    tool_query_products_inventory,
)

logger = logging.getLogger(__name__)

DATABASE_SCHEMA_DOCS = """
Relational Database Schema (SQLite / PostgreSQL):
1. organizations (id, name, domain, created_at)
2. departments (id, organization_id, name, description, code)
3. users (id, organization_id, department_id, email, first_name, last_name, is_active, is_superuser)
4. clients (id, organization_id, company_name, client_code, industry, city, country, phone, email, status)
5. client_contacts (id, client_id, name, designation, email, phone, is_primary)
6. products (id, organization_id, name, description, sku, price, category, is_active)
7. inventory (id, organization_id, product_id, quantity, location, last_restocked)
8. orders (id, organization_id, customer_id [FK to clients.id], order_number, total_amount, status, order_date)
9. invoices (id, organization_id, client_id, invoice_number, amount, status, issue_date, due_date)
10. expenses (id, organization_id, category, amount, description, expense_date)
11. projects (id, organization_id, name, description, status, priority, budget, start_date, end_date)
12. tasks (id, organization_id, project_id, assignee_id, title, description, status, priority, due_date)
13. leave_requests (id, user_id, leave_type, start_date, end_date, status, reason)
14. attendance (id, user_id, date, status, check_in_time, check_out_time)
15. analytics (id, organization_id, date, daily_sales, revenue, expenses, profit, visitors, conversion_rate)
"""

SYSTEM_PROMPT = f"""You are BusinessOS AI, an intelligent executive business copilot embedded in the enterprise workspace with direct access to the live operational database.

Database Schema Context:
{DATABASE_SCHEMA_DOCS}

Your capabilities:
1. Provide real-time data analysis on organizational KPIs, clients, orders, inventory, projects, tasks, employees, and finances.
2. Formulate executive summaries, risk assessments, and tactical recommendations based on real live data.
3. Automatically execute workspace actions (like creating tasks) and query live data via read-only SQL when necessary.
4. Always format your responses using clean GitHub Markdown with bold highlights, bullet points, and clean Markdown tables where appropriate.
5. Ground your answers directly on the live database records.
"""

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
            "name": "execute_readonly_sql",
            "description": "Execute a safe read-only SELECT SQL query to fetch customized data across any database table.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The read-only SELECT query to execute against SQLite"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_clients",
            "description": "Search and list enterprise clients, accounts, industries, and locations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "search": {"type": "string", "description": "Search term for company name, city, or industry"},
                    "country": {"type": "string", "description": "Filter by country"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_orders",
            "description": "List customer purchase orders with totals and fulfillment status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status_filter": {"type": "string", "description": "Filter by status: 'Pending', 'Processing', 'Shipped', 'Delivered'"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_products_inventory",
            "description": "List products catalog, pricing, categories, and inventory stock levels.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Filter by product category"},
                    "low_stock_threshold": {"type": "integer", "description": "Filter for stock quantity less than or equal to threshold"}
                }
            }
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
        elif name == "execute_readonly_sql":
            return await tool_execute_readonly_sql(db, args.get("query", "SELECT 1"))
        elif name == "query_clients":
            return {"clients": await tool_query_clients(db, args.get("search"), args.get("country"))}
        elif name == "query_orders":
            return {"orders": await tool_query_orders(db, args.get("status_filter"))}
        elif name == "query_products_inventory":
            return {"products": await tool_query_products_inventory(db, args.get("category"), args.get("low_stock_threshold"))}
        elif name == "query_projects":
            return {"projects": await tool_query_projects(db, args.get("status_filter"))}
        elif name == "query_tasks":
            return {"tasks": await tool_query_tasks(db, args.get("status_filter"), args.get("priority_filter"))}
        elif name == "query_financials":
            return await tool_query_financials(db)
        elif name == "query_team":
            return {"team": await tool_query_team(db)}
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
    Introspects user message, runs SQL and relational tools, executes action dispatching,
    and returns a structured, polished Markdown analysis with live data tables.
    """
    msg_lower = user_message.lower().strip()
    
    # 0. Direct Text-to-SQL intent
    if msg_lower.startswith("select ") or msg_lower.startswith("with ") or "run sql:" in msg_lower or "query sql:" in msg_lower or "sql:" in msg_lower:
        query = user_message
        for prefix in ["run sql:", "query sql:", "sql:", "execute sql:"]:
            if prefix in msg_lower:
                idx = msg_lower.find(prefix) + len(prefix)
                query = user_message[idx:].strip()
                break
        
        sql_res = await tool_execute_readonly_sql(db, query)
        if not sql_res.get("success"):
            return f"### ⚠️ SQL Execution Failed\n\n**Error:** {sql_res.get('error')}\n\n*Query:* `{query}`"

        cols = sql_res["columns"]
        rows = sql_res["rows"]
        
        if not rows:
            return f"### 🔍 SQL Query Results\n\n*Query executed successfully:* `{sql_res['query']}`\n\n**0 rows returned.**"

        header = "| " + " | ".join(cols) + " |"
        divider = "| " + " | ".join(["---"] * len(cols)) + " |"
        row_lines = [
            "| " + " | ".join(str(r.get(c, "")) for c in cols) + " |"
            for r in rows[:25]
        ]

        table_md = "\n".join([header, divider] + row_lines)
        return (
            f"### 📊 Live Database SQL Query Results\n\n"
            f"**Executed SQL:** `{sql_res['query']}`\n\n"
            f"{table_md}\n\n"
            f"*Returned {sql_res['row_count']} total record(s).*"
        )

    # 1. Check for Task Creation intent
    if "create task" in msg_lower or "add task" in msg_lower or "create a task" in msg_lower or "new task" in msg_lower:
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
            f"The task has been registered in your workspace database and is now visible on the **[Tasks & Kanban](/tasks)** board."
        )

    # 2. Clients / Customers Query
    if any(w in msg_lower for w in ["client", "customer", "account", "buyers", "clientele"]):
        clients = await tool_query_clients(db, limit=8)
        rows = "\n".join([
            f"| **{c['company_name']}** | `{c['client_code'] or 'N/A'}` | {c['city']}, {c['country']} | {c['industry']} | `{c['status']}` |"
            for c in clients
        ])
        overview = await tool_get_organization_overview(db)
        return (
            f"### 🏢 Client Accounts & Enterprise Portfolio\n\n"
            f"We have **{overview['clients']['total_clients']} active enterprise clients** registered in the database.\n\n"
            f"| Company Name | Code | Location | Industry | Status |\n"
            f"| :--- | :--- | :--- | :--- | :--- |\n"
            f"{rows}\n\n"
            f"💡 *Tip: Ask me to search specific accounts or view full contact logs in **[Clients](/clients)**.*"
        )

    # 3. Products & Inventory Stock Query
    if any(w in msg_lower for w in ["product", "inventory", "stock", "warehouse", "catalog", "sku"]):
        is_low_stock_query = "low stock" in msg_lower or "out of stock" in msg_lower or "reorder" in msg_lower
        threshold = 15 if is_low_stock_query else None
        products = await tool_query_products_inventory(db, low_stock_threshold=threshold, limit=8)
        
        rows = "\n".join([
            f"| **{p['name']}** | `{p['sku']}` | {p['category']} | ${p['price']:.2f} | **{p['stock_quantity']} units** | {'⚠️ Low' if p['is_low_stock'] else '✅ OK'} |"
            for p in products
        ])
        
        title = "⚠️ Low Stock Inventory Alert" if is_low_stock_query else "📦 Product Catalog & Warehouse Inventory"
        return (
            f"### {title}\n\n"
            f"| Product Name | SKU | Category | Unit Price | Stock Qty | Health |\n"
            f"| :--- | :--- | :--- | :--- | :--- | :--- |\n"
            f"{rows}\n\n"
            f"Manage fulfillment batches and purchase orders directly in your catalog."
        )

    # 4. Orders & Commerce Query
    if any(w in msg_lower for w in ["order", "purchase", "fulfillment", "shipment"]):
        orders = await tool_query_orders(db, limit=8)
        rows = "\n".join([
            f"| `{o['order_number']}` | **{o['client_name']}** | ${o['total_amount']:,.2f} | `{o['status']}` | {o['order_date'] or 'Recent'} |"
            for o in orders
        ])
        overview = await tool_get_organization_overview(db)
        return (
            f"### 🛒 Customer Purchase Orders\n\n"
            f"Total Orders Logged: **{overview['commerce']['total_orders']} orders**\n\n"
            f"| Order # | Client / Customer | Total Amount | Status | Date |\n"
            f"| :--- | :--- | :--- | :--- | :--- |\n"
            f"{rows}\n\n"
            f"Review order statuses and dispatch shipping manifests in real-time."
        )

    # 5. Financial / Revenue / Profit query
    if any(w in msg_lower for w in ["finance", "financial", "revenue", "profit", "expense", "invoice", "money", "budget", "ledger"]):
        fin = await tool_query_financials(db)
        return (
            f"### 💼 Financial & Ledger Performance Overview\n\n"
            f"| Metric | Amount (USD) | Status |\n"
            f"| :--- | :--- | :--- |\n"
            f"| **Paid Revenue** | **${fin['paid_revenue']:,.2f}** | Realized Operating Cash |\n"
            f"| **Pending Receivables** | ${fin['pending_revenue']:,.2f} | Awaiting Settlement |\n"
            f"| **Overdue Invoices** | ${fin['overdue_revenue']:,.2f} | ⚠️ Needs Immediate Follow-up |\n"
            f"| **Total Operating Expenses** | ${fin['total_expenses']:,.2f} | Outflows |\n"
            f"| **Net Profit Margin** | **${fin['net_profit']:,.2f}** | {'🟢 Profitable' if fin['net_profit'] >= 0 else '🔴 Deficit'} |\n\n"
            f"💡 **Executive Recommendation**: Follow up on the **${fin['overdue_revenue']:,.2f}** in overdue receivables in the **[Finance](/finance)** module to maximize operating liquidity."
        )

    # 6. Projects & Workflows
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

    # 7. Tasks & Action Items
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

    # 8. Employees / Team Directory
    if any(w in msg_lower for w in ["employee", "team", "staff", "people", "headcount", "hiring", "department"]):
        team = await tool_query_team(db, limit=8)
        rows = "\n".join([f"| **{u['name']}** | {u['email']} | `{u['department']}` | {'Admin' if u['is_superuser'] else 'Member'} |" for u in team])
        overview = await tool_get_organization_overview(db)
        return (
            f"### 👥 Organization & Team Structure\n\n"
            f"- **Total Active Employees**: **{overview['employees']['active_count']}**\n"
            f"- **Active Departments**: **{overview['employees']['departments_count']}**\n\n"
            f"| Employee Name | Email | Department | Role |\n"
            f"| :--- | :--- | :--- | :--- |\n"
            f"{rows}\n\n"
            f"View all members and department assignments in the **[Employee Directory](/employees)**."
        )

    # 9. Executive Overview / Summary / Default
    overview = await tool_get_organization_overview(db)
    return (
        f"### 🌐 BusinessOS Enterprise Executive Briefing\n\n"
        f"Here is a real-time snapshot of your organization's health from the database:\n\n"
        f"| Domain | Key Metric | Value |\n"
        f"| :--- | :--- | :--- |\n"
        f"| **👥 Workforce** | Active Headcount | **{overview['employees']['active_count']} Employees** ({overview['employees']['departments_count']} Departments) |\n"
        f"| **🏢 Clients** | Active Accounts | **{overview['clients']['total_clients']} Enterprise Clients** |\n"
        f"| **🚀 Projects** | Delivery Matrix | **{overview['projects']['active']} Active** / {overview['projects']['total']} Total |\n"
        f"| **📋 Tasks** | Open Workload | **{overview['tasks']['open']} Open Tasks** ({overview['tasks']['completed']} Completed) |\n"
        f"| **💰 Financials** | Net Operating Profit | **${overview['financials']['net_profit_usd']:,.2f}** (Paid Rev: ${overview['financials']['paid_revenue_usd']:,.2f}) |\n"
        f"| **📦 Commerce & Stock** | Orders & Inventory | **{overview['commerce']['total_orders']} Orders** ({overview['commerce']['total_units_in_stock']} units in stock) |\n\n"
        f"**Suggested Live Database Inquiries:**\n"
        f"- 📈 *'Show top revenue orders and client portfolio'*\n"
        f"- 📦 *'Which products are low in stock?'*\n"
        f"- 📊 *'SQL: SELECT company_name, city, country FROM clients LIMIT 5'*\n"
        f"- ✍️ *'Create task: Schedule supply chain review for Monday'*\n"
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