import {
    INotWorkingDaysRepository,
    IProfileRepository,
    ITimeTrackingRepository,
    TimeTrackingFilters,
} from "../../interfaces/repositories";
import {
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
    convertToTimeOffEntry,
} from "./utils";
import { AxiosInstance } from "axios";

export const ENDPOINT = "https://app.humaans.io";

export class HumaansHRRepository
    implements
        ITimeTrackingRepository,
        IProfileRepository,
        INotWorkingDaysRepository
{
    constructor(
        private readonly axios: AxiosInstance,
        private readonly token: string
    ) {}

    private generateHeaders(): {
        Authorization: string;
        "Content-Type": string;
    } {
        return {
            Authorization: `Bearer ${this.token}`,
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
                const response = await this.axios.get<Humaans.ListResponse<T>>(
                    url.toString(),
                    {
                        headers: this.generateHeaders(),
                    }
                );

                if (response.status !== 200) {
                    throw new Error(
                        `Error on requesting time entries ${url.toString()}, ${
                            response.status
                        }, ${response.data}`
                    );
                }

                const json = response.data;

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
        if (filters.userId) url.searchParams.set("personId", filters.userId);
        if (filters.from) url.searchParams.set("date[$gte]", filters.from);
        if (filters.to) url.searchParams.set("date[$lte]", filters.to);

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

    async getCurrentUserProfile(): Promise<Profile> {
        try {
            const response = await this.axios.get<Humaans.Profile>(
                `${ENDPOINT}/api/me`,
                {
                    headers: this.generateHeaders(),
                }
            );

            if (response.status !== 200) {
                throw new Error(
                    `Error on requesting profile ${response.request.url.toString()}, ${
                        response.status
                    }, ${response.data}`
                );
            }

            const jsonProfile = response.data;

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

    async getTimeOff(params: { userId: string }): Promise<TimeOffEntry[]> {
        const url = new URL("/api/time-away", ENDPOINT);
        url.searchParams.set("personId", params.userId);

        try {
            const data = await this.loopThroughPagination<Humaans.TimeOffEntry>(
                url
            );
            return data.map(convertToTimeOffEntry);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
