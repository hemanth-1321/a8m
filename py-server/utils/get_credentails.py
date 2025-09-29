from sqlalchemy.orm import Session
from db.syncDB import get_db
from db.models import  Node, Credentials
from uuid import UUID

def get_credentials(node_id: UUID, cred_name: str, user_id: str):
    print("user_id:", user_id)
    db: Session = next(get_db())
    try:
        # Optional: fetch the node if you want node-specific info
        node = db.query(Node).filter(Node.id == node_id).first()
        if not node:
            print(f"Node {node_id} not found")
            return None

        # 1️⃣ Check if credentials are in node.data
        node_creds = node.data.get("credentials") if node.data else None
        if node_creds and node_creds.get("type").lower() == cred_name.lower():
            print(f"Using credentials from node data for node {node_id}")
            return node_creds

        # 2️⃣ Query credentials directly by user_id + name
        credentials = (
            db.query(Credentials)
            .filter(Credentials.user_id == user_id)
            .filter(Credentials.name == cred_name)
            .first()
        )

        if not credentials:
            print(f"No {cred_name} credentials found for user {user_id}")
            return None

        print(f"Using credentials from DB for user {user_id},{credentials.data}")
        return {
            "id": str(credentials.id),
            "type": credentials.type,
            "data": credentials.data,
        }

    except Exception as e:
        print(f"Error fetching credentials for node {node_id}: {e}")
        return None
