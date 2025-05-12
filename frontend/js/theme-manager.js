// Theme manager functionality
function toggleTheme() {
    const html = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update button icon if the button exists
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
        }
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update button icon if the button exists
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'light' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
        }
    }
}); 