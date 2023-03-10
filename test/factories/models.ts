import { Factory } from "rosie";
import { TimeEntry } from "../../src/types/models";
import { ONE_HOUR_MS } from "../../src/use-cases/time-calculator";

export const TIME_ENTRY_FACT_NAME = "timeEntry";

export const timeEntryFactory = Factory.define<TimeEntry>(TIME_ENTRY_FACT_NAME)
    .sequence("id")
    .option("entryLong", 0)
    .option("finished", true)
    .attr("startTime", () => new Date())
    .attr(
        "endTime",
        ["entryLong", "startTime", "finished"],
        (entryLong: number | undefined, startTime: Date, finished: boolean) => {
            if (!finished) return null;
            if (entryLong) return new Date(startTime.getTime() + entryLong);
            return new Date(startTime.getTime() + ONE_HOUR_MS);
        }
    )
    .attr("createdAt", () => new Date())
    .attr("date", ["startTime"], (startTime: Date) =>
        startTime.toISOString().substring(0, 10)
    );
