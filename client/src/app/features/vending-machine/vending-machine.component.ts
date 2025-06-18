import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CoinsStore } from '../../core/services/coins/coins.store';
import { Coin } from '../../core/models/coin.model';

@Component({
  selector: 'app-vending-machine',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './vending-machine.component.html',
  styleUrls: ['./vending-machine.component.scss']
})
export class VendingMachineComponent implements OnInit {
  readonly coinsStore = inject(CoinsStore);

  readonly validCoins: Coin[] = [0.10, 0.20, 0.50, 1.00];

  ngOnInit(): void {
    this.coinsStore.loadInitialBalance();
  }

  insertCoin(coin: Coin): void {
    this.coinsStore.insertCoin(coin);
  }

  refundCoins(): void {
    this.coinsStore.refund();
  }
}
