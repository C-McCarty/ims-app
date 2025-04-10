import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/App.css';
import SignInForm from './comp/SignInForm';
import Header from './comp/Header';
import EditForm from './comp/EditForm';
import Error404 from './comp/Error404';
import Loading from './comp/Loading';
import ListItem from './comp/ListItem';
import AddModal from './comp/AddModal';

function App() {
    // const DB_URL = process.env.DB_URL;
    const DB_URL = "https://tmcf-ims-app.onrender.com";

    const [signedIn, toggleSignedIn] = useState(false);
    const [viewData, setViewData] = useState([]);
    const [viewItems, setViewItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [collection, setCollection] = useState("");
    const [modalOpen, toggleModalOpen] = useState(false);
    const [addModal, toggleAddModal] = useState(false);

    const handleSignIn = (DB, PWD) => {
        toggleSignedIn(true);
        setPage(0);
        setCollection("Dashboard");
    }
    // 0 = Dashboard
    const [page, setPage] = useState(0);

    const [manageFormSelect, setManageFormSelect] = useState(0);
    const handleManageFormSelect = (e) => {
        setManageFormSelect(e.target.value);
    }

    useEffect(() => {
        setManageFormSelect(0);
    }, [page]);
    
    useEffect(() => {
        if (page == 2) {
            setLoading(true);
            // Credit for help: https://www.freecodecamp.org/news/how-to-use-axios-with-react/
            axios.get(`${DB_URL}/get${collection}`).then(response => {
                setViewData(response.data);
            });
        }
    }, [page, collection]);

    useEffect(() => {
        if (viewData.length > 0) {
            if (collection === "Products") {
                const list = viewData.map((item, i) => {
                    return (
                        <ListItem collection={collection} name={item.name} category={item.category} taxable={(item.isTaxable) ? "Yes" : "No"} count={item.count} />
                    );
                });
                setViewItems(list);
            } else if (collection === "Markets") {
                const list = viewData.map((item, i) => {
                    return (
                        <tr>
                            <td>{item.name}</td>
                            <td>{new Date(item.date).toDateString()}</td>
                            <td>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Allocated</th>
                                            <th>Remaining</th>
                                            <th>Sold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.products.map((prod, i) => {
                                        return (
                                            <tr>
                                                <td>{prod.name}</td>
                                                <td className='count'>{prod.countAllocated}</td>
                                                <td className='count'>{prod.countRemaining}</td>
                                                <td className='count'>{prod.countAllocated - prod.countRemaining}</td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </td>
                            <td className="edit">Edit</td>
                        </tr>
                    );
                });
                setViewItems(list);
            }
            setLoading(false);
        }
    }, [viewData, page]);

    useEffect(() => {
        if (viewItems.length > 0 && viewItems.length == viewData.length) {
            setLoading(false);
        }
    }, [viewItems]);

    const appRef = useRef(null);
    const handleFullScreen = e => {
        console.log("fired")
        appRef.current.requestFullscreen().catch(err => {
            console.warn(err);
        });
    }


    if (signedIn) {
        // Dashboard
        if (page == 0) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} setCollection={setCollection} />
                    <main>
                        <h1>{collection}</h1>
                        <div id="settings" onClick={()=>{toggleModalOpen(true)}}></div>
                        <div id="dashboard">
                            <div className="widget s1x2">
                                <h2>Recent Markets</h2>
                            </div>
                            <div className="widget">
                                <h2>Quick Links</h2>
                            </div>
                            <div className="widget s2x2">
                                <h2>Report</h2>
                            </div>
                            <div className="widget">
                                <h2>Analysis</h2>
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
        } else if (page == 1) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} setCollection={setCollection} />
                    <main>
                        <h1>I Want to... <select className="manageFormSelect" value={manageFormSelect} onChange={handleManageFormSelect}><option value="0">Add</option><option value="1">Remove</option></select> a {collection}</h1>
                        <EditForm collection={collection} type={manageFormSelect} DB_URL={DB_URL} />
                    </main>
                </div>
            );
        } else if (page == 2) {
            return (
                <div className="App" onClick={handleFullScreen} ref={appRef}>
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
                    <AddModal toggleAddModal={toggleAddModal} addModal={addModal} collection={collection} DB_URL={DB_URL} />
                </div>
            );
        } else if (page == 3) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} setCollection={setCollection} />
                    <main>
                        <h1>{collection}</h1>
                        <div className="card">
                            <h2>Recent Markets</h2>
                        </div>
                        <div className="card">
                            <h2>Recent Sales</h2>
                        </div>
                    </main>
                </div>
            );
        } else {
            return (
                <Error404 />
            );
        }
    } else {
        return (
            <>
                <Header />
                <SignInForm signedIn={signedIn} handleSignIn={handleSignIn} />
            </>
        );
    }
}

export default App;