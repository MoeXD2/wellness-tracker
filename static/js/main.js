// Main JavaScript functionality
class WellnessTracker {
    constructor() {
        this.initializeStorage();
        this.bindEvents();
    }

    initializeStorage() {
        // Initialize local storage with default values if not exists
        if (!localStorage.getItem('wellnessData')) {
            localStorage.setItem('wellnessData', JSON.stringify({
                fitness: [],
                sleep: [],
                diet: []
            }));
        }
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFormHandlers();
            this.setupNavigationHandlers();
        });
    }

    setupFormHandlers() {
        const forms = document.querySelectorAll('.tracking-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        });
    }

    setupNavigationHandlers() {
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                window.location.href = '/fitness.html';
            });
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const category = e.target.getAttribute('data-category');
        
        this.saveData(category, data);
        this.showSuccessMessage();
    }

    saveData(category, data) {
        const wellnessData = JSON.parse(localStorage.getItem('wellnessData'));
        data.timestamp = new Date().toISOString();
        wellnessData[category].push(data);
        localStorage.setItem('wellnessData', JSON.stringify(wellnessData));
    }

    showSuccessMessage() {
        const toast = new bootstrap.Toast(document.getElementById('successToast'));
        toast.show();
    }

    getData(category) {
        const wellnessData = JSON.parse(localStorage.getItem('wellnessData'));
        return wellnessData[category] || [];
    }
}

// Initialize the app
const wellnessTracker = new WellnessTracker();