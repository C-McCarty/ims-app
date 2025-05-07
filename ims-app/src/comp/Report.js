import { useState, useEffect } from "react";
import Loading from "./Loading";

export default function Report({type, data, query, toggleReport}) {
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [bestSellers, setBestSellers] = useState("");
    const [markProdTable, setMarkProdTable] = useState(<></>);
    const [markProdData, setMarkProdData] = useState([]);
    useEffect(() => {
        // Search by Date
        if (type === 0) {
            const list = data.filter(x => {
                const d = new Date(x.date).toISOString().split("T")[0];
                return (d >= query[0] && d <= query[1]);
            });
            setFilteredData(list);
            analyze(list);
        }
        // Search by Name
        else if (type === 1) {
            const list = data.filter(x => (x.name === query));
            setFilteredData(list);
            analyze(list);
        }
    }, []);

    const analyze = (data) => {
        // Get Product names and how much was sold
        const prodSoldList = data.flatMap(m => m.products.map(p => ({ name: p.name, sold: p.countAllocated - p.countRemaining, marketName: m.name, date: m.date })));
        setMarkProdData(prodSoldList);
        const prodTotals = [];
        // Combine sold amount for each Product
        for (const a of prodSoldList) {
            const prod = prodTotals.find(b => a.name === b.name);
            if (prod) { prod.sold += a.sold; }
            else { prodTotals.push({...a}); }
        }
        // Sort by most sold then by name
        prodTotals.sort((a, b) => {
            if (a.sold === b.sold) {
                return a.name.localeCompare(b.name);
            }
            return b.sold - a.sold;
        });
        // Create a table list of the top 5 Products sold
        const top5 = prodTotals.map(p => {
            return (
                <div className="tr" key={p.name+p.sold}>
                    <div className="td">{p.name}</div>
                    <div className="td">{p.sold}</div>
                </div>
            );
        }).slice(0,5);
        setBestSellers(top5);
        // Generate table of all Products sold per Market
        prodSoldList.sort((a, b) => {
            if (a.date === b.date) {
                if (a.marketName === b.marketName) {
                    // Sort third by Product name
                    return a.name.localeCompare(b.name);
                }
                // Sort second by Market name
                return a.marketName.localeCompare(b.marketName);
            }
            // Sort first by Market date
            return (new Date(b.date) - new Date(a.date));
        });
        setMarkProdTable(prodSoldList.map(p => {
            const D = new Date(p.date);
            return (
                <div className="tr">
                    <div className="td">{p.name}</div>
                    <div className="td">{p.marketName}</div>
                    <div className="td">{`${(String(D.getUTCMonth() + 1)).padStart(2, "0")}/${String(D.getUTCDate()).padStart(2, "0")}/${String(D.getUTCFullYear())}`}</div>
                    <div className="td">{p.sold}</div>
                </div>
            );
        }));
    }
    
    // Export sales metrics to CSV
    const exportCSV = () => {
        const csvData = `Product Name,Market Name,Market Date,Count Sold\n` + markProdData.map(p => {
            const D = new Date(p.date);
            const DATE_STRING = `${(String(D.getUTCMonth() + 1)).padStart(2, "0")}/${String(D.getUTCDate()).padStart(2, "0")}/${String(D.getUTCFullYear())}`;
            return `${p.name},${p.marketName},${DATE_STRING},${p.sold}\n`;
        }).join("");
        const BLOB = new Blob([csvData], {type: "text/csv"});
        const CSV_URL = URL.createObjectURL(BLOB);
        const CSV_LINK = document.createElement("a");
        CSV_LINK.href = CSV_URL;
        if (type === 1) {
            CSV_LINK.download = `${query}.csv` || "data.csv";
        } else {
            const D1 = new Date(query[0]);
            const DATE_STRING_1 = `${(String(D1.getUTCMonth() + 1)).padStart(2, "0")}.${String(D1.getUTCDate()).padStart(2, "0")}.${String(D1.getUTCFullYear())}`;
            const D2 = new Date(query[1]);
            const DATE_STRING_2 = `${(String(D2.getUTCMonth() + 1)).padStart(2, "0")}.${String(D2.getUTCDate()).padStart(2, "0")}.${String(D2.getUTCFullYear())}`;
            CSV_LINK.download = `${DATE_STRING_1}-${DATE_STRING_2}.csv` || "data.csv";
        }
        document.body.appendChild(CSV_LINK);
        CSV_LINK.click();
        document.body.removeChild(CSV_LINK);
        URL.revokeObjectURL(CSV_URL);
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
                    <div className="reportHeader">
                        {type === 1 ?
                            <>
                                <h2>Report </h2>
                                <h3>{`("${query}")`}</h3>
                            </> :
                            <>
                                <h2>Report</h2>
                                <h3>{`(${String(new Date(query[0]).getUTCMonth() + 1).padStart(2, "0")}/${String(new Date(query[0]).getUTCDate()).padStart(2, "0")}/${new Date(query[0]).getUTCFullYear()} to ${String(new Date(query[1]).getUTCMonth() + 1).padStart(2, "0")}/${String(new Date(query[1]).getUTCDate()).padStart(2, "0")}/${new Date(query[1]).getUTCFullYear()})`}</h3>
                            </>
                        }
                    </div>
                    <h3>Number of Markets: <span className="data">{filteredData.length}</span></h3>
                    <h3>Total Products Sold: <span className="data">{
                        filteredData.map(m => {
                            const soldProds = m.products.map(p => p.countAllocated - p.countRemaining);
                            return (soldProds.reduce((a, b) => a + b, 0));
                        }).reduce((a, b) => a + b, 0)
                    }</span></h3>

                    <h3>Top Selling Products:</h3>
                    <div className="table two">
                        <div className="tr thead">
                            <div className="th">Product Name</div>
                            <div className="th">Sold</div>
                        </div>
                        <div className="tbody">
                            {bestSellers}
                        </div>
                    </div>
                    <h3>Sales by Date:</h3>
                    <div className="table reportSales">
                        <div className="tr thead">
                            <div className="th">Product Name</div>
                            <div className="th">Market Name</div>
                            <div className="th">Date</div>
                            <div className="th">Sold</div>
                        </div>
                        <div className="tbody">
                            {markProdTable}
                        </div>
                    </div>
                    <div className="reportBtnWrap">
                        <button type="button" onClick={exportCSV}>Export CSV</button>
                    </div>
                </div>
                }
            </div>
        </div>
    );
}