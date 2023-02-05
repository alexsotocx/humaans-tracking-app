import {
    Profile,
    PublicHoliday,
    TimeEntry,
    TimeOffEntry,
} from "../types/models";

export type TimeTrackingFilters = {
    from?: string;
    before?: string;
};

export interface ITimeTrackingRepository {
    findEntries(filters: TimeTrackingFilters): Promise<TimeEntry[]>;
}

export interface IProfileRepository {
    getProfile(): Promise<Profile>;
}

export interface INotWorkingDaysRepository {
    getPublicHolidays(params: {
        id: string;
        from: string;
        to: string;
    }): Promise<PublicHoliday[]>;
    getTimeOff(): Promise<TimeOffEntry[]>;
}
