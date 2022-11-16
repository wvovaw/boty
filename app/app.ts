import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { webhookCallback } from "../deps.deno.ts";
import { bot } from "./bot/bot.ts";

const app: Application = new Application();

// Logger middleware
app.use(async (ctx, next) => {
  await next();
  console.log(`${ctx.request.method} ${ctx.request.url}`);
});

// Routes
const router = new Router();
router.post(`/${bot.token}`, webhookCallback(bot, "oak"));
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
