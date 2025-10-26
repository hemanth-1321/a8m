from db.models import Node
from sqlalchemy.orm import Session
from typing import Dict, Any
from db.syncDB import get_db
from langchain_classic import hub
from langchain.agents import create_agent
from utils.get_credentails import get_credentials
from .get_llm import get_llm
from ..tools.tools import WEBSEARCH_TOOL
import json
def run_agent_node(node: Node, input_data: Dict[str, Any], user_id) -> Dict[str, Any]:
    print("in the run agent")
    db: Session = next(get_db())

    prompt_template = hub.pull("hwchase17/react")

    try:
        node = db.query(Node).filter(Node.id == node.id).first()
        if not node:
            return {"error": "node not found"}

        node.status = "running"
        db.commit()

        node_data = json.loads(node.data) if isinstance(node.data, str) else (node.data or {})
        llm_name = node_data.get("llm", "")
        prompt = node_data.get("prompt", "")
        tools_list = node_data.get("tools", [])
        print(f"node data:", llm_name, prompt, tools_list)

        credentials = get_credentials(node_id=node.id, cred_name=llm_name, user_id=user_id)
        if not credentials:
            node.status = "failed"
            db.commit()
            return {"status": "error", "message": f"Credentials not found for llm '{llm_name}'"}

        api_key = credentials.get("data", {}).get("api_key")
        if not api_key:
            node.status = "failed"
            db.commit()
            return {"status": "error", "message": "API key missing"}

        try:
            llm = get_llm(llm_name, api_key)
        except Exception as e:
            node.status = "failed"
            db.commit()
            return {"status": "error", "message": f"LLM initialization failed: {e}"}

        available_tools = []
        if "websearch" in tools_list:
            available_tools.append(WEBSEARCH_TOOL)

        agent = create_agent(
            model=llm,
            # tools=available_tools
        )

      
        final_prompt = prompt_template.format(input=prompt, **input_data)

        agent_input = {"messages": [{"role": "user", "content": final_prompt}]}

        try:
            response = agent.invoke(agent_input)
            node.status = "completed"
            db.commit()

            print("Agent response:", response)

            return {
                "status": "success",
                "node_id": node.id,
                "output": response.get("output") or response.get("result"),
                "intermediate_steps": response.get("intermediate_steps", []),
                "raw_response": response,
            }
        except Exception as e:
            node.status = "failed"
            db.commit()
            return {"status": "error", "message": f"Agent invocation failed: {e}"}

    except Exception as e:
        print(f"Error in agent node {node.id}: {e}")
        return {"error ": str(e)}



