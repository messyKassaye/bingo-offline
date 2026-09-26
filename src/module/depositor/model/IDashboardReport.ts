export interface IDashboardReport {
  id: number;
  title: string;
  data: number;
  color: string;
  icon: string;
  iconColor?: string;
  subTitle?: string;
  currency?: string;
  isShowProgress?: boolean;
  progressText?: string;
  progressColor?: string;
}
