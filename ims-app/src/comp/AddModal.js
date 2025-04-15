import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "./Loading";

export default function AddModal({toggleAddModal, addModal, collection, DB_URL, setRefresh}) {
    // Control input data for Products
    const [prodName, setProdName] = useState("");
    const handleProdNameChange = e => setProdName(e.target.value);
    const [prodCategoryOption, setProdCategoryOption] = useState(-1);
    const handleSelCategoryChange = e => setProdCategoryOption(e.target.value);
    const [prodNewCategory, setProdNewCategory] = useState("");
    const handleProdNewCategoryChange = e => setProdNewCategory(e.target.value);
    const [prodIsTaxable, setProdIsTaxable] = useState(1);
    const handleProdIsTaxableChange = e => setProdIsTaxable(e.target.value);
    const [prodCount, setProdCount] = useState(0);
    const handleProdCountChange = e => setProdCount(e.target.value);
    const [prodOptionData, setProdOptionData] = useState([]);
    const [prodOptions, setProdOptions] = useState([]);

    // Control input data for Markets
    const [markName, setMarkName] = useState("");
    const handleMarkNameChange = e => setMarkName(e.target.value);
    const [markDate, setMarkDate] = useState("");
    const handleMarkDateChange = e => setMarkDate(e.target.value);
    const [markProds, setMarkProds] = useState([]);
    const handleMarkProdsChange = e => setMarkProds(e.target.value);

    // Toggle loading screen component
    const [loading, setLoading] = useState(false);

    // Handle form submission for adding a Product or a Market
    const handleSubmit = e => {
        e.preventDefault();
        // Adding a Product
        if (collection == "Products") {
            axios.post(`${DB_URL}/addProducts`, {
                name: prodName,
                category: (prodCategoryOption == 0 ? prodNewCategory : prodCategoryOption),
                isTaxable: (prodIsTaxable == 1 ? true : false),
                count: prodCount
            }).then(()=> {
                window.alert(`Product "${prodName}" added successfully!`);
                setProdName("");
                setProdCategoryOption(null);
                setProdNewCategory("");
                setProdIsTaxable(1);
                setProdCount(0);
                toggleAddModal(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                window.alert("An error occurred while trying to add your product. Please try again later.");
            });
        }
        // Adding a Market
        else {
            axios.post(`${DB_URL}/addMarkets`, {
                name: markName,
                date: markDate,
                products: markProds
            }).then(() => {
                window.alert(`Market "${markName}" added successfully!`);
                setMarkName("");
                setMarkDate("");
                setMarkProds([]);
                toggleAddModal(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                window.alert("An error occurred while trying to add your market. Please try again later.");
            });
        }
    };
    // Get Product categories to populate category dropdown
    useEffect(() => {
        setLoading(true);
        if (collection == "Products") {
            axios.get(`${DB_URL}/get${collection}`).then(res => {
                let list = res.data.map(item => {return item.category});
                list = new Set(list);
                list = [...list];
                setProdOptionData([...list]);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [addModal]);
    
    // Generate <option> elements for category dropdown
    useEffect(() => {
        const list = prodOptionData.map((opt, i) => {
            return <option value={opt} key={i}>{opt}</option>
        });
        setProdOptions(list);
        setLoading(false);
    }, [prodOptionData]);
    
    const handleClose = () => {
        setProdName("");
        setProdCategoryOption(-1);
        setProdNewCategory("");
        setProdIsTaxable(1);
        setProdCount(0);
        setMarkName("");
        setMarkDate("");
        setMarkProds([]);
        toggleAddModal(false);
    }

    if (addModal) {
        return (
            <div id="addModalWrap" className="modalWrap">
                <div id="addModal" className="modal">
                    <h2>Add {collection == "Products" ? "Product" : "Market"}</h2>
                    <div className="closeBtn" onClick={handleClose}>
                        <div></div>
                        <div></div>
                    </div>
                    {loading ? <Loading /> :
                        collection == "Products" ?
                        <form id="addForm" className="popupForm" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="prodName">Product Name:</label>
                                <input type="text" name="prodName" id="prodName" value={prodName} onChange={handleProdNameChange} required />
                            </div>
                            <div>
                                <label htmlFor="prodCategory">Product Category:</label>
                                <select name="prodCategory" id="prodCategory" value={prodCategoryOption} onChange={handleSelCategoryChange} required >
                                    <option value="-1" disabled hidden></option>
                                    {prodOptions}
                                    <option value={0}>-- New Category --</option>
                                </select>
                            </div>
                            {prodCategoryOption == 0 ?
                                <div>
                                    <label htmlFor="prodNewCategory">New Category:</label>
                                    <input type="text" name="prodNewCategory" id="prodNewCategory" value={prodNewCategory} onChange={handleProdNewCategoryChange} required />
                                </div>
                            : null}
                            <div>
                                <label htmlFor="prodTaxable">Taxable?</label>
                                <select name="prodTaxable" id="prodTaxable" value={prodIsTaxable} onChange={handleProdIsTaxableChange} required >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="prodCount">Product Count:</label>
                                <input type="number" id="prodCount" min={0} value={prodCount} onChange={handleProdCountChange} required />
                            </div>
                            <div>
                                <button type="submit">Submit</button>
                            </div>
                        </form>
                        : null
                    }
                </div>
            </div>
        );
    }
}