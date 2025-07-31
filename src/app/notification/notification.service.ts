import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = 'http://localhost:3000';
  private socket: Socket;
  private statusSubject = new Subject<{ messageId: string; status: string }>();

  statusUpdates$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io(this.baseUrl);

    this.socket.on(
      'statusUpdate',
      (data: { messageId: string; status: string }) => {
        this.statusSubject.next(data);
      }
    );
  }

  sendNotification(content: string): Observable<{ messageId: string }> {
    const messageId = uuidv4();
    return this.http.post<{ messageId: string }>(
      `${this.baseUrl}/api/messages`,
      {
        messageId,
        messageContent: content,
      }
    );
  }

  getStatus(messageId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(
      `${this.baseUrl}/api/messages/status/${messageId}`
    );
  }
}
