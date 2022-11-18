import {
  Menu,
  MenuRange,
} from "https://deno.land/x/grammy_menu@v1.1.2/menu.ts";

import { MyContext } from "./../types.ts";
import { mainMenuEntries } from "./mainMenuEntries.ts";
import { infoMenuEntries } from "./infoMenuEntries.ts";
import { buyMenuEntries } from "./buyMenuEntries.ts";
import { writePaymentData, getFreeKeyRow } from "../../googlesheet/sheet.ts";

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
          ctx.session.storage.itemId = item.id;
          ctx.session.storage.paymentText = item.text;
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
    .text("Оплатить", async (ctx) => {
      if (
        ctx.session.storage.paymentStatus != true &&
        ctx.session.storage.paymentStatus != undefined
      ) {
        const messageText = `<b>Ошибка инициализации платежа</b>\nПожалуйста, завершите вашу предыдущую транзакцию:\n${ctx.session.storage.paymentUrl}`;
        if (
          // BUG: Preventing a bug which crush an app if replacing message with the same text
          ctx.msg?.text !=
          messageText.replaceAll("<b>", "").replaceAll("</b>", "")
        )
          ctx.editMessageText(messageText, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          });
        return;
      }
      // Else: generate new invoice url, save it in session storage

      const { index, amount, trafic, city, key } = await getFreeKeyRow(
        ctx.session.storage.itemId
      );
      if (index == undefined) {
        ctx.reply(
          `<b>Ошибка</b>

В настоящий момент ключей по данному тарифу нет, выберите другой тариф или попробуйте позже.`,
          { parse_mode: "HTML" }
        );
        return;
      }
      ctx.session.storage.paymentStatus = false;
      ctx.session.storage.paymentUrl =
        "https://oplata.qiwi.com/form/?invoice_uid=aa0fa2bb-5452-47ca-9190-cd9c1a73718f";
      setTimeout(() => {
        // setUserIDInRow(String(ctx.from.id), 11);
        // TODO: create a task which will check  a payment status on qiwi side
        ctx.session.storage.paymentStatus = true;
        writePaymentData(ctx.from?.id, index, new Date(), amount);
        ctx.reply(
          `<b>Спасибо за покупку!</b>

Город: ${city}
Трафик: ${trafic} Гб
Стоимость: ${amount} руб.

Ваш ключ: ${key}

Инструкция по использованию в меню информация в главном меню.
В случае ошибки обратитесь в поддержку из главного меню.`,
          { parse_mode: "HTML" }
        );
        console.log("Transaction has been approved!");
      }, 10000);
      const messageText =
        ctx.session.storage.paymentText +
        `

<b>Перейдите по ссылке для оплаты:</b> ${ctx.session.storage.paymentUrl}

После оплаты нажмите на кнопку <b>Проверить оплату</b>. Если платёж прошёл, вы получите ключ.`;
      ctx.editMessageText(messageText, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    })
    .text("Проверить оплату", () => {
      const messageText =
        ctx.session.storage.paymentText +
        `

<b>Перейдите по ссылке для оплаты:</b> https://oplata.qiwi.com/form/?invoice_uid=aa0fa2bb-5452-47ca-9190-cd9c1a73718f

После оплаты нажмите на кнопку <b>Проверить оплату</b>. Если платёж прошёл, вы получите ключ.

Статус платежа: <b>${
          ctx.session.storage.paymentStatus ? "" : "НЕ "
        }ОПЛАЧЕНО</b>`;

      if (
        // BUG: Preventing a bug which crush an app if replacing message with the same text
        ctx.msg?.text !=
        messageText.replaceAll("<b>", "").replaceAll("</b>", "")
      )
        ctx.editMessageText(messageText, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
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
