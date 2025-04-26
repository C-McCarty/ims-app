import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import ConfirmationModal from "./ConfirmationModal";
import Select from "react-select";

export default function EditForm({collection, DB_URL, name=null, category=null, taxable=null, count=null, date=null, products=null, editForm, toggleEditForm, _id, setRefresh, banner, setBanner}) {
    const NEW_CATEGORY_FLAG = -1;
    const MAX_VAL = 999; // For market allocation/remaining
    
    const [loading, setLoading] = useState(true);
    // Control input data for Products
    const [prodName, setProdName] = useState((collection == "Products" ? name : ""));
    const handleProdNameChange = e => setProdName(e.target.value);
    const [prodCategoryOption, setProdCategoryOption] = useState((category != null ? category : ""));
    const handleProdCategoryChange = option => setProdCategoryOption(option);
    const [prodNewCategory, setProdNewCategory] = useState("");
    const handleProdNewCategoryChange = e => setProdNewCategory(e.target.value);
    const [prodIsTaxable, setProdIsTaxable] = useState((taxable != null ? ((taxable) ? 1 : 0) : 1));
    const handleProdIsTaxableChange = option => setProdIsTaxable(option);
    const [prodCount, setProdCount] = useState((count != null ? count : 0));
    const handleProdCountChange = e => setProdCount(e.target.value);
    const [prodOptionData, setProdOptionData] = useState([]);
    const [prodOptions, setProdOptions] = useState([]);

    // Control input data for Markets
    const [markName, setMarkName] = useState((collection == "Markets" ? name : ""));
    const handleMarkNameChange = e => setMarkName(e.target.value);
    const [markDate, setMarkDate] = useState((collection == "Markets" ? date : ""));
    const handleMarkDateChange = e => setMarkDate(e.target.value);
    
    // List of products at the market
    const [markProdList, setMarkProdList] = useState((products != null ? products.map(p => {return {value: p._id, label: p.name}}) : []));
    // handles changes to the Select
    const handleUpdateMarkProdList = (options) => {
        setMarkProdList(options);
        setProductCountAllocated(options.map((opt, i) => {
          const existing = markProdList.findIndex(p => p.value === opt.value);
          return existing !== -1 ? productCountAllocated[existing] : 0;
        }));
        setProductCountRemaining(options.map((opt, i) => {
          const existing = markProdList.findIndex(p => p.value === opt.value);
          return existing !== -1 ? productCountRemaining[existing] : 0;
        }));
      };
      
    const [markProdListOptions, setMarkProdListOptions] = useState([]);
    // Updates the Market Product table
    const [markProds, setMarkProds] = useState([]);

    // Array to handle controls from dynamic Product inputs
    const [productCountAllocated, setProductCountAllocated] = useState([]);
    const handleProductCountAllocatedChange = (e, i) => setProductCountAllocated(list => {
        const newList = [...list];
        const val = Math.floor(e.target.value);
        if (val < 0) {
            newList[i] = 0;
        } else if (val > MAX_VAL) {
            newList[i] = MAX_VAL;
        } else {
            newList[i] = val;
        }
        return newList;
    });
    const handleProductCountRemainingChange = (e, i) => setProductCountRemaining(list => {
        const newList = [...list];
        const val = Math.floor(e.target.value);
        if (val < 0) {
            newList[i] = 0;
        } else if (val > MAX_VAL) {
            newList[i] = MAX_VAL;
        } else {
            newList[i] = val;
        }
        return newList;
    });
    const [productCountRemaining, setProductCountRemaining] = useState([]);
    
    const [confirmModal, toggleConfirmModal] = useState(false);

    // Update the counts of individual Products for a Market when the EditForm loads
    useEffect(() => {
        if (collection === "Markets" && editForm && products?.length > 0) {
            const list = products.map(p => ({
                value: p._id,
                label: p.name
            }));
            setMarkProdList(list);
            setProductCountAllocated(products.map(p => p.countAllocated ?? 0));
            setProductCountRemaining(products.map(p => p.countRemaining ?? 0));
        }
    }, [editForm, products]);
    
    // Populate EditForm dropdowns
    useEffect(() => {
        if (collection === "Products") {
            setLoading(true);
            axios.get(`${DB_URL}/getProducts`).then(res => {
                let list = res.data.map(item => ({ value: item.category, label: item.category }));
                list.push({ value: NEW_CATEGORY_FLAG, label: "-- New Category --" });
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
                setMarkProdListOptions(list);
            }).catch(err => {
                console.error(err);
            }).finally(() => setLoading(false));
        }
    }, [editForm]);

    useEffect(() => {
        setLoading(true);
        console.log(markProdList)
        const list = markProdList.map((p, i) => {
            return (
                <div className="tr" key={`${p.value}${p.label}${i}`}>
                    <div className="td">{p.label}</div>
                    <div className="td"><input type="number" name={`prodAllocated${i}`} id={`prodAllocated${i}`} value={productCountAllocated[i]} onChange={e => {handleProductCountAllocatedChange(e, i)}} /></div>
                    <div className="td"><input type="number" name={`prodRemaining${i}`} id={`prodRemaining${i}`} value={productCountRemaining[i]} onChange={e => {handleProductCountRemainingChange(e, i)}} /></div>
                </div>
            );
        });
        setMarkProds(list);
    }, [markProdList, productCountAllocated, productCountRemaining]);
    useEffect(() => {
        setLoading(false);
    }, [markProds]);

    // Handle Submit: Update Product or Market
    const handleSubmit = e => {
        e.preventDefault();
        if (collection == "Products") {
            axios.put(`${DB_URL}/updateProducts`, {
                _id: _id,
                name: prodName,
                category: (prodCategoryOption == NEW_CATEGORY_FLAG ? prodNewCategory : prodCategoryOption),
                isTaxable: (prodIsTaxable == 1 ? true : false),
                count: prodCount
            }).then(() => {
                setBanner([true, 0, "Product updated successfully!"]);
                toggleEditForm(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                setBanner([true, 2, "An error occurred while trying to update your product. Please try again later."]);
            });
        } else {
            axios.put(`${DB_URL}/updateMarkets`, {
                _id: _id,
                name: markName,
                date: markDate,
                products: markProdList.map((prod, i) => ({
                    _id: prod.value,
                    name: prod.label,
                    countAllocated: productCountAllocated[i] || 0,
                    countRemaining: productCountRemaining[i] || 0
                }))
            }).then(() => {
                setBanner([true, 0, "Market updated successfully!"]);
                toggleEditForm(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                setBanner([true, 2, "An error occurred while trying to update your market. Please try again later."]);
            });
        }
    }
    // Soft Delete from database
    const handleDelete = () => {
        if (collection === "Products") {
            axios.put(`${DB_URL}/deleteProduct`, { _id }).then(() => {
                setBanner([true, 1, `Product "${name}" was successfully deleted.`]);
                toggleEditForm(false);
                toggleConfirmModal(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                setBanner([true, 2, "An error occurred while trying to delete your product. Please try again later."]);
            });
        } else if (collection === "Markets") {
            console.log(_id, name)
            axios.put(`${DB_URL}/deleteMarket`, { _id }).then(() => {
                setBanner([true, 1, `Market "${name}" was successfully deleted.`]);
                toggleEditForm(false);
                toggleConfirmModal(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                setBanner([true, 2, "An error occurred while trying to delete your market. Please try again later."]);
            });
        }
    }
    
    if (editForm) {
        // Product edit form
        if (collection == "Products") {
            return (
                <div id="editFormWrap" className="modalWrap">
                    <div id="editModal" className="modal">
                        <h2>Edit {name}</h2>
                        <div className="closeBtn" onClick={() => toggleEditForm(false)}>
                            <div></div>
                            <div></div>
                        </div>
                        <form id="EditForm" className="popupForm" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="prodName">Product Name:</label>
                                <input type="text" name="prodName" id="prodName" value={prodName} onChange={handleProdNameChange} required />
                            </div>
                            <div>
                                <label htmlFor="prodCategory">Product Category:</label>
                                {loading ? <Loading /> : 
                                    <Select className="select" options={prodOptions} onChange={handleProdCategoryChange} value={{value: category, label: category}} required />
                                }
                            </div>
                            {prodCategoryOption === NEW_CATEGORY_FLAG ?
                                <div>
                                    <label htmlFor="prodNewCategory">New Category:</label>
                                    <input type="text" name="prodNewCategory" id="prodNewCategory" value={prodNewCategory} onChange={handleProdNewCategoryChange} required />
                                </div>
                            : null}
                            <div>
                                <label htmlFor="prodTaxable">Taxable?</label>
                                <Select className="select" options={[{ value: 1, label: "Yes" }, { value: 0, label: "No" }]} onChange={handleProdIsTaxableChange} value={{value: (taxable === "Yes" ? 1 : 0), label: taxable}} required />
                            </div>
                            <div>
                                <label htmlFor="prodCount">Product Count:</label>
                                <input type="number" id="prodCount" min={0} max={100} step={1} value={prodCount} onChange={handleProdCountChange} required />
                            </div>
                            <div className="half">
                                <button type="submit">Save</button>
                                <button type="button" className="deleteBtn" onClick={() => toggleConfirmModal(true)}>Delete Product</button>
                            </div>
                        </form>
                        <ConfirmationModal name={name} confirmModal={confirmModal} toggleConfirmModal={toggleConfirmModal} handleDelete={handleDelete} />
                    </div>
                </div>
            );
        }
        // Market edit form
        else if (collection == "Markets") {
            return (
                <div id="editFormWrap" className="modalWrap">
                    <div id="editModal" className="modal">
                        <h2>Edit {name}</h2>
                        <div className="closeBtn" onClick={() => toggleEditForm(false)}>
                            <div></div>
                            <div></div>
                        </div>
                        <form id="EditForm" className="popupForm" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="markName">Market Name:</label>
                                <input type="text" name="markName" id="markName" value={markName} onChange={handleMarkNameChange} required />
                            </div>
                            <div>
                                <label htmlFor="markDate">Market Date:</label>
                                <input type="date" name="markDate" id="markDate" value={markDate} onChange={handleMarkDateChange} />
                            </div>
                            {loading ? <Loading /> : <>
                                <div>
                                    <label htmlFor="markProds">Products:</label>
                                        <Select className="select" options={markProdListOptions} onChange={handleUpdateMarkProdList} value={markProdList} isMulti />
                                </div>
                                <div className="table edit">
                                    <div className="tr thead">
                                        <div className="th">Name</div>
                                        <div className="th">Sent</div>
                                        <div className="th">Left</div>
                                    </div>
                                    <div className="tbody">
                                        {markProds}
                                    </div>
                                </div>
                            </> }
                            <div className="half">
                                <button type="submit">Save</button>
                                <button type="button" className="deleteBtn" onClick={() => toggleConfirmModal(true)}>Delete Market</button>
                            </div>
                        </form>
                        <ConfirmationModal name={name} confirmModal={confirmModal} toggleConfirmModal={toggleConfirmModal} handleDelete={handleDelete} market />
                    </div>
                </div>
            );
        }
    }
}