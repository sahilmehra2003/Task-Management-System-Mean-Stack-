import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { todoResolver } from './todo.resolver';

describe('todoResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => todoResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
