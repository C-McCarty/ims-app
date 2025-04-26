import { useState, useEffect } from "react";
import Select from "react-select";
import Report from "./Report";
import axios from "axios";

export default function ReportMenu({ DB_URL }) {
    const [reportType, setReportType] = useState(-1);
    const handleTypeChange = option => {
        setReportType(option.value);
        setFromDate("");
        setToDate("");
        setMarketName("");
    }

    const [fromDate, setFromDate] = useState("");
    const handleFromDateChange = e => setFromDate(e.target.value);
    const [toDate, setToDate] = useState("");
    const handleToDateChange = e => setToDate(e.target.value);
    const [marketName, setMarketName] = useState("");
    const handleMarketNameChange = e => setMarketName(e.target.value);

    const [report, toggleReport] = useState(false);

    const [marketData, setMarketData] = useState([]);

    const handleSubmit = e => {
        e.preventDefault();
        axios.get(`${DB_URL}/getMarkets`).then(res => {
            setMarketData(res.data);
            toggleReport(true);
        });
    }

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
                        <input type="date" name="toDate" id="toDate" value={toDate} onChange={handleToDateChange} required />
                    </div>
                </>
                // Report by Name
                : reportType === 1 ?
                <div>
                    <label htmlFor="marketName">Market Name:</label>
                    <input type="text" name="marketName" id="marketName" value={marketName} onChange={handleMarketNameChange} required />
                </div>
                : null}
                <div>
                    <button type="submit">Generate</button>
                </div>
            </form>
            {report ? 
                <Report type={reportType} data={marketData} query={reportType === 0 ? [fromDate, toDate] : marketName} toggleReport={toggleReport} />
            : null}
        </div>
    );
}