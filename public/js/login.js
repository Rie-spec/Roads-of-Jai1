// Login and Slider Logic
document.addEventListener('DOMContentLoaded', () => {
    // === Slider Logic ===
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds per slide

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    // Auto-advance slider
    let autoSlide = setInterval(nextSlide, slideInterval);

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(autoSlide);
            showSlide(index);
            autoSlide = setInterval(nextSlide, slideInterval);
        });
    });

    // === Login Form Logic ===
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            errorMsg.innerText = '';
            
            const originalBtnContent = loginBtn.innerHTML;
            loginBtn.innerHTML = '<span>Verifying...</span>';
            loginBtn.disabled = true;

            setTimeout(() => {
                if (email === 'admin@jairoads.com' && password === 'admin123') {
                    window.location.href = '/AdminDashboard.php';
                } else if (email === 'engineer@jairoads.com' && password === 'engineer123') {
                    window.location.href = '/dashboard';
                } else {
                    errorMsg.innerText = 'Invalid email or password. Please try again.';
                    loginBtn.innerHTML = originalBtnContent;
                    loginBtn.disabled = false;
                }
            }, 1000);
        });
    }
});
