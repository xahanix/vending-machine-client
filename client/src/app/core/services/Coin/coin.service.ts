import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CoinType } from '../../models/Coin/coin.model';
import { environment } from '../../../../environments/environment';

export interface CoinRequestDto {
  coin: CoinType;
}

export interface AmountDto {
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoinService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  async insertCoin(coin: CoinType): Promise<number> {
    try {
      const request: CoinRequestDto = { coin };
      const response = await firstValueFrom(
        this.http.post<AmountDto>(`${this.baseUrl}/vendingmachine/coin`, request)
      );
      return response.amount;
    } catch (error) {
      console.error('Error inserting coin:', error);
      throw new Error('Failed to insert coin');
    }
  }

  async getCurrentBalance(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.http.get<AmountDto>(`${this.baseUrl}/vendingmachine/balance`)
      );
      return response.amount;
    } catch (error) {
      console.error('Error getting current balance:', error);
      throw new Error('Failed to get current balance');
    }
  }

  async returnCoins(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.baseUrl}/vendingmachine/coin`)
      );
    } catch (error) {
      console.error('Error returning coins:', error);
      throw new Error('Failed to return coins');
    }
  }
}
