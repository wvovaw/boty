import { MyContext, MyConversation } from "./types.ts";
import { writeSpreadsheet } from "../googlesheet/sheet.ts";
import { mainMenu, mainMenuText } from "./markups/menus.ts";

export async function reportConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  await ctx.reply("Отправьте актив. (Отправьте точку, если нет активов)");
  const {
    msg: { text: m1 },
  } = await conversation.waitFor("message:text");
  if (["отмена", "cancel"].includes(m1.toLocaleLowerCase())) {
    await ctx.reply("Отправка отчёта отменена");
    return;
  }

  await ctx.reply("Отправьте деактив (Отправьте точку, если нет деактивов)");
  const {
    msg: { text: m2 },
  } = await conversation.waitFor("message:text");
  if (["отмена", "cancel"].includes(m2.toLocaleLowerCase())) {
    await ctx.reply("Отправка отчёта отменена. /report чтобы отправить отчёт");
    return;
  }
  if (m1 === "." && m2 === ".") {
    await ctx.reply("Отправка отчёта отменена. /report чтобы отправить отчёт");
    return;
  }
  await ctx.reply("...Идёт запись. Ожидайте.");

  const date = new Date()
    .toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
    .replaceAll("/", ".")
    .split(",")[0];

  if (m1 !== ".")
    await writeSpreadsheet("active", m1.split("\n"), ctx.session.city, date);
  if (m2 !== ".")
    await writeSpreadsheet("deactive", m2.split("\n"), ctx.session.city, date);
  // if (m1 !== ".")
  //   await ctx.reply(
  //     "Вы ввели следующие коды актив:" + JSON.stringify(m1.split("\n"))
  //   );
  // if (m2 !== ".")
  //   await ctx.reply(
  //     "Вы ввели следующие коды деактив:" + JSON.stringify(m2.split("\n"))
  //   );
  else
    await ctx.reply(
      "Отчёт принят и сохранён. /report чтобы отправить ещё один отчёт"
    );
  return;
}
