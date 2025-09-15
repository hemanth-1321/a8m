import express from "express";
import { authMiddleware } from "../middleware/middleware";
import { userCheck } from "../libs/userCheck";
import { client } from "@repo/redis/client";
import { prisma } from "@repo/db/client";

const router = express.Router();

router.post("/:workflowId", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { workflowId } = req.params;
  const { data } = req.body;
  console.log(data);
  if (!userId) {
    return res.status(404).json({
      message: "unAuthenticated",
    });
  }
  const user = await userCheck(userId);
  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }

  try {
    const workflow = await prisma.workflow.findUnique({
      where: {
        id: workflowId,
      },
      include: {
        Node: true,
        Edge: true,
      },
    });
    if (!workflow) {
      return res.status(400).json({
        message: "workflow not found",
      });
    }
    const nodes = workflow.Node;
    const edgess = workflow.Edge;

    const graph: any = {};
    const indegree: any = {};

    nodes.forEach((node) => {
      //   console.log("nodes foreach", node);
      ((graph[node.id] = []), (indegree[node.id] = 0));
    });

    edgess.forEach((edge) => {
      graph[edge.sourceNodeId].push(edge.targetNodeId);
      indegree[edge.targetNodeId]++;
    });
    const queue = [];
    const executionOrder = [];

    for (const nodeId in indegree) {
      if (indegree[nodeId] === 0) {
        //first node
        queue.push(nodeId);
      }
    }
    console.log("queue", queue);
    while (queue.length > 0) {
      const currentNode = queue.shift();
      executionOrder.push(currentNode);
      if (!currentNode) return;
      //   console.log("shifted", currentNode);

      graph[currentNode].forEach((neighborId: any) => {
        //points to the next node
        // console.log(currentNode, points to, neighborId);
        indegree[neighborId]--; //if indegree is 1 makes it 0
        if (indegree[neighborId] === 0) {
          queue.push(neighborId);
        }
      });
    }
    if (executionOrder.length !== nodes.length) {
      return res.status(500).json({ message: "Cycle detected in workflow" });
    }

    for (const nodeId of executionOrder) {
      const node = nodes.find((n) => n.id === nodeId);
      console.log("queud", node);
      if (node) {
        await client.rPush(
          "nodeQueue",
          JSON.stringify({
            ...node,
            workflowId,
            data,
          })
        );
      }
    }

    res.status(200).json({
      message: "execution started",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: "error hitting the webhook,Please try again",
    });
  }
});

router.get("/:workflowId", async (req, res) => {
  const { workflowId } = req.params;

  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId },
    });

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const credentials = await prisma.credentials.findMany({
      where: { userId: workflow.userId },
    });

    return res.status(200).json({
      ...workflow,
      credentials,
    });
  } catch (error) {
    console.error("Server error fetching workflow:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
