import React from 'react';
import './Modal.css';

/**
 * Modal Component
 * Reusable modal dialog
 */
const Modal = ({ show, onClose, title, children, actions }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="modal-content">
          {children}
        </div>
        {actions && (
          <div className="modal-buttons">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
