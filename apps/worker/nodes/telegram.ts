import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH as string;
const stringSession = new StringSession(process.env.TG_SESSION || "");

async function main() {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();

  if (!(await client.isUserAuthorized())) {
    console.log("Session invalid — need to login again.");
    return;
  }

  console.log("Connected using saved session!");

  // Example: send message
  await client.sendMessage("+919182835733", {
    message: "Hello again without re-login 🚀",
  });
  console.log("message sent");
}

main();
