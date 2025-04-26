import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import Select from "react-select";
import TR from "./TR";

export default function AddModal({ toggleAddModal, addModal, collection, DB_URL, setRefresh, banner, setBanner }) {
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
    const [markName, setMarkName] = useState("");
    const handleMarkNameChange = e => setMarkName(e.target.value);
    const [markDate, setMarkDate] = useState("");
    const handleMarkDateChange = e => setMarkDate(e.target.value);
    const [markProdOptions, setMarkProdOptions] = useState([]);
    const [markProds, setMarkProds] = useState([]);
    const handleMarkProdsChange = options => setMarkProds(options || []);

    // Maximum product allowed to be allocated to a market
    const MAX_VAL = 999;
    const [productCountAllocated, setProductCountAllocated] = useState([]);
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

    const [loading, setLoading] = useState(true);

    const handleSubmit = e => {
        e.preventDefault();
        if (collection === "Products") {
            axios.post(`${DB_URL}/addProducts`, {
                name: prodName,
                category: (prodCategoryOption === -1 ? prodNewCategory : prodCategoryOption),
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
            axios.post(`${DB_URL}/addMarkets`, {
                name: markName,
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

    useEffect(() => {
        if (collection === "Products") {
            setLoading(true);
            axios.get(`${DB_URL}/getProducts`).then(res => {
                let list = res.data.map(item => ({ value: item.category, label: item.category }));
                list.push({ value: -1, label: "-- New Category --" });
                list = list.filter((a, i, self) => i === self.findIndex(b => b.value === a.value));
                setProdOptions([...list]);
            }).catch(err => {
                console.error(err);
            }).finally(() => setLoading(false));
        }
        if (collection === "Markets") {
            setLoading(true);
            axios.get(`${DB_URL}/getProducts`).then(res => {
                const list = res.data.map(item => ({ value: item._id, label: item.name }));
                setMarkProdOptions(list);
            }).catch(err => {
                console.error(err);
            }).finally(() => setLoading(false));
        }
    }, [addModal]);

    useEffect(() => {
        setProductCountAllocated(prev => {
            const arr = [...prev];
            while (arr.length < markProds.length) arr.push(0);
            return arr.slice(0, markProds.length);
        });
    }, [markProds]);

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
                        {prodCategoryOption === -1 &&
                            <div>
                                <label htmlFor="prodNewCategory">New Category:</label>
                                <input type="text" name="prodNewCategory" id="prodNewCategory" value={prodNewCategory} onChange={handleProdNewCategoryChange} required />
                            </div>}
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
                            <input type="text" name="markName" id="markName" value={markName} onChange={handleMarkNameChange} required />
                        </div>
                        <div>
                            <label htmlFor="markDate">Date:</label>
                            <input type="date" name="markDate" id="markDate" value={markDate} onChange={handleMarkDateChange} required />
                        </div>
                        <div>
                            <label htmlFor="markProds">Market Products:</label>
                            <Select className="select" options={markProdOptions} onChange={handleMarkProdsChange} isMulti />
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