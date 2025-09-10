import { prisma } from "@repo/db/client";
import { CredentialSchema } from "@repo/validations/zod";
import express from "express";
import { authMiddleware } from "../middleware/middleware";
import type { Prisma } from "@prisma/client";

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  const userId = req.userId;

  if (!userId) return;

  const parsedData = CredentialSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(200).json({
      message: "invalid inputs",
      error: parsedData.error,
    });
  }

  try {
    const credentails = prisma.credentials.create({
      data: {
        name: parsedData.data.name,
        type: parsedData.data.type,
        data: parsedData.data.data as Prisma.InputJsonValue,
        userId,
      },
    });

    return res.status(200).json({
      message: "credentials added successfully",
      credentails,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: "error creating credentails",
    });
  }
});

export default router;
