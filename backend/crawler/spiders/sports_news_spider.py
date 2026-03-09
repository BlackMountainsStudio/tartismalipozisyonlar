from __future__ import annotations

from typing import Iterable

import scrapy
from scrapy.http import Response
from scrapy_playwright.page import PageCoroutine

from backend.crawler.items import ArticleItem


class SportsNewsSpider(scrapy.Spider):
    name = "sports_news_spider"
    allowed_domains = [
        "beinSports.com",
        "ntvspor.net",
        "fanatik.com.tr",
        "fotomac.com.tr",
    ]
    start_urls = [
        "https://www.fanatik.com.tr/futbol",
    ]

    custom_settings = {
        "PLAYWRIGHT_PAGE_COROUTINES": [
            PageCoroutine("wait_for_timeout", 3_000),
        ],
    }

    def parse(self, response: Response, **kwargs: object) -> Iterable[scrapy.Request]:
        for href in response.css("a::attr(href)").getall():
            if "/futbol/" in href:
                url = response.urljoin(href)
                yield scrapy.Request(
                    url,
                    callback=self.parse_article,
                    meta={"playwright": True},
                )

    def parse_article(self, response: Response) -> Iterable[ArticleItem]:
        item = ArticleItem()
        item["page_title"] = response.css("h1::text").get()
        item["url"] = response.url
        item["publish_date"] = response.css("time::attr(datetime)").get()
        item["article_text"] = " ".join(
            response.css("article p::text, article span::text").getall(),
        )
        item["match_reference"] = None
        yield item

