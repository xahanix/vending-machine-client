import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BalanceResponse, Coin } from '../../models/coin.model';

@Injectable({
  providedIn: 'root'
})
export class CoinsApiService {
  private baseUrl = '/api/vendingmachine'; // Using the proxy, backend routes start with /vendingmachine

  constructor(private http: HttpClient) { }

  insertCoin(coin: Coin): Observable<BalanceResponse> {
    return this.http.post<BalanceResponse>(`${this.baseUrl}/coin`, { amount: coin });
  }

  refund(): Observable<void> {
    // Expecting a 204 No Content, which means the Observable will complete without a value.
    return this.http.delete<void>(`${this.baseUrl}/coin`);
  }

  getBalance(): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.baseUrl}/balance`);
  }
}
