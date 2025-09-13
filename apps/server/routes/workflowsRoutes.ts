import express from "express";
import { authMiddleware } from "../middleware/middleware";
import { userCheck } from "../libs/userCheck";
import { WorkflowCreateSchema } from "@repo/validations/zod";
import { prisma } from "@repo/db/client";

const router = express.Router();

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

router.get("/:id", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const { id } = req.params;

  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return res.status(404).json({ message: "workflow not found" });
    }

    res.status(200).json({ workflow });
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

export default router;
