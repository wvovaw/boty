// run the bot locally
import { bot } from "./app/bot/bot.ts";

await bot.api.deleteWebhook();

bot.start();
