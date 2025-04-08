import { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/App.css';
import SignInForm from './comp/SignInForm';
import Header from './comp/Header';
import EditForm from './comp/EditForm';
import Error404 from './comp/Error404';

function App() {
    const DB_URL = "https://tmcf-ims-app.onrender.com/";

    const [signedIn, toggleSignedIn] = useState(false);
    const [viewData, setViewData] = useState([]);
    const handleSignIn = () => {        
        setTimeout(() => {
            toggleSignedIn(true);
        }, 0);

        setPage([0, "Dashboard"]);
    }
    // 0 = Dashboard
    const [page, setPage] = useState([0, "Dashboard"]);

    const [manageFormSelect, setManageFormSelect] = useState(0);
    const handleManageFormSelect = (e) => {
        setManageFormSelect(e.target.value);
    }

    useEffect(() => {
        setManageFormSelect(0);
    }, [page]);

    if (signedIn) {
        // Dashboard
        if (page[0] == 0) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} />
                    <main>
                        <h1>{page[1]}</h1>
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
                </div>
            );
        } else if (page[0] == 1) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} />
                    <main>
                        <h1>I Want to... <select className="manageFormSelect" onChange={handleManageFormSelect}><option value="0">Add</option><option value="1">Remove</option></select> a {page[1]}</h1>
                        <EditForm item={page[1]} type={manageFormSelect} />
                    </main>
                </div>
            );
        } else if (page[0] == 2) {
            axios.get(`${DB_URL}/get${page[1]}`).then(response => {
                setViewData(response.data);
            });
            fetch(`get${page[1]}`).then(
                response => response.json()
            ).then(data => {
                setViewData(JSON.stringify(data));
            }).catch(err => console.log(err));
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} />
                    <main>
                        <h1>View {page[1]}</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Taxable?</th>
                                    <th>Count</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Splits</td>
                                    <td>Freeze-Dried Candy</td>
                                    <td>Yes</td>
                                    <td className="count">12</td>
                                    <td className="edit"></td>
                                </tr>
                                <tr>
                                    <td>Happy Farmers</td>
                                    <td>Freeze-Dried Candy</td>
                                    <td>Yes</td>
                                    <td className="count">23</td>
                                    <td className="edit"></td>
                                </tr>
                                <tr>
                                    <td>Galaxy Brains</td>
                                    <td>Freeze-Dried Candy</td>
                                    <td>Yes</td>
                                    <td className="count">14</td>
                                    <td className="edit"></td>
                                </tr>
                                <tr>
                                    <td>Hand Soap</td>
                                    <td>Natural Home Care</td>
                                    <td>Yes</td>
                                    <td className="count">9</td>
                                    <td className="edit"></td>
                                </tr>
                                <tr>
                                    <td>Roasted Vegetable Mix</td>
                                    <td>Freeze-Dried Food</td>
                                    <td>No</td>
                                    <td className="count">9</td>
                                    <td className="edit"></td>
                                </tr>
                            </tbody>
                        </table>
                    </main>
                </div>
            );
        } else if (page[0] == 3) {
            return (
                <div className="App">
                    <Header nav={true} toggleSignedIn={toggleSignedIn} setPage={setPage} />
                    <main>
                        <h1>{page[1]}</h1>
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
