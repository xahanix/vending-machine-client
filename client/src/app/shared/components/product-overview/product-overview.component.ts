import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {Product} from '../../../core/models/Product/product.model';
import {ProductsStore} from "../../../core/store/Product/products.store";

@Component({
  selector: 'app-product-overview',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-overview.component.html',
})
export class ProductOverviewComponent {
  productsStore = inject(ProductsStore);

  onProductClicked(product: Product): void {
    this.productsStore.setSelectedProduct(product);
  }

  getButtonClass(product: Product): string {
    const inventory = product.inventory;
    if (inventory === 0) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  }
}
