import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserSchema } from "@repo/validations/zod";
import { prisma } from "@repo/db/client";
const router = express.Router();

router.post("/signup", async (req, res) => {
  const parsed = UserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(404).json({
      message: "signup unsucessfull",
      error: parsed.error,
    });
  }
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  console.log("hash", hashedPassword);

  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: hashedPassword,
      },
    });
    return res.status(200).json({
      message: "Signed up sucessfully,Please signin",
      user: user,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "error signing up",
    });
  }
});

router.post("/signin", async (req, res) => {
  const parsed = UserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(404).json({
      message: "inva;idf ss",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: parsed.data?.email,
      },
    });

    if (!parsed.data?.password || !user?.password) {
      throw new Error("Missing password");
    }

    const isMatch = await bcrypt.compare(parsed.data.password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Credentails",
      });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_TOKEN!, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      message: "login successfull",
      token,
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({
      message: "error in signing in",
    });
  }
});
export default router;
