import { IOption } from './IOptions';

export interface IFormElement {
  name: string;
  value?: any;
  label: string;
  type: string;
  defaultValue?: any;
  placeholder: string;
  required_message: string;
  is_required: boolean;
  options?: IOption[];
  element?: string;
  disable?: boolean;
  className?: string;
  isMultipleSelect?: boolean;
}
