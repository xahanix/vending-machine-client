import { Routes } from '@angular/router';

import { VendingMachineComponent } from './features/vending-machine/vending-machine.component';

export const routes: Routes = [
  { path: '', component: VendingMachineComponent, pathMatch: 'full' }
];
