import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NewsService {
  constructor(private configService: ConfigService) {}

  async fetchNews() {
    try {
      const apiKey = this.configService.get<string>('ALPACA_API_KEY');
      const apiSecret = this.configService.get<string>('ALPACA_API_SECRET');

      if (!apiKey || !apiSecret) {
        throw new Error('Alpaca API credentials are not configured');
      }

      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': apiSecret,
        },
      };

      const response = await fetch(
        'https://data.alpaca.markets/v1beta1/news?sort=desc&exclude_contentless=true',
        options,
      );

      if (!response.ok) {
        throw new Error(`Alpaca API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      throw new HttpException(
        {
          error: 'Failed to fetch news',
          message: error.response?.data || error.message,
        },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
