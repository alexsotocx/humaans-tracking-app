import { calculateFromHumaans } from "../services/calculate-from-humaans";
import { Days } from "../types/models";
import axios from "axios";
import express from "express";
import { HumaansHRRepository } from "../repositories/humaans/repository";
import { createProxyMiddleware } from "http-proxy-middleware";

async function boostrap(): Promise<void> {
    const token = process.env["TOKEN"];
    const app = express();
    app.use(
        "/api/humaans/*",
        (req, res, next) => {
            console.log(req.headers, req.path);
            next();
        },
        createProxyMiddleware({
            target: "https://app.humaans.io/api",
            changeOrigin: true,
            logLevel: "info",
        })
    );

    app.listen(3000);

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
        from: "2023-01-01",
        to: "2023-01-31",
    });

    console.log(JSON.stringify(results));
}

boostrap();
