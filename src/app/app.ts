import { Component, signal } from '@angular/core';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'app-root',
  imports: [NotificationComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('notificacao-frontend');
}
