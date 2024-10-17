export const delay = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

export const typing = async (provider, ctx, ms): Promise<void> => {
  const refProvider = await provider.getInstance();
  const jid = ctx.key.remoteJid;

  await delay(300);
  await refProvider.sendPresenceUpdate("composing", jid);
  await delay(ms);
  await refProvider.sendPresenceUpdate("available", jid);
};

export const sendReaction = async (provider: any, ctx: any, emoji: string = "🤖"): Promise<void> => {
  const id = ctx.key.remoteJid;

  const reactionMessage = {
    react: {
      text: emoji,
      key: ctx.key,
    },
  };

  const abc = await provider.getInstance();
  await abc.sendMessage(id, reactionMessage);
};
