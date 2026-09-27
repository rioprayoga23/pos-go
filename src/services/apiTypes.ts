export type ApiEnvelope<T> = {
  data: T;
};

export type ApiPage<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
