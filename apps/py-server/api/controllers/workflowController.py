from models.response import Http
from models.schema import workflowBase,ResponseModel,workflowresponse,WorkflowUpdateRequest,WorkflowResponse
from db.models import User,Workflow
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db.models import Workflow,Node,Edge
from uuid import UUID
from sqlalchemy.orm import joinedload
import uuid

def create_workflows(db: Session, workflow_data: workflowBase, user_id: str) -> ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="UnAuthorized",
                data=None
            )
        
        new_workflow = Workflow(
            title=workflow_data.title,
            enabled=True,
            trigger="Manual",
            user_id=user_id
        )
        
        db.add(new_workflow)
        db.commit()
        db.refresh(new_workflow)
        
        workflow_response = workflowresponse.model_validate(new_workflow)
        return ResponseModel(
            status=Http.StatusOk,
            message="workflow created succesfully",
            data=workflow_response
        )
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"data base error occrured:{str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occurred:{str(e)}",
            data=None
        )

def get_all_workflows(db:Session,user_id:str)->ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        user=db.query(User).filter(User.id==user_id).first()
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="user not found",
                data=None 
            )
        workflows=db.query(Workflow).filter(Workflow.user_id==user_id).all()
        response=[]
        for ws in workflows:
            response.append(workflowresponse.model_validate(ws))
        return ResponseModel(
            status=Http.StatusOk,
            message="Credentails fetched successfully",
            data=response
        )
    except SQLAlchemyError as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected exception occured {str(e)}",
            data=None
        )
        
        
def upadate_workflows(db:Session,user_id:str,workflow_id,workflow_data: workflowBase)->ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        user=db.query(User).filter(User.id==user_id).first()
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="user not found",
                data=None 
            )
        workflow=db.query(Workflow).filter(
            Workflow.id==workflow_id,
            Workflow.user_id==user_id
        ).first()
        if not workflow:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="workflow not found",
                data=None
            )
        update_data=workflow_data.model_dump(exclude_unset=True)
        for key,value in update_data.items():
            setattr(workflow,key,value)
        db.commit()
        db.refresh(workflow)

        return ResponseModel(
            status=Http.StatusOk,
            message="Workflow updated sucessfully",
            data=workflowresponse.model_validate(workflow)
        )            
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"database error occured {str(e)}",
            data=None
        )
    except Exception as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occured {str(e)}",
            data=None
        )
        
def delete_workflows(db:Session,user_id:str,workflow_id)->ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        user=db.query(User).filter(User.id==user_id).first()
        
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="User not found",
                data=None
            )
        workflow=db.query(Workflow).filter(Workflow.id==workflow_id,Workflow.user_id==user_id).first()
        if not workflow:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="workflow not found",
                data=None
            )
        db.delete(workflow)
        db.commit()
        return ResponseModel(
            status=Http.StatusOk,
            message="workflow delted successfully",
            data=None
        )
    
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occured: {str(e)}",
            data=None
        )
    except Exception as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An internal server error occured :{str(e)}",
            data=None
        )


def save_workflows(db: Session, user_id: str, workflow_id: UUID, updated_workflow: WorkflowUpdateRequest) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    
    try:
        # Check workflow exists and belongs to user
        workflow = db.query(Workflow).filter(
            Workflow.id == workflow_id, 
            Workflow.user_id == user_id
        ).first()
        
        if not workflow:
            return ResponseModel(status=Http.StatusNotFound, message="Workflow not found", data=None)
        
        # Update workflow fields
        workflow.title = updated_workflow.title
        workflow.enabled = updated_workflow.enabled  
        
        # Delete existing nodes and edges
        db.query(Node).filter(Node.workflow_id == workflow_id).delete()
        db.query(Edge).filter(Edge.workflow_id == workflow_id).delete()  
        
        created_nodes = {}
        
        # Create new nodes
        for node_data in updated_workflow.nodes:  
            node_id = str(node_data.id) if node_data.id else str(uuid.uuid4())
            
            new_node = Node(
                id=node_id,
                title=node_data.title,
                workflow_id=workflow_id,  
                trigger=node_data.trigger,
                enabled=node_data.enabled,
                data=node_data.data or {},
                position_x=node_data.position_x,
                position_y=node_data.position_y,
                type=node_data.type,
            )
            db.add(new_node)
            created_nodes[node_id] = new_node
        
        db.flush()  
        
        # Create new edges
        for edge_data in updated_workflow.edges:
            edge_id = str(edge_data.id) if edge_data.id else str(uuid.uuid4())
            
            source_id_str = str(edge_data.source_node_id)
            target_id_str = str(edge_data.target_node_id)
            
            # Validate source and target nodes exist
            if source_id_str not in created_nodes or target_id_str not in created_nodes:
                print(f"Warning: Edge {edge_id} references non-existent nodes: {source_id_str} -> {target_id_str}")
                continue
                
            new_edge = Edge(
                id=edge_id,
                workflow_id=workflow_id, 
                source_node_id=edge_data.source_node_id, 
                target_node_id=edge_data.target_node_id, 
            )
            db.add(new_edge)

        db.commit()

        workflow_nodes = db.query(Node).filter(Node.workflow_id == workflow_id).all()
        workflow_edges = db.query(Edge).filter(Edge.workflow_id == workflow_id).all()

        response_data = {
            "id": str(workflow.id),
            "title": workflow.title,
            "enabled": workflow.enabled,
            "user_id": str(workflow.user_id),
            "nodes": [
                {
                    "id": str(node.id),
                    "title": node.title,
                    "workflow_id": str(node.workflow_id),
                    "position_x": node.position_x,
                    "position_y": node.position_y,
                    "enabled": node.enabled,
                    "trigger": node.trigger,
                    "data": node.data,
                }
                for node in workflow_nodes  
            ],
            "edges": [
                {
                    "id": str(edge.id),
                    "workflow_id": str(edge.workflow_id),
                    "source_node_id": str(edge.source_node_id),
                    "target_node_id": str(edge.target_node_id),
                }
                for edge in workflow_edges                          
            ]
        }

        return ResponseModel(
            status=Http.StatusOk,
            message="Workflow updated successfully",
            data=response_data
        )

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {str(e)}")
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error: {str(e)}",
            data=None
        )
    except Exception as e:
        db.rollback()
        print(f"Unexpected error: {str(e)}")
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Unexpected error: {str(e)}",
            data=None
        )
            
            
        
         
           
    
    
def get_workflow(db: Session, user_id: str, workflow_id: UUID) -> ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="unauthorized",
            data=None
        )
    try:
        workflow = (
            db.query(Workflow)
            .options(joinedload(Workflow.nodes), joinedload(Workflow.edges))
            .filter(Workflow.id == workflow_id, Workflow.user_id == user_id)
            .first()
        )

        if not workflow:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="workflow not found",
                data=None
            )

        return ResponseModel(
            status=Http.StatusOk,
            message="workflow fetched successfully",
            data=WorkflowResponse.model_validate(workflow)  # nodes + edges auto included
        )
    except SQLAlchemyError as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Unexpected error occurred: {str(e)}",
            data=None
        )
