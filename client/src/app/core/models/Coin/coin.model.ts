export type CoinType = 'TEN_RAPPEN' | 'TWENTY_RAPPEN' | 'FIFTY_RAPPEN' | 'ONE_CHF' | 'TWO_CHF';

export interface Coin {
  coin: CoinType;
  value: number; // Value in CHF
  displayName: string;
}

// Swiss coin definitions
export const SWISS_COINS: Coin[] = [
  { coin: 'TEN_RAPPEN', value: 0.10, displayName: '10 Rp' },
  { coin: 'TWENTY_RAPPEN', value: 0.20, displayName: '20 Rp' },
  { coin: 'FIFTY_RAPPEN', value: 0.50, displayName: '50 Rp' },
  { coin: 'ONE_CHF', value: 1.00, displayName: '1 CHF' },
  { coin: 'TWO_CHF', value: 2.00, displayName: '2 CHF' }
];
