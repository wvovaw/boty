import {
  Menu,
  MenuRange,
} from "https://deno.land/x/grammy_menu@v1.1.2/menu.ts";

import { MyContext } from "./types.ts";
import { mainMenuEntries } from "./menus/mainMenuEntries.ts";
import { infoMenuEntries } from "./menus/infoMenuEntries.ts";

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

mainMenu.register(infoMenu);
infoMenu.register(infoTextView);
