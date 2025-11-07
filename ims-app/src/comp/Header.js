import "../styles/header.css";

export default function Header({nav=false, toggleSignedIn, setPage, setCollection, activeNav, setActiveNav, activeSubNav=null, setActiveSubNav=null}) {

    // x = page, y = collection
    const handleClick = (x, y) => {
        setPage(x);
        setCollection(y);
        setActiveSubNav(1);
    }

    if (nav) {
        return (
            <>
                <header>
                    <nav>
                        <div className={activeNav === 0 ? "active navBtn" : "navBtn"} onClick={()=>{setActiveNav(0); handleClick(1, "Markets")}}>
                            <div className="list"></div>
                        </div>
                        <div className={activeNav === 1 ? "active navBtn" : "navBtn"} onClick={()=>{setActiveNav(1); handleClick(0, "Dashboard")}}>
                            <div className="logo"></div>
                        </div>
                        <div className={activeNav === 2 ? "active navBtn" : "navBtn"} onClick={()=>{setActiveNav(2); handleClick(2, "Report")}}>
                            <div className="repo"></div>
                        </div>
                    </nav>
                </header>
                {activeNav === 0 ?
                    <div id="subNav">
                            <>
                                <div className={activeSubNav === 0 ? "active subNav" : "subNav"} onClick={()=>{setActiveSubNav(0); setCollection("Products")}}><h4>Products</h4></div>
                                <div className={activeSubNav === 1 ? "active subNav" : "subNav"} onClick={()=>{setActiveSubNav(1); setCollection("Markets")}}><h4>Markets</h4></div>
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