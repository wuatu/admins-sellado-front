import { TestBed } from '@angular/core/testing';

import { SelladoraService } from './selladora.service';

describe('SelladoraService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SelladoraService = TestBed.get(SelladoraService);
    expect(service).toBeTruthy();
  });
});
