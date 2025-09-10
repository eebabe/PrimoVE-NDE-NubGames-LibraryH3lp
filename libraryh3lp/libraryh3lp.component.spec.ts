import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Libraryh3lpComponent } from './libraryh3lp.component';

describe('Libraryh3lpComponent', () => {
  let component: Libraryh3lpComponent;
  let fixture: ComponentFixture<Libraryh3lpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Libraryh3lpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Libraryh3lpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
