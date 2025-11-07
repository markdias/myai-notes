// Settings management for MyAI Notes

// DOM Elements
const backButton = document.getElementById('backButton');
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const saveKeyButton = document.getElementById('saveKeyButton');
const clearKeyButton = document.getElementById('clearKeyButton');
const keyStatus = document.getElementById('keyStatus');
const claudeApiKeyInput = document.getElementById('claudeApiKeyInput');
const toggleClaudeKeyVisibility = document.getElementById('toggleClaudeKeyVisibility');
const saveClaudeKeyButton = document.getElementById('saveClaudeKeyButton');
const clearClaudeKeyButton = document.getElementById('clearClaudeKeyButton');
const claudeKeyStatus = document.getElementById('claudeKeyStatus');
const openaiEnabled = document.getElementById('openaiEnabled');
const claudeEnabled = document.getElementById('claudeEnabled');
const openaiModelSelect = document.getElementById('openaiModelSelect');
const claudeModelSelect = document.getElementById('claudeModelSelect');
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

    // OpenAI API key listeners
    saveKeyButton.addEventListener('click', saveApiKey);
    clearKeyButton.addEventListener('click', clearApiKey);
    toggleKeyVisibility.addEventListener('click', togglePasswordVisibility);

    // Claude API key listeners
    saveClaudeKeyButton.addEventListener('click', saveClaudeApiKey);
    clearClaudeKeyButton.addEventListener('click', clearClaudeApiKey);
    toggleClaudeKeyVisibility.addEventListener('click', toggleClaudePasswordVisibility);

    // Provider toggles
    openaiEnabled.addEventListener('change', saveProviderSettings);
    claudeEnabled.addEventListener('change', saveProviderSettings);

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

    claudeApiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveClaudeApiKey();
        }
    });
}

// Load current settings
function loadSettings() {
    // Load provider toggles
    const openaiEnabledState = localStorage.getItem('myai_openai_enabled') !== 'false';
    const claudeEnabledState = localStorage.getItem('myai_claude_enabled') === 'true';
    openaiEnabled.checked = openaiEnabledState;
    claudeEnabled.checked = claudeEnabledState;

    // Load OpenAI API key (don't display it for security)
    const apiKey = localStorage.getItem('myai_api_key');
    if (apiKey) {
        apiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
        showStatus('OpenAI API key is set', 'success');
    } else {
        showStatus('No OpenAI API key set', 'info');
    }

    // Load Claude API key (don't display it for security)
    const claudeApiKey = localStorage.getItem('myai_claude_api_key');
    if (claudeApiKey) {
        claudeApiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
        showClaudeStatus('Claude API key is set', 'success');
    } else {
        showClaudeStatus('No Claude API key set', 'info');
    }

    // Load model settings
    const openaiModel = localStorage.getItem('myai_openai_model') || 'gpt-4o-mini';
    const claudeModel = localStorage.getItem('myai_claude_model') || 'claude-3-5-sonnet-20241022';
    const temperature = localStorage.getItem('myai_temperature') || '0.7';

    openaiModelSelect.value = openaiModel;
    claudeModelSelect.value = claudeModel;
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

// Save Claude API key
function saveClaudeApiKey() {
    const key = claudeApiKeyInput.value.trim();

    if (!key) {
        showClaudeStatus('Please enter an API key', 'error');
        return;
    }

    // Basic validation
    if (!key.startsWith('sk-ant-')) {
        showClaudeStatus('Warning: Claude API key should start with "sk-ant-"', 'error');
        return;
    }

    try {
        localStorage.setItem('myai_claude_api_key', key);
        claudeApiKeyInput.value = '';
        claudeApiKeyInput.placeholder = '••••••••••••••••••••••••••••••••';
        claudeApiKeyInput.type = 'password';
        showClaudeStatus('Claude API key saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving Claude API key:', error);
        showClaudeStatus('Failed to save API key', 'error');
    }
}

// Clear Claude API key
function clearClaudeApiKey() {
    if (!confirm('Are you sure you want to clear your Claude API key?')) {
        return;
    }

    try {
        localStorage.removeItem('myai_claude_api_key');
        claudeApiKeyInput.value = '';
        claudeApiKeyInput.placeholder = 'sk-ant-...';
        showClaudeStatus('Claude API key cleared', 'info');
    } catch (error) {
        console.error('Error clearing Claude API key:', error);
        showClaudeStatus('Failed to clear API key', 'error');
    }
}

// Toggle Claude password visibility
function toggleClaudePasswordVisibility() {
    if (claudeApiKeyInput.type === 'password') {
        claudeApiKeyInput.type = 'text';
        toggleClaudeKeyVisibility.textContent = '🙈';
    } else {
        claudeApiKeyInput.type = 'password';
        toggleClaudeKeyVisibility.textContent = '👁️';
    }
}

// Save provider settings
function saveProviderSettings() {
    // Ensure at least one provider is enabled
    if (!openaiEnabled.checked && !claudeEnabled.checked) {
        alert('At least one AI provider must be enabled!');
        // Restore the previously enabled provider
        const previousOpenAI = localStorage.getItem('myai_openai_enabled') !== 'false';
        const previousClaude = localStorage.getItem('myai_claude_enabled') === 'true';

        if (previousClaude) {
            claudeEnabled.checked = true;
        } else {
            openaiEnabled.checked = true;
        }
        return;
    }

    try {
        localStorage.setItem('myai_openai_enabled', openaiEnabled.checked);
        localStorage.setItem('myai_claude_enabled', claudeEnabled.checked);
        showStatus('Provider settings saved!', 'success');
    } catch (error) {
        console.error('Error saving provider settings:', error);
        showStatus('Failed to save provider settings', 'error');
    }
}

// Save model settings
function saveModelSettings() {
    const openaiModel = openaiModelSelect.value;
    const claudeModel = claudeModelSelect.value;
    const temperature = temperatureSlider.value;

    try {
        localStorage.setItem('myai_openai_model', openaiModel);
        localStorage.setItem('myai_claude_model', claudeModel);
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

// Show Claude status message
function showClaudeStatus(message, type = 'info') {
    claudeKeyStatus.textContent = message;
    claudeKeyStatus.className = `status-indicator ${type}`;
    claudeKeyStatus.style.display = 'block';
}
