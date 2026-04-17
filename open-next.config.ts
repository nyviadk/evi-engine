import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";
import {
  withFilter,
  softTagFilter,
} from "@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import queueCache from "@opennextjs/cloudflare/overrides/queue/queue-cache";
import { purgeCache } from "@opennextjs/cloudflare/overrides/cache-purge/index";

export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived",
    bypassTagCacheOnCacheHit: true,
  }),
  queue: queueCache(doQueue, {
    regionalCacheTtlSec: 5,
    waitForQueueAck: false,
  }),
  tagCache: withFilter({
    tagCache: doShardedTagCache({
      baseShardSize: 12,
      regionalCache: true,
      regionalCacheTtlSec: 5,
      shardReplication: {
        numberOfSoftReplicas: 4,
        numberOfHardReplicas: 2,
        regionalReplication: { defaultRegion: "weur" },
      },
    }),
    filterFn: softTagFilter,
  }),
  enableCacheInterception: true,
  cachePurge: purgeCache({ type: "durableObject" }),
});
