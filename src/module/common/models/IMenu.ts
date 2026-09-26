export interface IMenu {
  id: number;
  name: string;
  route?: string;
  icon?: string;
  items?: IMenu[];
  className?: string;
}
