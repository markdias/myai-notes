// Settings management for MyAI Notes

// DOM Elements
const backButton = document.getElementById('backButton');
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const saveKeyButton = document.getElementById('saveKeyButton');
const clearKeyButton = document.getElementById('clearKeyButton');
const keyStatus = document.getElementById('keyStatus');
const modelSelect = document.getElementById('modelSelect');
const temperatureSlider = document.getElementById('temperatureSlider');
const temperatureValue = document.getElementById('temperatureValue');
const saveModelButton = document.getElementById('saveModelButton');

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    saveKeyButton.addEventListener('click', saveApiKey);
    clearKeyButton.addEventListener('click', clearApiKey);
    toggleKeyVisibility.addEventListener('click', togglePasswordVisibility);

    temperatureSlider.addEventListener('input', (e) => {
        temperatureValue.textContent = e.target.value;
    });

    saveModelButton.addEventListener('click', saveModelSettings);

    // Save on Enter key
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveApiKey();
        }
    });
}

// Load current settings
function loadSettings() {
    // Load API key (don't display it for security)
    const apiKey = localStorage.getItem('myai_api_key');
    if (apiKey) {
        apiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
        showStatus('API key is set', 'success');
    } else {
        showStatus('No API key set', 'info');
    }

    // Load model settings
    const model = localStorage.getItem('myai_model') || 'gpt-4o-mini';
    const temperature = localStorage.getItem('myai_temperature') || '0.7';

    modelSelect.value = model;
    temperatureSlider.value = temperature;
    temperatureValue.textContent = temperature;
}

// Save API key
function saveApiKey() {
    const key = apiKeyInput.value.trim();

    if (!key) {
        showStatus('Please enter an API key', 'error');
        return;
    }

    // Basic validation
    if (!key.startsWith('sk-')) {
        showStatus('Warning: API key should start with "sk-"', 'error');
        return;
    }

    try {
        localStorage.setItem('myai_api_key', key);
        apiKeyInput.value = '';
        apiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
        apiKeyInput.type = 'password';
        showStatus('API key saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving API key:', error);
        showStatus('Failed to save API key', 'error');
    }
}

// Clear API key
function clearApiKey() {
    if (!confirm('Are you sure you want to clear your API key?')) {
        return;
    }

    try {
        localStorage.removeItem('myai_api_key');
        apiKeyInput.value = '';
        apiKeyInput.placeholder = 'sk-...';
        showStatus('API key cleared', 'info');
    } catch (error) {
        console.error('Error clearing API key:', error);
        showStatus('Failed to clear API key', 'error');
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleKeyVisibility.textContent = '🙈';
    } else {
        apiKeyInput.type = 'password';
        toggleKeyVisibility.textContent = '👁️';
    }
}

// Save model settings
function saveModelSettings() {
    const model = modelSelect.value;
    const temperature = temperatureSlider.value;

    try {
        localStorage.setItem('myai_model', model);
        localStorage.setItem('myai_temperature', temperature);
        showStatus('Model settings saved!', 'success');
    } catch (error) {
        console.error('Error saving model settings:', error);
        showStatus('Failed to save settings', 'error');
    }
}

// Show status message
function showStatus(message, type = 'info') {
    keyStatus.textContent = message;
    keyStatus.className = `status-indicator ${type}`;
    keyStatus.style.display = 'block';
}
