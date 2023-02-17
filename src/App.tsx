import React, { useState } from "react";
import "./App.css";
import { Days } from "./types/models";
import {
    CalculatedTime,
    CalculatedTimeResponse,
    daysOrder,
    extractDatePortion,
    ReadableWorkingTime,
} from "./services/time-calculator";
import Dayjs from "dayjs";
import { calculateFromHumaans } from "./services/calculate-from-humaans";
import { HumaansHRRepository } from "./repositories/humaans/repository";
import axios from "axios";

function CalculationSection(calculations: CalculatedTime) {
    const entries = Object.entries(calculations.workedTimePerDay).sort(
        ([dateA], [dateB]) =>
            new Date(dateB).getTime() - new Date(dateA).getDate()
    );
    function renderCalculatedTimeResponse(c: ReadableWorkingTime) {
        let str = "";
        if (c.hours !== 0) str = `${c.hours}h`;
        if (c.minutes !== 0) str = `${str} ${c.minutes}m`;
        return str.trim();
    }

    function renderRow(date: string, workedData: CalculatedTimeResponse) {
        return (
            <tr key={date} className={"entry-row"}>
                <td>
                    {date} -{" "}
                    <span className="text-capitalize">
                        {daysOrder[new Date(date).getDay()]}
                    </span>
                </td>
                <td>{renderCalculatedTimeResponse(workedData.missing)}</td>
                <td>{renderCalculatedTimeResponse(workedData.totalWorked)}</td>
                <td>{renderCalculatedTimeResponse(workedData.extra)}</td>
                <td>{renderCalculatedTimeResponse(workedData.expected)}</td>
            </tr>
        );
    }

    const entriesComponent = entries.map(([date, workedData]) =>
        renderRow(date, workedData)
    );
    return (
        <div className="calculations">
            <h2>Work entries</h2>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Missing Hours</th>
                        <th>Total worked</th>
                        <th>Extra time</th>
                        <th>Expected</th>
                    </tr>
                </thead>
                <tbody>{entriesComponent}</tbody>
            </table>

            <h2>Total in period</h2>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Missing Hours</th>
                        <th>Total worked</th>
                        <th>Extra time</th>
                        <th>Expected</th>
                    </tr>
                </thead>
                <tbody>
                    {renderRow(
                        calculations.maximumEntryDate,
                        calculations.total
                    )}
                </tbody>
            </table>
        </div>
    );
}

function InputForm() {
    const [token, setToken] = useState("");
    const [data, setData] = useState<CalculatedTime>();
    const [calculated, setCalculated] = useState(false);
    const [fromDate, setFromDate] = useState(
        extractDatePortion(Dayjs().startOf("month").toDate())
    );
    const [toDate, setToDate] = useState(
        extractDatePortion(Dayjs().endOf("month").toDate())
    );

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
                token,
                from: fromDate,
                to: toDate,
                humaansRepoFactory: (token) =>
                    new HumaansHRRepository(
                        axios.create(),
                        token,
                        "http://localhost:3000"
                    ),
                workingHoursPerDay: workingDays,
            });

            setData(data);
            setCalculated(true);
        } catch (e: any) {
            console.error(e);
            alert(`Error ${e.message}`);
        }
    }

    let calculationSection = calculated ? CalculationSection(data!) : null;

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-auto">
                    <label htmlFor="tokenInput" className="form-label">
                        Token
                    </label>
                    <input
                        className="form-control"
                        name="tokenInput"
                        id="tokenInput"
                        type="text"
                        placeholder="Humaans Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
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

            <div>{calculationSection}</div>
        </div>
    );
}

function App() {
    return (
        <div className="App">
            <InputForm></InputForm>
        </div>
    );
}

export default App;
