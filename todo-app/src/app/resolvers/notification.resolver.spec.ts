import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { notificationResolver } from './notification.resolver';

describe('notificationResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => notificationResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
