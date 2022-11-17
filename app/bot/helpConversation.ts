import { MyContext, MyConversation } from "./types.ts";

export async function helpConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const {
    msg: { text },
  } = await conversation.waitFor("message:text");
  if (["отмена", "cancel"].includes(text.toLocaleLowerCase())) {
    await ctx.reply("Отменено.\nМожете продолжать: /start");
  } else {
    const userId = ctx?.from?.id;
    const username = ctx?.from?.username;
    const name = ctx?.from?.first_name + " " + ctx?.from?.last_name;
    await ctx.api.sendMessage(
      "-1001629487339", // Support channel group id
      `<b>Обращение в поддержку</b>
user_id: ${userId}
username: @${username}
name: ${name}
___
<b>${text}</b>
___
для связи: https://t.me/${username}
    `,
      { parse_mode: "HTML" }
    );
    await ctx.reply(
      "Спасибо за обращение.\nВаше сообщение было направлено модераторам. Они свяжутся с вами в ближайшее время.\nМожете продолжать: /start"
    );
  }
  return;
}
