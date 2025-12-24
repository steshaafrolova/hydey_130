 // ============================================
        // SCROLL REVEAL ANIMATIONS
        // ============================================
        
        function reveal() {
            const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate');
            
            reveals.forEach(element => {
                const windowHeight = window.innerHeight;
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 100;
                
                if (elementTop < windowHeight - elementVisible) {
                    element.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', reveal);
        window.addEventListener('load', reveal);

        // ============================================
        // HEADER
        // ============================================
        
        const header = document.getElementById('header');
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });

        // ============================================
        // MOBILE MENU
        // ============================================
        
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        function closeMobileMenu() {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        // ============================================
        // SMOOTH SCROLL
        // ============================================
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    closeMobileMenu();
                }
            });
        });

        // ============================================
        // SLIDER
        // ============================================
        
        let currentSlide = 0;
        const totalSlides = 4;
        const sliderTrack = document.getElementById('sliderTrack');
        const dots = document.querySelectorAll('.slider-dot');

        function updateSlider() {
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlider();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlider();
        }

        // Auto-slide
        setInterval(nextSlide, 6000);

        // ============================================
        // FLOATING BENEFITS - Simple scroll animation
        // ============================================
        
        function handleFloatingBenefits() {
            const benefits = document.querySelectorAll('.floating-benefit');
            benefits.forEach(benefit => {
                const rect = benefit.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100) {
                    benefit.classList.add('visible');
                }
            });
        }

        window.addEventListener('scroll', handleFloatingBenefits);
        window.addEventListener('load', handleFloatingBenefits);

        // ============================================
        // FAQ TOGGLE
        // ============================================
        
        function toggleFaq(element) {
            const faqItem = element.parentElement;
            const isOpen = faqItem.classList.contains('open');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('open');
            });
            
            // Open clicked one if it wasn't open
            if (!isOpen) {
                faqItem.classList.add('open');
            }
        }

        // ============================================
        // PROGRAM SELECTION
        // ============================================
        
        let selectedPrice = 0;
        let selectedProgram = null;

        function selectProgramCard(card) {
            document.querySelectorAll('.program-select-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedPrice = parseInt(card.dataset.price);
            selectedProgram = card.dataset.program;
            document.getElementById('totalAmount').textContent = selectedPrice.toLocaleString() + ' ₽';
        }

        function selectProgram(program, price) {
            document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                const card = document.querySelector(`[data-program="${program}"]`);
                if (card) selectProgramCard(card);
            }, 600);
        }

        // ============================================
        // FORM SUBMIT - Відправка в Telegram
        // ============================================
        
        // URL бекенду (зміни на свій після деплою!)
        const API_URL = 'https://sveta-server-production.up.railway.app/api';
        
        document.getElementById('orderForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Валідація
            if (selectedPrice === 0 || !selectedProgram) {
                showNotification('Выбери программу', 'error');
                return;
            }
            
            // Отримуємо дані форми
            const formData = {
                program: selectedProgram,
                name: document.getElementById('customerName').value.trim(),
                email: document.getElementById('customerEmail').value.trim(),
                phone: document.getElementById('customerPhone').value.trim(),
                telegram: document.getElementById('customerTelegram').value.trim()
            };
            
            // Валідація полів
            if (!formData.name || !formData.email || !formData.phone) {
                showNotification('Заполни все обязательные поля', 'error');
                return;
            }
            
            // Показуємо лоадер
            const submitBtn = document.querySelector('.order-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправляем...';
            submitBtn.disabled = true;
            
            try {
                // Відправляємо заявку
                const response = await fetch(`${API_URL}/payment/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Показуємо успіх
                    showNotification('Заявка отправлена! Света свяжется с тобой 💚', 'success');
                    
                    // Показуємо модалку успіху
                    showSuccessModal(result.data);
                    
                    // Очищаємо форму
                    document.getElementById('orderForm').reset();
                    document.querySelectorAll('.program-select-card').forEach(c => c.classList.remove('selected'));
                    selectedPrice = 0;
                    selectedProgram = null;
                    document.getElementById('totalAmount').textContent = '0 ₽';
                    
                } else {
                    throw new Error(result.error || 'Ошибка отправки');
                }
                
            } catch (error) {
                console.error('Error:', error);
                showNotification(error.message || 'Ошибка. Попробуй позже.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
        // Модалка успіху
        function showSuccessModal(data) {
            const modal = document.createElement('div');
            modal.className = 'success-modal';
            modal.innerHTML = `
                <div class="success-modal-content">
                    <div class="success-modal-icon">✅</div>
                    <h2>Заявка отправлена!</h2>
                    <p><strong>${data.program}</strong></p>
                    <p>Сумма: <strong>${data.price.toLocaleString()} ₽</strong></p>
                    <p style="margin-top: 20px; color: #636E72;">
                        Света получила твою заявку и свяжется<br>с тобой в ближайшее время для оплаты
                    </p>
                    <p style="margin-top: 15px; font-size: 13px; color: #999;">
                        Номер заказа: ${data.orderId}
                    </p>
                    <button onclick="this.parentElement.parentElement.remove()" class="success-modal-btn">
                        Отлично! 💚
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Notification helper
        function showNotification(message, type = 'info') {
            const existing = document.querySelector('.notification');
            if (existing) existing.remove();
            
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span>${message}</span>
            `;
            
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '16px 24px',
                borderRadius: '12px',
                background: type === 'success' ? '#7CB342' : type === 'error' ? '#e74c3c' : '#3498db',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                zIndex: '10000',
                animation: 'slideIn 0.3s ease'
            });
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }
        
        // Додаємо стилі для модалки та анімацій
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                animation: fadeIn 0.3s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .success-modal-content {
                background: white;
                padding: 50px;
                border-radius: 30px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 30px 80px rgba(0,0,0,0.2);
            }
            .success-modal-icon {
                font-size: 70px;
                margin-bottom: 20px;
            }
            .success-modal-content h2 {
                font-size: 28px;
                margin-bottom: 15px;
                color: #1A1A1A;
            }
            .success-modal-content p {
                font-size: 16px;
                color: #1A1A1A;
                margin-bottom: 5px;
            }
            .success-modal-btn {
                margin-top: 25px;
                padding: 16px 40px;
                background: #7CB342;
                color: white;
                border: none;
                border-radius: 30px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .success-modal-btn:hover {
                background: #689F38;
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(styleSheet);

        // ============================================
        // PARALLAX EFFECT
        // ============================================
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });