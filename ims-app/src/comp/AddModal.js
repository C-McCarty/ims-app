import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import Select from "react-select";
import TR from "./TR";

export default function AddModal({ toggleAddModal, addModal, collection, DB_URL, setRefresh, banner, setBanner }) {
    // Constants
    const NEW_FLAG = -1;
    // Maximum product allowed to be allocated to a market
    const MAX_VAL = 999;
    
    // State variables
    const [loading, setLoading] = useState(true);

    // Product state
    const [prodName, setProdName] = useState("");
    const handleProdNameChange = e => setProdName(e.target.value);
    const [prodCategoryOption, setProdCategoryOption] = useState("");
    const handleCategoryChange = option => setProdCategoryOption(option.value);
    const [prodNewCategory, setProdNewCategory] = useState("");
    const handleProdNewCategoryChange = e => setProdNewCategory(e.target.value);
    const [prodIsTaxable, setProdIsTaxable] = useState(1);
    const handleProdIsTaxableChange = option => setProdIsTaxable(option.value);
    const [prodCount, setProdCount] = useState(0);
    const handleProdCountChange = e => setProdCount(e.target.value);
    const [prodOptions, setProdOptions] = useState([]);

    // Market state
    const [markNames, setMarkNames] = useState([]);
    const [markOpt, setMarkOpt] = useState(null);
    const handleMarkNameOptChange = option => setMarkOpt(option);
    const [markName, setMarkName] = useState("");
    const handleMarkNameChange = e => setMarkName(e.target.value);
    const [markDate, setMarkDate] = useState("");
    const handleMarkDateChange = e => setMarkDate(e.target.value);
    const [markProdOptions, setMarkProdOptions] = useState([]);
    const [markProds, setMarkProds] = useState([]);
    const handleMarkProdsChange = options => setMarkProds(options || []);

    // Stores the amount of each Product allocated for the Market
    const [productCountAllocated, setProductCountAllocated] = useState([]);

    // Handlers
    const handleProductCountAllocatedChange = (e, i) => {
        const newList = [...productCountAllocated];
        const val = Math.floor(e.target.value);
        if (val < 0) {
            newList[i] = 0;
        } else if (val > MAX_VAL) {
            newList[i] = MAX_VAL;
        } else {
            newList[i] = val;
        }
        setProductCountAllocated(newList);
    };
    const handleSubmit = e => {
        e.preventDefault();
        if (collection === "Products") {
            // Submit Product data
            axios.post(`${DB_URL}/addProducts`, {
                name: prodName,
                category: (prodCategoryOption === NEW_FLAG ? prodNewCategory : prodCategoryOption),
                isTaxable: prodIsTaxable === 1,
                count: prodCount
            }).then(() => {
                setBanner([true, 0, `Product "${prodName}" added successfully!`]);
                setProdName("");
                setProdCategoryOption("");
                setProdNewCategory("");
                setProdIsTaxable(1);
                setProdCount(0);
                toggleAddModal(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                setBanner([true, 2, "An error occurred while trying to add your product. Please try again later."]);
            });
        } else {
            // Submit Market data
            axios.post(`${DB_URL}/addMarkets`, {
                name: (markOpt.value === NEW_FLAG ? markName : markOpt.value),
                date: markDate,
                products: markProds.map((p, i) => ({
                    _id: p.value,
                    name: p.label,
                    countAllocated: Number(productCountAllocated[i] || 0),
                    countRemaining: Number(productCountAllocated[i] || 0) // Same initial value
                }))
            }).then(() => {
                setBanner([true, 0, `Market "${markName}" added successfully!`]);
                setMarkName("");
                setMarkDate("");
                setMarkProds([]);
                toggleAddModal(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                setBanner([true, 2, "An error occurred while trying to add your market. Please try again later."]);
            });
        }
    };
    const handleClose = () => {
        setProdName("");
        setProdCategoryOption("");
        setProdNewCategory("");
        setProdIsTaxable(1);
        setProdCount(0);
        setMarkName("");
        setMarkDate("");
        setMarkProds([]);
        toggleAddModal(false);
    };

    // useEffect methods
    // Get existing metadata
    useEffect(() => {
        if (collection === "Products") {
            setLoading(true);
            // Get content for existing Product categories
            axios.get(`${DB_URL}/getProducts`).then(res => {
                // Filter out duplicates and sort alphabetically
                let list = res.data.map(item => (item.category));
                list = new Set(list);
                list = [...list].sort((a, b) => a.localeCompare(b)).map(c => ({value: c, label: c}));
                setProdOptions([...list, { value: -1, label: "-- New Category --" }]);
            }).catch(err => {
                console.error(err);
            }).finally(() => setLoading(false));
        }
        if (collection === "Markets") {
            setLoading(true);
            // Get content for Product list
            axios.get(`${DB_URL}/getProducts`).then(res => {
                // Get Product list
                const list = res.data.map(item => ({ value: item._id, label: item.name }));
                setMarkProdOptions(list);
                setMarkProds(list);
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                // Get content for existing Market names
                axios.get(`${DB_URL}/getMarkets`).then(results => {
                    // Filter out duplicates and sort alphabetically
                    let markNameList = results.data.map(m => m.name);
                    markNameList = new Set(markNameList);
                    markNameList = [...markNameList].sort((a, b) => a.localeCompare(b)).map(name => ({value: name, label: name}));
                    setMarkNames([...markNameList, {value: -1, label: "-- New Market --"}]);
                }).catch(err => {
                    console.error(err);
                }).finally(() => setLoading(false));
            });
        }
    }, [addModal]);
    // Pad prodCountAllocated array with 0s when it is shorter than the amount of market products
    useEffect(() => {
        setProductCountAllocated(prev => {
            const list = [...prev];
            while (list.length < markProds.length) {
                list.push(0);
            }
            return list.slice(0, markProds.length);
        });
    }, [markProds]);

    // If the AddModal is inactive it will not display
    if (!addModal) return null;
    
    return (
        <div id="addModalWrap" className="modalWrap">
            <div id="addModal" className="modal">
                <h2>Add {collection === "Products" ? "Product" : "Market"}</h2>
                <div className="closeBtn" onClick={handleClose}>
                    <div></div>
                    <div></div>
                </div>
                {loading ? <Loading /> : collection === "Products" ?
                    <form id="addForm" className="popupForm" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="prodName">Product Name:</label>
                            <input type="text" name="prodName" id="prodName" value={prodName} onChange={handleProdNameChange} required />
                        </div>
                        <div>
                            <label htmlFor="prodCategory">Product Category:</label>
                            {loading ? <Loading /> :
                                <Select className="select" options={prodOptions} onChange={handleCategoryChange} required />
                            }
                        </div>
                        {prodCategoryOption === NEW_FLAG ?
                            <div>
                                <label htmlFor="prodNewCategory">New Category:</label>
                                <input type="text" name="prodNewCategory" id="prodNewCategory" value={prodNewCategory} onChange={handleProdNewCategoryChange} required />
                            </div>
                        : null}
                        <div>
                            <label htmlFor="prodTaxable">Taxable?</label>
                            <Select className="select" options={[{ value: 1, label: "Yes" }, { value: 0, label: "No" }]} onChange={handleProdIsTaxableChange} required />
                        </div>
                        <div>
                            <label htmlFor="prodCount">Product Count:</label>
                            <input type="number" id="prodCount" min={0} max={100} step={1} value={prodCount} onChange={handleProdCountChange} required />
                        </div>
                        <div>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                    :
                    <form id="addForm" className="popupForm" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="markName">Market Name:</label>
                            <Select className="select" options={markNames} onChange={handleMarkNameOptChange} required />
                        </div>
                        {markOpt?.value === NEW_FLAG ?
                        <div>
                            <label htmlFor="markName">New Market Name:</label>
                            <input type="text" name="markName" id="markName" value={markName} onChange={handleMarkNameChange} required />
                        </div>
                        : null }
                        <div>
                            <label htmlFor="markDate">Date:</label>
                            <input type="date" name="markDate" id="markDate" value={markDate} onChange={handleMarkDateChange} required />
                        </div>
                        <div>
                            <label htmlFor="markProds">Market Products:</label>
                            <Select className="select" options={markProdOptions} value={markProds} onChange={handleMarkProdsChange} isMulti />
                        </div>
                        <div>
                            {markProds.length > 0 ?
                                <div className="table">
                                    <div className="tr send">
                                        <div className="th">Name</div>
                                        <div className="th">Allocated</div>
                                    </div>
                                    {markProds.map((item, i) => (
                                        <TR key={`p${item.value}${i}`}
                                            item={item}
                                            i={i}
                                            productCountAllocated={productCountAllocated}
                                            handleProductCountAllocatedChange={handleProductCountAllocatedChange}
                                            send={true} />
                                    ))}
                                </div>
                            : null}
                        </div>
                        <div>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                }
            </div>
        </div>
    );
}