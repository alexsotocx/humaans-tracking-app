import { Factory, IFactory } from "rosie";
import { Humaans } from "../../src/repositories/humaans/types";
import { randomUUID } from "crypto";
import {
    convertToReadableTime,
    extractDatePortion,
} from "../../src/services/time-calculator";
import { createDateFromDateTimeStrings } from "../../src/repositories/humaans/utils";

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
