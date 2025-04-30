import { useEffect, useState } from "react";
import Loading from "./Loading";
import "../styles/signInStyles.css";

export default function SignInForm({loading, setLoading, signedIn, handleSignIn, signInFail, toggleSignInFail}) {
    const [DB, setDB] = useState("");
    const handleDB = e => {
        toggleSignInFail(false);
        setDB(e.target.value.toString());
    };
    const [PWD, setPWD] = useState("");
    const handlePWD = e => {
        toggleSignInFail(false);
        setPWD(e.target.value.toString());
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        handleSignIn(DB, PWD);
    }
    useEffect(() => {
        setLoading(false);
    }, [signedIn]);

    useEffect(() => {
        toggleSignInFail(false);
    }, [DB, PWD]);

    if (loading) {
        return <Loading />;
    } else {
        return (
            <form className="signInForm" onSubmit={handleSubmit}>
                <h1>Database Access</h1>
                <div>
                    <label htmlFor="dbName">Database:</label>
                    <input type="text" name="dbName" id="dbName" onChange={handleDB} required />
                </div>
                <div>
                    <label htmlFor="dbPwd">Password:</label>
                    <input type="password" name="dbPwd" id="dbPwd" onChange={handlePWD} required />
                </div>
                {signInFail ? <h4 className="error">Database name or Password incorrect.</h4> : <h4>Enter Database name and Password</h4>}
                <button type="submit">Submit</button>
            </form>
        );
    }
}