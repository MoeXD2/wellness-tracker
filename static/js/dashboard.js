class WellnessDashboard {
    constructor() {
        this.charts = {};
        this.timeRange = 7; // Default to 7 days
        this.initializeCharts();
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.timeRange = parseInt(e.target.value);
            this.loadData();
        });

        document.getElementById('refreshData').addEventListener('click', () => {
            this.loadData();
        });
    }

    loadData() {
        const wellnessData = JSON.parse(localStorage.getItem('wellnessData'));
        if (!wellnessData) return;

        this.updateSummaryCards(wellnessData);
        this.updateCharts(wellnessData);
        this.updateLastUpdated();
    }

    updateSummaryCards(data) {
        const recentData = this.getRecentData(data);
        
        // Fitness Summary
        const totalWorkouts = recentData.fitness.length;
        const avgDuration = recentData.fitness.reduce((acc, curr) => 
            acc + parseInt(curr.duration), 0) / totalWorkouts || 0;
        
        document.getElementById('totalWorkouts').textContent = totalWorkouts;
        document.getElementById('avgDuration').textContent = Math.round(avgDuration);

        // Sleep Summary
        const avgSleepHours = this.calculateAverageSleepHours(recentData.sleep);
        const avgSleepQuality = this.calculateAverageSleepQuality(recentData.sleep);
        
        document.getElementById('avgSleepHours').textContent = avgSleepHours.toFixed(1);
        document.getElementById('avgSleepQuality').textContent = avgSleepQuality;

        // Diet Summary
        const avgCalories = recentData.diet.reduce((acc, curr) => 
            acc + parseInt(curr.calories), 0) / recentData.diet.length || 0;
        const avgWater = recentData.diet.reduce((acc, curr) => 
            acc + parseFloat(curr.water), 0) / recentData.diet.length || 0;
        
        document.getElementById('avgCalories').textContent = Math.round(avgCalories);
        document.getElementById('avgWater').textContent = avgWater.toFixed(1);
    }

    updateCharts(data) {
        const recentData = this.getRecentData(data);

        // Update Fitness Chart
        this.updateFitnessChart(recentData.fitness);
        
        // Update Sleep Chart
        this.updateSleepChart(recentData.sleep);
        
        // Update Calorie Chart
        this.updateCalorieChart(recentData.diet);
        
        // Update Food Category Chart
        this.updateFoodCategoryChart(recentData.diet);
    }

    initializeCharts() {
        // Fitness Chart
        this.charts.fitness = new Chart(document.getElementById('fitnessChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Duration (minutes)',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Sleep Chart
        this.charts.sleep = new Chart(document.getElementById('sleepChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sleep Hours',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Calorie Chart
        this.charts.calories = new Chart(document.getElementById('calorieChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Calories',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Food Category Chart
        this.charts.foodCategory = new Chart(document.getElementById('foodCategoryChart'), {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    updateFitnessChart(fitnessData) {
        const dates = fitnessData.map(entry => new Date(entry.timestamp).toLocaleDateString());
        const durations = fitnessData.map(entry => entry.duration);

        this.charts.fitness.data.labels = dates;
        this.charts.fitness.data.datasets[0].data = durations;
        this.charts.fitness.update();
    }

    updateSleepChart(sleepData) {
        const dates = sleepData.map(entry => new Date(entry.timestamp).toLocaleDateString());
        const hours = sleepData.map(entry => this.calculateSleepHours(entry.bedtime, entry.wakeTime));

        this.charts.sleep.data.labels = dates;
        this.charts.sleep.data.datasets[0].data = hours;
        this.charts.sleep.update();
    }

    updateCalorieChart(dietData) {
        const dates = dietData.map(entry => new Date(entry.timestamp).toLocaleDateString());
        const calories = dietData.map(entry => entry.calories);

        this.charts.calories.data.labels = dates;
        this.charts.calories.data.datasets[0].data = calories;
        this.charts.calories.update();
    }

    updateFoodCategoryChart(dietData) {
        const categories = ['proteins', 'carbs', 'fats', 'vegetables', 'fruits', 'dairy'];
        const categoryCounts = categories.map(category => 
            dietData.filter(entry => 
                entry.foodCategories && entry.foodCategories.includes(category)
            ).length
        );

        this.charts.foodCategory.data.labels = categories;
        this.charts.foodCategory.data.datasets[0].data = categoryCounts;
        this.charts.foodCategory.update();
    }

    getRecentData(data) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.timeRange);

        return {
            fitness: data.fitness.filter(entry => new Date(entry.timestamp) >= cutoffDate),
            sleep: data.sleep.filter(entry => new Date(entry.timestamp) >= cutoffDate),
            diet: data.diet.filter(entry => new Date(entry.timestamp) >= cutoffDate)
        };
    }

    calculateSleepHours(bedtime, wakeTime) {
        // Convert time strings to Date objects for calculation
        const bed = new Date(`2000-01-01T${bedtime}`);
        const wake = new Date(`2000-01-01T${wakeTime}`);
        if (wake < bed) wake.setDate(wake.getDate() + 1);
        
        return (wake - bed) / (1000 * 60 * 60);
    }

    calculateAverageSleepHours(sleepData) {
        if (!sleepData.length) return 0;
        const totalHours = sleepData.reduce((acc, curr) => 
            acc + this.calculateSleepHours(curr.bedtime, curr.wakeTime), 0);
        return totalHours / sleepData.length;
    }

    calculateAverageSleepQuality(sleepData) {
        if (!sleepData.length) return '-';
        const qualityMap = { poor: 1, fair: 2, good: 3, excellent: 4 };
        const avgQuality = sleepData.reduce((acc, curr) => 
            acc + qualityMap[curr.quality], 0) / sleepData.length;
        return avgQuality.toFixed(1);
    }

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = 
            now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    }
}

// Initialize dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WellnessDashboard();
});