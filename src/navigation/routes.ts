export const routePaths = {
  Order: '/order',
  Products: '/products',
  Stock: '/stock',
  Cash: '/cash',
  Payment: '/payment',
  Queue: '/queue',
  History: '/history',
} as const;

export type RouteName = keyof typeof routePaths;
export type PrimaryRouteName = Exclude<RouteName, 'Payment'>;
