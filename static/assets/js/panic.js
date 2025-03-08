// Panic Key Handler
document.addEventListener('DOMContentLoaded', () => {
    // Get panic key settings from localStorage
    const panicKey = localStorage.getItem('panicKey');
    const panicUrl = localStorage.getItem('panicUrl') || 'https://www.google.com/';
    
    if (!panicKey) return; // If no panic key is set, don't add the listener
    
    // Add keydown event listener
    document.addEventListener('keydown', (event) => {
        // Ignore modifier keys
        if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
            return;
        }
        
        // Check if the pressed key matches the panic key
        if (event.key.toLowerCase() === panicKey.toLowerCase()) {
            window.location.href = panicUrl;
        }
    });
}); 