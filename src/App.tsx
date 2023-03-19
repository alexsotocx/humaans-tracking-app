import React, { useState } from "react";
import "./App.css";
import { Profile } from "./types/models";
import { FormData } from "./Components/FormData";
import {
    CalculatedTime,
    CalculatedTimeResponse,
    daysOrder,
    ReadableWorkingTime,
} from "./use-cases/time-calculator";
import { HumaansHRRepository } from "./services/humaans/repository";
import { SessionForm } from "./Components/SessionForm";

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

    function difference(
        missing: ReadableWorkingTime,
        extra: ReadableWorkingTime
    ) {
        if (missing.minutes || missing.hours)
            return `- ${renderCalculatedTimeResponse(missing)}`;
        if (extra.hours || extra.minutes)
            return `+ ${renderCalculatedTimeResponse(extra)}`;
        return "";
    }

    function renderRow(date: string, workedData: CalculatedTimeResponse) {
        const { missing, extra, expected, totalWorked } = workedData;
        return (
            <tr key={date} className={"entry-row"}>
                <td>
                    {date} -{" "}
                    <span className="text-capitalize">
                        {daysOrder[new Date(date).getDay()]}
                    </span>
                </td>
                <td>{renderCalculatedTimeResponse(totalWorked)}</td>
                <td>{renderCalculatedTimeResponse(expected)}</td>
                <td>{difference(missing, extra)}</td>
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
                        <th>Total worked</th>
                        <th>Expected</th>
                        <th>Difference</th>
                    </tr>
                </thead>
                <tbody>{entriesComponent}</tbody>
            </table>

            <h2>Total in period</h2>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Total worked</th>
                        <th>Expected</th>
                        <th>Difference</th>
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
    const [data, setData] = useState<CalculatedTime | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [users, setUsers] = useState([] as Profile[]);
    const [currentUser, setCurrentUser] = useState<null | Profile>(null);
    const [repository, setRepository] = useState<null | HumaansHRRepository>(
        null
    );

    let calculationSection = data ? CalculationSection(data) : null;

    function logIn(
        users: Profile[],
        currentUser: Profile,
        repo: HumaansHRRepository
    ) {
        setLoggedIn(true);
        setUsers(users);
        setCurrentUser(currentUser);
        setRepository(repo);
    }

    return (
        <div className="container-fluid">
            <SessionForm
                logInCb={logIn}
                reset={() => {
                    setUsers([]);
                    setCurrentUser(null);
                    setLoggedIn(false);
                    setData(null);
                }}
            ></SessionForm>
            <div>
                {loggedIn ? (
                    <FormData
                        repository={repository!}
                        users={users}
                        currentUser={currentUser!}
                        calculationCb={(data: CalculatedTime) => setData(data)}
                    />
                ) : null}
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
