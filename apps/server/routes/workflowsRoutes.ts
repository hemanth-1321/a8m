import express from "express";
import { authMiddleware } from "../middleware/middleware";
import { userCheck } from "../libs/userCheck";
import { WorkflowCreateSchema } from "@repo/validations/zod";
import { prisma } from "@repo/db/client";

const router = express.Router();

interface NodeInput {
  id?: string;
  title: string;
  workflowId: string;
  trigger: "WebHook" | "Manual" | "Cron"; //
  enabled: boolean;
  data: Record<string, any>;
  positionX: number;
  positionY: number;
}

interface EdgeInput {
  id?: string;
  workflowId: string;
  sourceNodeId: string;
  targetNodeId: string;
}

/**
 * crud for workflows
 */

router.post("/create", authMiddleware, async (req, res) => {
  const parsedData = WorkflowCreateSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ message: "invalid inputs" });
  }

  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const user = await userCheck(userId);
  if (user.status !== 200) {
    return res.status(user.status).json({ message: user.message });
  }

  try {
    const workflow = await prisma.workflow.create({
      data: {
        title: parsedData.data.title,
        enabled: true,
        trigger: parsedData.data.trigger,
        userId,
      },
    });
    res.status(200).json({
      message: "workflow created successfully",
      workflow,
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  try {
    const workflows = await prisma.workflow.findMany({ where: { userId } });
    res.status(200).json({ workflows });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const parsedData = WorkflowCreateSchema.partial().safeParse(req.body); // allow partial updates
  if (!parsedData.success) {
    return res.status(400).json({ message: "invalid inputs" });
  }

  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  try {
    const updated = await prisma.workflow.updateMany({
      where: { id, userId },
      data: parsedData.data,
    });

    if (updated.count === 0) {
      return res
        .status(404)
        .json({ message: "workflow not found or not yours" });
    }

    res.status(200).json({ message: "workflow updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  try {
    const deleted = await prisma.workflow.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      return res
        .status(404)
        .json({ message: "workflow not found or not yours" });
    }

    res.status(200).json({ message: "workflow deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
  }
});

//nodes postendpoint
router.post("/:id", authMiddleware, async (req, res) => {
  const workflowId = req.params.id;
  const { title, enabled, nodes, edges } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await userCheck(userId);
  if (user.status !== 200) {
    return res.status(user.status).json({ message: user.message });
  }

  try {
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        title,
        enabled,
        Node: {
          deleteMany: { workflowId }, // Delete existing nodes
          create: nodes.map((n: any) => ({
            id: n.id,
            title: n.title,
            trigger: n.trigger,
            enabled: n.enabled,
            data: n.data,
            positionX: n.positionX,
            positionY: n.positionY,
          })),
        },
        Edge: {
          deleteMany: { workflowId }, // Delete existing edges
          create: edges.map((e: any) => ({
            id: e.id,
            sourceNodeId: e.sourceNodeId,
            targetNodeId: e.targetNodeId,
          })),
        },
      },
      include: {
        Node: true,
        Edge: true,
      },
    });

    res.status(200).json(updatedWorkflow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update workflow", error });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  const workflowId = req.params.id;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const user = await userCheck(userId);
  if (user.status !== 200) {
    return res.status(user.status).json({ message: user.message });
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
    return res.status(200).json({
      workflow,
    });
  } catch (error) {
    console.log("error in workflow get", error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});

export default router;
