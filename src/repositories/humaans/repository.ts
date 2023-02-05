import {
    INotWorkingDaysRepository,
    IProfileRepository,
    ITimeTrackingRepository,
    TimeTrackingFilters,
} from "../../interfaces/repositories";
import {
    Days,
    Profile,
    PublicHoliday,
    TimeEntry,
    TimeOffEntry,
} from "../../types/models";
import { Humaans } from "./types";
import {
    convertToProfile,
    convertToPublicHoliday,
    convertToTimeEntry,
} from "./utils";

export const ENDPOINT = "https://app.humaans.io";

export class HumaansHRRepository
    implements
        ITimeTrackingRepository,
        IProfileRepository,
        INotWorkingDaysRepository
{
    constructor(
        private readonly fetchApi: typeof fetch,
        private readonly token: string
    ) {}

    private generateHeaders(): {
        Authentication: string;
        "Content-Type": string;
    } {
        return {
            Authentication: `Bearer ${this.token}`,
            "Content-Type": "application/json",
        };
    }

    private async loopThroughPagination<T>(url: URL): Promise<T[]> {
        const elements: T[] = [];
        try {
            let totalElements = 0;
            let page = 0;
            const perPage = 100;
            url.searchParams.set("$limit", perPage.toString());

            do {
                url.searchParams.set("$skip", (page * perPage).toString());
                const response = await this.fetchApi(url, {
                    headers: this.generateHeaders(),
                });

                if (!response.ok) {
                    throw new Error(
                        `Error on requesting time entries ${url.toString()}, ${
                            response.status
                        }, ${await response.text()}`
                    );
                }

                const json: Humaans.ListResponse<T> = await response.json();

                totalElements = json.total;
                elements.push(...json.data);
                page++;
            } while (elements.length < totalElements);
            return elements;
        } catch (e) {
            throw e;
        }
    }

    async findEntries(filters: TimeTrackingFilters): Promise<TimeEntry[]> {
        const url = new URL("/api/timesheet-entries", ENDPOINT);
        if (filters.from) url.searchParams.append("date[$gte]", filters.from);
        if (filters.before)
            url.searchParams.append("date[$lte]", filters.before);

        try {
            const data =
                await this.loopThroughPagination<Humaans.TimeTrackingEntry>(
                    url
                );
            return data.map(convertToTimeEntry);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getProfile(): Promise<Profile> {
        try {
            const response = await this.fetchApi(`${ENDPOINT}/api/me`, {
                headers: this.generateHeaders(),
            });

            if (!response.ok) {
                throw new Error(
                    `Error on requesting profile ${response.url.toString()}, ${
                        response.status
                    }, ${await response.text()}`
                );
            }

            const jsonProfile: Humaans.Profile = await response.json();

            return convertToProfile(jsonProfile);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getPublicHolidays(params: {
        id: string;
        from: string;
        to: string;
    }): Promise<PublicHoliday[]> {
        //https://app.humaans.io/api/public-holidays?publicHolidayCalendarId=DE-BY&date[$gte]=2023-01-01&date[$lte]=2023-12-31
        const url = new URL("/api/public-holidays", ENDPOINT);
        url.searchParams.set("publicHolidayCalendarId", params.id);
        url.searchParams.set("date[$gte]", params.from);
        url.searchParams.set("date[$lte]", params.to);

        try {
            const data =
                await this.loopThroughPagination<Humaans.PublicHoliday>(url);
            return data.map(convertToPublicHoliday);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    getTimeOff(): Promise<TimeOffEntry[]> {
        return Promise.resolve([]);
    }
}
