import { useState } from "react";
import '../styles/editFormStyles.css';

export default function EditForm({item, type}) {
    // TYPE 0 = Add, 1 = Remove, 2 = Edit

    if (type == 0) {
        return (
            <form className="editorForm" id="addForm">
                <div>
                    <label htmlFor="name">{item} Name:</label>
                    <input type="text" name="name" id="name" />
                </div>
                {(item == "Product") ?
                <>
                    <div>
                        <label htmlFor="category">{item} Category:</label>
                        <input type="text" name="category" id="category" />
                    </div>
                    <div>
                        <label htmlFor="isTaxable">Taxable?</label>
                        <input type="checkbox" name="isTaxable" id="isTaxable" />
                    </div>
                </>:
                <div>
                    <label htmlFor="marketDate">{item} Date:</label>
                    <input type="date" name="marketDate" id="marketDate" />
                </div>}

                <button>Submit</button>
            </form>
        );
    } else if (type == 1) {
        return (
            <form className="editorForm" id="remForm">
                <div>
                    <label htmlFor="name">{item} Name:</label>
                    <select name="name" id="name"></select>
                </div>
                
                <button>Delete {item}</button>
                <h4>Warning! This action cannot be undone!</h4>
            </form>
        );
    } else if (type == 2) {
        return (
            <form className="editorForm" id="edtForm">
                <h2>Edit {item}</h2>
                <div>
                    <label htmlFor="name">Rename:</label>
                    <input type="text" name="name" id="name" value={item} />
                </div>
                {(item == "Product") ?
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