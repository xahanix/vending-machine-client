import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Product } from '../models/product.model';
// Force re-evaluation of the module import
import { ProductsService } from './products.service';
import { CoinStore } from './coin.store';

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
  withMethods((store, productsService = inject(ProductsService), coinStore = inject(CoinStore)) => ({
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

    async purchaseSelectedProduct(): Promise<void> {
      const selectedProduct = store.selectedProduct();
      if (!selectedProduct) return;

      patchState(store, { isLoading: true });
      coinStore.setProcessing(true);

      try {
        const purchasedProduct = await productsService.purchaseProduct(selectedProduct.id);

        // Update the inventory of the purchased product in the local store
        this.updateProductInventory(purchasedProduct.id, purchasedProduct.inventory);
        
        // The backend handles the balance and change; we just need to refresh the balance from the server
        await coinStore.getCurrentBalance();
        
        // Clear selection and processing state
        this.setSelectedProduct(null);
        console.log('Purchase successful for:', purchasedProduct.name);

      } catch (error: any) {
        patchState(store, { error: error?.message || 'Purchase failed' });
        coinStore.setError(error?.message || 'Purchase failed');
      } finally {
        patchState(store, { isLoading: false });
        coinStore.setProcessing(false);
      }
    },
  }))
);
