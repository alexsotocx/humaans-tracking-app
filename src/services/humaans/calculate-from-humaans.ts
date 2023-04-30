import { CalculatedTime, calculateTime } from "../../use-cases/time-calculator";
import { HumaansHRRepository } from "./repository";
import { Profile } from "../../types/models";

export async function calculateFromHumaans(params: {
    user: Profile;
    from: string;
    to: string;
    workingHoursPerDay: Record<string, number>;
    repository: HumaansHRRepository;
}): Promise<CalculatedTime> {
    const { repository, user } = params;

    const timeEntries = await repository.findEntries({
        from: params.from,
        userId: user.id,
        to: params.to,
    }).then(entries => entries.filter(e => e.endTime != null));

    const timeOffEntries = await repository.getTimeOff({
        userId: user.id,
    });

    const publicHolidays = await repository.getPublicHolidays({
        from: params.from,
        to: params.to,
        id:
            timeOffEntries[0]?.publicHolidaysCalendarID ||
            user.region ||
            user.country,
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
