import {
  Context,
  SessionFlavor,
} from "https://deno.land/x/grammy@v1.12.0/mod.ts";

export interface SessionData {
  storage: string[];
}
export type MyContext = Context & SessionFlavor<SessionData>;

export interface MenuEntry {
  id: string;
  title: string;
  text: string;
}
