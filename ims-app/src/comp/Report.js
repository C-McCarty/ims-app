import { useState, useEffect } from "react";
import Loading from "./Loading";

// Units sold for a market product, clamped at 0 (remaining should never exceed allocated)
const soldOf = p => (p.countAllocated >= p.countRemaining ? p.countAllocated - p.countRemaining : 0);

// Format a date value as MM<sep>DD<sep>YYYY in UTC
const formatDate = (value, sep = "/") => {
    const D = new Date(value);
    return `${String(D.getUTCMonth() + 1).padStart(2, "0")}${sep}${String(D.getUTCDate()).padStart(2, "0")}${sep}${String(D.getUTCFullYear())}`;
};

export default function Report({ type, data, query, toggleReport }) {
    // State variables
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [markProdRows, setMarkProdRows] = useState([]);

    useEffect(() => {
        // Filter the markets in scope for this report
        let list;
        if (type === 0) {
            // Search by Date
            list = data.filter(x => {
                const d = new Date(x.date).toISOString().split("T")[0];
                return (d >= query[0] && d <= query[1]);
            });
        } else {
            // Search by Name
            list = data.filter(x => (x.name === query));
        }
        setFilteredData(list);

        // Flatten to one row per product sold at each market
        const prodSoldList = list.flatMap(m => m.products.map(p => ({
            name: p.name,
            sold: soldOf(p),
            marketName: m.name,
            date: m.date
        })));

        // Combine sold amount for each Product, then sort by most sold then by name
        const prodTotals = [];
        for (const entry of prodSoldList) {
            const prod = prodTotals.find(b => entry.name === b.name);
            if (prod) { prod.sold += entry.sold; }
            else { prodTotals.push({ name: entry.name, sold: entry.sold }); }
        }
        prodTotals.sort((a, b) => (a.sold === b.sold ? a.name.localeCompare(b.name) : b.sold - a.sold));
        setBestSellers(prodTotals.slice(0, 5));

        // Sort sold-per-market rows: by date (newest first), then market name, then product name
        const sortedRows = [...prodSoldList].sort((a, b) => {
            if (a.date === b.date) {
                if (a.marketName === b.marketName) {
                    return a.name.localeCompare(b.name);
                }
                return a.marketName.localeCompare(b.marketName);
            }
            return new Date(b.date) - new Date(a.date);
        });
        setMarkProdRows(sortedRows);

        setLoading(false);
    }, []);

    // Total units sold across every market in scope
    const totalSold = filteredData.reduce(
        (sum, m) => sum + m.products.reduce((s, p) => s + soldOf(p), 0),
        0
    );

    // Export sales metrics to CSV
    const exportCSV = () => {
        const csvData = `Product Name,Market Name,Market Date,Count Sold\n` + markProdRows.map(p =>
            `${p.name},${p.marketName},${formatDate(p.date)},${p.sold}\n`
        ).join("");
        const BLOB = new Blob([csvData], { type: "text/csv" });
        const CSV_URL = URL.createObjectURL(BLOB);
        const CSV_LINK = document.createElement("a");
        CSV_LINK.href = CSV_URL;
        CSV_LINK.download = type === 1
            ? `${query || "data"}.csv`
            : `${formatDate(query[0], ".")}-${formatDate(query[1], ".")}.csv`;
        document.body.appendChild(CSV_LINK);
        CSV_LINK.click();
        document.body.removeChild(CSV_LINK);
        URL.revokeObjectURL(CSV_URL);
    };

    return (
        <div id="reportWrap">
            <div id="report">
                <div className="closeBtn" onClick={() => { toggleReport(false); }}><div></div><div></div></div>
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
                                    <h3>{`(${formatDate(query[0])} to ${formatDate(query[1])})`}</h3>
                                </>
                            }
                        </div>
                        <h3>Number of Markets: <span className="data">{filteredData.length}</span></h3>
                        <h3>Total Products Sold: <span className="data">{totalSold}</span></h3>

                        <h3>Top Selling Products:</h3>
                        <div className="table two">
                            <div className="tr thead">
                                <div className="th">Product Name</div>
                                <div className="th">Sold</div>
                            </div>
                            <div className="tbody">
                                {bestSellers.map(p => (
                                    <div className="tr" key={p.name}>
                                        <div className="td">{p.name}</div>
                                        <div className="td">{p.sold}</div>
                                    </div>
                                ))}
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
                                {markProdRows.map((p, i) => (
                                    <div className="tr" key={`${p.date}-${p.marketName}-${p.name}-${i}`}>
                                        <div className="td">{p.name}</div>
                                        <div className="td">{p.marketName}</div>
                                        <div className="td">{formatDate(p.date)}</div>
                                        <div className="td">{p.sold}</div>
                                    </div>
                                ))}
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
