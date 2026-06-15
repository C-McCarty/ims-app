import { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/App.css';
import SignInForm from './comp/SignInForm';
import Header from './comp/Header';
import Error404 from './comp/Error404';
import Loading from './comp/Loading';
import ListItem from './comp/ListItem';
import AddModal from './comp/AddModal';
import Banner from './comp/Banner';
import ReportMenu from './comp/ReportMenu';
import { sha256 } from 'js-sha256';

// Sort a working list in place: Products alphabetically, Markets by date (newest first) then name.
function sortCollection(data, collection) {
    if (collection === "Products") {
        data.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        data.sort((a, b) => {
            const D1 = new Date(a.date);
            const D2 = new Date(b.date);
            if (D1.getTime() === D2.getTime()) {
                return a.name.localeCompare(b.name);
            }
            return D2 - D1;
        });
    }
    return data;
}

export default function App() {
    const [imageProducts, setImageProducts] = useState(null);
    const [workingProducts, setWorkingProducts] = useState(null);
    const [imageMarkets, setImageMarkets] = useState(null);
    const [workingMarkets, setWorkingMarkets] = useState(null);

    const [signedIn, toggleSignedIn] = useState(false);
    const [signInFail, toggleSignInFail] = useState(false);
    const [DB_URL, setDB_URL] = useState("");

    const [viewData, setViewData] = useState([]);

    const [activeNav, setActiveNav] = useState(1);
    const [activeSubNav, setActiveSubNav] = useState(0);

    const [collection, setCollection] = useState("");
    const [modalOpen, toggleModalOpen] = useState(false);
    const [addModal, toggleAddModal] = useState(false);
    const [banner, setBanner] = useState([false, -1, ""]);

    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(0);

    const [page, setPage] = useState(-1);

    useEffect(() => {
        // Ask once for OS notification permission, guarding browsers that lack the API.
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        const DB = localStorage.getItem('DB_URL');
        if (DB !== null && DB.length > 0) {
            setDB_URL(DB);
        }
    }, []);

    // Load and sort the working copy whenever the list page opens, the collection
    // changes, or a refresh is requested.
    useEffect(() => {
        if (page === 1) {
            setLoading(true);
            const stored = localStorage.getItem(`w${collection}`);
            const data = sortCollection(stored ? JSON.parse(stored) : [], collection);
            setViewData(data);
            setRefresh(false);
            setLoading(false);
        }
    }, [page, collection, refresh]);

    useEffect(() => {
        if (banner[0]) {
            // Mirror the in-app toast to the OS notification center, but only when the
            // app is backgrounded — foreground users already see the on-screen banner.
            if (
                typeof Notification !== 'undefined' &&
                Notification.permission === 'granted' &&
                document.visibilityState !== 'visible'
            ) {
                const titles = ['Success', 'Notice', 'Error'];
                new Notification(titles[banner[1]] || 'Notification', {
                    body: banner[2],
                    icon: `${process.env.PUBLIC_URL || ''}/logo192.png`,
                    tag: 'ims-app',
                });
            }
            const timer = setTimeout(() => setBanner([false, -1, ""]), 3500);
            return () => clearTimeout(timer);
        }
    }, [banner]);

    const handleSignIn = (DB, PWD) => {
        axios.post(`https://ims-auth.onrender.com/authenticate`, {
            USER: sha256(DB),
            PASS: sha256(PWD)
        }).then(res => {
            if (res.data.AUTH) {
                setDB_URL(res.data.URL);
            } else {
                toggleSignInFail(true);
            }
        }).catch(err => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        if (DB_URL.length > 0 && !signedIn) {
            toggleSignedIn(true);
            setPage(0);
            setCollection("Dashboard");
            localStorage.setItem('DB_URL', DB_URL);
        }
    }, [DB_URL, signedIn]);

    const fetchAndStoreData = async (endpoint, itemKey) => {
        try {
            const res = await axios.get(`${DB_URL}/${endpoint}`);
            const sortedData = res.data.sort((a, b) => a.name.localeCompare(b.name));
            localStorage.setItem(`i${itemKey}`, JSON.stringify(sortedData));
            localStorage.setItem(`w${itemKey}`, JSON.stringify(sortedData));
        } catch (err) {
            console.error(`Error fetching/storing ${itemKey}:`, err);
        }
    };

    const resetLocalData = async () => {
        setLoading(true);
        localStorage.removeItem('iProducts');
        localStorage.removeItem('wProducts');
        localStorage.removeItem('iMarkets');
        localStorage.removeItem('wMarkets');
        await Promise.all([
            fetchAndStoreData('getProducts', 'Products'),
            fetchAndStoreData('getMarkets', 'Markets')
        ]);
        setLoading(false);
    };

    const downloadSync = async () => {
        const confirmation = prompt("Are you sure you want to Download Sync? This will erase any unsaved changes you have made (Y/N).");
        if (confirmation === "Y") {
            setLoading(true);
            await resetLocalData(); // Wait for fetches + localStorage writes to finish

            setImageProducts(JSON.parse(localStorage.getItem("iProducts")));
            setWorkingProducts(JSON.parse(localStorage.getItem("wProducts")));
            setImageMarkets(JSON.parse(localStorage.getItem("iMarkets")));
            setWorkingMarkets(JSON.parse(localStorage.getItem("wMarkets")));

            setBanner([true, 0, "Download Sync completed successfully!"]);
            setLoading(false);
        }
    };

    // Utility to find differences between imageData and workingData arrays by _id
    function diffItems(imageData, workingData) {
        // Create maps keyed by _id or _tempid
        const imageMap = new Map(
            imageData.map(item => [item._id || item._tempid, item])
        );
        const workingMap = new Map(
            workingData.map(item => [item._id || item._tempid, item])
        );

        const added = [];
        const updated = [];
        const deleted = [];

        // Find added and updated items
        for (const [id, workItem] of workingMap.entries()) {
            const imageItem = imageMap.get(id);
            if (!imageItem) {
                added.push(workItem);
            } else if (JSON.stringify(workItem) !== JSON.stringify(imageItem)) {
                updated.push(workItem);
            }
        }

        // Find deleted items (in image but not in working)
        for (const [id, imageItem] of imageMap.entries()) {
            if (!workingMap.has(id)) {
                deleted.push(imageItem);
            }
        }

        return { added, updated, deleted };
    }

    useEffect(() => {
        setWorkingProducts(JSON.parse(localStorage.getItem("wProducts")));
        setWorkingMarkets(JSON.parse(localStorage.getItem("wMarkets")));
    }, [refresh, addModal]);

    const uploadSync = async () => {
        if (!window.confirm("Are you sure you want to Upload Sync? This will update only the changed items.")) return;

        setLoading(true);

        try {
            // Diff for Products
            const productDiff = diffItems(imageProducts || [], workingProducts || []);
            // Handle added products
            for (const product of productDiff.added) {
                if (product._tempid) {
                    delete product._tempid;
                }
                await axios.post(`${DB_URL}/addProducts`, product);
            }
            // Handle updated products (send only changed fields)
            for (const product of productDiff.updated) {
                const imageProduct = (imageProducts || []).find(p => (p._id || p._tempid) === (product._id || product._tempid));
                const changedFields = {};
                for (const key in product) {
                    if (JSON.stringify(product[key]) !== JSON.stringify(imageProduct?.[key])) {
                        changedFields[key] = product[key];
                    }
                }
                changedFields._id = product._id;
                await axios.put(`${DB_URL}/updateProducts`, changedFields);
            }
            // Handle deleted products (soft delete)
            for (const product of productDiff.deleted) {
                await axios.put(`${DB_URL}/deleteProduct`, { _id: product._id });
            }

            // Diff for Markets
            const marketDiff = diffItems(imageMarkets || [], workingMarkets || []);
            for (const market of marketDiff.added) {
                if (market._tempid) {
                    delete market._tempid;
                }
                await axios.post(`${DB_URL}/addMarkets`, market);
            }
            for (const market of marketDiff.updated) {
                const imageMarket = (imageMarkets || []).find(m => (m._id || m._tempid) === (market._id || market._tempid));
                const changedFields = {};
                for (const key in market) {
                    if (JSON.stringify(market[key]) !== JSON.stringify(imageMarket?.[key])) {
                        changedFields[key] = market[key];
                    }
                }
                changedFields._id = market._id;
                await axios.put(`${DB_URL}/updateMarkets`, changedFields);
            }
            for (const market of marketDiff.deleted) {
                await axios.put(`${DB_URL}/deleteMarket`, { _id: market._id });
            }

            // Refresh local image and working copies after successful upload
            await resetLocalData(); // This fetches fresh from server and resets localStorage

            setImageProducts(JSON.parse(localStorage.getItem("iProducts")));
            setWorkingProducts(JSON.parse(localStorage.getItem("wProducts")));
            setImageMarkets(JSON.parse(localStorage.getItem("iMarkets")));
            setWorkingMarkets(JSON.parse(localStorage.getItem("wMarkets")));

            setBanner([true, 1, "Upload Sync completed successfully!"]);
        } catch (err) {
            console.error("Upload Sync failed:", err);
            setBanner([true, 2, "Upload Sync failed. Check console for more information."]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setPage(-1);
        setDB_URL("");
        localStorage.removeItem('DB_URL');
        localStorage.removeItem('iProducts');
        localStorage.removeItem('wProducts');
        localStorage.removeItem('iMarkets');
        localStorage.removeItem('wMarkets');
        toggleSignedIn(false);
        toggleModalOpen(false);
    };

    if (!signedIn) {
        return (
            <div className='App'>
                <Header />
                <SignInForm loading={loading} setLoading={setLoading} signedIn={signedIn} handleSignIn={handleSignIn} signInFail={signInFail} toggleSignInFail={toggleSignInFail} />
            </div>
        );
    }

    return (
        <div className="App">
            <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} setCollection={setCollection} activeNav={activeNav} setActiveNav={setActiveNav} activeSubNav={activeSubNav} setActiveSubNav={setActiveSubNav} />
            <div className="pageWrap">
                { loading ? <Loading />
                : page === 0 ? <Dashboard collection={collection} modalOpen={modalOpen} toggleModalOpen={toggleModalOpen} downloadSync={downloadSync} uploadSync={uploadSync} handleLogout={handleLogout} />
                : page === 1 ? <List loading={loading} collection={collection} DB_URL={DB_URL} viewData={viewData} setRefresh={setRefresh} toggleAddModal={toggleAddModal} addModal={addModal} banner={banner} setBanner={setBanner} />
                : page === 2 ? <ReportView DB_URL={DB_URL} />
                : <Error404 /> }
            </div>
            {banner[0] &&
                <Banner active={banner[0]} type={banner[1]} msg={banner[2]} />
            }
        </div>
    );
}

function Dashboard({ collection, modalOpen, toggleModalOpen, downloadSync, uploadSync, handleLogout }) {
    return (
        <>
            <main>
                <h1>{collection}</h1>
                <div id="settings" onClick={() => toggleModalOpen(true)}></div>
                <div id="dashboard">
                    {/* Optional widgets */}
                    <div className='btnGroup'>
                        <div><button onClick={downloadSync}>Download Sync</button></div>
                        <div><button onClick={uploadSync}>Upload Sync</button></div>
                    </div>
                </div>
            </main>
            {modalOpen && (
                <>
                    <div className="overlay"></div>
                    <div id='modalWrap'>
                        <div id="modal">
                            <h2>McCarty Farm Inventory Management System</h2>
                            <div className='closeBtn' onClick={() => toggleModalOpen(false)}>
                                <div></div>
                                <div></div>
                            </div>
                            <h3>Developer: Cameron McCarty</h3>
                            <div id='logout' onClick={handleLogout}></div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function List({ loading, collection, DB_URL, viewData, setRefresh, toggleAddModal, addModal, banner, setBanner }) {
    return (
        <>
            <main>
                {loading ? <Loading /> : (
                    <>
                        <div id="title">
                            <h1>View {collection}</h1>
                            <div id="refresh" className="icon" onClick={() => setRefresh(true)}></div>
                        </div>
                        <div id='list'>
                            <div className='listItem' onClick={() => toggleAddModal(true)}>
                                <div className='add'></div>
                                <h3>Add Item</h3>
                            </div>
                            {viewData.map((item) => (
                                collection === "Products" ? (
                                    <ListItem
                                        collection={collection}
                                        DB_URL={DB_URL}
                                        name={item.name}
                                        category={item.category}
                                        taxable={item.isTaxable ? "Yes" : "No"}
                                        count={item.count}
                                        key={item._id || item._tempid}
                                        _id={item._id || item._tempid}
                                        setRefresh={setRefresh}
                                        banner={banner}
                                        setBanner={setBanner}
                                    />
                                ) : (
                                    <ListItem
                                        collection={collection}
                                        DB_URL={DB_URL}
                                        name={item.name}
                                        date={item.date}
                                        products={item.products}
                                        key={item._id || item._tempid}
                                        _id={item._id || item._tempid}
                                        setRefresh={setRefresh}
                                        banner={banner}
                                        setBanner={setBanner}
                                    />
                                )
                            ))}
                        </div>
                    </>
                )}
            </main>
            <AddModal toggleAddModal={toggleAddModal} addModal={addModal} collection={collection} DB_URL={DB_URL} setRefresh={setRefresh} banner={banner} setBanner={setBanner} />
        </>
    );
}

function ReportView({ DB_URL }) {
    return (
        <main>
            <h1>Generate Report</h1>
            <ReportMenu DB_URL={DB_URL} />
        </main>
    );
}
