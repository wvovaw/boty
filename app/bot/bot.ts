import {
  Bot,
  session,
  GrammyError,
  HttpError,
} from "https://deno.land/x/grammy@v1.12.0/mod.ts";
import { SessionData, MyContext } from "./types.ts";
import { mainMenu, mainMenuText } from "./menus.ts";

Deno.env.set(
  "TELEGRAM_API_KEY",
  "5718100835:AAEi8_THMSeeJi4yEkPemyBZUM_wmjK9aE0"
);

export const bot = new Bot<MyContext>(
  Deno.env.get("TELEGRAM_API_KEY") as string
);

bot.use(
  session({
    initial(): SessionData {
      return { storage: [] };
    },
  })
);

bot.use(mainMenu);

bot.command("start", (ctx) =>
  ctx.reply(mainMenuText, { reply_markup: mainMenu })
);
bot.command("help", async (ctx) => {
  await ctx.reply("Send /start");
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});