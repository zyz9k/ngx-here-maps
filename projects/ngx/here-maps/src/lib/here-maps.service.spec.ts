import { TestBed } from '@angular/core/testing';

import { HereMapsService } from './here-maps.service';

describe('HereMapsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HereMapsService = TestBed.get(HereMapsService);
    expect(service).toBeTruthy();
  });
});
