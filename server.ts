import app from "./app/app.ts";
const PORT = Deno.env.get("PORT");
await app.listen({ port: Number(PORT) || 3000 });
