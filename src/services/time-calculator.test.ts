import { Days, TimeEntry } from "../types/models";
import { Factory } from "rosie";
import "../../test/factories";
import { TIME_ENTRY_FACT_NAME } from "../../test/factories";
import {
  calculateTime,
  extractDatePortion,
  ONE_HOUR_MS,
} from "./time-calculator";

describe("calculateTime", () => {
  const february2_8AM = new Date("2023-02-02T08:00:00.000Z");

  it("sums up the time tracked", () => {
    const timeTracking1 = Factory.build<TimeEntry>(
      TIME_ENTRY_FACT_NAME,
      { startTime: february2_8AM },
      { entryLong: ONE_HOUR_MS * 3 }
    );

    const timeTracking2 = Factory.build<TimeEntry>(
      TIME_ENTRY_FACT_NAME,
      { startTime: new Date(february2_8AM.getTime() + 3 * ONE_HOUR_MS) },
      { entryLong: ONE_HOUR_MS }
    );

    const response = calculateTime({
      timeEntries: [timeTracking1, timeTracking2],
      workingHoursPerDay: { [Days.Thursday]: 8 },
      holidays: [],
      publicHolidays: [],
    });

    const workingTime =
      response.workedTimePerDay[extractDatePortion(february2_8AM)];

    expect(workingTime.worked).toEqual({ hours: 4, minutes: 0 });
    expect(workingTime.missing).toEqual({ hours: 4, minutes: 0 });
    expect(workingTime.expected).toEqual({ hours: 8, minutes: 0 });
    expect(workingTime.extra).toEqual(null);
  });

  describe("when the time tracked is greater than the expected working hours", () => {
    it("counts as extra", () => {
      const timeTracking1 = Factory.build<TimeEntry>(
        TIME_ENTRY_FACT_NAME,
        { startTime: february2_8AM },
        { entryLong: ONE_HOUR_MS * 10.5 }
      );

      const response = calculateTime({
        timeEntries: [timeTracking1],
        workingHoursPerDay: { [Days.Thursday]: 8 },
        holidays: [],
        publicHolidays: [],
      });

      const workingTime =
        response.workedTimePerDay[extractDatePortion(february2_8AM)];

      expect(workingTime.worked).toEqual({ hours: 10, minutes: 30 });
      expect(workingTime.missing).toEqual(null);
      expect(workingTime.extra).toEqual({ hours: 2, minutes: 30 });
    });
  });

  describe("when day is a not working day", () => {
    describe("with an time tracking entry", () => {
      it("counts the time as extra time", () => {
        const timeTracking1 = Factory.build<TimeEntry>(
          TIME_ENTRY_FACT_NAME,
          { startTime: february2_8AM },
          { entryLong: ONE_HOUR_MS * 2 }
        );

        const response = calculateTime({
          timeEntries: [timeTracking1],
          workingHoursPerDay: {},
          holidays: [],
          publicHolidays: [],
        });

        const workingTime =
          response.workedTimePerDay[extractDatePortion(february2_8AM)];

        expect(workingTime.worked).toEqual({ hours: 2, minutes: 0 });
        expect(workingTime.missing).toEqual(null);
        expect(workingTime.expected).toEqual({ hours: 0, minutes: 0 });
        expect(workingTime.extra).toEqual({ hours: 2, minutes: 0 });
      });
    });

    it("does not count to the not working hours", () => {});
  });

  describe("when there is public holiday", () => {
    describe("with an time tracking entry", () => {
      it("counts the time as extra time", () => {});
    });

    it("does not count to the not working hours", () => {});
  });

  describe("when there is paid off day", () => {
    describe("with an time tracking entry", () => {
      it("counts the time as extra time", () => {});
    });

    it("does not count to the not working hours", () => {});
  });
});