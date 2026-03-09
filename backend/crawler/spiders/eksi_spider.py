from __future__ import annotations

from typing import Iterable

import scrapy
from scrapy.http import Response
from scrapy_playwright.page import PageCoroutine

from backend.crawler.items import ArticleItem


class EksiSpider(scrapy.Spider):
    name = "eksi_spider"
    allowed_domains = ["eksisozluk.com"]
    start_urls = [
        "https://eksisozluk.com/basliklar/istatistik/futbol",
    ]

    custom_settings = {
        "PLAYWRIGHT_PAGE_COROUTINES": [
            PageCoroutine("wait_for_timeout", 3_000),
        ],
    }

    def parse(self, response: Response, **kwargs: object) -> Iterable[ArticleItem]:
        for entry in response.css("ul.topic-list li a::attr(href)").getall():
            url = response.urljoin(entry)
            yield scrapy.Request(
                url,
                callback=self.parse_topic,
                meta={"playwright": True},
            )

    def parse_topic(self, response: Response) -> Iterable[ArticleItem]:
        item = ArticleItem()
        item["page_title"] = response.css("h1#title span::text").get()
        item["url"] = response.url
        item["publish_date"] = response.css("time::attr(datetime)").get()
        item["article_text"] = " ".join(response.css("div.content::text").getall())
        item["match_reference"] = None
        yield item

