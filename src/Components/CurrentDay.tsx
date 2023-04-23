import { useEffect, useState } from "react";
import { HumaansHRRepository } from "../services/humaans/repository";
import { Profile, TimeEntry } from "../types/models";
import { extractDatePortion } from "../use-cases/time-calculator";

export function CurrentDay({repo, user}: {repo: HumaansHRRepository, user: Profile}) {
  const [currentDayData, setCurrentDayData] = useState<TimeEntry[]>([])

  useEffect(() => {
    (async () => {
      const entries = await repo.findEntries({
        userId: user.id,
        to: extractDatePortion(new Date()),
        from: extractDatePortion(new Date()),
      });

      setCurrentDayData(entries);
    })()
  })

  if(!repo || !user) return null;
  if (currentDayData.length === 0) return null;

  return (<div>
    
    { JSON.stringify(currentDayData) }

  </div>)
}
