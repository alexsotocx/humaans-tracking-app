export namespace Humaans {
    export type TimeTrackingEntry = {
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

    export type ListResponse<T> = {
        total: number;
        limit: number;
        skip: number;
        data: T[];
    };

    export type Profile = {
        firstName: string;
        lastName: string;
        profilePhotoId: string;
        profilePhoto: {
            id: string;
            variants: Record<string, string>;
        };
        workingDays: { day: string }[];
        timezone: string;
        // Rest of the fields ignored https://docs.humaans.io/api/#me
    };
}
