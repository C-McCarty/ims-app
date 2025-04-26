export default function TR({item, i, productCountAllocated, handleProductCountAllocatedChange, send=false}) {
    return (
        <div className={send ? "tr send" : "tr"}>
            <div className="td">{item.label}</div>
            <div className="td"><input type="number" name={`prodAllocated${i}`} id={`prodAllocated${i}`} value={productCountAllocated[i]} onChange={e => {handleProductCountAllocatedChange(e, i)}} /></div>
        </div>
    );
}