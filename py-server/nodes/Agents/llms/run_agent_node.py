from db.models import Node, Edge,Workflow
from sqlalchemy.orm import Session
from typing import Dict, Any
from db.syncDB import get_db
from langchain import hub
from langchain.agents import AgentExecutor,create_react_agent
from utils.get_credentails import get_credentials
from .get_llm import get_llm
from ..tools.tools import WEBSEARCH_TOOL

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

        node_data=node.data
        llm_name=node_data.get("llm","")
        prompt=node_data.get("prompt","")
        tools=node_data.get("tools","")
        print(f"node data",llm_name,prompt,tools)   
        
        credentials=get_credentials(node_id=node.id,cred_name=llm_name,user_id=user_id)
        if not credentials:
            node.status = "failed"
            db.commit()
            return {"status": "error", "message": f"Credentials not found for llm '{llm_name}'"}
        print("credentails",credentials)
        
        api_key = credentials.get("data", {}).get("api_key")

        if not api_key:
            node.status = "failed"
            db.commit()
            return {"status": "error", "message": "API key missing"}
        print("api  key",api_key)

        try:
            llm = get_llm(llm_name, api_key)
        except Exception as e:
            return {"status": "error", "message": " llm initialization failed"}


        available_tools = []
        #can add more
        if "websearch" in tools:
            available_tools.append(WEBSEARCH_TOOL)
        
        
        agent=create_react_agent(   
            llm=llm,
            tools=available_tools,
            prompt=prompt_template
        )
        
        agent_executor=AgentExecutor.from_agent_and_tools(
            agent=agent,
            tools=available_tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=5,
            early_stopping_method="generate",
        )
        
        agent_input = {"input": prompt, **(input_data or {})}
        try:
            response = agent_executor.invoke(agent_input)
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
            return {"status": "error", "message": " llm initialization failed"}


    except Exception as e:
        print(f"Error in agent node {node.id}: {e}")  # type: ignore
        return {"error": str(e)}
