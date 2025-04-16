import { useEffect, useState } from "react";
import EditForm from "./EditForm";

export default function ListItem({collection, DB_URL, name, category=null, taxable=null, count=null, date=null, products=null, _id, setRefresh, banner, setBanner}) {
    // Control display of ListItem details
    const [details, toggleDetails] = useState(false);
    // Control display of editor modal
    const [editForm, toggleEditForm] = useState(false);

    // Product list items
    if (collection == "Products") {
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
                <EditForm collection={collection} DB_URL={DB_URL} name={name} category={category} taxable={taxable} count={count} editForm={editForm} toggleEditForm={toggleEditForm} _id={_id} setRefresh={setRefresh} banner={banner} setBanner={setBanner} />
            </div>
        );
    }
    // Market list items
    else if (collection == "Markets") {
        return (
            <div className='listItem'>
                <div className="listItemMain">
                    <h3>{name}</h3>
                    <div className='details' onClick={()=>{toggleDetails(!details)}}></div>
                    <div className='edit' onClick={()=>{toggleEditForm(true)}}></div>
                </div>
                <div className={details ? "listItemDetails" : "listItemDetails hidden"}>
                    <div className="date">
                        <h4>Date</h4>
                        <p>{date}</p>
                    </div>
                    <div className="products">
                        <h4>Products</h4>
                        {/* I am using <div> elements instead of semantic <table> elements
                        {/* because they do not support styling the same way. Using <div>
                        {/* elements also gives me greater control over the layout. */}
                        <div className="table">
                            <div className="tr thead">

                                <div className="th">Name</div>
                                <div className="th">Sent</div>
                                <div className="th">Left</div>
                                <div className="th">Sold</div>
                            </div>
                            <div className="tbody">
                                {products.map((p, i) => {
                                    // Generate Product rows
                                    return (
                                        <div className="tr" key={p._id}>
                                            <div className="td">{p.name}</div>
                                            <div className="td">{p.countAllocated}</div>
                                            <div className="td">{p.countRemaining}</div>
                                            <div className="td">{p.countAllocated - p.countRemaining}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <EditForm collection={collection} DB_URL={DB_URL} name={name} date={date} products={products} editForm={editForm} toggleEditForm={toggleEditForm} _id={_id} setRefresh={setRefresh} banner={banner} setBanner={setBanner} />
            </div>
        );
    }
}