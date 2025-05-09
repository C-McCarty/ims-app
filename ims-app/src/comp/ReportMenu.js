import { useState, useEffect } from "react";
import Select from "react-select";
import Report from "./Report";
import axios from "axios";
import Loading from "./Loading";

export default function ReportMenu({ DB_URL }) {
    // State variables
    const [reportType, setReportType] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [report, toggleReport] = useState(false);
    const [marketData, setMarketData] = useState([]);
    
    const [fromDate, setFromDate] = useState("");
    const handleFromDateChange = e => setFromDate(e.target.value);
    const [toDate, setToDate] = useState("");
    const handleToDateChange = e => setToDate(e.target.value);
    const [marketNames, setMarketNames] = useState([]);
    const [markName, setMarkName] = useState("");
    const handleMarketNameChange = option => setMarkName(option.value);
    
    // Handlers
    const handleTypeChange = option => {
        setLoading(true);
        setReportType(option.value);
        setFromDate("");
        setToDate("");
        setMarketNames([]);
        setMarkName("");
    }
    const handleSubmit = e => {
        e.preventDefault();
        axios.get(`${DB_URL}/getMarkets`).then(res => {
            setMarketData(res.data);
            toggleReport(true);
        }).catch(err => {
            console.error(err);
        });
    }

    // useEffect methods
    useEffect(() => {
        if (loading) {
            if (reportType == 1) {
                axios.get(`${DB_URL}/getMarkets`).then(res => {
                    let list = res.data.map(m => (m.name));
                    list = new Set(list);
                    list = [...list];
                    list = list.map(name => ({value: name, label: name}));
                    list.sort((a, b) => a.value.localeCompare(b.value));
                    setMarketNames(list);
                }).catch(err => {
                    console.error(err);
                }).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        }
    }, [loading]);

    return (
        <div id="reportMenu">
            <form className="reportForm" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="reportType">Report Type:</label>
                    <Select className="reportSelect" options={[{value: 0, label: "By Date"},{value: 1, label: "By Name"}]} onChange={handleTypeChange} required />
                </div>
                {/* Report by Date */}
                {reportType === 0 ? 
                <>
                    <div>
                        <label htmlFor="fromDate">From Date:</label>
                        <input type="date" name="fromDate" id="fromDate" value={fromDate} onChange={handleFromDateChange} required />
                    </div>
                    <div>
                        <label htmlFor="toDate">To Date:</label>
                        <input type="date" name="toDate" id="toDate" value={toDate} min={fromDate !== "" ? fromDate : null} onChange={handleToDateChange} required />
                    </div>
                {/* Report by Name */}
                </> : reportType === 1 ?
                    <div>
                        <label htmlFor="marketName">Market Name:</label>
                        <Select className="reportSelect" options={marketNames} value={{value: markName, label: markName}} onChange={handleMarketNameChange} required />
                    </div>
                : null}
                <div>
                    <button type="submit">Generate</button>
                </div>
            </form>
            {report ? 
                <Report type={reportType} data={marketData} query={reportType === 0 ? [fromDate, toDate] : markName} toggleReport={toggleReport} />
            : null}
        </div>
    );
}