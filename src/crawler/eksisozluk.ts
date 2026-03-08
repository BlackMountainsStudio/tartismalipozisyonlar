import { chromium, type Browser, type Page } from "playwright";
import * as cheerio from "cheerio";
import { createLogger } from "@/utils/logger";
import { RateLimiter } from "@/utils/rateLimiter";

const logger = createLogger("EksiCrawler");

export interface EksiEntry {
  id: string;
  body: string;
  author: string;
  date: string;
  favoriteCount: number;
  url: string;
}

export interface EksiCrawlResult {
  source: "eksisozluk";
  url: string;
  title: string;
  content: string;
  entries: EksiEntry[];
}

const BASE_URL = "https://eksisozluk.com";

async function createBrowser(): Promise<Browser> {
  return chromium.launch({ headless: true });
}

function cleanHtml(html: string): string {
  const $ = cheerio.load(html);
  $("nav, footer, header, .ad, .advertisement, script, style").remove();
  return $.text().replace(/\s+/g, " ").trim();
}

export async function crawlEksiSozluk(
  homeTeam: string,
  awayTeam: string,
  maxPages = 3
): Promise<EksiCrawlResult[]> {
  const rateLimiter = new RateLimiter(5, 60_000);
  const results: EksiCrawlResult[] = [];
  let browser: Browser | null = null;

  const searchTerms = [
    `${homeTeam} ${awayTeam} hakem`,
    `${homeTeam} ${awayTeam} penaltı`,
    `${homeTeam} ${awayTeam} VAR`,
    `${homeTeam} ${awayTeam}`,
    `${homeTeam} ${awayTeam} derbi`,
    `${homeTeam} ${awayTeam} tartışmalı`,
    `${homeTeam} ${awayTeam} ofsayt`,
    `${homeTeam} ${awayTeam} kırmızı kart`,
  ];
  const uniqueTerms = [...new Set(searchTerms)];

  try {
    browser = await createBrowser();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "Accept-Language": "tr-TR,tr;q=0.9" });

    for (const term of uniqueTerms) {
      try {
        await rateLimiter.waitForSlot();
        const searchUrl = `${BASE_URL}/?q=${encodeURIComponent(term)}`;
        logger.info(`Searching Ekşi Sözlük: ${term}`);

        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
        await page.waitForTimeout(2000);

        const topicLinks = await page.$$eval(
          "ul.topic-list li a",
          (links) =>
            links.slice(0, 7).map((a) => ({
              href: a.getAttribute("href") ?? "",
              text: a.textContent?.trim() ?? "",
            }))
        );

        for (const link of topicLinks) {
          if (!link.href) continue;

          const topicResult = await crawlTopic(
            page,
            `${BASE_URL}${link.href}`,
            link.text,
            maxPages,
            rateLimiter
          );
          if (topicResult) {
            results.push(topicResult);
          }
        }
      } catch (err) {
        logger.warn(`Failed to search Ekşi for "${term}"`, err);
      }
    }
  } catch (err) {
    logger.error("Ekşi Sözlük crawler error", err);
  } finally {
    if (browser) await browser.close();
  }

  logger.info(`Ekşi Sözlük crawl complete: ${results.length} results`);
  return results;
}

async function crawlTopic(
  page: Page,
  url: string,
  title: string,
  maxPages: number,
  rateLimiter: RateLimiter
): Promise<EksiCrawlResult | null> {
  const entries: EksiEntry[] = [];

  try {
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      await rateLimiter.waitForSlot();
      const pageUrl = pageNum > 1 ? `${url}?p=${pageNum}` : url;
      await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
      await page.waitForTimeout(1500);

      const html = await page.content();
      const $ = cheerio.load(html);

      const pageEntries: EksiEntry[] = [];
      $("#entry-item-list > li").each((_, el) => {
        const $el = $(el);
        const entryId = $el.attr("data-id") ?? "";
        const body = cleanHtml($el.find(".content").html() ?? "");
        const author = $el.find(".entry-author").text().trim();
        const date = $el.find(".entry-date").text().trim();
        const favCount = parseInt($el.find(".favorite-count").text()) || 0;

        if (body.length > 10) {
          pageEntries.push({
            id: entryId,
            body,
            author,
            date,
            favoriteCount: favCount,
            url: `${BASE_URL}/entry/${entryId}`,
          });
        }
      });

      entries.push(...pageEntries);

      if (pageEntries.length === 0) break;
    }

    if (entries.length === 0) return null;

    return {
      source: "eksisozluk",
      url,
      title,
      content: entries.map((e) => e.body).join("\n\n"),
      entries,
    };
  } catch (err) {
    logger.warn(`Failed to crawl topic: ${url}`, err);
    return null;
  }
}
