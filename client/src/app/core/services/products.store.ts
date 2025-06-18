import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Product } from '../models/product.model';
// Force re-evaluation of the module import
import { ProductsService } from './products.service';

export interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}

const initialState: ProductsState = {
  products: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    productsCount: computed(() => store.products().length),
    availableProducts: computed(() => store.products().filter(p => p.inventory > 0)),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, productsService = inject(ProductsService)) => ({
    async loadProducts(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      
      try {
        const products = await productsService.getProducts();
        patchState(store, { products, isLoading: false });
      } catch (error: any) {
        patchState(store, { 
          error: error?.message || 'Failed to load products', 
          isLoading: false 
        });
      }
    },

    updateProductInventory(productId: string, newInventory: number): void {
      const products = store.products().map(product =>
        product.id === productId ? { ...product, inventory: newInventory } : product
      );
      patchState(store, { products });
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    setSelectedProduct(product: Product | null): void {
      patchState(store, { selectedProduct: product });
    },
  }))
);
