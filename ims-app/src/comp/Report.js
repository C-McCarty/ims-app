import { useState, useEffect } from "react";
import Loading from "./Loading";

export default function Report({type, data, query, toggleReport}) {
    const [loading, setLoading] = useState(true);
    // Search by Date
    if (type === 0) {
        const list = data.filter(x => {
            const d = new Date(x.date).toISOString().split("T")[0];
            return (d > query[0] && d < query[1])
        });
        console.log(data);
        console.log(list);
    }
    // Search by Name
    else if (type === 1) {
        const list = data.filter(x => (x.name === query));
        console.log(data);
        console.log(list);
    }

    useEffect(() => {
        setLoading(false);
    }, [type, data])

    return (
        <div id="reportWrap">
            <div id="report">
                <div className="closeBtn" onClick={() => {toggleReport(false)}}><div></div><div></div></div>
                {loading ? <Loading /> :
                <h2>Report</h2>
                    
                }
            </div>
        </div>
    );
}