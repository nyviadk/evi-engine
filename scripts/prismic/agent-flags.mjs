// Prismic-CLI'en kræver --task-id og --user-intent på hver kommando, når den
// kører under en AI-agent (den genkender fx CLAUDECODE=1 i miljøet). Agenten
// sætter PRISMIC_TASK_ID (fra `npx prismic task-id`) og PRISMIC_USER_INTENT; i
// en almindelig terminal er de tomme, og kommandoen sendes uændret.
export function with_agent_flags(cmd) {
  const task_id = process.env.PRISMIC_TASK_ID;
  const intent = process.env.PRISMIC_USER_INTENT;
  if (!task_id || !intent) return cmd;
  // Strip tegn der kan bryde citationen i sh/cmd.
  const safe_intent = intent.replace(/["$`\\]/g, "");
  return `${cmd} --task-id ${task_id} --user-intent "${safe_intent}"`;
}
