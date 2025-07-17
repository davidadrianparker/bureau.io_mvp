// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Get all the buttons
    const freeBtn = document.querySelector('.free-btn');
    const proBtn = document.querySelector('.pro-btn');
    const enterpriseBtn = document.querySelector('.enterprise-btn');
    
    // Add click event listeners
    freeBtn.addEventListener('click', function() {
        alert('Great choice! You can start using P&D Bureau for free right now.');
    });
    
    proBtn.addEventListener('click', function() {
        alert('You selected the Pro plan for $15/month. Redirecting to signup...');
    });
    
    enterpriseBtn.addEventListener('click', function() {
        alert('You selected the Enterprise plan. Our sales team will contact you soon.');
    });
    
    // Add smooth animations when page loads
    const cards = document.querySelectorAll('.pricing-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}); 