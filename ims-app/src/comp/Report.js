import { useState, useEffect } from "react";
import Loading from "./Loading";

export default function Report({type, data, query, toggleReport}) {
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [bestSeller, setBestSeller] = useState("");
    useEffect(() => {
        // Search by Date
        if (type === 0) {
            const list = data.filter(x => {
                const d = new Date(x.date).toISOString().split("T")[0];
                return (d > query[0] && d < query[1]);
            });
            setFilteredData(list);
            getBestSeller(list);
        }
        // Search by Name
        else if (type === 1) {
            const list = data.filter(x => (x.name === query));
            setFilteredData(list);
            getBestSeller(list);
        }
    }, []);

    const getBestSeller = (data) => {
        const list = data.flatMap(m =>
            m.products.map(p => ({
                name: p.name,
                sold: p.countAllocated - p.countRemaining
            }))
        );
        const prodTotals = [];
        for (const a of list) {
            const prod = prodTotals.find(b => a.name === b.name);
            if (prod) {
                prod.sold += a.sold;
            } else {
                prodTotals.push({...a});
            }
        }
        let greatest = [prodTotals[0]];
        for (let i = 1; i < prodTotals.length; i++) {
            if (greatest[0].sold < prodTotals[i].sold) {
                greatest = [prodTotals[i]];
            } else if (greatest[0].sold === prodTotals[i].sold) {
                greatest.push(prodTotals[i]);
            }
            if (greatest.length > 1) {
                setBestSeller(greatest.map(p => p.name).join(", "));
            } else {
                setBestSeller(greatest[0].name);
            }
        }
    }

    useEffect(() => {
        setLoading(false);
    }, [type, data])

    return (
        <div id="reportWrap">
            <div id="report">
                <div className="closeBtn" onClick={() => {toggleReport(false)}}><div></div><div></div></div>
                {loading ? <Loading /> :
                <div>
                    <h2>Report</h2>
                    <h3>Number of Markets: {filteredData.length}</h3>
                    <h3>Total Products Sold: {
                        filteredData.map(m => {
                            const soldProds = m.products.map(p => p.countAllocated - p.countRemaining);
                            return (soldProds.reduce((a, b) => a + b, 0));
                        }).reduce((a, b) => a + b, 0)
                    }</h3>

                    <h3>Best-Selling Product(s): {bestSeller}</h3>
                </div>
                }
            </div>
        </div>
    );
}