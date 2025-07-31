import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from './notification.service';

interface NotificationItem {
  messageId: string;
  messageContent: string;
  status: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent {
  notifications: NotificationItem[] = [];
  newMessage = '';

  constructor(private notificationService: NotificationService) {}

  send() {
    if (!this.newMessage.trim()) return;

    this.notificationService.sendNotification(this.newMessage).subscribe({
      next: (res) => {
        this.notifications.push({
          messageId: res.messageId,
          messageContent: this.newMessage,
          status: 'AGUARDANDO_PROCESSAMENTO',
        });
        this.newMessage = '';
      },
      error: (err) => {
        alert('Erro ao enviar notificação');
        console.error(err);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PROCESSADO_SUCESSO':
        return 'status-success';
      case 'FALHA_PROCESSAMENTO':
        return 'status-failed';
      case 'AGUARDANDO_PROCESSAMENTO':
      default:
        return 'status-pending';
    }
  }
}
