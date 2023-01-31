import {
  INotWorkingDaysRepository,
  IProfileRepository,
  ITimeTrackingRepository,
  TimeTrackingFilters,
} from "../../interfaces/repositories";
import { Profile, PublicHoliday, TimeOffEntry } from "../../types/models";

export class HumaansHRRepository
  implements
    ITimeTrackingRepository,
    IProfileRepository,
    INotWorkingDaysRepository
{
  constructor(private readonly fetchApi: typeof fetch) {}

  findEntries(filters: TimeTrackingFilters): Promise<TimeEntry[]> {
    return Promise.resolve([]);
  }

  getProfile(): Promise<Profile> {
    return Promise.resolve(undefined);
  }

  getPublicHolidays(): Promise<PublicHoliday[]> {
    return Promise.resolve([]);
  }

  getTimeOff(): Promise<TimeOffEntry[]> {
    return Promise.resolve([]);
  }
}
