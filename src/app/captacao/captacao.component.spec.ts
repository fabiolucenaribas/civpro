import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CaptacaoComponent } from './captacao.component';

import { ConfirmationService, MessageService } from 'primeng/api';

describe('CaptacaoComponent', () => {
  let component: CaptacaoComponent;
  let fixture: ComponentFixture<CaptacaoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CaptacaoComponent],
      providers: [DatePipe, ConfirmationService, MessageService],
      imports: [FormsModule, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CaptacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
