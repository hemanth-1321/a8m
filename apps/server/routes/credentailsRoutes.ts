import { prisma } from "@repo/db/client";
import { CredentialSchema } from "@repo/validations/zod";
import express from "express";
import { authMiddleware } from "../middleware/middleware";
import type { Prisma } from "@prisma/client";
import { getCredentialsById } from "../libs/credentialChecker";
import { userCheck } from "../libs/userCheck";

const router = express.Router();

/**crud for credentails */

router.post("/create", authMiddleware, async (req, res) => {
  const userId = req.userId;

  if (!userId) return;

  const user = await userCheck(userId);

  if (user.status !== 200) {
    return res.status(user.status).json({ message: user.message });
  }
  console.log(req.body);
  const parsedData = CredentialSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(200).json({
      message: "invalid inputs",
      error: parsedData.error,
    });
  }

  try {
    const credentails = await prisma.credentials.create({
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

router.get("/get", authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId)
    return res.status(404).json({
      message: "Unauthenticated",
    });
  const user = await userCheck(userId);

  if (user.status !== 200) {
    return res.status(user.status).json({ message: user.message });
  }

  try {
    const credentails = await prisma.credentials.findMany({
      where: {
        userId,
      },
    });
    console.log("credentails", credentails);
    return res.status(200).json({
      credentails,
    });
  } catch (error) {
    console.log("error in get credentails", error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthenticated",
    });
  }

  const user = await userCheck(userId);

  if (user.status !== 200) {
    return res.status(user.status).json({ message: user.message });
  }

  try {
    const credentials = await prisma.credentials.findUnique({
      where: { id },
    });

    if (!credentials) {
      return res.status(404).json({
        message: "Credentials not found",
      });
    }

    await prisma.credentials.delete({
      where: { id: credentials.id },
    });

    return res.status(200).json({
      message: "Credentials deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting credentials:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.put("/update/:id", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  if (!userId)
    return res.status(404).json({
      message: "Unauthenticated",
    });

  const user = await userCheck(userId);

  if (user.status !== 200) {
    return res.status(user.status).json({ message: user.message });
  }

  try {
    const credentialsResponse = await getCredentialsById(id!);
    if (credentialsResponse.status !== 200) {
      return res.status(credentialsResponse.status).json({
        message: credentialsResponse.message,
      });
    }

    const credentials = credentialsResponse.data;
    const updatedCredentials = await prisma.credentials.update({
      where: {
        id: credentials?.id,
      },
      data: {
        data: req.body,
      },
    });
    return res.status(200).json({
      message: "Credentials updated successfully",
      data: updatedCredentials,
    });
  } catch (error) {
    console.error("Error updating credentials:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
export default router;
