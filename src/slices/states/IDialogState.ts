export interface INotification {
  notificationType: 'error' | 'success' | 'info';
  isOpen: boolean;
  title: string;
  errorComponent: number;
  message: string;
}
export interface IDialogState {
  notificationDialog: INotification;
}
