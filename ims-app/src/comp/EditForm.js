import { useEffect, useState } from "react";
import '../styles/editFormStyles.css';
import axios from "axios";
import Loading from "./Loading";

export default function EditForm({collection, type, DB_URL}) {
    const [loading, setLoading] = useState(false);
    // TYPE 0 = Add, 1 = Remove, 2 = Edit
    const [prodIDs, setProdIDs] = useState([]);
    const [options, setOptions] = useState([]);

    const [txtName, setTxtName] = useState("");
    const handleTxtName = e => setTxtName(e.target.value);
    const [txtProdCategory, setTxtProdCategory] = useState("");
    const handleTxtProdCategory = e => setTxtProdCategory(e.target.value);
    const [slxProdCategory, setSlxProdCategory] = useState("");
    const handleSlxProdCategory = e => setSlxProdCategory(e.target.value);
    const [tofProdTaxable, setTofProdTaxable] = useState("");
    const handleTofProdTaxable = e => setTofProdTaxable(e.target.value);
    const [dteMarkDate, setDteMarkDate] = useState("");
    const handleDteMarkDate = e => setDteMarkDate(e.target.value);

    const [delName, setDelName] = useState("");
    const handleDelName = e => setDelName(e.target.value);

    const handleSubmit = e => {
        e.preventDefault();
        console.log(delName)
        axios.delete(`${DB_URL}/delete${collection}`, {data: {id: delName}});
        setLoading(true);
        axios.get(`${DB_URL}/get${collection}s`).then(response => {
            const names = response.data.map(item => ({_id: item._id, name: item.name}));
            setProdIDs(names);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }

    // Populates dropdown menus
    useEffect(() => {
        if (type == 1) {
            setLoading(true);
            axios.get(`${DB_URL}/get${collection}s`).then(response => {
                const names = response.data.map(item => ({_id: item._id, name: item.name}))
                setProdIDs(names);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [collection, type]);

    useEffect(() => {
        if (prodIDs.length > 0) {
            const list = prodIDs.map((opt, i) => {
                return <option value={opt._id} key={i}>{opt.name}</option>
            });
            setOptions(list);
            setLoading(false);
        }
    }, [prodIDs]);


    if (loading) {
        return <Loading />
    } else {
        if (type == 0) {
            return (
                <form className="editorForm" id="addForm">
                    <div>
                        <label htmlFor="name">{collection} Name:</label>
                        <input type="text" name="name" id="name" value={txtName} onChange={handleTxtName} />
                    </div>
                    {(collection == "Product") ?
                    <>
                        <div>
                            <label htmlFor="category">{collection} Category:</label>
                            <select name="category" id="category" value={slxProdCategory} onChange={handleSlxProdCategory}></select>
                        </div>
                        {slxProdCategory == "" ?
                        <div>
                            <label htmlFor="custCategory">Custom Category:</label>
                            <input type="text" name="custCategory" id="custCategory" value={txtProdCategory} onChange={handleTxtProdCategory} />
                        </div>
                        : null}
                        <div>
                            <label htmlFor="isTaxable">Taxable?</label>
                            <input type="checkbox" name="isTaxable" id="isTaxable" value={tofProdTaxable} onChange={handleTofProdTaxable} />
                        </div>
                    </>:
                    <div>
                        <label htmlFor="marketDate">{collection} Date:</label>
                        <input type="date" name="marketDate" id="marketDate" value={dteMarkDate} onChange={handleDteMarkDate} />
                    </div>}

                    <button>Submit</button>
                </form>
            );
        } else if (type == 1) {
            return (
                <form className="editorForm" id="remForm" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="delName">{collection} Name:</label>
                        <select name="delName" id="delName" value={delName} onChange={handleDelName}>{options}</select>
                    </div>
                    
                    <button className="delBtn">Delete {collection}</button>
                    <h4>Warning! This action cannot be undone!</h4>
                </form>
            );
        } else if (type == 2) {
            return (
                <form className="editorForm" id="edtForm">
                    <h2>Edit {collection}</h2>
                    <div>
                        <label htmlFor="name">Rename:</label>
                        <input type="text" name="name" id="name" value={collection} />
                    </div>
                    {(collection == "Product") ?
                    <>
                        <div>
                            <label htmlFor="category">Change Category:</label>
                            <input type="text" name="category" id="category" />
                        </div>
                        <div>
                            <label htmlFor="isTaxable">Change Taxable:</label>
                            <input type="checkbox" name="isTaxable" id="isTaxable" />
                        </div>
                    </> :
                    <div>
                        <label htmlFor="marketDate">Change Date:</label>
                        <input type="date" name="marketDate" id="marketDate" />
                    </div>}

                    <button>Save Changes</button>
                </form>
            );
        }
    }
}