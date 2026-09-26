export interface IGenericState<T> {
  status: boolean;
  loading?: boolean;
  message: string;
  code: number;
  data: T;
  error?: boolean;
  errorMessage?: string;
}
