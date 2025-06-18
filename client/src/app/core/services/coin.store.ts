import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CoinType } from '../models/coin.model';
import { CoinService } from './coin.service';

export interface CoinState {
  currentAmount: number;
  isProcessing: boolean;
  error: string | null;
  lastInsertedCoin: CoinType | null;
}

const initialState: CoinState = {
  currentAmount: 0,
  isProcessing: false,
  error: null,
  lastInsertedCoin: null,
};

export const CoinStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasAmount: computed(() => store.currentAmount() > 0),
    hasError: computed(() => !!store.error()),
    isIdle: computed(() => !store.isProcessing() && !store.error()),
  })),
  withMethods((store, coinService = inject(CoinService)) => ({
    async insertCoin(coin: CoinType): Promise<void> {
      patchState(store, { isProcessing: true, error: null });
      
      try {
        const newAmount = await coinService.insertCoin(coin);
        patchState(store, { 
          currentAmount: newAmount,
          lastInsertedCoin: coin,
          isProcessing: false 
        });
      } catch (error: any) {
        patchState(store, { 
          error: error?.message || 'Failed to insert coin', 
          isProcessing: false 
        });
      }
    },

    async getCurrentBalance(): Promise<void> {
      patchState(store, { isProcessing: true, error: null });
      
      try {
        const amount = await coinService.getCurrentBalance();
        patchState(store, { 
          currentAmount: amount,
          isProcessing: false 
        });
      } catch (error: any) {
        patchState(store, { 
          error: error?.message || 'Failed to get current balance', 
          isProcessing: false 
        });
      }
    },

    async returnCoins(): Promise<void> {
      patchState(store, { isProcessing: true, error: null });
      
      try {
        await coinService.returnCoins();
        patchState(store, { 
          currentAmount: 0,
          lastInsertedCoin: null,
          isProcessing: false 
        });
        console.log('Coins returned successfully');
      } catch (error: any) {
        patchState(store, { 
          error: error?.message || 'Failed to return coins', 
          isProcessing: false 
        });
      }
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    resetAmount(): void {
      patchState(store, { 
        currentAmount: 0, 
        lastInsertedCoin: null,
        error: null 
      });
    },
  }))
);
