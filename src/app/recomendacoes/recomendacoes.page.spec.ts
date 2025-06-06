import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecomendacoesPage } from './recomendacoes.page';

describe('RecomendacoesPage', () => {
  let component: RecomendacoesPage;
  let fixture: ComponentFixture<RecomendacoesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecomendacoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
