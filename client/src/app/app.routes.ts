import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/vending-machine/vending-machine.component').then(m => m.VendingMachineComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
  }
];
