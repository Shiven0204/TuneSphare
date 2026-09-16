function MobileNav({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <button className="mobile-nav-backdrop" type="button" aria-label="Close navigation" onClick={onClose}>
            <span className="sr-only">Close navigation</span>
        </button>
    );
}

export default MobileNav;
