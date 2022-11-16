import {
  Bot,
  GrammyError,
  HttpError,
  InlineKeyboard,
} from "https://deno.land/x/grammy@v1.12.0/mod.ts";

export const bot = new Bot(Deno.env.get("TELEGRAM_API_KEY") as string);

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

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("ping", (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`));
