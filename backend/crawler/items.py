import scrapy


class ArticleItem(scrapy.Item):
    page_title = scrapy.Field()
    url = scrapy.Field()
    publish_date = scrapy.Field()
    article_text = scrapy.Field()
    match_reference = scrapy.Field()

