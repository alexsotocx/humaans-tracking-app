import { ENDPOINT, HumaansHRRepository } from "./repository";
import * as HumaansFactories from "../../../test/factories/humaans";
import { convertToTimeEntry } from "./utils";
import { rest } from "msw";
import { setupServer } from "msw/node";
beforeAll(() => jest.spyOn(window, "fetch"));

describe("HumaansRepository", () => {
    const repository = new HumaansHRRepository(fetch, "token");
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
                    before: "2023-01-01",
                });

                expect(searchParams!.get("date[$gte]")).toEqual("2023-01-01");
                expect(searchParams!.get("date[$lte]")).toEqual("2023-01-01");
            });
        });
    });
});
