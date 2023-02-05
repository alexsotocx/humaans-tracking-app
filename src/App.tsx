import React, { useState } from "react";
import "./App.css";
import { Days } from "./types/models";
import { extractDatePortion } from "./services/time-calculator";
import Dayjs from "dayjs";
import { calculateFromHumaans } from "./services/calculate-from-humaans";
import { HumaansHRRepository } from "./repositories/humaans/repository";
import axios, { Axios } from "axios";

function InputForm() {
    const [token, setToken] = useState("");
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
                    new HumaansHRRepository(axios.create(), token),
                workingHoursPerDay: workingDays,
            });
            setCalculated(true);
            console.log(data);
        } catch (e: any) {
            console.error(e);
            alert(`Error ${e.message}`);
        }
    }

    return (
        <div className="form">
            <div>
                <label htmlFor="tokenInput">Token</label>
                <input
                    name="tokenInput"
                    id="tokenInput"
                    type="text"
                    placeholder="Humaans Token"
                    onChange={(e) => setToken(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="fromDate">Token</label>
                <input
                    name="fromDate"
                    id="fromDate"
                    type="date"
                    placeholder={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="toDate">Token</label>
                <input
                    name="toDate"
                    id="toDate"
                    type="date"
                    placeholder={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>
            <button onClick={handleClick}>Calculate</button>
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
