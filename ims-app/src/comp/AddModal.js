import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "./Loading";

export default function AddModal({toggleAddModal, addModal, collection, DB_URL}) {
    const [prodName, setProdName] = useState("");
    const handleProdNameChange = e => setProdName(e.target.value);
    const [prodCategoryOption, setProdCategoryOption] = useState(null);
    const handleSelCategoryChange = e => setProdCategoryOption(e.target.value);
    const [prodNewCategory, setProdNewCategory] = useState("");
    const handleProdNewCategoryChange = e => setProdNewCategory(e.target.value);
    const [prodIsTaxable, setProdIsTaxable] = useState(1);
    const handleProdIsTaxableChange = e => setProdIsTaxable(e.target.value);
    const [prodCount, setProdCount] = useState(0);
    const handleProdCountChange = e => setProdCount(e.target.value);

    const [optionData, setOptionData] = useState([]);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();

        axios.post(`${DB_URL}/add${collection}`, {
            body: {
                name: prodName,
                category: (prodCategoryOption == 0 ? prodNewCategory : prodCategoryOption),
                isTaxable: (prodIsTaxable == 1 ? true : false),
                count: prodCount
            }
        }).catch(err => {
            console.error(err);
        })
    };

    useEffect(() => {
        setLoading(true);
        axios.get(`${DB_URL}/get${collection}`).then(res => {
            let list = res.data.map(item => {return item.category});
            list = new Set(list);
            list = [...list];
            setOptionData([...list, 0]);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [addModal]);

    useEffect(() => {
        console.log(optionData)
        const list = optionData.map((opt, i) => {
            return <option value={opt} key={i}>{opt == 0 ? "-- New Category --" : opt}</option>
        });
        setOptions(list);
        setLoading(false);
    }, [optionData]);

    if (addModal) {
        return (
            <div id="addModalWrap">
                <div id="addModal">
                    <h2>Add {collection == "Products" ? "Product" : "Market"}</h2>
                    <div className="closeBtn" onClick={()=>toggleAddModal(false)}>
                        <div></div>
                        <div></div>
                    </div>
                    {loading ? <Loading /> :
                        collection == "Products" ?
                        <form id="addForm" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="prodName">Product Name:</label>
                                <input type="text" name="prodName" id="prodName" value={prodName} onChange={handleProdNameChange} />
                            </div>
                            <div>
                                <label htmlFor="prodCategory">Product Category:</label>
                                <select name="prodCategory" id="prodCategory" value={prodCategoryOption} onChange={handleSelCategoryChange}>
                                    {options}
                                </select>
                            </div>
                            {prodCategoryOption == 0 ?
                                <div>
                                    <label htmlFor="prodNewCategory">New Category:</label>
                                    <input type="text" name="prodNewCategory" id="prodNewCategory" value={prodNewCategory} onChange={handleProdNewCategoryChange} />
                                </div>
                            : null}
                            <div>
                                <label htmlFor="prodTaxable">Taxable?</label>
                                <select name="prodTaxable" id="prodTaxable" value={prodIsTaxable} onChange={handleProdIsTaxableChange}>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="prodCount">Product Count:</label>
                                <input type="number" id="prodCount" min={0} value={prodCount} onChange={handleProdCountChange} />
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