import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Coin, SWISS_COINS, CoinType } from '../../../core/models/coin.model';
import { Product } from '../../../core/models/product.model';
import { CoinStore } from '../../../core/services/coin.store';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control-panel.component.html',
  styles: []
})
export class ControlPanelComponent {
  selectedProduct = input<Product | null>(null);
  disabled = input<boolean>(false);

  coinInserted = output<CoinType>();
  purchaseRequested = output<void>();
  cancelRequested = output<void>();

  coinStore = inject(CoinStore);
  systemStatus = signal<string>('Ready for selection...');

  // Use Swiss coins from the model
  availableCoins = SWISS_COINS;

  async onInsertCoin(coinType: CoinType): Promise<void> {
    if (this.disabled()) return;

    await this.coinStore.insertCoin(coinType);
    this.coinInserted.emit(coinType);
    this.updateSystemStatus();
  }

  onPurchaseSelected(): void {
    if (this.disabled()) return;

    const product = this.selectedProduct();
    if (product && this.coinStore.currentAmount() >= product.price) {
      this.purchaseRequested.emit();
      this.resetPayment();
    }
  }

  async onCancelRefund(): Promise<void> {
    await this.coinStore.returnCoins();
    this.cancelRequested.emit();
    this.resetPayment();
  }

  private updateSystemStatus(): void {
    const product = this.selectedProduct();
    const amount = this.coinStore.currentAmount();

    if (!product) {
      this.systemStatus.set('Select a product to purchase');
    } else if (amount < product.price) {
      const needed = product.price - amount;
      this.systemStatus.set(`Insert CHF ${needed.toFixed(2)} more`);
    } else {
      this.systemStatus.set('Ready to purchase!');
    }
  }

  private resetPayment(): void {
    this.coinStore.resetAmount();
    this.systemStatus.set('Ready for selection...');
  }

  // Public method to reset from parent
  reset(): void {
    this.resetPayment();
  }

  // Update status when product selection changes
  ngOnInit(): void {
    // Listen for product changes and update status
    this.updateSystemStatus();
  }

  // Helper method to get coin display info
  getCoinInfo(coinType: CoinType): Coin {
    return this.availableCoins.find(coin => coin.coin === coinType)!;
  }

  protected readonly Math = Math;
}
