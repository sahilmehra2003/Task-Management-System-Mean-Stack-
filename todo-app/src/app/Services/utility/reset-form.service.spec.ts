import { TestBed } from '@angular/core/testing';

import { ResetFormService } from './reset-form.service';

describe('ResetFormService', () => {
  let service: ResetFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResetFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
