import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendingMachineComponent } from './vending-machine.component';

describe('VendingMachineComponent', () => {
  let component: VendingMachineComponent;
  let fixture: ComponentFixture<VendingMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendingMachineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendingMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
