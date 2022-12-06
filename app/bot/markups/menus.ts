import {
  Menu,
  MenuRange,
} from "https://deno.land/x/grammy_menu@v1.1.2/menu.ts";

import { MyContext } from "./../types.ts";
import { mainMenuEntries } from "./mainMenuEntries.ts";
import { citiesMenuEntries } from "./citiesMenuEntries.ts";

/**
 * Main menu
 */
export const mainMenuText = `👋 Привет.
Я бот-помощник, помогаю отправлять отчёты
Нажмите 'отправить отчёт', выберите город и отправьте отчёт.
Для справки: /help
`;
export const citiesMenuText = "🏙️ Выберите город";

export const mainMenu = new Menu<MyContext>("Main");
mainMenu.dynamic(() => {
  const range = new MenuRange<MyContext>();
  for (const item of mainMenuEntries) {
    range.submenu(
      { text: item.title, payload: item.id }, // label and payload
      "Cities",
      (ctx) => {
        ctx.editMessageText(citiesMenuText);
      } // Target menu
    );
  }
  return range;
});

/**
 * Cities submenu
 */
export const citiesMenu = new Menu<MyContext>("Cities");
citiesMenu.dynamic(() => {
  const range = new MenuRange<MyContext>();
  let i = 0;
  for (const item of citiesMenuEntries) {
    range.submenu(
      { text: item.title, payload: item.id }, // label and payload
      "Report", // Target menu
      (ctx) => {
        ctx.session.city = item.title;
        ctx.editMessageText(
          `
Вы выбрали город ${ctx.session.city}
Для отмены введите \`cancel\`
        `,
          {
            disable_web_page_preview: true,
          }
        ); // Handler
      }
    );
    if (i === 3) {
      range.row();
      i = 0;
    } else i++;
  }
  range.row();
  range.back({ text: "🔙 Главная" }, (ctx) =>
    ctx.editMessageText(mainMenuText, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    })
  );
  return range;
});

/**
 * Report conversation view
 */

const reportView = new Menu<MyContext>("Report");
reportView.dynamic(async (ctx) => {
  await ctx.conversation.enter("report");
});

mainMenu.register(citiesMenu);
citiesMenu.register(reportView);
