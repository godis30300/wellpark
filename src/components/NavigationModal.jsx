import './NavigationModal.css'; // Add your CSS styles for the modal

const NavigationModal = ({ show, onClose, locationInfo }) => {
    if (!show) {
        return null;
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="navigation-modal-overlay" onClick={handleOverlayClick}>
            <div className="navigation-modal">
                <button className="navigation-modal-close" onClick={onClose}>
                    &times;
                </button>
                <div className="navigation-modal-content">
                    <h3>{locationInfo.name}</h3>
                    <p>地址: {locationInfo.address}</p>
                    <p>營業時間: {locationInfo.businessHours}</p>
                    <button className="navigationModal-button-calculate">停車費試算</button>
                </div>
                <div className="navigation-modal-footer">
                    <button className="navigationModal-button-close" onClick={onClose}>關閉</button>
                    <button className="navigationModal-button" onClick={locationInfo.onNavigate}>開始導航</button>
                </div>
            </div>
        </div>
    );
};

export default NavigationModal;