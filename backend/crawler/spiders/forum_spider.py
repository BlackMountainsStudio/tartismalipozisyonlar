from __future__ import annotations

from typing import Iterable

import scrapy
from scrapy.http import Response
from scrapy_playwright.page import PageCoroutine

from backend.crawler.items import ArticleItem


class ForumSpider(scrapy.Spider):
    name = "forum_spider"
    allowed_domains = [
        "macforum.example.com",
    ]
    start_urls = [
        "https://macforum.example.com/futbol",
    ]

    custom_settings = {
        "PLAYWRIGHT_PAGE_COROUTINES": [
            PageCoroutine("wait_for_timeout", 3_000),
        ],
    }

    def parse(self, response: Response, **kwargs: object) -> Iterable[scrapy.Request]:
        for href in response.css("a.thread-title::attr(href)").getall():
            url = response.urljoin(href)
            yield scrapy.Request(
                url,
                callback=self.parse_thread,
                meta={"playwright": True},
            )

    def parse_thread(self, response: Response) -> Iterable[ArticleItem]:
        item = ArticleItem()
        item["page_title"] = response.css("h1::text").get()
        item["url"] = response.url
        item["publish_date"] = None
        item["article_text"] = " ".join(response.css("div.post-content::text").getall())
        item["match_reference"] = None
        yield item

