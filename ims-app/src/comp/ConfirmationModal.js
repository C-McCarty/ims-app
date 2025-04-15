import { useState } from "react";

export default function ConfirmationModal({name, confirmModal, toggleConfirmModal, handleDelete}) {
    const handleCancel = () => {
        toggleConfirmModal(false);
    }
    if (confirmModal) {

        return (
            <div className="modalWrap">
                <div className="modal">
                    <h2>Are you sure you want to delete {name}? This action cannot be undone.</h2>
                    <form className="popupForm" onSubmit={e=>{e.preventDefault();}}>
                        <div className="half">
                            <button type="button" className="deleteBtn" onClick={handleDelete}>Delete Product</button>
                            <button type="submit" onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}