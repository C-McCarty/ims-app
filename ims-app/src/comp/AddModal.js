import { useEffect, useState } from "react";
import Loading from "./Loading";
import Select from "react-select";

export default function AddModal({ toggleAddModal, addModal, collection, setRefresh, banner, setBanner }) {
    const NEW_FLAG = -1;
    const MAX_VAL = 999;

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

    const [marketProducts, setMarketProducts] = useState([]);
    const [tempMarketProducts, setTempMarketProducts] = useState([]);
    const [productManagementModal, setProductManagementModal] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();

        if (collection === "Products") {
            const stored = JSON.parse(localStorage.getItem("wProducts") || "[]");
            // 🔒 Prevent duplicate product names
            if (stored.some(p => p.name.trim().toLowerCase() === prodName.trim().toLowerCase())) {
                setBanner([true, 2, `Product "${prodName}" already exists.`]);
                return;
            }

            const newProduct = {
                _tempid: "temp_" + new Date().toISOString(),
                name: prodName.trim(),
                category: (prodCategoryOption === NEW_FLAG ? prodNewCategory.trim() : prodCategoryOption),
                isTaxable: prodIsTaxable === 1,
                count: Number(prodCount)
            };

            stored.push(newProduct);
            localStorage.setItem("wProducts", JSON.stringify(stored));

            setBanner([true, 0, `Product "${prodName}" added successfully!`]);
            setProdName("");
            setProdCategoryOption("");
            setProdNewCategory("");
            setProdIsTaxable(1);
            setProdCount(0);
            toggleAddModal(false);
            setRefresh(true);
        } else {
            const stored = JSON.parse(localStorage.getItem("wMarkets") || "[]");
            const newMarketName = (markOpt?.value === NEW_FLAG ? markName.trim() : markOpt?.value);

            // 🔒 Prevent duplicate market with same name & date
            if (stored.some(m => m.name.trim().toLowerCase() === newMarketName.toLowerCase() && m.date === markDate)) {
                setBanner([true, 2, `Market "${newMarketName}" on this date already exists.`]);
                return;
            }
            const allProducts = JSON.parse(localStorage.getItem("wProducts") || "[]");
            const newMarket = {
                tempid: "temp_" + new Date().toISOString(),
                name: (markOpt?.value === NEW_FLAG ? markName : markOpt?.value),
                date: markDate,
                products: marketProducts.map(p => {
                    const matched = allProducts.find(prod => prod.name === p.name);
                    return {
                        _id: matched?._id,
                        name: p.name,
                        countAllocated: Number(p.countAllocated),
                        countRemaining: Number(p.countAllocated)
                    };
                }),
            };
            stored.push(newMarket);
            localStorage.setItem("wMarkets", JSON.stringify(stored));

            setBanner([true, 0, `Market "${markName}" added successfully!`]);
            setMarkName("");
            setMarkDate("");
            setMarketProducts([]);
            toggleAddModal(false);
            setRefresh(true);
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
        setMarketProducts([]);
        toggleAddModal(false);
    };

    useEffect(() => {
        setLoading(true);

        if (collection === "Products") {
            const data = JSON.parse(localStorage.getItem("wProducts") || "[]");
            const categories = Array.from(new Set(data.map(p => p.category)))
                .sort((a, b) => a.localeCompare(b))
                .map(c => ({ value: c, label: c }));
            categories.push({ value: NEW_FLAG, label: "-- New Category --" });
            setProdOptions(categories);
            setLoading(false);
        }

        if (collection === "Markets") {
            const products = JSON.parse(localStorage.getItem("wProducts") || "[]");
            setMarkProdOptions(products.map(p => ({ value: p.name, label: p.name })));

            const markets = JSON.parse(localStorage.getItem("wMarkets") || "[]");
            const names = Array.from(new Set(markets.map(m => m.name)))
                .sort((a, b) => a.localeCompare(b))
                .map(name => ({ value: name, label: name }));
            names.push({ value: NEW_FLAG, label: "-- New Market --" });
            setMarkNames(names);

            // Default empty products
            setMarketProducts([]);
            setTempMarketProducts([]);

            setLoading(false);
        }
    }, [addModal]);

    // Load market data on selection
    useEffect(() => {
        if (collection === "Markets" && markOpt && markOpt.value !== NEW_FLAG) {
            const storedMarkets = JSON.parse(localStorage.getItem("wMarkets") || "[]");
            const market = storedMarkets.find(m => m.name === markOpt.value);
            if (market) {
                setMarkName(market.name);
                setMarkDate(market.date);
                const products = market.products.map(p => ({
                    _id: p._id,
                    name: p.name,
                    countAllocated: p.countAllocated,
                    countRemaining: p.countRemaining
                }));
                setMarketProducts(products);
                setTempMarketProducts(products);
            }
        } else if (markOpt?.value === NEW_FLAG) {
            setMarkName("");
            setMarkDate("");
            setMarketProducts([]);
            setTempMarketProducts([]);
        }
    }, [markOpt, collection]);

    const handleAddProductToTempList = (selected) => {
        if (!selected) return;
        const products = JSON.parse(localStorage.getItem("wProducts") || "[]");
        const matched = products.find(p => p.name === selected.value);
        const newProduct = {
            _id: matched?._id,
            name: selected.value,
            countAllocated: 0,
            countRemaining: 0
        };
        setTempMarketProducts(prev => [...prev, newProduct]);
    };

    const updateTempProductCount = (index, value) => {
        const num = parseInt(value);
        setTempMarketProducts(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                countAllocated: isNaN(num) || num < 0 ? 0 : num,
                countRemaining: isNaN(num) || num < 0 ? 0 : num
            };
            return updated;
        });
    };

    const saveProductManagementChanges = () => {
        setMarketProducts(tempMarketProducts);
        setProductManagementModal(false);
    };

    const cancelProductManagementChanges = () => {
        setTempMarketProducts(marketProducts);
        setProductManagementModal(false);
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
                {loading ? <Loading /> : collection === "Products" ? (
                    <form id="addForm" className="popupForm" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="prodName">Product Name:</label>
                            <input type="text" name="prodName" id="prodName" value={prodName} onChange={handleProdNameChange} required />
                        </div>
                        <div>
                            <label htmlFor="prodCategory">Product Category:</label>
                            <Select className="select" options={prodOptions} value={prodOptions.find(opt => opt.value === prodCategoryOption) || null} onChange={handleCategoryChange} required />
                        </div>
                        {prodCategoryOption === NEW_FLAG &&
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
                ) : (
                    <form id="addForm" className="popupForm" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="markName">Market Name:</label>
                            <Select className="select" options={markNames} onChange={handleMarkNameOptChange} value={markOpt} required />
                        </div>
                        {markOpt?.value === NEW_FLAG &&
                            <div>
                                <label htmlFor="markName">New Market Name:</label>
                                <input type="text" name="markName" id="markName" value={markName} onChange={handleMarkNameChange} required />
                            </div>}
                        <div>
                            <label htmlFor="markDate">Date:</label>
                            <input type="date" name="markDate" id="markDate" value={markDate} onChange={handleMarkDateChange} required />
                        </div>
                        <div>
                            <button type="button" onClick={() => {
                                setTempMarketProducts(marketProducts);
                                setProductManagementModal(true);
                            }}>
                                Manage Products
                            </button>
                        </div>

                        {productManagementModal && (
                            <div className="productManagementModal">
                                <div className="addProductSection">
                                    <button onClick={cancelProductManagementChanges} className="productManagementCloseBtn" aria-label="Close product management modal"></button>
                                    <h3>Manage Products</h3>
                                    <div className="addProductSelectWrap">
                                        <h5>Add Product</h5>
                                        <Select
                                            className="select"
                                            options={markProdOptions.filter(opt => !tempMarketProducts.some(p => p.name === opt.value))}
                                            onChange={handleAddProductToTempList}
                                            isClearable
                                        />
                                    </div>
                                </div>
                                <div className="productListWrap">
                                    <h5>Current Products</h5>
                                    {tempMarketProducts.length === 0 ? (
                                        <p>No products added yet.</p>
                                    ) : (
                                        <ul className="productList">
                                            <li className="productListHeader">
                                                <div className="productName">Product Name</div>
                                                <div className="productCountAllocated">Allocated</div>
                                                <div className="productRemove"></div>
                                            </li>
                                            {tempMarketProducts.map((p, i) => (
                                                <li key={i} className="productListItem">
                                                    <div className="productName"><strong>{p.name}</strong></div>
                                                    <div className="productCountAllocated">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={MAX_VAL}
                                                            value={p.countAllocated}
                                                            onChange={(e) => updateTempProductCount(i, e.target.value)}
                                                            className="productCountInput"
                                                        />
                                                    </div>
                                                    <div className="productRemove">
                                                        <button type="button" onClick={() => {
                                                            setTempMarketProducts(prev => prev.filter((_, idx) => idx !== i));
                                                        }} className="productRemoveBtn" aria-label={`Remove ${p.name}`}></button>
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
                        )}

                        <div>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
