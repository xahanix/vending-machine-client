import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { patchState, withState, withMethods, withComputed } from '@ngrx/signals';

import { ProductsStore } from './Product/products.store';
import { ProductsService } from '../services/Product/products.service';
import { CoinStore } from './Coin/coin.store'; // Import for DI token
// Assuming CoinStore is a signalStore. Define an interface for its methods used by ProductsStore.
interface MockableCoinStore {
  setProcessing(isProcessing: boolean): void;
  getCurrentBalance(): Promise<void>;
  setError(error: string | null): void;
  // Add other methods of CoinStore if they are used by ProductsStore and need mocking
}
import { Product } from '../models/Product/product.model';
import { initialState as productsInitialState } from './Product/InitialState'; // Path based on your store's import

// Helper to create a minimal store for testing specific methods if needed
// Or we can test the full ProductsStore directly

describe('ProductsStore', () => {
  // Type of store will be inferred from TestBed.inject(ProductsStore)
  // For explicit typing, you'd need the instance type of the signal store.
  // Let's declare it as 'any' for now to resolve immediate TS errors in declaration,
  // but rely on the injected type for method calls.
  let store: any;
  let productsServiceMock: jasmine.SpyObj<ProductsService>;
  let coinStoreMock: jasmine.SpyObj<MockableCoinStore>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 100,
    inventory: 10,
  };

  beforeEach(() => {
    productsServiceMock = jasmine.createSpyObj('ProductsService', [
      'getProducts',
      'purchaseProduct',
      'createProduct',
      'updateProduct',
      'deleteProduct',
    ]);
    coinStoreMock = jasmine.createSpyObj('CoinStore', [
      'setProcessing',
      'getCurrentBalance',
      'setError',
      // Add other methods of CoinStore if they are used by ProductsStore and need mocking
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProductsStore, // Provide the actual store
        { provide: ProductsService, useValue: productsServiceMock },
        { provide: CoinStore, useValue: coinStoreMock },
      ],
    });

    store = TestBed.inject(ProductsStore);
    // Reset state before each test to a known baseline
    patchState(store, productsInitialState);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('purchaseSelectedProduct', () => {
    it('should do nothing if no product is selected', async () => {
      patchState(store, { selectedProduct: null });

      await store.purchaseSelectedProduct();

      expect(productsServiceMock.purchaseProduct).not.toHaveBeenCalled();
      expect(coinStoreMock.setProcessing).not.toHaveBeenCalled();
      expect(store.isLoading()).toBe(false); // Assuming it doesn't change isLoading
    });

    it('should successfully purchase a selected product', async () => {
      const purchasedProductData = { ...mockProduct, inventory: mockProduct.inventory - 1 };
      patchState(store, { selectedProduct: mockProduct, products: [mockProduct] });

      productsServiceMock.purchaseProduct.and.resolveTo(purchasedProductData);
      coinStoreMock.getCurrentBalance.and.resolveTo(); // Mock successful balance retrieval

      await store.purchaseSelectedProduct();

      expect(store.isLoading()).toBe(false);
      expect(coinStoreMock.setProcessing).toHaveBeenCalledWith(true);
      expect(coinStoreMock.setProcessing).toHaveBeenCalledWith(false);
      expect(productsServiceMock.purchaseProduct).toHaveBeenCalledWith(mockProduct.id);

      // Check inventory update (via internal call to updateProductInventory)
      const productInState = store.products().find((p: Product) => p.id === mockProduct.id);
      expect(productInState?.inventory).toBe(purchasedProductData.inventory);

      expect(coinStoreMock.getCurrentBalance).toHaveBeenCalled();
      expect(store.selectedProduct()).toBeNull();
      expect(store.error()).toBeNull();
      expect(coinStoreMock.setError).not.toHaveBeenCalled(); // Assuming no error in CoinStore
    });

    it('should handle error when productsService.purchaseProduct fails', async () => {
      const errorMessage = 'Purchase API failed';
      patchState(store, { selectedProduct: mockProduct });

      productsServiceMock.purchaseProduct.and.rejectWith(new Error(errorMessage));

      await store.purchaseSelectedProduct();

      expect(store.isLoading()).toBe(false);
      expect(coinStoreMock.setProcessing).toHaveBeenCalledWith(true);
      expect(coinStoreMock.setProcessing).toHaveBeenCalledWith(false);
      expect(store.error()).toBe(errorMessage);
      expect(coinStoreMock.setError).toHaveBeenCalledWith(errorMessage);
      // selectedProduct might still be set or cleared depending on desired error handling
      // expect(store.selectedProduct()).toBe(mockProduct); // or expect(...).toBeNull();
    });

    // Add more tests: e.g., what happens if coinStore.getCurrentBalance fails?
    // This would require purchaseProduct to succeed but getCurrentBalance to reject.

  });

  // --- Add describe blocks for other methods like loadProducts, createProduct etc. here ---

});
