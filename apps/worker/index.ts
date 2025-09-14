import { client } from "@repo/redis/client";

async function main() {
  while (true) {
    const item = await client.lPop("nodeQueue");
    if (item) {
      const nodeObj = JSON.parse(item);
      console.log("Popped:", nodeObj);
    }
  }
}

main();
