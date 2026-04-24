import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-uOtagtW6SIIevUbmZNNvmBzmahShHT0",
    authDomain: "vridhi-d9d3d.firebaseapp.com",
    projectId: "vridhi-d9d3d",
    storageBucket: "vridhi-d9d3d.firebasestorage.app",
    messagingSenderId: "1089765931043",
    appId: "1:1089765931043:web:1c190674058da9e096d996",
    measurementId: "G-E6QX1HRHZ4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

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
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        const target = document.getElementById(targetSectionId);
        if(target) target.classList.add('active');
    }

    // Restore Session if on index.html
    if(document.getElementById('dashboard-section') && localStorage.getItem('vridhiUser')) {
        renderDashboard(JSON.parse(localStorage.getItem('vridhiUser')));
        switchSection('dashboard-section');
    }

    // --- 3. Login to User Info ---
    const loginForm = document.getElementById("login-form");
    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault(); 
        const email = document.getElementById("user_email").value;
        const password = document.getElementById("user_password").value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                renderDashboard(userData);
                switchSection('dashboard-section');
            } else {
                switchSection('userinfo-section');
            }
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    switchSection('userinfo-section');
                } catch (regError) {
                    alert("Registration Error: " + regError.message);
                }
            } else {
                alert("Login Error: " + error.message);
            }
        }
    });

    // --- 4. User Info: Category Selection & Dynamic Inputs ---
    const categoryCards = document.querySelectorAll('.category-card');
    const dynamicContainer = document.getElementById('dynamic-input-container');
    const hiddenCategoryInput = document.getElementById('selected_category');

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const categoryValue = card.getAttribute('data-category');
            hiddenCategoryInput.value = categoryValue;

            // Display an Exact Income Input for accurate 20-20-30-30 math
            dynamicContainer.style.display = 'flex';
            dynamicContainer.innerHTML = `
                <label for="exact_income">Total Monthly Income (₹)</label>
                <input type="number" id="exact_income" placeholder="E.g. 50000" min="0" required>
            `;
        });
    });

    // --- 5. Submit User Info & Build Dashboard UI ---
    const userInfoForm = document.getElementById("userinfo-form");
    userInfoForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if(!hiddenCategoryInput.value) {
            alert("Please select a category before continuing!");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            alert("No user is logged in!");
            return;
        }

        const userData = {
            name: document.getElementById('full_name').value,
            email: user.email,
            category: hiddenCategoryInput.value,
            income: Number(document.getElementById('exact_income').value)
        };

        try {
            await setDoc(doc(db, "users", user.uid), userData); 
            console.log("Data saved to Vridhi Database!");
            renderDashboard(userData);
            switchSection('dashboard-section');
        } catch (error) {
            alert("Error saving data: " + error.message);
        }
    });

    // --- 6. Dashboard Generator Function ---
    function renderDashboard(userData) {
        const dashboardContent = document.getElementById('dashboard-content');
        if(!dashboardContent) return; // Exit if on learn.html

        // Calculate 20-20-30-30 Logic
        let inc = Number(userData.income);
        if (isNaN(inc)) {
            inc = 0; // Fallback if income is a string like "< ₹3L"
        }

        const secureSavings = inc * 0.20;
        const emergencyShield = inc * 0.20;
        const homeEssentials = inc * 0.30;
        const wealthGen = inc * 0.30;

        // Generate Dynamic Widget based on User Category
        let specialSuggestionsHTML = "";
        switch(userData.category) {
            case "Student":
                specialSuggestionsHTML = `<div class="suggestion-pill">📚 Micro-Investments</div> <div class="suggestion-pill">🎓 Education Goal Tracker</div>`;
                break;
            case "Employee":
                specialSuggestionsHTML = `<div class="suggestion-pill">🏢 Tax Saver (80C) Ideas</div> <div class="suggestion-pill">📈 Automated SIP Planner</div>`;
                break;
            case "Business":
                specialSuggestionsHTML = `<div class="suggestion-pill">💼 Business Reserve Fund</div> <div class="suggestion-pill">📊 Working Capital Tracker</div>`;
                break;
            case "Housewife":
                specialSuggestionsHTML = `<div class="suggestion-pill">🪙 Digital Gold & FDs</div> <div class="suggestion-pill">🛒 Household Expense Buffer</div>`;
                break;
            case "Farmer":
                specialSuggestionsHTML = `<div class="suggestion-pill">🌾 Seasonal Income Allocator</div> <div class="suggestion-pill">📜 Govt. Schemes Info</div>`;
                break;
        }

        // Injecting the Dashboard Layout
        dashboardContent.innerHTML = `
            <div class="dashboard-header">
                <h2>Hello, ${userData.name}!</h2>
                <div class="total-income">Total Input: ₹${inc > 0 ? inc.toLocaleString('en-IN') : "Please Update Income"}</div>
            </div>

            <div class="allocation-grid">
                <div class="allocation-card">
                    <h4>Secure Savings (20%)</h4>
                    <div class="amount">₹${secureSavings.toLocaleString('en-IN')}</div>
                </div>
                <div class="allocation-card">
                    <h4>Emergency Shield (20%)</h4>
                    <div class="amount">₹${emergencyShield.toLocaleString('en-IN')}</div>
                </div>
                <div class="allocation-card">
                    <h4>Home & Essentials (30%)</h4>
                    <div class="amount">₹${homeEssentials.toLocaleString('en-IN')}</div>
                </div>
                <div class="allocation-card" style="border-top-color: var(--accent);">
                    <h4>Wealth Generation (30%)</h4>
                    <div class="amount">₹${wealthGen.toLocaleString('en-IN')}</div>
                </div>
            </div>

            <div class="category-widget">
                <h3>Recommended for ${userData.category}s</h3>
                <div class="widget-suggestions">
                    ${specialSuggestionsHTML}
                </div>
            </div>
        `;
    }

    // --- 7. Sign Out / Update Flow ---
    // Handling multiple buttons across pages by querying all with the class
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('vridhiUser');
            if(window.location.pathname.includes('learn.html')) {
                window.location.href = 'index.html'; // Redirect to home if on Learn page
            } else {
                window.location.reload(); // Refresh index.html to show login
            }
        });
    });

    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if(window.location.pathname.includes('learn.html')) {
                window.location.href = 'index.html'; // Needs to go to index to update
            } else {
                switchSection('userinfo-section'); // Go back to info section
            }
        });
    });

});