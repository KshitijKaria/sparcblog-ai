import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toasts$ = this.toastSubject.asObservable();

  show(message: string, type: Toast['type'] = 'info') {
    this.toastSubject.next({ message, type });
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'danger'); }
  warning(message: string) { this.show(message, 'warning'); }
}
