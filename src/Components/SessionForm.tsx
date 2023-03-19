import React, { useState } from "react";
import { HumaansHRRepository } from "../services/humaans/repository";
import axios from "axios";
import { Profile } from "../types/models";

export function SessionForm({
    logInCb,
    reset,
}: {
    reset: () => void;
    logInCb: (
        users: Profile[],
        currentUser: Profile,
        repository: HumaansHRRepository
    ) => void;
}) {
    const [token, setToken] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    let repository: HumaansHRRepository;

    async function logIn() {
        repository = new HumaansHRRepository(
            axios.create(),
            token,
            "http://localhost:3000"
        );
        const users = await repository.getUsers();
        const currentUser = await repository.getCurrentUserProfile();

        setLoggedIn(true);

        logInCb(users, currentUser, repository);
    }

    return (
        <div className="row">
            <div className="col-auto">
                <label htmlFor="tokenInput" className="form-label">
                    Token
                </label>
                <input
                    disabled={loggedIn}
                    className="form-control"
                    name="tokenInput"
                    id="tokenInput"
                    type="text"
                    placeholder="Humaans Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                />
            </div>
            {!loggedIn ? (
                <div className="col-auto">
                    <button onClick={() => logIn()} className="btn btn-primary">
                        Sign in
                    </button>
                </div>
            ) : (
                <div className="col-auto">
                    <button
                        onClick={() => {
                            setLoggedIn(false);
                            reset();
                        }}
                        className="btn btn-danger"
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
