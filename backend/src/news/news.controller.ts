import { Controller, Get } from '@nestjs/common';
import { NewsService } from './news.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiQuery
  } from '@nestjs/swagger';

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    @Get()
    @ApiOperation({ summary: 'Fetch latest news from Alpaca API' })
    @ApiQuery({ name: 'start', type: String, required: false, description: 'The inclusive start of the interval. Format: RFC-3339 or YYYY-MM-DD. Default: beginning of the current day.' })
    @ApiQuery({ name: 'end', type: String, required: false, description: 'The inclusive end of the interval. Format: RFC-3339 or YYYY-MM-DD. Default: current time.' })
    @ApiQuery({ name: 'sort', type: String, required: false, enum: ['asc', 'desc'], description: 'Sort articles by updated date. Default: desc.' })
    @ApiQuery({ name: 'symbols', type: String, required: false, description: 'A comma-separated list of symbols for which to query news (e.g., "AAPL,TSLA").' })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Limit of news items to be returned for a result page (1 to 50). Default: 10.' })
    @ApiQuery({ name: 'include_content', type: Boolean, required: false, description: 'Include content for news articles (if available). Default: false.' })
    @ApiQuery({ name: 'exclude_contentless', type: Boolean, required: false, description: 'Exclude news articles that do not contain content. Default: false.' })
    @ApiQuery({ name: 'page_token', type: String, required: false, description: 'The pagination token to continue fetching results.' })
    @ApiResponse({
    status: 200,
    description: 'OK',
    schema: {
        example: {
        "news": [
            {
                "id": 24843171,
                "headline": "Apple Leader in Phone Sales in China for Second Straight Month in November With 23.6% Share, According to Market Research Data",
                "author": "Charles Gross",
                "created_at": "2021-12-31T11:08:42Z",
                "updated_at": "2021-12-31T11:08:43Z",
                "summary": "This headline-only article is meant to show you why a stock is moving, the most difficult aspect of stock trading",
                "content": "<p>This headline-only article is meant to show you why a stock is moving, the most difficult aspect of stock trading....</p>",
                "url": "https://www.benzinga.com/news/21/12/24843171/apple-leader-in-phone-sales-in-china-for-second-straight-month-in-november-with-23-6-share-according",
                "images": [],
                "symbols": [
                    "AAPL"
                ],
                "source": "benzinga"
                }
            ],
            "next_page_token": "MTY0MDk0ODkyMzAwMDAwMDAwMHwyNDg0MzE3MQ=="
        },
    },
    })
    @ApiResponse({ 
        status: 400, 
        description: 'One of the requested parameters is invalid. See the returned message for details' 
    })
    @ApiResponse({ status: 403, description: 'Authentication headers are missing or invalid. Make sure you authenticate your request with a valid API key.' })
    @ApiResponse({ status: 429, description: 'Too many requests. You hit the rate limit. Use the X-RateLimit-... response headers to make sure you\'re under the rate limit.' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async getNews() {
    return this.newsService.fetchNews();
    }
}
