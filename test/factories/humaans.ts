import { Factory, IFactory } from "rosie";
import { Humaans } from "../../src/services/humaans/types";
import { randomUUID } from "crypto";
import {
    convertToReadableTime,
    extractDatePortion,
} from "../../src/use-cases/time-calculator";
import { createDateFromDateTimeStrings } from "../../src/services/humaans/utils";
import { Days } from "../../src/types/models";

export const timeEntry = Factory.define<Humaans.TimeTrackingEntry>(
    "humaans.timeEntry"
)
    .attr("id", randomUUID)
    .attr("date", () => extractDatePortion(new Date()))
    .attr("startTime", "09:00:00")
    .attr("endTime", "10:00:00")
    .attr(
        "duration",
        ["startTime", "endTime", "date"],
        (starTime, endTime, date) => {
            const difference =
                createDateFromDateTimeStrings(date, endTime).getTime() -
                createDateFromDateTimeStrings(date, endTime).getTime();
            return convertToReadableTime(difference);
        }
    )
    .attr("personId", randomUUID)
    .attr("createdAt", () => new Date().toISOString())
    .attr("updatedAt", () => new Date().toISOString());

export const listFactory = Factory.define<Humaans.ListResponse<unknown>>(
    "humaans.list"
)
    .option("factory")
    .attr("skip", 0)
    .attr("total", 10)
    .attr("limit", 5)
    .attr(
        "data",
        ["total", "limit", "skip", "factory"],
        (total, limit, skip, factory: IFactory) => {
            const toGenerate = Math.min(Math.max(0, total - skip), limit);
            const data: unknown[] = [];
            for (let i = 0; i < toGenerate; i++) data.push(factory.build());
            return data;
        }
    );

export const profile = Factory.define<Humaans.Profile>("humaans.profile")
    .attr("id", randomUUID)
    .attr("profilePhotoId", randomUUID)
    .attr("profilePhoto", ["profilePhotoId"], (profilePhotoId) => ({
        id: profilePhotoId,
        variants: { "64": `https://url.com?url=${randomUUID()}` },
    }))
    .attr("remoteRegionCode", randomUUID)
    .attr("remoteCountryCode", randomUUID)
    .attr("firstName", "firstName")
    .attr("lastName", "lastName")
    .attr("timezone", "Europe/Berlin")
    .attr("workingDays", [{ day: Days.Thursday }]);

export const timeOffEntry = Factory.define<Humaans.TimeOffEntry>(
    "humaans.timeOffEntry"
)
    .attr("id", randomUUID)
    .attr("publicHolidayCalendarId", randomUUID)
    .attr("startDate", extractDatePortion(new Date()))
    .attr("startPeriod", "full")
    .attr("endDate", extractDatePortion(new Date()))
    .attr("type", "pto")
    .attr("endPeriod", "full");

export const publicHoliday = Factory.define<Humaans.PublicHoliday>(
    "humaans.publicHoliday"
)
    .attr("id", randomUUID)
    .attr("date", extractDatePortion(new Date()))
    .attr("name", "full");
