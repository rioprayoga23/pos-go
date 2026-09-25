export type DateRange = {
  startDate: string;
  endDate: string;
};

export type DatePeriod = "today" | "month" | "custom";
export type DatePeriodPreset = Exclude<DatePeriod, "custom">;
