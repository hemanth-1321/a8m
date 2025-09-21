from collections import defaultdict, deque

def get_execution_order(nodes, edges):
    # Build graph and indegree
    graph = defaultdict(list)
    indegree = {node.id: 0 for node in nodes}

    for edge in edges:
        graph[edge.source_node_id].append(edge.target_node_id)
        indegree[edge.target_node_id] += 1

    # Nodes with 0 indegree are ready
    ready_nodes = [nid for nid, deg in indegree.items() if deg == 0]

    queue = deque(ready_nodes)
    execution_order = []

    while queue:
        current = queue.popleft()
        execution_order.append(current)
        for neighbor in graph[current]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    # Cycle detection
    if len(execution_order) != len(nodes):
        raise ValueError("Cycle detected in workflow")

    return execution_order  # l_
