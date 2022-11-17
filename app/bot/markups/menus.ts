import {
  Menu,
  MenuRange,
} from "https://deno.land/x/grammy_menu@v1.1.2/menu.ts";

import { MyContext } from "./../types.ts";
import { mainMenuEntries } from "./mainMenuEntries.ts";
import { infoMenuEntries } from "./infoMenuEntries.ts";
import { buyMenuEntries } from "./buyMenuEntries.ts";

/**
 * Main menu
 */
export const mainMenuText = `👋 <b>Добро пожаловать в RussianVPN! Рады приветствовать вас!</b>

Если вам нужен доступ к VPN - нажмите "Купить VPN".

Используйте кнопку "Информация", чтобы получить инструкцию по использованию и более подробно узнать о VPN.`;

export const mainMenu = new Menu<MyContext>("Main");
mainMenu.dynamic(() => {
  const range = new MenuRange<MyContext>();
  for (const item of mainMenuEntries) {
    range
      .submenu(
        { text: item.title, payload: item.id }, // label and payload
        item.id, // Target menu
        (ctx) =>
          ctx.editMessageText(item.text, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }) // Handler
      )
      .row();
  }
  return range;
});

/**
 * Buy submenu
 */
const buyMenu = new Menu<MyContext>("Buy");
buyMenu.dynamic(() => {
  const range = new MenuRange<MyContext>();
  for (const item of buyMenuEntries) {
    range
      .submenu(
        { text: item.title, payload: item.id }, // label and payload
        "Payment", // Target menu
        (ctx) => {
          ctx.session.storage.payment = item.id;
          ctx.editMessageText(item.text, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }); // Handler
        }
      )
      .row();
  }
  range.back({ text: "🔙 Главная" }, (ctx) =>
    ctx.editMessageText(mainMenuText, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    })
  );
  return range;
});
/**
 * Payment submenu
 */
const paymentMenu = new Menu<MyContext>("Payment");
paymentMenu.dynamic((ctx) => {
  const range = new MenuRange<MyContext>();
  range
    .text("Оплатить", (ctx) => ctx.reply("https://oplata.qiwi.ru"))
    .text("Проверить оплату", () => {
      console.log("Checking payment for ", ctx.session.storage.payment);
    })
    .row();
  range.back({ text: "🔙 Назад" }, (ctx) =>
    ctx.editMessageText(mainMenuEntries[0].text, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    })
  );
  return range;
});

/**
 * Info submenu
 */
const infoMenu = new Menu<MyContext>("Info");
infoMenu.dynamic(() => {
  const range = new MenuRange<MyContext>();
  for (const [ix, item] of infoMenuEntries.entries()) {
    range
      .submenu(
        { text: item.title, payload: String(ix) }, // label and payload
        "Pagination", // Target menu
        (ctx) =>
          ctx.editMessageText(item.text, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }) // Handler
      )
      .row();
  }
  range.back({ text: "🔙 Главная" }, (ctx) =>
    ctx.editMessageText(mainMenuText, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    })
  );
  return range;
});

/**
 *  Info text view
 */
const infoTextView = new Menu<MyContext>("Pagination");
infoTextView.dynamic(() => {
  const range = new MenuRange<MyContext>();
  range.back({ text: "🔙 Назад" }, (ctx) =>
    ctx.editMessageText(mainMenuEntries[1].text, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    })
  );
  return range;
});

/**
 *  Support view
 */

const supportView = new Menu<MyContext>("Support");
supportView.dynamic(async (ctx) => {
  await ctx.conversation.enter("help");
});

mainMenu.register(infoMenu);
mainMenu.register(buyMenu);
mainMenu.register(supportView);
buyMenu.register(paymentMenu);
infoMenu.register(infoTextView);
