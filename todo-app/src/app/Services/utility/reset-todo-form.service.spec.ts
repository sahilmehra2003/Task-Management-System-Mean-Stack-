import { TestBed } from '@angular/core/testing';

import { ResetTodoFormService } from './reset-todo-form.service';

describe('ResetTodoFormService', () => {
  let service: ResetTodoFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResetTodoFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
