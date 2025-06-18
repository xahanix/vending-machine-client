import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { ProductsStore } from '../../../core/services/products.store';

@Component({
  selector: 'app-product-overview',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-overview.component.html',
  styles: []
})
export class ProductOverviewComponent implements OnInit {
  productsStore = inject(ProductsStore);
  ngOnInit(): void {
    // Products are now loaded by the parent container component.
  }

  onProductClicked(product: Product): void {
    this.productsStore.setSelectedProduct(product);
  }

  getStockBadgeClass(product: Product): string {
    const inventory = product.inventory;
    if (inventory === 0) {
      return 'bg-red-100 text-red-800';
    } else if (inventory <= 5) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  }

  getButtonClass(product: Product): string {
    const inventory = product.inventory;
    if (inventory === 0) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  }


}
