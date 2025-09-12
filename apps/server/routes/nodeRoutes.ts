import express from "express";
import { authMiddleware } from "../middleware/middleware";
import { NodeSchema } from "@repo/validations/zod";
import { prisma } from "@repo/db/client";

const router = express.Router();

/**CRUD for nodes */

// Create Node
router.post("/create", authMiddleware, async (req, res) => {
  const parsedData = NodeSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ message: "Invalid inputs" });
  }

  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const node = await prisma.node.create({
      data: {
        title: parsedData.data.title,
        trigger: parsedData.data.trigger,
        workflowId: parsedData.data.workflowId,
        enabled: true,
      },
    });

    return res.status(200).json({ message: "Node created", node });
  } catch (error) {
    console.error("Error creating node", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get all Nodes
router.get("/", authMiddleware, async (req, res) => {
  try {
    const nodes = await prisma.node.findMany();
    return res.status(200).json(nodes);
  } catch (error) {
    console.error("Error fetching nodes", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get Node by ID
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const node = await prisma.node.findUnique({ where: { id } });
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }
    return res.status(200).json(node);
  } catch (error) {
    console.error("Error fetching node", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update Node
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const parsedData = NodeSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ message: "Invalid inputs" });
  }

  try {
    const node = await prisma.node.update({
      where: { id },
      data: parsedData.data,
    });

    return res.status(200).json({ message: "Node updated", node });
  } catch (error: any) {
    if (error.code === "P2025") {
      // Prisma record not found
      return res.status(404).json({ message: "Node not found" });
    }
    console.error("Error updating node", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Node
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.node.delete({ where: { id } });
    return res.status(200).json({ message: "Node deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Node not found" });
    }
    console.error("Error deleting node", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
