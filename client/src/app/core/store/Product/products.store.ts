import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {Product} from '../../models/Product/product.model';
import {ProductsService} from '../../services/Product/products.service';
import {CoinStore} from '../Coin/coin.store';
import {ProductRequestDto} from '../../models/Product/ProductRequestDto';
import {initialState} from './InitialState';

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
      setSelectedProduct(product: Product | null): void {
        patchState(store, { selectedProduct: product });
      },

      clearError(): void {
        patchState(store, { error: null });
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
          patchState(store, { products: updatedProducts, isLoading: false });
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
          patchState(store, { products: remainingProducts, isLoading: false });
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
  })
);
