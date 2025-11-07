
// EditForm component handles editing Products and Markets
// - For Products: allows editing name, category, taxable status, and count
// - For Markets: allows editing name, date, and associated products
// - Product management modal enables adding/removing/updating products for a market
// - Changes are persisted to localStorage and trigger UI refresh
// - Uses react-select for dropdowns and custom modals for confirmation and product management
import { useEffect, useState } from "react";
import Loading from "./Loading";
import ConfirmationModal from "./ConfirmationModal";
import Select from "react-select";

/**
 * EditForm
 * @param {string} collection - 'Products' or 'Markets'
 * @param {string} name - Name of product or market
 * @param {string} category - Product category
 * @param {string} taxable - 'Yes' or 'No' for product taxable status
 * @param {number} count - Product count
 * @param {string} date - Market date
 * @param {Array} products - Products for market
 * @param {boolean} editForm - Whether the edit modal is open
 * @param {function} toggleEditForm - Function to toggle edit modal
 * @param {string} _id - Unique id for product/market
 * @param {function} setRefresh - Function to trigger UI refresh
 * @param {Array} banner - Banner state for notifications
 * @param {function} setBanner - Function to set banner
 */
export default function EditForm({
    collection,
    name = null,
    category = null,
    taxable = null,
    count = null,
    date = null,
    products = null,
    editForm,
    toggleEditForm,
    _id,
    setRefresh,
    banner,
    setBanner,
}) {
    const NEW_FLAG = -1;
    const [loading, setLoading] = useState(true);

    // --- Product fields ---
    const [prodName, setProdName] = useState(name || "");
    const [prodCategoryOption, setProdCategoryOption] = useState(category || "");
    const [prodNewCategory, setProdNewCategory] = useState("");
    const [prodIsTaxable, setProdIsTaxable] = useState(taxable === "Yes" ? 1 : 0);
    const [prodCount, setProdCount] = useState(count || 0);
    const [prodOptions, setProdOptions] = useState([]);

    // --- Market fields ---
    const [markName, setMarkName] = useState(name || "");
    const [markDate, setMarkDate] = useState(date || "");
    const [productManagementModal, setProductManagementModal] = useState(false);
    const [markProdList, setMarkProdList] = useState([]);
    const [markProdListOptions, setMarkProdListOptions] = useState([]);

    // --- Temp state for editing products inside the modal ---
    const [tempMarkProdList, setTempMarkProdList] = useState([]);

    const [confirmModal, toggleConfirmModal] = useState(false);

    // Load product/market data from localStorage when opening the edit form
    useEffect(() => {
        if (collection === "Products") {
            const data = JSON.parse(localStorage.getItem("wProducts") || "[]");
            const categories = [...new Set(data.map((p) => p.category))];
            const options = categories.map((c) => ({ value: c, label: c }));
            options.push({ value: NEW_FLAG, label: "New Category" });
            setProdOptions(options);
            setLoading(false);
        } else if (collection === "Markets") {
            const prodData = JSON.parse(localStorage.getItem("wProducts") || "[]");
            const options = prodData.map((p) => ({ value: p.name, label: p.name }));
            setMarkProdListOptions(options);
            const markets = JSON.parse(localStorage.getItem("wMarkets") || "[]");
            const currentMarket = markets.find((m) => m._id === _id || m.tempid === _id || m._tempid === _id);
            setMarkProdList(currentMarket?.products || []);
            setLoading(false);
        }
    }, [collection, _id]);

    // When opening the product management modal, copy current product list to temp state
    useEffect(() => {
        if (productManagementModal) {
            // Always pull the latest products from localStorage for the current market
            const markets = JSON.parse(localStorage.getItem("wMarkets") || "[]");
            const currentMarket = markets.find((m) => m._id === _id || m.tempid === _id || m._tempid === _id);
            setTempMarkProdList(currentMarket?.products || []);
            console.log("Temp product list set to:", currentMarket?.products || []);
        }
    }, [productManagementModal, _id]);

    /**
     * Handles form submission for editing products or markets
     * - Updates localStorage with new values
     * - Triggers UI refresh and closes modal
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (collection === "Products") {
            const stored = JSON.parse(localStorage.getItem("wProducts") || "[]");
            const updated = stored.map((item) => ((item._id === _id) || (item._tempid === _id)) ? {
                ...item,
                name: prodName,
                category: prodCategoryOption === NEW_FLAG ? prodNewCategory : prodCategoryOption.value,
                isTaxable: prodIsTaxable === 1,
                count: parseInt(prodCount),
            } : item );
            await localStorage.setItem("wProducts", JSON.stringify(updated));
            setBanner([true, 1, `Successfully updated ${prodName}`]);
        } else if (collection === "Markets") {
            // Always use the latest tempMarkProdList for products
            const productsToSave = tempMarkProdList.filter(p => !p.deleted);
            console.log("Saving products for market:", productsToSave);
            const stored = JSON.parse(localStorage.getItem("wMarkets") || "[]");
            const updated = stored.map((item) => ((item._id === _id) || (item._tempid === _id)) ? {
                ...item,
                name: markName,
                date: markDate,
                products: productsToSave,
            } : item );
            await localStorage.setItem("wMarkets", JSON.stringify(updated));
            setMarkProdList(productsToSave); // Update local state to match saved products
            setBanner([true, 1, `Successfully updated ${markName}`]);
        }
        setRefresh(true);
        toggleEditForm(false);
    };

    /**
     * Handles deletion of product or market
     * - Removes item from localStorage
     * - Triggers UI refresh and closes modal
     */
    const handleDelete = async () => {
        if (collection === "Products") {
            const data = JSON.parse(localStorage.getItem("wProducts") || "[]");
            const updated = data.filter((p) => p._id !== _id);
            await localStorage.setItem("wProducts", JSON.stringify(updated));
            setBanner([true, 2, `${name} deleted.`]);
        } else if (collection === "Markets") {
            const data = JSON.parse(localStorage.getItem("wMarkets") || "[]");
            const updated = data.filter((m) => m._id !== _id);
            await localStorage.setItem("wMarkets", JSON.stringify(updated));
            setBanner([true, 2, `${name} deleted.`]);
        }
        setRefresh(true);
        toggleEditForm(false);
    };

    // --- Product field handlers ---
    const handleProdCategoryChange = (option) => setProdCategoryOption(option);
    const handleProdNewCategoryChange = (e) => setProdNewCategory(e.target.value);
    const handleProdIsTaxableChange = (option) => setProdIsTaxable(option.value);
    const handleProdCountChange = (e) => setProdCount(e.target.value);
    const handleProdNameChange = (e) => setProdName(e.target.value);

    // --- Market field handlers ---
    const handleMarkNameChange = (e) => setMarkName(e.target.value);
    const handleMarkDateChange = (e) => setMarkDate(e.target.value);

    // Filter product options to exclude already-added products
    const filteredMarkProdListOptions = markProdListOptions.filter(
        (opt) => !tempMarkProdList.some((p) => p.name === opt.value)
    );

    /**
     * Adds a product to the temp product list for a market
     * @param {object} selected - Selected product option
     */
    const handleAddProductToTempList = (selected) => {
        if (!selected) return;
        const newProduct = {
            name: selected.value,
            countAllocated: 0,
            countRemaining: 0,
        };
        setTempMarkProdList((prev) => [...prev, newProduct]);
    };

    /**
     * Updates countAllocated or countRemaining for a product in temp list
     * @param {number} index - Index of product in temp list
     * @param {string} field - Field to update ('countAllocated' or 'countRemaining')
     * @param {number|string} value - New value
     */
    const updateTempProductCount = (index, field, value) => {
        setTempMarkProdList((prev) => {
            const updated = [...prev];
            const num = parseInt(value);
            updated[index] = {
                ...updated[index],
                [field]: isNaN(num) || num < 0 ? 0 : num,
            };
            return updated;
        });
    };

    /**
     * Toggles deletion state for a product in temp list
     * @param {string} name - Product name
     */
    const toggleProductDeletion = (name) => {
        setTempMarkProdList((prev) =>
            prev.map((p) => p.name === name ? { ...p, deleted: !p.deleted } : p
        ));
    };

    /**
     * Saves changes from product management modal to main product list
     * @param {boolean} closeAfterSave - Whether to close modal after saving
     */
    const saveProductManagementChanges = (closeAfterSave = true) => {
        const filtered = tempMarkProdList.filter(p => !p.deleted);
        setMarkProdList(filtered);
        // Immediately update localStorage for the current market
        const stored = JSON.parse(localStorage.getItem("wMarkets") || "[]");
        const updated = stored.map((item) => ((item._id === _id) || (item._tempid === _id)) ? {
            ...item,
            products: filtered,
        } : item );
        localStorage.setItem("wMarkets", JSON.stringify(updated));
        setBanner([true, 0, `Successfully updated products for ${markName}`]);
        setRefresh(true);
        if (closeAfterSave) {
            setProductManagementModal(false);
        }
    };

    // Sync temp product list to main product list when modal closes
    useEffect(() => {
        if (!productManagementModal) {
            setMarkProdList(tempMarkProdList.filter(p => !p.deleted));
        }
    }, [productManagementModal]);


    /**
     * Cancels product management changes and closes modal
     */
    const cancelProductManagementChanges = () => {
        setBanner([true, 1, `Discarded product changes`]);
        setProductManagementModal(false);
    };

    if (!editForm) return null;

    return (
        <>
            <div className="overlay"></div>
            <div id="editFormWrap" className="modalWrap">
                <div id="editModal" className="modal">
                    <h2>Edit {name}</h2>
                    <button type="button" className="closeBtn" onClick={() => toggleEditForm(false)}></button>
                    <form id="editForm" className="popupForm" onSubmit={handleSubmit}>
                        {collection === "Products" ? (
                            <>
                                <div>
                                    <label htmlFor="prodName">Product Name:</label>
                                    <input type="text" name="prodName" id="prodName" value={prodName} onChange={handleProdNameChange} required />
                                </div>
                                <div>
                                    <label htmlFor="prodCategory">Product Category:</label>
                                    {loading ? (
                                        <Loading />
                                    ) : (
                                        <Select
                                            className="select"
                                            options={prodOptions}
                                            onChange={handleProdCategoryChange}
                                            value={prodOptions.find(opt => (prodCategoryOption === NEW_FLAG) ? false : opt.value === prodCategoryOption.value || opt.value === prodCategoryOption)}
                                            required
                                        />
                                    )}
                                </div>
                                {prodCategoryOption === NEW_FLAG && (
                                    <div>
                                        <label htmlFor="prodNewCategory">New Category:</label>
                                        <input type="text" name="prodNewCategory" id="prodNewCategory" value={prodNewCategory} onChange={handleProdNewCategoryChange} required />
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="prodTaxable">Taxable?</label>
                                    <Select
                                        className="select"
                                        options={[{ value: 1, label: "Yes" }, { value: 0, label: "No" }]}
                                        onChange={handleProdIsTaxableChange}
                                        value={{ value: prodIsTaxable, label: prodIsTaxable === 1 ? "Yes" : "No" }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="prodCount">Product Count:</label>
                                    <input type="number" id="prodCount" min={0} max={100} step={1} value={prodCount} onChange={handleProdCountChange} required />
                                </div>
                                <div className="half">
                                    <button type="submit">Save</button>
                                    <button type="button" className="deleteBtn" onClick={() => toggleConfirmModal(true)}>Delete</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="formInputRow">
                                    <label htmlFor="markName">Market Name:</label>
                                    <input type="text" name="markName" id="markName" value={markName} onChange={handleMarkNameChange} required />
                                </div>
                                <div className="formInputRow">
                                    <label htmlFor="markDate">Market Date:</label>
                                    <input type="date" name="markDate" id="markDate" value={markDate} onChange={handleMarkDateChange} required />
                                </div>
                                <div>
                                    <button type="button" onClick={() => { setLoading(true); setProductManagementModal(true); }}>Manage Products</button>
                                </div>
                                {productManagementModal && (
                                    <>
                                        <div className="overlay2"></div>
                                        <div className="productManagementModal">
                                            <div className="addProductSection">
                                                <button onClick={cancelProductManagementChanges} className="productManagementCloseBtn" aria-label="Close product management modal"></button>
                                                <h3>Manage Products</h3>
                                                <div className="addProductSelectWrap">
                                                    <h5>Add Product</h5>
                                                    <Select className="select" options={filteredMarkProdListOptions} onChange={handleAddProductToTempList} value={null} isClearable />
                                                </div>
                                            </div>
                                            <div className="productListWrap">
                                                <h5>Current Products</h5>
                                                {tempMarkProdList.length === 0 ? (
                                                    <p>No products added yet.</p>
                                                ) : (
                                                    <ul className="productList">
                                                        <li className="productListHeader">
                                                            <div className="productName">Product Name</div>
                                                            <div className="productCountAllocated">Out</div>
                                                            <div className="productCountRemaining">Return</div>
                                                            <div className="productRemove"></div>
                                                        </li>
                                                        {[...tempMarkProdList].sort((a, b) => a.name.localeCompare(b.name)).map((p, i) => (
                                                            <li key={i} className={`productListItem ${p.deleted ? "removed" : ""}`}>
                                                                <div className="productName">
                                                                    <strong>{p.name}</strong>
                                                                </div>
                                                                <div className="productCountAllocated">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        value={p.countAllocated}
                                                                        onChange={(e) => updateTempProductCount(i, "countAllocated", e.target.value)}
                                                                        className="productCountInput"
                                                                        disabled={p.deleted}
                                                                    />
                                                                </div>
                                                                <div className="productCountRemaining">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        value={p.countRemaining}
                                                                        onChange={(e) => updateTempProductCount(i, "countRemaining", e.target.value)}
                                                                        className="productCountInput"
                                                                        disabled={p.deleted}
                                                                    />
                                                                </div>
                                                                <div className="productRemove">
                                                                    <button type="button" onClick={() => toggleProductDeletion(p.name)} aria-label={`${p.deleted ? "Undo" : "Remove"} ${p.name}`} className={`productRemoveBtn ${p.deleted ? "undo" : ""}`}></button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>

                                            <div className="modalButtonsRow">
                                                <button type="button" onClick={saveProductManagementChanges}>Save</button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="half">
                                    <button type="submit">Save</button>
                                    <button type="button" className="deleteBtn" onClick={() => toggleConfirmModal(true)}>Delete</button>
                                </div>
                            </>
                        )}
                    </form>

                    {confirmModal && (
                        <ConfirmationModal
                            confirmModal={confirmModal}
                            toggleConfirmModal={toggleConfirmModal}
                            handleDelete={handleDelete}
                            name={name}
                            collection={collection}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
