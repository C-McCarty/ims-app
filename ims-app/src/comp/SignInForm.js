import { useEffect, useState } from "react";
import Loading from "./Loading";
import "../styles/signInStyles.css";

export default function SignInForm({signedIn, handleSignIn}) {
    const [loading, setLoading] = useState(false);
    const [DB, setDB] = useState("");
    const handleDB = e => setDB(e.target.value.toString());
    const [PWD, setPWD] = useState("");
    const handlePWD = e => setPWD(e.target.value.toString());

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        handleSignIn();
    }
    useEffect(() => {
        setLoading(false);
    }, [signedIn]);

    if (loading) {
        return <Loading />;
    } else {
        return (
            <form className="signInForm" onSubmit={handleSubmit}>
                <h2>Database Access</h2>
                <div>
                    <label htmlFor="dbName">Database:</label>
                    <input type="text" name="dbName" id="dbName" onChange={handleDB} required />
                </div>
                <div>
                    <label htmlFor="dbPwd">Password:</label>
                    <input type="password" name="dbPwd" id="dbPwd" onChange={handlePWD} required />
                </div>
                <button type="submit">Submit</button>
            </form>
        );
    }
}