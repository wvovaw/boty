import {
  Context,
  SessionFlavor,
} from "https://deno.land/x/grammy@v1.12.0/mod.ts";

import {
  Conversation,
  ConversationFlavor,
} from "https://deno.land/x/grammy_conversations@v1.0.3/mod.ts";

export interface SessionData {
  storage: Record<string, any>;
}
export type MyContext = Context &
  SessionFlavor<SessionData> &
  ConversationFlavor;

export type MyConversation = Conversation<MyContext>;

export interface MenuEntry {
  id: string;
  title: string;
  text: string;
}
