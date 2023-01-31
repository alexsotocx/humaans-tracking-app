export type HumaansTimeTrackingEntry = {
  id: string;
  personId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: {
    hours: number;
    minutes: number;
  } | null;
  createdAt: string;
  updatedAt: string;
};
