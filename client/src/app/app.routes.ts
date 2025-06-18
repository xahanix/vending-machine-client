import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/vending-machine/vending-machine.component').then(m => m.VendingMachineComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
