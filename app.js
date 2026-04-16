document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Terms and Conditions Slide-Up Logic ---
    const openTermsBtn = document.getElementById("open-terms");
    const closeTermsBtn = document.getElementById("close-terms");
    const termsPanel = document.getElementById("terms-panel");
    const overlay = document.getElementById("overlay");

    openTermsBtn?.addEventListener("click", (event) => {
        event.preventDefault();
        termsPanel.classList.add("active");
        overlay.classList.add("active");
    });

    closeTermsBtn?.addEventListener("click", () => {
        termsPanel.classList.remove("active");
        overlay.classList.remove("active");
    });

    overlay?.addEventListener("click", () => {
        termsPanel.classList.remove("active");
        overlay.classList.remove("active");
    });

    // --- 2. SPA Navigation Helper ---
    function switchSection(targetSectionId) {
        // Hide all sections by removing the active class
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        // Show the targeted section
        document.getElementById(targetSectionId).classList.add('active');
    }

    // --- 3. Login to User Info ---
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault(); 
        // Logic to verify password would go here if you had a backend
        switchSection('userinfo-section'); // Move to step 2
    });

    // --- 4. User Info: Category Selection & Dynamic Inputs ---
    const categoryCards = document.querySelectorAll('.category-card');
    const dynamicContainer = document.getElementById('dynamic-input-container');
    const hiddenCategoryInput = document.getElementById('selected_category');

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from all cards, add to clicked card
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Get the value and store it in our hidden form input
            const categoryValue = card.getAttribute('data-category');
            hiddenCategoryInput.value = categoryValue;

            // Generate dynamic HTML based on selection
            dynamicContainer.style.display = 'flex';
            
            if (categoryValue === 'Business') {
                dynamicContainer.innerHTML = `
                    <label for="income_range">Annual Business Income</label>
                    <select id="income_range" required>
                        <option value="" disabled selected>Select your range...</option>
                        <option value="Small">Small (< ₹10L/year)</option>
                        <option value="Medium">Medium (₹10L–₹50L/year)</option>
                        <option value="Large">Large (> ₹50L/year)</option>
                    </select>
                `;
            } else if (categoryValue === 'Student' || categoryValue === 'Employee') {
                const labelText = categoryValue === 'Student' ? 'Annual Allowance' : 'Annual Salary';
                dynamicContainer.innerHTML = `
                    <label for="income_range">${labelText}</label>
                    <select id="income_range" required>
                        <option value="" disabled selected>Select your range...</option>
                        <option value="< ₹3L">Less than ₹3L</option>
                        <option value="₹3L - ₹10L">₹3L - ₹10L</option>
                        <option value="> ₹10L">More than ₹10L</option>
                    </select>
                `;
            } else {
                // Housewife or Farmer (assuming no extra field needed right now, hide container)
                dynamicContainer.innerHTML = '';
                dynamicContainer.style.display = 'none';
            }
        });
    });

    // --- 5. Submit User Info & Show Dashboard ---
    const userInfoForm = document.getElementById("userinfo-form");
    userInfoForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // 1. Check if a category was actually clicked
        if(!hiddenCategoryInput.value) {
            alert("Please select a category before continuing!");
            return;
        }

        // 2. Gather Data
        const userData = {
            name: document.getElementById('full_name').value,
            age: document.getElementById('user_age').value,
            mobile: document.getElementById('mobile_num').value,
            category: hiddenCategoryInput.value,
            income: document.getElementById('income_range') ? document.getElementById('income_range').value : 'N/A'
        };

        // 3. Save to localStorage
        localStorage.setItem('vridhiUser', JSON.stringify(userData));

        // 4. Populate Dashboard UI
        const dashboardContent = document.getElementById('dashboard-content');
        dashboardContent.innerHTML = `
            <p style="font-size: 1.1rem; color: var(--secondary); margin-bottom: 10px;">
                Hello, <strong>${userData.name}</strong>!
            </p>
            <p style="color: gray; font-size: 0.9rem;">
                Profile: ${userData.category} ${userData.income !== 'N/A' ? `(${userData.income})` : ''}
            </p>
            <br>
            <p style="color: var(--primary); font-weight: bold;">
                Your growth engine is currently being fueled. 🚀
            </p>
        `;

        // 5. Move to Dashboard
        switchSection('dashboard-section');
    });

    // --- 6. Optional: Logout / Restart flow ---
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('vridhiUser');
        loginForm.reset();
        userInfoForm.reset();
        categoryCards.forEach(c => c.classList.remove('active'));
        dynamicContainer.style.display = 'none';
        hiddenCategoryInput.value = '';
        
        switchSection('login-section');
    });

});