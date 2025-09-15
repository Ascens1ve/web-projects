import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreatePostComponent } from './dialog-create-post.component';

describe('DialogCreatePost', () => {
  let component: DialogCreatePostComponent;
  let fixture: ComponentFixture<DialogCreatePostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCreatePostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCreatePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
