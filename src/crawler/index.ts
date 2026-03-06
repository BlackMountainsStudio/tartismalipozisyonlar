import { crawlReddit, type RedditCrawlResult } from "./reddit";
import { crawlEksiSozluk, type EksiCrawlResult } from "./eksisozluk";
import { ConcurrencyLimiter } from "@/utils/rateLimiter";
import { createLogger } from "@/utils/logger";

const logger = createLogger("CrawlerOrchestrator");

export type CrawlResult = RedditCrawlResult | EksiCrawlResult;

interface CrawlJob {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchId: string;
  status: "pending" | "running" | "completed" | "failed";
  results: CrawlResult[];
  error?: string;
  retries: number;
}

const MAX_RETRIES = 3;
const visitedUrls = new Set<string>();

export class CrawlerOrchestrator {
  private queue: CrawlJob[] = [];
  private concurrencyLimiter: ConcurrencyLimiter;

  constructor(maxConcurrent = 2) {
    this.concurrencyLimiter = new ConcurrencyLimiter(maxConcurrent);
  }

  addJob(homeTeam: string, awayTeam: string, matchId: string): string {
    const jobId = `crawl-${matchId}-${Date.now()}`;
    this.queue.push({
      id: jobId,
      homeTeam,
      awayTeam,
      matchId,
      status: "pending",
      results: [],
      retries: 0,
    });
    logger.info(`Job added: ${jobId} for ${homeTeam} vs ${awayTeam}`);
    return jobId;
  }

  async processQueue(): Promise<Map<string, CrawlResult[]>> {
    const allResults = new Map<string, CrawlResult[]>();

    const promises = this.queue
      .filter((j) => j.status === "pending")
      .map((job) =>
        this.concurrencyLimiter.run(async () => {
          const results = await this.executeJob(job);
          allResults.set(job.matchId, results);
        })
      );

    await Promise.allSettled(promises);
    return allResults;
  }

  private async executeJob(job: CrawlJob): Promise<CrawlResult[]> {
    job.status = "running";
    logger.info(`Starting job: ${job.id}`);

    try {
      const [redditResults, eksiResults] = await Promise.allSettled([
        crawlReddit(job.homeTeam, job.awayTeam),
        crawlEksiSozluk(job.homeTeam, job.awayTeam),
      ]);

      const results: CrawlResult[] = [];

      if (redditResults.status === "fulfilled") {
        const fresh = redditResults.value.filter((r) => !visitedUrls.has(r.url));
        fresh.forEach((r) => visitedUrls.add(r.url));
        results.push(...fresh);
      } else {
        logger.warn(`Reddit crawl failed for job ${job.id}`, redditResults.reason);
      }

      if (eksiResults.status === "fulfilled") {
        const fresh = eksiResults.value.filter((r) => !visitedUrls.has(r.url));
        fresh.forEach((r) => visitedUrls.add(r.url));
        results.push(...fresh);
      } else {
        logger.warn(`Ekşi crawl failed for job ${job.id}`, eksiResults.reason);
      }

      job.results = results;
      job.status = "completed";
      logger.info(`Job completed: ${job.id}, ${results.length} results`);
      return results;
    } catch (err) {
      job.retries++;
      if (job.retries < MAX_RETRIES) {
        logger.warn(`Job ${job.id} failed, retrying (${job.retries}/${MAX_RETRIES})`);
        job.status = "pending";
        return this.executeJob(job);
      }
      job.status = "failed";
      job.error = err instanceof Error ? err.message : String(err);
      logger.error(`Job ${job.id} failed permanently`, err);
      return [];
    }
  }

  getJobStatus(jobId: string): CrawlJob | undefined {
    return this.queue.find((j) => j.id === jobId);
  }

  clearVisitedUrls(): void {
    visitedUrls.clear();
  }
}
