import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService } from './notification.service';
import { of, Subject, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let mockNotificationService: Partial<NotificationService>;
  let statusSubject = new Subject<{ messageId: string; status: string }>();

  beforeEach(async () => {
    mockNotificationService = {
      sendNotification: jasmine
        .createSpy('sendNotification')
        .and.returnValue(of({ messageId: '123' })),
      statusUpdates$: statusSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [NotificationComponent, FormsModule],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should add new notification on send', () => {
    component.newMessage = 'Teste notificação';
    component.send();

    expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
      'Teste notificação'
    );
    expect(component.notifications.length).toBe(1);
    expect(component.notifications[0].messageContent).toBe('Teste notificação');
    expect(component.notifications[0].status).toBe('AGUARDANDO_PROCESSAMENTO');
    expect(component.newMessage).toBe('');
  });

  it('should update notification status on socket event', fakeAsync(() => {
    component.notifications = [
      {
        messageId: '123',
        messageContent: 'Teste',
        status: 'AGUARDANDO_PROCESSAMENTO',
      },
    ];

    statusSubject.next({ messageId: '123', status: 'PROCESSADO_SUCESSO' });
    tick();
    fixture.detectChanges();

    console.log(component.notifications);
    expect(component.notifications[0].status).toBe('PROCESSADO_SUCESSO');
  }));

  it('should handle error when sending notification fails', () => {
    mockNotificationService.sendNotification = jasmine
      .createSpy('sendNotification')
      .and.returnValue(throwError(() => new Error('Erro simulado')));

    spyOn(window, 'alert');

    component.newMessage = 'Mensagem com erro';
    component.send();

    expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
      'Mensagem com erro'
    );
    expect(window.alert).toHaveBeenCalledWith('Erro ao enviar notificação');
    expect(component.notifications.length).toBe(0);
  });

  it('should not send notification if message is empty', () => {
    component.newMessage = '   ';
    component.send();

    expect(mockNotificationService.sendNotification).not.toHaveBeenCalled();
    expect(component.notifications.length).toBe(0);
  });

  it('should return correct CSS class based on status', () => {
    expect(component.getStatusClass('PROCESSADO_SUCESSO')).toBe(
      'status-success'
    );
    expect(component.getStatusClass('FALHA_PROCESSAMENTO')).toBe(
      'status-failed'
    );
    expect(component.getStatusClass('AGUARDANDO_PROCESSAMENTO')).toBe(
      'status-pending'
    );
    expect(component.getStatusClass('QUALQUER_OUTRO')).toBe('status-pending');
  });
});
