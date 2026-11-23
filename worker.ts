// Worker-indgang: OpenNext genererer kun en fetch-handler, så cron-jobbet
// (Evi Stats-arkivet) lægges på her. https://opennext.js.org/cloudflare/howtos/custom-worker
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- .open-next findes kun efter build; deploy:clean sletter den før typecheck
// @ts-ignore `.open-next/worker.js` genereres ved build
import { default as handler } from "./.open-next/worker.js";
import { archive_stats } from "./src/lib/analytics/archive";

export default {
  fetch: handler.fetch,
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(archive_stats(env));
  },
} satisfies ExportedHandler<CloudflareEnv>;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- .open-next findes kun efter build; deploy:clean sletter den før typecheck
// @ts-ignore `.open-next/worker.js` genereres ved build
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
