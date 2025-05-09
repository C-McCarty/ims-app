import { useState } from "react";
import "../styles/header.css";

export default function Header({nav=false, toggleSignedIn, setPage, setCollection, subNav=true}) {
    const [activeNav, toggleActiveNav] = useState(1);
    const [activeSubNav, toggleActiveSubNav] = useState(0);

    // x = page, y = collection
    const handleClick = (x, y) => {
        setPage(x);
        setCollection(y);
        toggleActiveSubNav(0);
    }

    if (nav) {
        return (
            <>
                <header>
                    <nav>
                        <div className={activeNav == 0 ? "active navBtn list" : "navBtn list"} onClick={()=>{toggleActiveNav(0); handleClick(2, "Products")}}></div>
                        <div className={activeNav == 1 ? "active navBtn logo" : "navBtn logo"} onClick={()=>{toggleActiveNav(1); handleClick(0, "Dashboard")}}></div>
                        <div className={activeNav == 3 ? "active navBtn repo" : "navBtn repo"} onClick={()=>{toggleActiveNav(3); handleClick(3, "Report")}}></div>
                    </nav>
                </header>
                {activeNav === 0 ?
                    <div id="subNav">
                            <>
                                <div className={activeSubNav == 0 ? "active subNav" : "subNav"} onClick={()=>{toggleActiveSubNav(0); setCollection("Products")}}><h4>Products</h4></div>
                                <div className={activeSubNav == 1 ? "active subNav" : "subNav"} onClick={()=>{toggleActiveSubNav(1); setCollection("Markets")}}><h4>Markets</h4></div>
                            </>
                    </div>
                : null}
            </>
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