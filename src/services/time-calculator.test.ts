import { Days } from "../types/models";
import "../../test/factories/models";
import { timeEntryFactory } from "../../test/factories/models";
import {
    calculateTime,
    extractDatePortion,
    getListOfDays,
    ONE_DAY_MS,
    ONE_HOUR_MS,
} from "./time-calculator";
import { randomUUID } from "crypto";

describe("timeUtils", () => {
    const february2_8AM = new Date("2023-02-02T08:00:00.000Z");

    const timeTracking1 = timeEntryFactory.build(
        { startTime: february2_8AM },
        { entryLong: ONE_HOUR_MS * 2 }
    );

    describe("extractDatePortion", () => {
        it("returns the date portion of the date object", () => {
            expect(extractDatePortion(february2_8AM)).toEqual("2023-02-02");
        });
    });

    describe("getListOfDays", () => {
        it("get a list of days between the given days", () => {
            expect(
                getListOfDays(
                    extractDatePortion(february2_8AM),
                    extractDatePortion(
                        new Date(february2_8AM.getTime() + ONE_DAY_MS)
                    )
                )
            ).toEqual(["2023-02-02", "2023-02-03"]);
        });

        describe("with just one day between them", () => {
            it("returns a single day", () => {
                expect(
                    getListOfDays(
                        extractDatePortion(february2_8AM),
                        extractDatePortion(february2_8AM)
                    )
                ).toEqual(["2023-02-02"]);
            });
        });
    });

    describe("calculateTime", () => {
        it("sums up the time tracked", () => {
            const timeTracking1 = timeEntryFactory.build(
                { startTime: february2_8AM },
                { entryLong: ONE_HOUR_MS * 3 }
            );

            const timeTracking2 = timeEntryFactory.build(
                {
                    startTime: new Date(
                        february2_8AM.getTime() + 3 * ONE_HOUR_MS
                    ),
                },
                { entryLong: ONE_HOUR_MS }
            );

            const response = calculateTime({
                timeEntries: [timeTracking1, timeTracking2],
                workingHoursPerDay: { [Days.Thursday]: 8 },
                holidays: [],
                publicHolidays: [],
                startingDate: extractDatePortion(february2_8AM),
                endDate: extractDatePortion(february2_8AM),
            });

            const workingTime =
                response.workedTimePerDay[extractDatePortion(february2_8AM)];

            expect(workingTime.totalWorked).toEqual({ hours: 4, minutes: 0 });
            expect(workingTime.missing).toEqual({ hours: 4, minutes: 0 });
            expect(workingTime.expected).toEqual({ hours: 8, minutes: 0 });
            expect(workingTime.extra).toEqual({ hours: 0, minutes: 0 });
        });

        describe("when the time tracked is greater than the expected working hours", () => {
            it("counts as extra", () => {
                const timeTracking1 = timeEntryFactory.build(
                    { startTime: february2_8AM },
                    { entryLong: ONE_HOUR_MS * 10.5 }
                );

                const response = calculateTime({
                    timeEntries: [timeTracking1],
                    workingHoursPerDay: { [Days.Thursday]: 8 },
                    holidays: [],
                    publicHolidays: [],
                    startingDate: extractDatePortion(february2_8AM),
                    endDate: extractDatePortion(february2_8AM),
                });

                const workingTime =
                    response.workedTimePerDay[
                        extractDatePortion(february2_8AM)
                    ];

                expect(workingTime.totalWorked).toEqual({
                    hours: 10,
                    minutes: 30,
                });
                expect(workingTime.missing).toEqual({ hours: 0, minutes: 0 });
                expect(workingTime.extra).toEqual({ hours: 2, minutes: 30 });
            });
        });

        describe("when day is a not working day", () => {
            describe("with an time tracking entry", () => {
                it("counts the time as extra time", () => {
                    const response = calculateTime({
                        timeEntries: [timeTracking1],
                        workingHoursPerDay: {},
                        holidays: [],
                        publicHolidays: [],
                        startingDate: extractDatePortion(february2_8AM),
                        endDate: extractDatePortion(february2_8AM),
                    });

                    const workingTime =
                        response.workedTimePerDay[
                            extractDatePortion(february2_8AM)
                        ];

                    expect(workingTime.totalWorked).toEqual({
                        hours: 2,
                        minutes: 0,
                    });
                    expect(workingTime.missing).toEqual({
                        hours: 0,
                        minutes: 0,
                    });
                    expect(workingTime.expected).toEqual({
                        hours: 0,
                        minutes: 0,
                    });
                    expect(workingTime.extra).toEqual({ hours: 2, minutes: 0 });
                });
            });

            it("does not count to the not working hours", () => {
                const response = calculateTime({
                    timeEntries: [],
                    workingHoursPerDay: {},
                    holidays: [],
                    publicHolidays: [],
                    startingDate: extractDatePortion(february2_8AM),
                    endDate: extractDatePortion(february2_8AM),
                });

                const workingTime =
                    response.workedTimePerDay[
                        extractDatePortion(february2_8AM)
                    ];

                expect(workingTime.totalWorked).toEqual({
                    hours: 0,
                    minutes: 0,
                });
                expect(workingTime.missing).toEqual({ hours: 0, minutes: 0 });
                expect(workingTime.expected).toEqual({ hours: 0, minutes: 0 });
                expect(workingTime.extra).toEqual({ hours: 0, minutes: 0 });
            });
        });

        describe("when there is public holiday", () => {
            describe("with an time tracking entry", () => {
                it("counts the time as extra time", () => {
                    const response = calculateTime({
                        timeEntries: [timeTracking1],
                        workingHoursPerDay: { [Days.Thursday]: 8 },
                        holidays: [],
                        publicHolidays: [
                            {
                                date: extractDatePortion(february2_8AM),
                                name: "Test Holiday",
                                id: randomUUID(),
                            },
                        ],
                        startingDate: extractDatePortion(february2_8AM),
                        endDate: extractDatePortion(february2_8AM),
                    });

                    const workingTime =
                        response.workedTimePerDay[
                            extractDatePortion(february2_8AM)
                        ];

                    expect(workingTime.totalWorked).toEqual({
                        hours: 2,
                        minutes: 0,
                    });
                    expect(workingTime.missing).toEqual({
                        hours: 0,
                        minutes: 0,
                    });
                    expect(workingTime.expected).toEqual({
                        hours: 0,
                        minutes: 0,
                    });
                    expect(workingTime.extra).toEqual({ hours: 2, minutes: 0 });
                });
            });

            it("does not count to the not working hours", () => {
                const response = calculateTime({
                    timeEntries: [],
                    workingHoursPerDay: { [Days.Thursday]: 8 },
                    holidays: [],
                    publicHolidays: [
                        {
                            date: extractDatePortion(february2_8AM),
                            name: "Test Holiday",
                            id: randomUUID(),
                        },
                    ],
                    startingDate: extractDatePortion(february2_8AM),
                    endDate: extractDatePortion(february2_8AM),
                });

                const workingTime =
                    response.workedTimePerDay[
                        extractDatePortion(february2_8AM)
                    ];

                expect(workingTime.totalWorked).toEqual({
                    hours: 0,
                    minutes: 0,
                });
                expect(workingTime.missing).toEqual({ hours: 0, minutes: 0 });
                expect(workingTime.expected).toEqual({ hours: 0, minutes: 0 });
                expect(workingTime.extra).toEqual({ hours: 0, minutes: 0 });
            });
        });

        describe("when there is paid off day", () => {
            describe("with an time tracking entry", () => {
                it("counts the time as extra time", () => {
                    const response = calculateTime({
                        timeEntries: [timeTracking1],
                        workingHoursPerDay: { [Days.Thursday]: 8 },
                        holidays: [
                            {
                                endDate: extractDatePortion(february2_8AM),
                                endDatePeriod: "full",
                                startDate: extractDatePortion(february2_8AM),
                                startDatePeriod: "full",
                                publicHolidaysCalendarID: randomUUID(),
                                id: randomUUID(),
                            },
                        ],
                        publicHolidays: [],
                        startingDate: extractDatePortion(february2_8AM),
                        endDate: extractDatePortion(february2_8AM),
                    });

                    const workingTime =
                        response.workedTimePerDay[
                            extractDatePortion(february2_8AM)
                        ];

                    expect(workingTime.totalWorked).toEqual({
                        hours: 2,
                        minutes: 0,
                    });
                    expect(workingTime.missing).toEqual({
                        hours: 0,
                        minutes: 0,
                    });
                    expect(workingTime.expected).toEqual({
                        hours: 0,
                        minutes: 0,
                    });
                    expect(workingTime.extra).toEqual({ hours: 2, minutes: 0 });
                });
            });

            it("does not count to the not working hours", () => {
                const response = calculateTime({
                    timeEntries: [],
                    workingHoursPerDay: { [Days.Thursday]: 8 },
                    holidays: [
                        {
                            endDate: extractDatePortion(february2_8AM),
                            endDatePeriod: "full",
                            startDate: extractDatePortion(february2_8AM),
                            startDatePeriod: "full",
                            id: randomUUID(),
                            publicHolidaysCalendarID: randomUUID(),
                        },
                    ],
                    publicHolidays: [],
                    startingDate: extractDatePortion(february2_8AM),
                    endDate: extractDatePortion(february2_8AM),
                });

                const workingTime =
                    response.workedTimePerDay[
                        extractDatePortion(february2_8AM)
                    ];

                expect(workingTime.totalWorked).toEqual({
                    hours: 0,
                    minutes: 0,
                });
                expect(workingTime.missing).toEqual({ hours: 0, minutes: 0 });
                expect(workingTime.expected).toEqual({ hours: 0, minutes: 0 });
                expect(workingTime.extra).toEqual({ hours: 0, minutes: 0 });
            });
        });
    });
});
