import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTodosComponent } from './sub-todos.component';

describe('SubTodosComponent', () => {
  let component: SubTodosComponent;
  let fixture: ComponentFixture<SubTodosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubTodosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubTodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
