BOT_NAME = "var_odasi_crawler"

SPIDER_MODULES = ["backend.crawler.spiders"]
NEWSPIDER_MODULE = "backend.crawler.spiders"

ROBOTSTXT_OBEY = True

CONCURRENT_REQUESTS = 8
DOWNLOAD_DELAY = 1.0

DOWNLOADER_MIDDLEWARES = {
    "scrapy_playwright.middleware.ScrapyPlaywrightDownloaderMiddleware": 543,
}

PLAYWRIGHT_BROWSER_TYPE = "chromium"
PLAYWRIGHT_DEFAULT_NAVIGATION_TIMEOUT = 60_000

PLAYWRIGHT_LAUNCH_OPTIONS = {
    "headless": True,
}

PLAYWRIGHT_CONTEXTS = {
    "default": {
        "viewport": {"width": 1280, "height": 720},
    },
}

