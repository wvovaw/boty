import {
  Bot,
  session,
  GrammyError,
  HttpError,
} from "https://deno.land/x/grammy@v1.12.0/mod.ts";

import {
  type Conversation,
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations@v1.0.3/mod.ts";

import { SessionData, MyContext } from "./types.ts";
import { mainMenu, mainMenuText } from "./markups/menus.ts";
import { citiesMenu, citiesMenuText } from "./markups/menus.ts";
import { reportConversation } from "./reportConversation.ts";

export const bot = new Bot<MyContext>(
  Deno.env.get("TELEGRAM_API_KEY") as string
);

bot.use(
  session({
    initial(): SessionData {
      return { city: "" };
    },
  })
);

bot.use(conversations());
bot.use(createConversation(reportConversation, "report"));
bot.use(mainMenu);

bot.command("start", (ctx) =>
  ctx.reply(mainMenuText, {
    reply_markup: mainMenu,
    parse_mode: "HTML",
  })
);
bot.command("report", (ctx) =>
  ctx.reply(citiesMenuText, {
    reply_markup: citiesMenu,
    parse_mode: "HTML",
  })
);
bot.command("help", async (ctx) => {
  await ctx.reply(
    `
<b>Формат отправки кодов:</b>

Несколько кодов можно отправить в одном сообщении сразу. Каждый код на отдельной строке.
Пример:

abc123
321bcd
123112

- три кода, отправленные одним отчетом.
  `,
    { parse_mode: "HTML" }
  );
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
