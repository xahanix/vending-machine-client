import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { CoinsApiService } from './coins-api.service';
import { Coin } from '../../models/coin.model';

export interface CoinsState {
  insertedAmount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CoinsState = {
  insertedAmount: 0,
  isLoading: false,
  error: null,
};

export const CoinsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, coinsApi = inject(CoinsApiService)) => ({
    loadInitialBalance: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => 
          coinsApi.getBalance().pipe(
            tap((response) => patchState(store, { insertedAmount: response.amount, isLoading: false })),
            catchError((e) => {
              patchState(store, { error: e.message || 'Failed to load balance', isLoading: false });
              return of(undefined); // Prevent observable from dying
            })
          )
        )
      )
    ),
    insertCoin: rxMethod<Coin>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((coin) => 
          coinsApi.insertCoin(coin).pipe(
            tap((response) => patchState(store, { insertedAmount: response.amount, isLoading: false })),
            catchError((e) => {
              patchState(store, { error: e.message || 'Failed to insert coin', isLoading: false });
              return of(undefined);
            })
          )
        )
      )
    ),
    refund: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => 
          coinsApi.refund().pipe(
            tap(() => patchState(store, { insertedAmount: 0, isLoading: false })),
            catchError((e) => {
              patchState(store, { error: e.message || 'Failed to refund', isLoading: false });
              return of(undefined);
            })
          )
        )
      )
    ),
  }))
);
