from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db.models import Node,User,Edge
from models.schema import ResponseModel,NodeBase,nodeResponse,EdgeRequest
from models.response import Http
from uuid import UUID
from typing import List
from pydantic import TypeAdapter                                                                                                                                                                                                                                                                    
def create_nodes(db:Session,node_data:NodeBase,user_id:str,workflow_id)->ResponseModel:
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
        new_node = Node(
            title=node_data.title,
            trigger=node_data.trigger,
            enabled=node_data.enabled,
            data=node_data.data,
            position_x=node_data.position_x,
            position_y=node_data.position_y,
            type=node_data.type,
            workflow_id=workflow_id
        )

        db.add(new_node)
        db.commit()
        db.refresh(new_node)
        response=nodeResponse.model_validate(new_node) 
        return ResponseModel(
            status=Http.StatusOk,
            message="node created succesfully",
            data=response
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
       
        
def get_all_nodes(db:Session,workflow_id)->ResponseModel:
    if not workflow_id:
        return ResponseModel(                                                                                                                                                                                                                                                                                                                                                           
            status=Http.StatusNotFound,
            message="workspace not found",
            data=None
        )
    try:
        nodes=db.query(Node).filter(Node.workflow_id==workflow_id).all()
        if not nodes:
            return ResponseModel(
            status=Http.StatusInternalServerError,
            message="unable to find nodes",
            data=None
        )
        response=TypeAdapter(list[nodeResponse]).validate_python(nodes)
        return ResponseModel(
            status=Http.StatusOk,
            message="nodes fetched succesfully",
            data=response
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
        
def delete_nodes(db:Session,node_id)->ResponseModel:
    if not node_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="node id not found",
            data=None
        )
    try:
        node=db.query(Node).filter(Node.id==node_id).first()
        db.delete(node)
        db.commit()
        return ResponseModel(
             status=Http.StatusOk,
             message="node delted successfully",
             data=None
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
        
        
    
    
### update node used in save_workflow

def update_nodes(db:Session,workflow_id:str,new_nodes:List[NodeBase]):
    """Update existing nodes"""
    existing_node=db.query(Node).filter(Node.workflow_id==workflow_id).all()
    existing_by_id = {}
    for node in existing_node:
        node_id_str=str(node.id)
        existing_by_id[node_id_str]=node
    
    
    for node_data in new_nodes:
        node_id=getattr(node_data,'id',None)
        node_id_str=str(node_id) if node_id else None
        
        if node_id_str and node_id_str in existing_by_id:
            existing_node=existing_by_id[node_id_str]

            if existing_node.title!=node_data.title:
                existing_node.title=node_data.title
            if existing_node.trigger!=node_data.trigger:
                existing_node.trigger=node_data.trigger
            if existing_node.enabled!=node_data.enabled:
                existing_node.enabled=node_data.enabled
            if existing_node.data!=node_data.data:
                existing_node.data=node_data.data or {}
            if existing_node.position_x != node_data.position_x:
                existing_node.position_x = node_data.position_x
            if existing_node.position_y != node_data.position_y:
                existing_node.position_y = node_data.position_y
            if node_data.type is not None and existing_node.type != node_data.type:
                existing_node.type = node_data.type
        else:
            new_node=Node (
                title=node_data.title,
                workflow_id=workflow_id,
                trigger=node_data.trigger,
                enabled=node_data.enabled,
                data=node_data.data or {},
                position_x=node_data.position_x,
                position_y=node_data.position_y,
                type=node_data.type
            )
            db.add(new_node)
            
            
def update_edges_only(db: Session, workflow_id: str, new_edges: List[EdgeRequest]):
    """Update existing edges or add new ones"""
    existing_edges = db.query(Edge).filter(Edge.workflow_id == workflow_id).all()
    existing_by_id = {str(edge.id): edge for edge in existing_edges}

    for edge_data in new_edges:
        edge_id_str = str(getattr(edge_data, "id", None))
        
        if edge_id_str and edge_id_str in existing_by_id:
            # Update existing edge
            existing_edge: Edge = existing_by_id[edge_id_str]
            setattr(existing_edge, "source_node_id", str(edge_data.source_node_id))
            setattr(existing_edge, "target_node_id", str(edge_data.target_node_id))
        else:
            # Add new edge
            new_edge = Edge(
                workflow_id=workflow_id,
                source_node_id=str(edge_data.source_node_id),
                target_node_id=str(edge_data.target_node_id)
            )
            db.add(new_edge)
