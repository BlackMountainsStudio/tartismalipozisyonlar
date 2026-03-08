import Snoowrap from "snoowrap";
import { createLogger } from "@/utils/logger";
import { RateLimiter } from "@/utils/rateLimiter";
import { CONTROVERSY_KEYWORDS_TR, CONTROVERSY_KEYWORDS_EN, buildSearchQueries } from "@/utils/keywords";

const logger = createLogger("RedditCrawler");

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  permalink: string;
  subreddit: string;
  createdAt: Date;
}

export interface RedditCrawlResult {
  source: "reddit";
  url: string;
  content: string;
  comments: RedditComment[];
}

function createRedditClient(): Snoowrap {
  return new Snoowrap({
    userAgent: "football-ai-platform/1.0",
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });
}

const FOOTBALL_SUBREDDITS = [
  "superlig",
  "FenseBahce",
  "galatasaray",
  "besiktas",
  "soccer",
  "football",
];

const ALL_KEYWORDS = [...CONTROVERSY_KEYWORDS_TR, ...CONTROVERSY_KEYWORDS_EN];

export async function crawlReddit(
  homeTeam: string,
  awayTeam: string,
  maxResults = 50
): Promise<RedditCrawlResult[]> {
  const rateLimiter = new RateLimiter(10, 60_000);
  const results: RedditCrawlResult[] = [];

  let reddit: Snoowrap;
  try {
    reddit = createRedditClient();
  } catch (err) {
    logger.error("Failed to create Reddit client", err);
    return results;
  }

  const searchTerms = [
    `${homeTeam} ${awayTeam}`,
    `${homeTeam} vs ${awayTeam}`,
    `${homeTeam} referee`,
    `${homeTeam} hakem`,
    `${awayTeam} ${homeTeam}`,
    `${homeTeam} ${awayTeam} VAR`,
    `${homeTeam} ${awayTeam} penaltı`,
    `${homeTeam} ${awayTeam} derbi`,
    ...buildSearchQueries(homeTeam, awayTeam).slice(0, 4),
  ];
  const uniqueTerms = [...new Set(searchTerms)];

  for (const subreddit of FOOTBALL_SUBREDDITS) {
    for (const query of uniqueTerms) {
      try {
        await rateLimiter.waitForSlot();
        logger.info(`Searching r/${subreddit} for: ${query}`);

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const sub = reddit.getSubreddit(subreddit) as any;
        const posts: any[] = await sub.search({
          query,
          time: "week",
          sort: "relevance",
          limit: 15,
        });

        for (const post of posts.slice(0, maxResults)) {
          const comments: RedditComment[] = [];

          await rateLimiter.waitForSlot();
          const fullPost = await post.expandReplies({ limit: 20, depth: 2 });

          for (const comment of fullPost.comments ?? []) {
            const c: any = comment;
            if (!c.body || c.body === "[deleted]" || c.body === "[removed]")
              continue;

            const hasKeyword = ALL_KEYWORDS.some((kw) =>
              c.body.toLowerCase().includes(kw.toLowerCase())
            );

            if (hasKeyword || c.score > 5) {
              comments.push({
                id: c.id,
                body: c.body,
                author: c.author?.name ?? "[deleted]",
                score: c.score,
                permalink: `https://reddit.com${c.permalink}`,
                subreddit,
                createdAt: new Date(c.created_utc * 1000),
              });
            }
          }

          if (comments.length > 0) {
            results.push({
              source: "reddit",
              url: `https://reddit.com${post.permalink}`,
              content: `${post.title}\n${post.selftext}`,
              comments,
            });
          }
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
      } catch (err) {
        logger.warn(`Failed to search r/${subreddit} for "${query}"`, err);
      }
    }
  }

  logger.info(`Reddit crawl complete: ${results.length} results`);
  return results;
}
