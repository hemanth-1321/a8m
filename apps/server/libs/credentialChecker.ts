import { prisma } from "@repo/db/client";

export async function getCredentialsById(id: string) {
  try {
    const credentials = await prisma.credentials.findUnique({
      where: {
        id,
      },
    });

    if (!credentials) {
      return {
        status: 404,
        message: "Credentials not found",
      };
    }

    return {
      status: 200,
      data: credentials,
    };
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
}
