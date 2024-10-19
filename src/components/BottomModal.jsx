import './BottomModal.css'; // Add your CSS styles for the modal

const BottomModal = ({ show, onClose, onConfirm, children }) => {
    if (!show) {
        return null;
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="bottom-modal-overlay" onClick={handleOverlayClick}>
            <div className="bottom-modal">
                <button className="bottom-modal-close" onClick={onClose}>
                    &times;
                </button>
                <div className="bottom-modal-content">{children}</div>
                <div className="bottom-modal-footer">
                    <button className="modal-button" onClick={onClose}>Cancel</button>
                    <button className="modal-button" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default BottomModal;