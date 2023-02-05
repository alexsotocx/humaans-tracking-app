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
import { convertToProfile, convertToTimeEntry } from "./utils";

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

    async findEntries(filters: TimeTrackingFilters): Promise<TimeEntry[]> {
        const elements: TimeEntry[] = [];
        try {
            let totalElements = 0;
            let page = 0;
            const perPage = 100;

            do {
                const url = new URL("/api/timesheet-entries", ENDPOINT);
                url.searchParams.append("$skip", (page * perPage).toString());
                url.searchParams.append("$limit", perPage.toString());

                if (filters.from)
                    url.searchParams.append("date[$gte]", filters.from);
                if (filters.before)
                    url.searchParams.append("date[$lte]", filters.before);

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

                const json: Humaans.ListResponse<Humaans.TimeTrackingEntry> =
                    await response.json();

                totalElements = json.total;
                elements.push(...json.data.map(convertToTimeEntry));
                page++;
            } while (elements.length < totalElements);
            return elements;
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

    getPublicHolidays(): Promise<PublicHoliday[]> {
        return Promise.resolve([]);
    }

    getTimeOff(): Promise<TimeOffEntry[]> {
        return Promise.resolve([]);
    }
}
