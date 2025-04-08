import "../styles/header.css";

export default function Header({nav=false, toggleSignedIn, setPage}) {
    if (nav) {
        return (
            <header>
                <div id="logo"></div>
                <div className="spacer"></div>
                <nav>
                    <div className="navBtn" onClick={()=>{setPage([0, "Dashboard"])}} ><h3>Dashboard</h3></div>
                    <div className="navDropDown">
                        <div className="options">
                            <div className="navBtn" onClick={()=>{setPage([1, "Product"])}} ><h4>Products</h4></div>
                            <div className="navBtn" onClick={()=>{setPage([1, "Market"])}} ><h4>Markets</h4></div>
                        </div>
                        <h3>Manage</h3>
                    </div>
                    <div className="navDropDown">
                        <div className="options">
                            <div className="navBtn" onClick={()=>{setPage([2, "Products"])}} ><h4>Products</h4></div>
                            <div className="navBtn" onClick={()=>{setPage([2, "Markets"])}} ><h4>Markets</h4></div>
                            <div className="navBtn" onClick={()=>{setPage([2, "Analytics"])}} ><h4>Analytics</h4></div>
                            <div className="navBtn" onClick={()=>{setPage([2, "Transactions"])}} ><h4>Transactions</h4></div>
                        </div>
                        <h3>View</h3>
                    </div>
                    <div className="navBtn" onClick={()=>{setPage([3, "Report"])}} ><h3>Reports</h3></div>
                    <div className="navBtn" onClick={()=>{toggleSignedIn(false)}}><h3>Sign Out</h3></div>
                </nav>
            </header>
        );
    } else {
        return (
            <header>
                <div className="spacer"></div>
                <div id="logo"></div>
                <div className="spacer"></div>
            </header>
        );
    }
}