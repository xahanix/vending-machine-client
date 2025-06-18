import { computed, inject } from '@angular/core';
import { withHooks } from '@ngrx/signals';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Product, ProductRequestDto } from '../models/product.model';
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

const productUpdateChannel = new BroadcastChannel('product-updates');

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    productsCount: computed(() => store.products().length),
    availableProducts: computed(() => store.products().filter(p => p.inventory > 0)),
    hasError: computed(() => !!store.error()),
  })),
  withMethods((store, productsService = inject(ProductsService), coinStore = inject(CoinStore)) => {
    const methods = {
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
          methods.updateProductInventory(purchasedProduct.id, purchasedProduct.inventory);

          // The backend handles the balance and change; we just need to refresh the balance from the server
          await coinStore.getCurrentBalance();

          // Clear selection and processing state
          methods.setSelectedProduct(null);
          console.log('Purchase successful for:', purchasedProduct.name);

        } catch (error: any) {
          patchState(store, { error: error?.message || 'Purchase failed' });
          coinStore.setError(error?.message || 'Purchase failed');
        } finally {
          patchState(store, { isLoading: false });
          coinStore.setProcessing(false);
        }
      },

      async createProduct(productData: ProductRequestDto): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const newProduct = await productsService.createProduct(productData);
          patchState(store, {
            products: [...store.products(), newProduct],
            isLoading: false,
          });
          productUpdateChannel.postMessage('products-updated');
        } catch (error: any) {
          patchState(store, {
            error: error?.message || 'Failed to create product',
            isLoading: false,
          });
          throw error;
        }
      },

      async updateProduct(productId: string, productData: ProductRequestDto): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const updatedProduct = await productsService.updateProduct(productId, productData);
          const updatedProducts = store.products().map(p =>
            p.id === productId ? updatedProduct : p
          );
          patchState(store, {
            products: updatedProducts,
            isLoading: false,
          });
          productUpdateChannel.postMessage('products-updated');
        } catch (error: any) {
          patchState(store, {
            error: error?.message || 'Failed to update product',
            isLoading: false,
          });
          throw error;
        }
      },

      async deleteProduct(productId: string): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          await productsService.deleteProduct(productId);
          const remainingProducts = store.products().filter(p => p.id !== productId);
          patchState(store, {
            products: remainingProducts,
            isLoading: false,
          });
          productUpdateChannel.postMessage('products-updated');
        } catch (error: any) {
          patchState(store, {
            error: error?.message || 'Failed to delete product',
            isLoading: false,
          });
          throw error;
        }
      }
    };
    return methods;
  }),
  withHooks({
    onInit(store: any) { // Use 'any' for now to bypass immediate type issues with loadProducts
      productUpdateChannel.onmessage = (event) => {
        if (event.data === 'products-updated') {
          console.log('ProductsStore: Received products-updated broadcast, reloading products...');
          if (typeof store.loadProducts === 'function') {
            store.loadProducts();
          } else {
            console.error('ProductsStore: loadProducts method not found on store instance for broadcast update.');
          }
        }
      };
    },
    onDestroy() {
      productUpdateChannel.close();
    }
  })
);
