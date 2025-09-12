import { prisma } from "@repo/db/client";

export async function userCheck(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { status: 404, message: "User not found" };
    }

    return { status: 200, data: user };
  } catch (error) {
    console.error("Error in userCheck:", error);
    return { status: 500, message: "Internal server error" };
  }
}
