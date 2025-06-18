import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductsStore } from '../../core/services/products.store';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

import { Product, ProductRequestDto } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ModalComponent, ProductFormComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  readonly productsStore = inject(ProductsStore);

  isModalOpen = signal(false);
  editingProduct = signal<Product | undefined>(undefined);

  ngOnInit(): void {
    this.productsStore.loadProducts();
  }

  openCreateModal(): void {
    this.editingProduct.set(undefined);
    this.isModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async onSaveProduct(productData: ProductRequestDto): Promise<void> {
    try {
      if (this.editingProduct()) {
        await this.productsStore.updateProduct(this.editingProduct()!.id, productData);
      } else {
        await this.productsStore.createProduct(productData);
      }
      this.closeModal();
    } catch (error) {
      console.error('Failed to save product', error);
      // Optionally, display an error message to the user in the modal
    }
  }

  async onDeleteProduct(productId: string): Promise<void> {
    if (confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
      try {
        await this.productsStore.deleteProduct(productId);
      } catch (error) {
        console.error('Failed to delete product', error);
        // Optionally, display an error message
      }
    }
  }
}
