import { Humaans } from "./types";
import TimeTrackingEntry = Humaans.TimeTrackingEntry;
import { TimeEntry } from "../../types/models";

export function createDateFromDateTimeStrings(
    date: string,
    time: string,
    _timeZone?: string
): Date {
    return new Date(`${date}T${time}.000Z`);
}

export function convertToTimeEntry(entry: TimeTrackingEntry): TimeEntry {
    return {
        date: entry.date,
        endTime: createDateFromDateTimeStrings(entry.date, entry.endTime),
        startTime: createDateFromDateTimeStrings(entry.date, entry.startTime),
        createdAt: new Date(entry.createdAt),
        id: entry.id,
    };
}
