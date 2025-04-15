import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import ConfirmationModal from "./ConfirmationModal";

export default function EditForm({collection, DB_URL, name=null, category=null, taxable=null, count=null, date=null, products=null, editForm, toggleEditForm, _id, setRefresh}) {
    const [loading, setLoading] = useState(true);
    
    // Control input data for Products
    const [prodName, setProdName] = useState((collection == "Products" ? name : ""));
    const handleProdNameChange = e => setProdName(e.target.value);
    const [prodCategoryOption, setProdCategoryOption] = useState((collection == "Products" ? category : ""));
    const handleProdCategoryChange = e => setProdCategoryOption(e.target.value);
    const [prodNewCategory, setProdNewCategory] = useState("");
    const handleProdNewCategoryChange = e => setProdNewCategory(e.target.value);
    const [prodIsTaxable, setProdIsTaxable] = useState((collection == "Products" ? ((taxable) ? 1 : 0) : 1));
    const handleProdIsTaxableChange = e => setProdIsTaxable(e.target.value);
    const [prodCount, setProdCount] = useState((collection == "Products" ? count : 0));
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
    const [prodDeleted, setProdDeleted] = useState(false);
    const [confirmModal, toggleConfirmModal] = useState(false);

    // Get Product categories to populate category dropdown
    useEffect(() => {
        setLoading(true);
        if (collection == "Products") {
            axios.get(`${DB_URL}/getProducts`).then(res => {
                console.log(res.data);
                let list = res.data.map(item => {return item.category});
                list = new Set(list);
                list = [...list];
                setProdOptionData([...list]);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [editForm]);
    
    // Generate <option> elements for category dropdown
    useEffect(() => {
        const list = prodOptionData.map((opt, i) => {
            return <option value={opt} key={i}>{opt}</option>
        });
        setProdOptions(list);
        setLoading(false);
    }, [prodOptionData]);

    const handleSubmit = e => {
        e.preventDefault();
        if (collection == "Products") {
            axios.put(`${DB_URL}/updateProducts`, {
                _id: _id,
                name: prodName,
                category: (prodCategoryOption == 0 ? prodNewCategory : prodCategoryOption),
                isTaxable: (prodIsTaxable == 1 ? true : false),
                count: prodCount
            }).then(()=> {
                window.alert("Product updated successfully");
                toggleEditForm(false);
                setRefresh(true);
            });
        } else {

        }
    }
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
                window.alert(`Product "${name}" was successfully deleted.`);
                toggleEditForm(false);
                toggleConfirmModal(false);
                setRefresh(true);
            }).catch(err => {
                console.error(err);
                window.alert("An error occurred while trying to delete your product. Please try again later.");
            });
        }
    }

    if (editForm) {
        if (collection == "Products") {
            return (
                <div id="editFormWrap" className="modalWrap">
                    <div id="editModal" className="modal">
                        <h2>Edit {name}</h2>
                        <div className="closeBtn" onClick={handleClose}>
                            <div></div>
                            <div></div>
                        </div>
                        {collection == "Products" ?
                            <form id="EditForm" className="popupForm" onSubmit={handleSubmit}>
                                
                                <div>
                                    <label htmlFor="prodName">Product Name:</label>
                                    <input type="text" name="prodName" id="prodName" value={prodName} onChange={handleProdNameChange} required />
                                </div>
                                <div>
                                    <label htmlFor="prodCategory">Product Category:</label>
                                    {loading ? <Loading /> : 
                                    <select name="prodCategory" id="prodCategory" value={prodCategoryOption} onChange={handleProdCategoryChange} required >
                                        {prodOptions}
                                        <option value={0}>-- New Category --</option>
                                    </select>}
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
                                <div className="half">
                                    <button type="submit">Save</button>
                                    <button type="button" className="deleteBtn" onClick={confirmDelete}>Delete Product</button>
                                </div>
                            </form>
                            : null
                        }
                        <ConfirmationModal name={name} confirmModal={confirmModal} toggleConfirmModal={toggleConfirmModal} handleDelete={handleDelete} />
                    </div>
                </div>
            );
        }
    }
}