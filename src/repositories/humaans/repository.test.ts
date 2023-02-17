import { HumaansHRRepository } from "./repository";
import * as HumaansFactories from "../../../test/factories/humaans";
import { listFactory } from "../../../test/factories/humaans";
import {
    convertToProfile,
    convertToPublicHoliday,
    convertToTimeEntry,
    convertToTimeOffEntry,
} from "./utils";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Days } from "../../types/models";
import { extractDatePortion } from "../../services/time-calculator";
import { randomUUID } from "crypto";
import axios from "axios";

const ENDPOINT = "http://localhost:3000";

describe("HumaansRepository", () => {
    const repository = new HumaansHRRepository(axios, "token", ENDPOINT);
    const server = setupServer();
    beforeAll(() => server.listen({}));
    beforeEach(() => server.resetHandlers());
    afterAll(() => server.close());

    describe("findEntries", () => {
        it("finds the whole list of entries", async () => {
            let calls = 0;
            const bodyResponse1 = HumaansFactories.listFactory.build(
                { limit: 1, total: 2, skip: 0 },
                {
                    factory: HumaansFactories.timeEntry,
                }
            );
            const bodyResponse2 = HumaansFactories.listFactory.build(
                { limit: 1, total: 2, skip: 1 },
                {
                    factory: HumaansFactories.timeEntry,
                }
            );
            const handler = rest.get(
                `${ENDPOINT}/api/timesheet-entries`,
                (req, res, context) => {
                    return res(
                        context.status(200),
                        context.json([bodyResponse1, bodyResponse2][calls++])
                    );
                }
            );
            server.use(handler);

            const response = await repository.findEntries({});

            expect(response.length).toEqual(2);
            expect(response[0]).toEqual(
                convertToTimeEntry(bodyResponse1.data[0] as never)
            );
            expect(response[1]).toEqual(
                convertToTimeEntry(bodyResponse2.data[0] as never)
            );

            expect(calls).toEqual(2);
        });

        describe("with 'from' and 'before' filter", () => {
            it("adds a the filter to the date param", async () => {
                const bodyResponse = HumaansFactories.listFactory.build(
                    { limit: 1, total: 1, skip: 0 },
                    {
                        factory: HumaansFactories.timeEntry,
                    }
                );
                let searchParams: URLSearchParams;
                server.use(
                    rest.get(
                        `${ENDPOINT}/api/timesheet-entries`,
                        (req, res, context) => {
                            searchParams = req.url.searchParams;
                            return res(
                                context.status(200),
                                context.json(bodyResponse)
                            );
                        }
                    )
                );

                await repository.findEntries({
                    from: "2023-01-01",
                    to: "2023-01-01",
                });

                expect(searchParams!.get("date[$gte]")).toEqual("2023-01-01");
                expect(searchParams!.get("date[$lte]")).toEqual("2023-01-01");
            });
        });
    });

    describe("getProfile", () => {
        const profile = HumaansFactories.profile.build({
            workingDays: [{ day: Days.Thursday }],
        });

        it("finds the public profile of the user", async () => {
            server.use(
                rest.get(`${ENDPOINT}/api/me`, (req, res, context) => {
                    return res(context.status(200), context.json(profile));
                })
            );

            const response = await repository.getCurrentUserProfile();

            expect(response).toEqual(convertToProfile(profile));
        });
    });

    describe("getPublicHolidays", () => {
        it("finds the public holidays of the calendar", async () => {
            const listResponse = listFactory.build(
                { limit: 1, total: 1, skip: 0 },
                {
                    factory: HumaansFactories.publicHoliday,
                }
            );
            server.use(
                rest.get(
                    `${ENDPOINT}/api/public-holidays`,
                    (req, res, context) => {
                        return res(
                            context.status(200),
                            context.json(listResponse)
                        );
                    }
                )
            );

            const date = new Date();
            const response = await repository.getPublicHolidays({
                from: extractDatePortion(date),
                id: "DE-BY",
                to: extractDatePortion(date),
            });

            expect(response).toEqual([
                convertToPublicHoliday(listResponse.data[0] as never),
            ]);
        });
    });

    describe("getTimeOff", () => {
        it("finds the public profile of the user", async () => {
            const listResponse = listFactory.build(
                { limit: 1, total: 1, skip: 0 },
                {
                    factory: HumaansFactories.timeOffEntry,
                }
            );
            server.use(
                rest.get(`${ENDPOINT}/api/time-away`, (req, res, context) => {
                    return res(context.status(200), context.json(listResponse));
                })
            );

            const response = await repository.getTimeOff({
                userId: randomUUID(),
            });

            expect(response).toEqual([
                convertToTimeOffEntry(listResponse.data[0] as never),
            ]);
        });
    });
});
