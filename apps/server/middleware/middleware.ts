import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(404).json({
      message: "unauthorized",
    });
  }
  const token = authHeader?.split(" ")[1];
  console.log("token", token);
  if (!token) {
    return res.status(400).json({
      error: "invalid token",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN!) as { id: string };
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("error in middleware", error);
    return res.status(500).json({
      error: "invalid or expired token",
    });
  }
};
