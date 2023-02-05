import { CalculatedTimeResponse, calculateTime } from "./time-calculator";
import { HumaansHRRepository } from "../repositories/humaans/repository";

export async function calculateFromHumaans(params: {
    from: string;
    to: string;
    workingHoursPerDay: Record<string, number>;
    token: string;
    humaansRepoFactory: (token: string) => HumaansHRRepository;
}): Promise<CalculatedTimeResponse> {
    const repository = params.humaansRepoFactory(params.token);
    const currentUser = await repository.getCurrentUserProfile();
    const timeEntries = await repository.findEntries({
        from: params.from,
        userId: currentUser.id,
        to: params.to,
    });

    const timeOffEntries = await repository.getTimeOff({
        userId: currentUser.id,
    });

    const publicHolidays = await repository.getPublicHolidays({
        from: params.from,
        to: params.to,
        id:
            timeOffEntries[0]?.publicHolidaysCalendarID ||
            currentUser.region ||
            currentUser.country,
    });

    return calculateTime({
        endDate: params.to,
        startingDate: params.from,
        timeEntries,
        publicHolidays,
        holidays: timeOffEntries,
        workingHoursPerDay: params.workingHoursPerDay,
    });
}
