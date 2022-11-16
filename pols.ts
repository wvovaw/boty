// run the bot locally
import { bot } from "./app/bot.ts";

await bot.api.deleteWebhook();

bot.start();
