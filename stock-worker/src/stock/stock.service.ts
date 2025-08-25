import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StockService {
  async fetchStock(symbol: string): Promise<any> {
    try {
      const url = `https://stooq.com/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=csv`;
      console.log('Fetching URL:', url);
      const res = await axios.get<string>(url, { responseType: 'text' });
      const data: string = res.data;
      const lines = data.split('\n');
      const headers = lines[0].split(',');
      const values = lines[1]?.split(',');

      if (!values || values.length !== headers.length) {
        return { error: 'Invalid stock symbol or no data' };
      }

      const result: Record<string, string> = {};
      headers.forEach((h, i) => {
        result[h] = values[i];
      });

      return result;
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { error: 'Fetch failed', details: err };
    }
  }
}
