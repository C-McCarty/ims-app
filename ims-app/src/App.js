import { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/App.css';
import SignInForm from './comp/SignInForm';
import Header from './comp/Header';
import EditForm from './comp/EditForm';
import Error404 from './comp/Error404';
import Loading from './comp/Loading';
import ListItem from './comp/ListItem';
import AddModal from './comp/AddModal';
import Banner from './comp/Banner';
import ReportMenu from './comp/ReportMenu';
import { sha256 } from 'js-sha256';

export default function App() {
    /* ---- Constants ---- */
    // const DB_URL = "https://tmcf-ims-app.onrender.com";

    /* ---- useState variables ---- */

    // Controls user authentication
    const [signedIn, toggleSignedIn] = useState(false);
    const [signInFail, toggleSignInFail] = useState(false);

    // Stores Database URL
    const [DB_URL, setDB_URL] = useState("");

    // Stores Product data from the database
    const [viewData, setViewData] = useState([]);
    // Stores Product ListItem elements
    const [viewItems, setViewItems] = useState([]);
    
    // Controls whether Products or Markets are displayed
    const [collection, setCollection] = useState("");
    // Controls whether the settings modal is open or closed
    const [modalOpen, toggleModalOpen] = useState(false);
    // Controls whether the AddModal is open or closed
    const [addModal, toggleAddModal] = useState(false);
    // Control Banner display, type, and message
    const [banner, setBanner] = useState([false, -1, ""]);

    // Control loading screen
    const [loading, setLoading] = useState(false);
    // Control list refresh
    const [refresh, setRefresh] = useState(0);
    
    /* Controls the active page
    /* 0 = Dashboard
    /* 1 = Unused
    /* 2 = List
    /* 3 = Reports */
    const [page, setPage] = useState(0);

    const [bestSellers, setBestSellers] = useState([]);
    const [recentMarkets, setRecentMarkets] = useState([]);

    /* ---- useEffect functions ---- */

    // Get Products or Markets that have not been soft deleted
    useEffect(() => {
        if (page == 2) {
            setLoading(true);
            // Credit for help: https://www.freecodecamp.org/news/how-to-use-axios-with-react/
            axios.get(`${DB_URL}/get${collection}`).then(response => {
                if (collection === "Products") {
                    response.data.sort((a, b) => a.name.localeCompare(b.name));
                } else {
                    response.data.sort((a, b) => {
                        const D1 = new Date(a.date);
                        const D2 = new Date(b.date);
                        if (D1 === D2) {
                            return a.name.localeCompare(b.name);
                        }
                        return D2 - D1;
                    });
                }
                setViewData(response.data);
            });
        }
    }, [page, collection]);
    // Same as above except it only fires when the page has been refreshed
    useEffect(() => {
        if (refresh) {
            if (page == 2) {
                setLoading(true);
                axios.get(`${DB_URL}/get${collection}`).then(response => {
                    response.data.sort((a, b) => a.name.localeCompare(b.name));
                    setViewData(response.data);
                });
                setRefresh(false);
            }
        }
    }, [refresh]);
    // Generate ListItems for Products and Markets
    useEffect(() => {
        if (viewData.length > 0) {
            // Product list
            if (collection === "Products") {
                const list = viewData.map((item, i) => {
                    return (
                        <ListItem collection={collection} DB_URL={DB_URL} name={item.name} category={item.category} taxable={(item.isTaxable) ? "Yes" : "No"} count={item.count} key={item._id} _id={item._id} setRefresh={setRefresh} banner={banner} setBanner={setBanner} />
                    );
                });
                setViewItems(list);
            }
            // Market List
            else if (collection === "Markets") {
                const list = viewData.map((item, i) => {
                    return (
                        <ListItem collection={collection} DB_URL={DB_URL} name={item.name} date={item.date} products={item.products} key={i} _id={item._id} setRefresh={setRefresh} banner={banner} setBanner={setBanner} />
                    );
                });
                setViewItems(list);
            }
            setLoading(false);
        }
    }, [viewData, page]);
    // Turn off the loading screen once the viewItems list has propagated
    useEffect(() => {
        if (viewItems.length > 0 && viewItems.length == viewData.length) {
            setLoading(false);
        }
    }, [viewItems]);
    // Set Banner timeout once it loads
    useEffect(() => {
        if (banner[0]) {
            setTimeout(() => {
                setBanner(false, -1, "");
            }, 3500);
        }
    }, [banner]);

    /* ---- Handler functions ---- */

    // Handle user authentication
    const handleSignIn = (DB, PWD) => {
        axios.post(`${DB_URL}/authenticate`, {
            USER: sha256(DB),
            PASS: sha256(PWD)
        }).then(res => {
            if (res.data.AUTH) {
                setDB_URL(res.data.URL);
            } else {
                toggleSignInFail(true);
                setLoading(false);
            }
        });
    }
    useEffect(() => {
        if (DB_URL.length > 0) {
            toggleSignedIn(true);
            setPage(0);
            setCollection("Dashboard");
        }
    }, [DB_URL]);
    useEffect(() => {
        if (page === 0) {
            axios.get(`${DB_URL}/getMarkets`).then(res => {
                const prodSoldList = res.data.flatMap(m => m.products.map(p => ({ name: p.name, sold: p.countAllocated - p.countRemaining })));
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
                const marketList = res.data.map(m => ({ name: m.name, date: m.date }));
                marketList.sort((a, b) => {
                    const D1 = new Date(a.date);
                    const D2 = new Date(b.date);
                    if (D1 === D2) {
                        return a.name.localeCompare(b.name);
                    }
                    return D2 - D1;
                }).slice(0, 5);
                setRecentMarkets(marketList.map(m => {
                    const D = new Date(m.date);
                    return (
                        <div className="tr">
                            <div className="td">{m.name}</div>
                            <div className="td">{`${(String(D.getUTCMonth() + 1)).padStart(2, "0")}/${String(D.getUTCDate()).padStart(2, "0")}/${String(D.getUTCFullYear())}`}</div>
                        </div>
                    );
                }));
            });
        }
    }, [page]);

    // User has signed in
    if (signedIn) {
        // 0 | Dashboard
        if (page == 0) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} setCollection={setCollection} />
                    <main>
                        <h1>{collection}</h1>
                        <div id="settings" onClick={()=>{toggleModalOpen(true)}}></div>
                        <div id="dashboard">
                            <div className="widget">
                                <h3>Recent Markets</h3>
                                <div className="table two">
                                    <div className="thead tr">
                                        <div className="th">Name</div>
                                        <div className="th">Date</div>
                                    </div>
                                    <div className="tbody">
                                        {recentMarkets}
                                    </div>
                                </div>
                            </div>
                            <div className="widget">
                                <h3>Top Products (All Time)</h3>
                                <div className="table two">
                                    <div className="thead tr">
                                        <div className="th">Name</div>
                                        <div className="th">Sold</div>
                                    </div>
                                    <div className="tbody">
                                        {bestSellers}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    {modalOpen ?
                    <div id='modalWrap'>
                        <div id="modal">
                            <h2>McCarty Farm Inventory Management System</h2>
                            <div className='closeBtn' onClick={()=>{toggleModalOpen(false)}}>
                                <div></div>
                                <div></div>
                            </div>
                            <h3>Developer: Cameron McCarty</h3>
                            <div id='logout' onClick={()=>{toggleSignedIn(false); toggleModalOpen(false)}}></div>
                        </div>
                    </div>
                    : null}
                </div>
            );
        }
        // 2 | List
        else if (page == 2) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} setCollection={setCollection} />
                    <main>
                        <h1>View {collection}</h1>
                        {loading ? <Loading /> :
                        <div id='list'>
                            <div className='listItem' onClick={()=>{toggleAddModal(true)}}>
                                <div className='add'></div>
                                <h3>Add Item</h3>
                            </div>
                            {viewItems}
                        </div>
                        }
                    </main>
                    <AddModal toggleAddModal={toggleAddModal} addModal={addModal} collection={collection} DB_URL={DB_URL} setRefresh={setRefresh} banner={banner} setBanner={setBanner} />
                    <Banner active={banner[0]} type={banner[1]} msg={banner[2]} />
                </div>
            );
        }
        // 3 | Reports
        else if (page == 3) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} setCollection={setCollection} />
                    <main>
                        <h1>Generate Report</h1>
                        <ReportMenu DB_URL={DB_URL} />
                    </main>
                </div>
            );
        }
        // 404 Page
        else {
            return (
                <Error404 />
            );
        }
    }
    // Login page
    else {
        return (
            <div className='App'>
                <Header />
                <SignInForm loading={loading} setLoading={setLoading} signedIn={signedIn} handleSignIn={handleSignIn} signInFail={signInFail} toggleSignInFail={toggleSignInFail} />
            </div>
        );
    }
}