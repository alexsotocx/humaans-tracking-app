import { calculateFromHumaans } from "../services/calculate-from-humaans";
import { Days } from "../types/models";
import axios from "axios";
import { HumaansHRRepository } from "../repositories/humaans/repository";
import fs from "fs/promises";

async function boostrap(): Promise<void> {
    const token = process.env["TOKEN"];
    const from = process.env["FROM"];
    const to = process.env["TO"];
    // const app = express();
    // app.use(
    //     "/api/humaans/*",
    //     (req, res, next) => {
    //         console.log(req.headers, req.path);
    //         next();
    //     },
    //     createProxyMiddleware({
    //         target: "https://app.humaans.io/api",
    //         changeOrigin: true,
    //         logLevel: "info",
    //     })
    // );

    // app.listen(3000);

    const workingDays: Record<string, number> = {
        [Days.Monday]: 8,
        [Days.Tuesday]: 8,
        [Days.Wednesday]: 8,
        [Days.Thursday]: 8,
        [Days.Friday]: 8,
    };
    const results = await calculateFromHumaans({
        workingHoursPerDay: workingDays,
        humaansRepoFactory: (token) =>
            new HumaansHRRepository(axios.create(), token),
        token: token!,
        from: from!,
        to: to!,
    });

    await fs.writeFile("res.json", JSON.stringify(results, null, 2));
}

void boostrap();
