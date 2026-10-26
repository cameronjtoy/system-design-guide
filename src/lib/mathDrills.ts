import type { NumberQuestion } from '../content/quizzes/types'
import { formatNumber, type QuizItem } from './quiz'

// Back-of-the-envelope drills with fresh numbers every time. Each drill links
// to the principle that teaches the method.

interface Drill {
  kind: string
  label: string
  category: string
  slug: string
  make: (pick: <T>(list: readonly T[]) => T) => NumberQuestion
}

const fmt = formatNumber
const SECONDS_PER_DAY = 86_400

export const DRILLS: Drill[] = [
  {
    kind: 'qps',
    label: 'Requests per second',
    category: 'foundations',
    slug: 'back-of-the-envelope-estimation',
    make: (pick) => {
      const dau = pick([2e6, 5e6, 10e6, 20e6, 50e6, 100e6, 200e6])
      const perUser = pick([5, 10, 20, 30, 50])
      const answer = (dau * perUser) / SECONDS_PER_DAY
      return {
        type: 'number',
        q: `An app has ${fmt(dau)} daily active users, each making ${perUser} requests a day. What's the average request rate?`,
        answer,
        unit: 'requests/s',
        tolerance: 0.2,
        explain: `${fmt(dau)} × ${perUser} = ${fmt(dau * perUser)} requests/day. A day has 86,400 s (round to 10⁵ for mental math), so ≈ ${fmt(answer)} requests/s. Peak is often 2–3× the average.`,
      }
    },
  },
  {
    kind: 'peak-qps',
    label: 'Peak traffic',
    category: 'foundations',
    slug: 'back-of-the-envelope-estimation',
    make: (pick) => {
      const daily = pick([100e6, 300e6, 500e6, 1e9, 2e9, 5e9])
      const factor = pick([2, 3, 5])
      const avg = daily / SECONDS_PER_DAY
      const answer = avg * factor
      return {
        type: 'number',
        q: `A service handles ${fmt(daily)} requests a day, and peak traffic is ${factor}× the average. What request rate must it handle at peak?`,
        answer,
        unit: 'requests/s',
        tolerance: 0.2,
        explain: `Average = ${fmt(daily)} ÷ 86,400 ≈ ${fmt(avg)} requests/s. Peak = ${factor} × ${fmt(avg)} ≈ ${fmt(answer)} requests/s.`,
      }
    },
  },
  {
    kind: 'storage',
    label: 'Storage growth',
    category: 'foundations',
    slug: 'back-of-the-envelope-estimation',
    make: (pick) => {
      const perDay = pick([1e6, 5e6, 10e6, 50e6, 100e6])
      const kb = pick([1, 2, 5, 10, 100])
      const years = pick([1, 3, 5])
      const tb = (perDay * kb * 1e3 * 365 * years) / 1e12
      return {
        type: 'number',
        q: `Users create ${fmt(perDay)} records a day at about ${kb} KB each. How much storage do you need for ${years} year${years > 1 ? 's' : ''}, before replication?`,
        answer: tb,
        unit: 'TB',
        tolerance: 0.2,
        explain: `${fmt(perDay)} × ${kb} KB = ${fmt((perDay * kb) / 1e6)} GB/day. × 365 × ${years} ≈ ${fmt(tb)} TB (using 1 TB = 10⁹ KB).`,
      }
    },
  },
  {
    kind: 'bandwidth',
    label: 'Bandwidth',
    category: 'foundations',
    slug: 'back-of-the-envelope-estimation',
    make: (pick) => {
      const qps = pick([1_000, 5_000, 10_000, 20_000, 50_000])
      const kb = pick([10, 50, 100, 200, 500])
      const gbps = (qps * kb * 1e3 * 8) / 1e9
      return {
        type: 'number',
        q: `A service returns ${fmt(qps)} responses per second, averaging ${kb} KB each. How much outbound bandwidth does it need?`,
        answer: gbps,
        unit: 'Gbit/s',
        tolerance: 0.2,
        explain: `${fmt(qps)} × ${kb} KB = ${fmt((qps * kb) / 1e3)} MB/s. Multiply by 8 for bits: ≈ ${fmt(gbps)} Gbit/s.`,
      }
    },
  },
  {
    kind: 'downtime',
    label: 'Downtime budget',
    category: 'foundations',
    slug: 'availability-and-the-nines',
    make: (pick) => {
      const availability = pick([99, 99.5, 99.9, 99.95, 99.99])
      const period = pick(['month', 'year'] as const)
      const minutes = period === 'month' ? 30 * 24 * 60 : 365 * 24 * 60
      const answer = (minutes * (100 - availability)) / 100
      return {
        type: 'number',
        q: `A service has a ${availability}% availability target. How many minutes of downtime does that allow per ${period}?`,
        answer,
        unit: 'minutes',
        tolerance: 0.1,
        explain: `A ${period} has about ${fmt(minutes)} minutes${period === 'month' ? ' (30 days)' : ''}. ${fmt(100 - availability)}% of that is ≈ ${fmt(answer)} minutes.`,
      }
    },
  },
  {
    kind: 'serial-availability',
    label: 'Availability of dependencies',
    category: 'foundations',
    slug: 'availability-and-the-nines',
    make: (pick) => {
      const a = pick([99.9, 99.95, 99.99])
      const n = pick([2, 3, 4, 5])
      const answer = Math.pow(a / 100, n) * 100
      return {
        type: 'number',
        q: `A request must succeed in ${n} services in a row, each ${a}% available. Roughly what is the availability of the whole request, in percent?`,
        answer,
        unit: '%',
        tolerance: 0.0005,
        explain: `Serial dependencies multiply: ${a / 100}^${n} ≈ ${(answer / 100).toFixed(5)}, so ≈ ${answer.toFixed(3)}%. Each extra dependency in the chain lowers availability.`,
      }
    },
  },
  {
    kind: 'servers',
    label: 'Servers needed',
    category: 'scaling',
    slug: 'vertical-vs-horizontal-scaling',
    make: (pick) => {
      const peak = pick([10_000, 25_000, 50_000, 100_000, 200_000])
      const perServer = pick([500, 1_000, 2_000, 5_000])
      const utilization = pick([0.5, 0.6, 0.7])
      const answer = Math.ceil(peak / (perServer * utilization))
      return {
        type: 'number',
        q: `Peak load is ${fmt(peak)} requests/s. One server handles ${fmt(perServer)} requests/s, and you want servers at most ${utilization * 100}% busy at peak. How many servers?`,
        answer,
        unit: 'servers',
        tolerance: 0.1,
        explain: `Usable capacity per server = ${fmt(perServer)} × ${utilization} = ${fmt(perServer * utilization)} requests/s. ${fmt(peak)} ÷ ${fmt(perServer * utilization)} ≈ ${answer} servers (round up, then add spares for failures).`,
      }
    },
  },
  {
    kind: 'littles-law',
    label: "Concurrency (Little's law)",
    category: 'foundations',
    slug: 'latency-vs-throughput',
    make: (pick) => {
      const qps = pick([500, 1_000, 2_000, 5_000, 10_000])
      const ms = pick([20, 50, 100, 200, 500])
      const answer = (qps * ms) / 1000
      return {
        type: 'number',
        q: `A service receives ${fmt(qps)} requests/s and each takes ${ms} ms. On average, how many requests are in flight at once?`,
        answer,
        unit: 'requests',
        tolerance: 0.1,
        explain: `Little's law: concurrency = arrival rate × time in system = ${fmt(qps)} × ${ms / 1000} s = ${fmt(answer)}. That's how many threads, connections or slots you need.`,
      }
    },
  },
  {
    kind: 'cache-memory',
    label: 'Cache size',
    category: 'caching',
    slug: 'caching-strategies',
    make: (pick) => {
      const items = pick([10e6, 50e6, 100e6, 500e6])
      const hot = pick([0.1, 0.2])
      const kb = pick([0.5, 1, 2, 5])
      const gb = (items * hot * kb * 1e3) / 1e9
      return {
        type: 'number',
        q: `You have ${fmt(items)} items averaging ${kb} KB, and the hottest ${hot * 100}% serve most reads. How much memory to cache the hot set?`,
        answer: gb,
        unit: 'GB',
        tolerance: 0.2,
        explain: `${fmt(items)} × ${hot} = ${fmt(items * hot)} items × ${kb} KB ≈ ${fmt(gb)} GB, before cache overhead (often 20–50% extra).`,
      }
    },
  },
  {
    kind: 'replication',
    label: 'Replicated storage',
    category: 'data',
    slug: 'replication',
    make: (pick) => {
      const raw = pick([50, 100, 200, 500])
      const rf = pick([2, 3])
      const headroom = pick([0.3, 0.5])
      const answer = raw * rf * (1 + headroom)
      return {
        type: 'number',
        q: `You store ${raw} TB of data with a replication factor of ${rf}, and want ${headroom * 100}% free space for growth. How much raw disk do you need?`,
        answer,
        unit: 'TB',
        tolerance: 0.1,
        explain: `${raw} TB × ${rf} copies = ${raw * rf} TB. Add ${headroom * 100}% headroom: ${raw * rf} × ${1 + headroom} = ${fmt(answer)} TB.`,
      }
    },
  },
  {
    kind: 'shards',
    label: 'Shard count',
    category: 'data',
    slug: 'sharding-and-partitioning',
    make: (pick) => {
      const writes = pick([20_000, 50_000, 100_000, 200_000])
      const perShard = pick([2_000, 5_000, 10_000])
      const answer = Math.ceil(writes / perShard)
      return {
        type: 'number',
        q: `Your database must absorb ${fmt(writes)} writes/s, and one shard comfortably handles ${fmt(perShard)} writes/s. What's the minimum number of shards?`,
        answer,
        unit: 'shards',
        tolerance: 0.1,
        explain: `${fmt(writes)} ÷ ${fmt(perShard)} = ${answer} shards. In practice, pick more logical shards than machines (e.g. 256) so you can rebalance without re-splitting data.`,
      }
    },
  },
  {
    kind: 'llm-tokens',
    label: 'LLM token throughput',
    category: 'ai-infra',
    slug: 'llm-inference-basics',
    make: (pick) => {
      const rps = pick([50, 100, 200, 500, 1_000])
      const out = pick([200, 300, 500, 800])
      const perGpu = pick([1_000, 2_000, 3_000])
      const tokens = rps * out
      const answer = Math.ceil(tokens / perGpu)
      return {
        type: 'number',
        q: `An LLM endpoint gets ${fmt(rps)} requests/s, each generating ${out} output tokens. If one GPU sustains about ${fmt(perGpu)} output tokens/s with batching, how many GPUs do you need?`,
        answer,
        unit: 'GPUs',
        tolerance: 0.15,
        explain: `${fmt(rps)} × ${out} = ${fmt(tokens)} output tokens/s. ÷ ${fmt(perGpu)} per GPU ≈ ${answer} GPUs, before headroom and prefill cost.`,
      }
    },
  },
  {
    kind: 'kv-cache',
    label: 'KV cache memory',
    category: 'ai-infra',
    slug: 'kv-cache-and-paged-attention',
    make: (pick) => {
      const mbPerToken = pick([0.125, 0.25, 0.5])
      const ctx = pick([2_000, 4_000, 8_000])
      const seqs = pick([16, 32, 64])
      const answer = (mbPerToken * ctx * seqs) / 1000
      return {
        type: 'number',
        q: `A model's KV cache takes ${mbPerToken} MB per token. How much GPU memory do ${seqs} concurrent sequences of ${fmt(ctx)} tokens need for KV cache alone?`,
        answer,
        unit: 'GB',
        tolerance: 0.15,
        explain: `${mbPerToken} MB × ${fmt(ctx)} tokens = ${fmt(mbPerToken * ctx)} MB per sequence. × ${seqs} sequences ≈ ${fmt(answer)} GB. This is why KV memory limits batch size.`,
      }
    },
  },
]

/** Builds one fresh question from a drill. */
export function makeDrill(drill: Drill, random: () => number = Math.random): QuizItem {
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(random() * list.length)]
  return { id: `gen:${drill.kind}`, question: drill.make(pick), slug: drill.slug, category: drill.category }
}
