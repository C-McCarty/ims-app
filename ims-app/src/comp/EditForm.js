import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import ConfirmationModal from "./ConfirmationModal";

export default function EditForm({collection, DB_URL, name=null, category=null, taxable=null, count=null, date=null, products=null, editForm, toggleEditForm, _id, setRefresh, banner, setBanner}) {
    const [loading, setLoading] = useState(true);
    
    // Control input data for Products
    const [prodName, setProdName] = useState((collection == "Products" ? name : ""));
    const handleProdNameChange = e => setProdName(e.target.value);
    const [prodCategoryOption, setProdCategoryOption] = useState((category != null ? category : ""));
    const handleProdCategoryChange = e => setProdCategoryOption(e.target.value);
    const [prodNewCategory, setProdNewCategory] = useState("");
    const handleProdNewCategoryChange = e => setProdNewCategory(e.target.value);
    const [prodIsTaxable, setProdIsTaxable] = useState((taxable != null ? ((taxable) ? 1 : 0) : 1));
    const handleProdIsTaxableChange = e => setProdIsTaxable(e.target.value);
    const [prodCount, setProdCount] = useState((count != null ? count : 0));
    const handleProdCountChange = e => setProdCount(e.target.value);
    const [prodOptionData, setProdOptionData] = useState([]);
    const [prodOptions, setProdOptions] = useState([]);

    // Control input data for Markets
    const [markName, setMarkName] = useState((collection == "Markets" ? name : ""));
    const handleMarkNameChange = e => setMarkName(e.target.value);
    const [markDate, setMarkDate] = useState((collection == "Markets" ? date : ""));
    const handleMarkDateChange = e => setMarkDate(e.target.value);
    const [markProds, setMarkProds] = useState((collection == "Markets" ? products : []));
    const handleMarkProdsChange = e => setMarkProds(e.target.value);
    const [markProdOption, setMarkProdOption] = useState(-1);
    const handleMarkProdOptionChange = e => setMarkProdOption(e.target.value);
    const [prodList, setProdList] = useState([]);
    // Array to handle controls from dynamic Product inputs
    const [productCountAllocated, setProductCountAllocated] = useState([]);
    const handleProductCountAllocatedChange = (e, i) => setProductCountAllocated(list => {
        const newList = [...list];
        newList[i] = e.target.value;
        return newList;
    });
    const handleProductCountRemainingChange = (e, i) => setProductCountRemaining(list => {
        const newList = [...list];
        newList[i] = e.target.value;
        return newList;
    });
    const [productCountRemaining, setProductCountRemaining] = useState([]);
    
    const [confirmModal, toggleConfirmModal] = useState(false);

    // Update the counts of individual Products for a Market when the EditForm loads
    useEffect(() => {
        if (collection === "Markets") {
            const countsAllocated = products.map((p) => {
                return p.countAllocated;
            });
            setProductCountAllocated(countsAllocated);
            const countsRemaining = products.map((p) => {
                return p.countRemaining;
            });
            setProductCountRemaining(countsRemaining);
        }
    }, [editForm]);
    // Get Product categories to populate category dropdown for Products and Product names to populate Product dropdown for Markets
    useEffect(() => {
        setLoading(true);
        axios.get(`${DB_URL}/getProducts`).then(res => {
            let categoryList = res.data.map(item => {return item.category});
            categoryList = new Set(categoryList);
            categoryList = [...categoryList];
            setProdOptionData([...categoryList]);
            const prodListData = res.data.map(item => {return {_id: item._id, name: item.name}});
            setProdList(prodListData);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [editForm]);
    
    // Generate <option> elements for category dropdown
    useEffect(() => {
        const list = prodOptionData.map((opt, i) => {
            return <option value={opt} key={i}>{opt}</option>
        });
        setProdOptions(list);
        setLoading(false);
    }, [prodOptionData]);

    // Handle Submit: Update Product or Market
    const handleSubmit = e => {
        e.preventDefault();
        if (collection == "Products") {
            axios.put(`${DB_URL}/updateProducts`, {
                _id: _id,
                name: prodName,
                category: (prodCategoryOption == 0 ? prodNewCategory : prodCategoryOption),
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

        }
    }
    // Close the EditForm component
    const handleClose = () => {
        toggleEditForm(false);
    }
    // Confirmation to delete Product/Market
    const confirmDelete = () => {
        toggleConfirmModal(true);
    }
    // Soft Delete from database
    const handleDelete = () => {
        if (collection == "Products") {
            axios.put(`${DB_URL}/deleteProduct`, { _id }).then(() => {
                setBanner([true, 1, `Product "${name}" was successfully deleted.`]);
                toggleEditForm(false);
                toggleConfirmModal(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                setBanner([true, 2, "An error occurred while trying to delete your product. Please try again later."]);
            });
        }
    }
    // Add a Product to the Market
    const handleAddMarkProd = () => {
        axios.put(`${DB_URL}/updateMarkets`, {
            _id: _id,
            name: markName,
            date: markDate,
            products: []
        }).then(() => {
            toggleEditForm(false);
            setRefresh(true);
        }).catch(err => {
            console.error(err);
            setBanner(true, 2, "An error occurred while trying to add a product to this market. Please try again later.");
        });
    }

    if (editForm) {
        // Product edit form
        if (collection == "Products") {
            return (
                <div id="editFormWrap" className="modalWrap">
                    <div id="editModal" className="modal">
                        <h2>Edit {name}</h2>
                        <div className="closeBtn" onClick={handleClose}>
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
                                <select name="prodCategory" id="prodCategory" value={prodCategoryOption} onChange={handleProdCategoryChange} required >
                                    <option value="" disabled hidden></option>
                                    {prodOptions}
                                    <option value={-1}>-- New Category --</option>
                                </select>}
                            </div>
                            {prodCategoryOption == -1 ?
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
                                <input type="number" id="prodCount" min={0} max={100} step={1} value={prodCount} onChange={handleProdCountChange} required />
                            </div>
                            <div className="half">
                                <button type="submit">Save</button>
                                <button type="button" className="deleteBtn" onClick={confirmDelete}>Delete Product</button>
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
                        <div className="closeBtn" onClick={handleClose}>
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
                            <div>
                                <label htmlFor="markProds">Products:</label>
                                <select name="markProds" id="markProds" value={markProdOption} onChange={handleMarkProdOptionChange}>
                                    {prodList.map((p, i) => {
                                        return <option value={p._id} key={`${p.name}${p._id}`}>{p.name}</option>
                                    })}
                                </select>
                                <div className="addBtn" onClick={handleAddMarkProd}></div>
                            </div>
                            <div className="table">
                                <div className="tr thead">
                                    <div className="th">Name</div>
                                    <div className="th">Sent</div>
                                    <div className="th">Left</div>
                                    <div className="th"></div>
                                </div>
                                <div className="tbody">
                                    {products.map((p, i) => {
                                        return (
                                            <div className="tr">
                                                <div className="td">{p.name}</div>
                                                <div className="td"><input type="number" min={0} max={100} step={1} name={`prodAllocated${i}`} id={`prodAllocated${i}`} value={productCountAllocated[i]} onChange={e => {handleProductCountAllocatedChange(e, i)}} /></div>
                                                <div className="td"><input type="number" min={0} max={100} step={1} name={`prodRemaining${i}`} id={`prodRemaining${i}`} value={productCountRemaining[i]} onChange={e => {handleProductCountRemainingChange(e, i)}} /></div>
                                                <div className="td"><div className="remove" onClick={()=>{}}></div></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="half">
                                <button type="submit">Save</button>
                                <button type="button" className="deleteBtn" onClick={confirmDelete}>Delete Market</button>
                            </div>
                        </form>
                        <ConfirmationModal name={name} confirmModal={confirmModal} toggleConfirmModal={toggleConfirmModal} handleDelete={handleDelete} />
                    </div>
                </div>
            );
        }
    }
}