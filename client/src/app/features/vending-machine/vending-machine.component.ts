import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductOverviewComponent } from '../../shared/components/product-overview/product-overview.component';
import { ControlPanelComponent } from '../../shared/components/control-panel/control-panel.component';
import { ProductsStore } from '../../core/services/products.store';
import { CoinStore } from '../../core/services/coin.store';

@Component({
  selector: 'app-vending-machine',
  standalone: true,
  imports: [CommonModule, ProductOverviewComponent, ControlPanelComponent],
  templateUrl: './vending-machine.component.html',
  styles: []
})
export class VendingMachineComponent implements OnInit {
  productsStore = inject(ProductsStore);
  coinStore = inject(CoinStore);
  

  ngOnInit(): void {
    // Load initial data for the vending machine
    this.productsStore.loadProducts();
    this.coinStore.getCurrentBalance();
  }

  onPurchaseRequested(): void {
    this.productsStore.purchaseSelectedProduct();
  }

  onCancelRequested(): void {
    // Clear the selected product and refund coins
    this.productsStore.setSelectedProduct(null);
    this.coinStore.returnCoins();
    console.log('Purchase cancelled - coins have been refunded.');
  }
}
