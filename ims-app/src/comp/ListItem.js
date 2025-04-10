import { useState } from "react";
import EditForm from "./EditForm";

export default function ListItem({collection, name, category=null, taxable=null, count=null, date=null, products=null}) {
    const [details, toggleDetails] = useState(false);
    const [editForm, toggleEditForm] = useState(false);
    const [viewProducts, toggleViewProducts] = useState(false);

    return (
        <div className='listItem'>
            <div className="listItemMain">
                <h3>{name}</h3>
                <div className='details' onClick={()=>{toggleDetails(!details)}}></div>
                <div className='edit' onClick={()=>{toggleEditForm(true)}}></div>
            </div>
            <div className={details ? "listItemDetails" : "listItemDetails hidden"}>
                <div className="category">
                    <h4>Category</h4>
                    <p>{category}</p>
                </div>
                <div className="taxable">
                    <h4>Taxable?</h4>
                    <p>{taxable}</p>
                </div>
                <div className="count">
                    <h4>Count</h4>
                    <p>{count}</p>
                </div>
            </div>
            {editForm ? <EditForm collection={collection} type={2} /> : null}
        </div>
    );
}