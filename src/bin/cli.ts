import { calculateFromHumaans } from "../services/humaans/calculate-from-humaans";
import { Days } from "../types/models";
import fs from "fs/promises";
import { HumaansHRRepository } from "../services/humaans/repository";
import axios from "axios";

async function boostrap(): Promise<void> {
  const token = process.env["TOKEN"] as string;
  const from = process.env["FROM"] as string;
  const to = process.env["TO"] as string;

  const workingDays: Record<string, number> = {
    [Days.Monday]: 8,
    [Days.Tuesday]: 8,
    [Days.Wednesday]: 8,
    [Days.Thursday]: 8,
    [Days.Friday]: 8,
  };

  const repository = new HumaansHRRepository(
    axios.create(),
    token!,
    "http://localhost:3000"
  );

  const user = await repository.getCurrentUserProfile();
  
  const results = await calculateFromHumaans({
    to,
    from,
    repository,
    user,
    workingHoursPerDay: workingDays,
  });

  await fs.writeFile("res.json", JSON.stringify(results, null, 2));

  console.log("Result of your query for", from, to);
  console.log(JSON.stringify(results.total));
}

void boostrap();
