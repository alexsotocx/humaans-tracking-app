import { HumaansHRRepository } from "../services/humaans/repository";
import { Days, Profile } from "../types/models";
import {
    CalculatedTime,
    extractDatePortion,
} from "../use-cases/time-calculator";
import React, { useState } from "react";
import Dayjs from "dayjs";
import { calculateFromHumaans } from "../services/humaans/calculate-from-humaans";

export function FormData({
    repository,
    calculationCb,
    users,
    currentUser,
}: {
    repository: HumaansHRRepository;
    users: Profile[];
    currentUser: Profile;
    calculationCb: (data: CalculatedTime) => void;
}) {
    const [fromDate, setFromDate] = useState(
        extractDatePortion(Dayjs().startOf("month").toDate())
    );
    const [toDate, setToDate] = useState(
        extractDatePortion(Dayjs().endOf("month").toDate())
    );

    const [selectedUser, setSelectedUser] = React.useState(currentUser);

    const workingDays: Record<string, number> = {
        [Days.Monday]: 8,
        [Days.Tuesday]: 8,
        [Days.Wednesday]: 8,
        [Days.Thursday]: 8,
        [Days.Friday]: 8,
    };

    async function handleClick() {
        try {
            const data = await calculateFromHumaans({
                user: selectedUser,
                from: fromDate,
                to: toDate,
                repository,
                workingHoursPerDay: workingDays,
            });

            calculationCb(data);
        } catch (e: any) {
            console.error(e);
            alert(`Error ${e.message}`);
        }
    }

    return (
        <div className="row">
            <div className="col-auto">
                <label className="form-label">User</label>
                <select
                    value={selectedUser.id}
                    onChange={(e) =>
                        setSelectedUser(
                            users.find((u) => u.id === e.target.value)!
                        )
                    }
                    className="form-select"
                >
                    {users.map((u) => (
                        <option value={u.id} key={u.id}>
                            {u.firstName} {u.lastName}{" "}
                            {currentUser.id === u.id ? "- Me" : ""}
                        </option>
                    ))}
                </select>
            </div>
            <div className="col-auto">
                <label htmlFor="fromDate" className="form-label">
                    Start date
                </label>
                <input
                    className="form-control"
                    name="fromDate"
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    placeholder={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </div>
            <div className="col-auto">
                <label htmlFor="toDate" className="form-label">
                    End date
                </label>
                <input
                    className="form-control"
                    name="toDate"
                    id="toDate"
                    type="date"
                    value={toDate}
                    placeholder={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>
            <div className="col-auto">
                <button onClick={handleClick} className="btn btn-primary">
                    Calculate
                </button>
            </div>
        </div>
    );
}
