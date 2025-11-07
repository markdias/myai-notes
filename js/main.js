// Main application logic for MyAI Notes

let currentNoteId = null;
let isLoading = false;

// DOM Elements
const newNoteButton = document.getElementById('newNoteButton');
const notesList = document.getElementById('notesList');
const welcomeScreen = document.getElementById('welcomeScreen');
const noteContent = document.getElementById('noteContent');
const noteTitleInput = document.getElementById('noteTitle');
const noteInput = document.getElementById('noteInput');
const expandButton = document.getElementById('expandButton');
const expandedNote = document.getElementById('expandedNote');
const saveButton = document.getElementById('saveButton');
const exportButton = document.getElementById('exportButton');
const deleteButton = document.getElementById('deleteButton');
const copyButton = document.getElementById('copyButton');
const settingsButton = document.getElementById('settingsButton');
const statusMessage = document.getElementById('statusMessage');
const exportAllButton = document.getElementById('exportAllButton');
const importNotesButton = document.getElementById('importNotesButton');
const importFileInput = document.getElementById('importFileInput');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderNotesList();
    setupEventListeners();

    // Show welcome screen if no notes
    if (notesStorage.getAllNotes().length === 0) {
        showWelcomeScreen();
    }
});

// Setup event listeners
function setupEventListeners() {
    newNoteButton.addEventListener('click', createNewNote);
    expandButton.addEventListener('click', expandNote);
    saveButton.addEventListener('click', saveCurrentNote);
    exportButton.addEventListener('click', exportCurrentNote);
    deleteButton.addEventListener('click', deleteCurrentNote);
    copyButton.addEventListener('click', copyToClipboard);
    settingsButton.addEventListener('click', () => {
        window.location.href = 'settings.html';
    });
    exportAllButton.addEventListener('click', exportAllNotes);
    importNotesButton.addEventListener('click', () => {
        importFileInput.click();
    });
    importFileInput.addEventListener('change', importNotes);

    // Auto-save on title/content change (debounced)
    let saveTimeout;
    noteTitleInput.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (currentNoteId) {
                autoSaveNote();
            }
        }, 1000);
    });

    noteInput.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (currentNoteId) {
                autoSaveNote();
            }
        }, 1000);
    });
}

// Render notes list in sidebar
function renderNotesList() {
    const notes = notesStorage.getNotesSortedByDate();
    notesList.innerHTML = '';

    if (notes.length === 0) {
        notesList.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-tertiary);">No notes yet</div>';
        return;
    }

    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        if (note.id === currentNoteId) {
            noteItem.classList.add('active');
        }

        const preview = note.content.slice(0, 60) || note.expandedContent.slice(0, 60) || 'Empty note';
        const date = new Date(note.updatedAt).toLocaleDateString();

        noteItem.innerHTML = `
            <div class="note-item-title">${escapeHtml(note.title)}</div>
            <div class="note-item-preview">${escapeHtml(preview)}${preview.length >= 60 ? '...' : ''}</div>
            <div class="note-item-date">${date}</div>
        `;

        noteItem.addEventListener('click', () => loadNote(note.id));
        notesList.appendChild(noteItem);
    });
}

// Create new note
function createNewNote() {
    const note = notesStorage.createNote();
    currentNoteId = note.id;
    showNoteEditor();
    renderNotesList();
    loadNote(note.id);
    noteTitleInput.focus();
}

// Load a note
function loadNote(noteId) {
    const note = notesStorage.getNoteById(noteId);
    if (!note) return;

    currentNoteId = noteId;
    showNoteEditor();

    noteTitleInput.value = note.title;
    noteInput.value = note.content;

    if (note.expandedContent) {
        renderMarkdown(note.expandedContent);
    } else {
        expandedNote.innerHTML = '';
    }

    renderNotesList();
    clearStatus();
}

// Show welcome screen
function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    noteContent.style.display = 'none';
    currentNoteId = null;
}

// Show note editor
function showNoteEditor() {
    welcomeScreen.style.display = 'none';
    noteContent.style.display = 'flex';
}

// Expand note using AI (OpenAI or Claude)
async function expandNote() {
    if (isLoading) return;

    const noteText = noteInput.value.trim();
    if (!noteText) {
        showStatus('Please write something first.', 'error');
        return;
    }

    // Check which providers are enabled
    const openaiEnabled = localStorage.getItem('myai_openai_enabled') !== 'false';
    const claudeEnabled = localStorage.getItem('myai_claude_enabled') === 'true';

    // Determine which provider to use (prioritize Claude if both are enabled)
    let useProvider = null;
    if (claudeEnabled && localStorage.getItem('myai_claude_api_key')) {
        useProvider = 'claude';
    } else if (openaiEnabled && localStorage.getItem('myai_api_key')) {
        useProvider = 'openai';
    }

    if (!useProvider) {
        showStatus('Please set an API key for at least one enabled provider in Settings.', 'error');
        return;
    }

    isLoading = true;
    expandButton.disabled = true;
    document.querySelector('.button-text').style.display = 'none';
    document.querySelector('.spinner').style.display = 'inline';
    showStatus(`Expanding with ${useProvider === 'claude' ? 'Claude' : 'OpenAI'}...`, 'info');

    try {
        let expandedText;
        if (useProvider === 'claude') {
            expandedText = await expandWithClaude(noteText);
        } else {
            expandedText = await expandWithOpenAI(noteText);
        }

        // Render markdown
        renderMarkdown(expandedText);

        // Auto-save the expanded content
        if (currentNoteId) {
            notesStorage.updateNote(currentNoteId, {
                expandedContent: expandedText
            });
            renderNotesList();
        }

        showStatus('Note expanded successfully!', 'success');
    } catch (error) {
        console.error('Error expanding note:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        isLoading = false;
        expandButton.disabled = false;
        document.querySelector('.button-text').style.display = 'inline';
        document.querySelector('.spinner').style.display = 'none';
    }
}

// Expand note using OpenAI API
async function expandWithOpenAI(noteText) {
    const apiKey = localStorage.getItem('myai_api_key');
    const model = localStorage.getItem('myai_openai_model') || 'gpt-4o-mini';
    const temperature = parseFloat(localStorage.getItem('myai_temperature') || '0.7');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that expands short notes into detailed, well-structured text. Format your response in Markdown for better readability.'
                },
                {
                    role: 'user',
                    content: `Please expand the following note into a detailed, well-structured text:\n\n${noteText}`
                }
            ],
            temperature: temperature
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Expand note using Claude API
async function expandWithClaude(noteText) {
    const apiKey = localStorage.getItem('myai_claude_api_key');
    const model = localStorage.getItem('myai_claude_model') || 'claude-3-5-sonnet-20241022';
    const temperature = parseFloat(localStorage.getItem('myai_temperature') || '0.7');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            max_tokens: 4096,
            temperature: temperature,
            system: 'You are a helpful assistant that expands short notes into detailed, well-structured text. Format your response in Markdown for better readability.',
            messages: [
                {
                    role: 'user',
                    content: `Please expand the following note into a detailed, well-structured text:\n\n${noteText}`
                }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

// Render markdown content
function renderMarkdown(text) {
    try {
        expandedNote.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('Error rendering markdown:', error);
        expandedNote.textContent = text;
    }
}

// Save current note
function saveCurrentNote() {
    if (!currentNoteId) {
        createNewNote();
        return;
    }

    const title = noteTitleInput.value.trim() || 'Untitled Note';
    const content = noteInput.value;
    const expandedContent = expandedNote.textContent || expandedNote.innerText;

    notesStorage.updateNote(currentNoteId, {
        title,
        content,
        expandedContent
    });

    renderNotesList();
    showStatus('Note saved!', 'success');
}

// Auto-save note (silent)
function autoSaveNote() {
    if (!currentNoteId) return;

    const title = noteTitleInput.value.trim() || 'Untitled Note';
    const content = noteInput.value;

    notesStorage.updateNote(currentNoteId, {
        title,
        content
    });

    renderNotesList();
}

// Export current note as .txt
function exportCurrentNote() {
    if (!currentNoteId) return;

    const note = notesStorage.getNoteById(currentNoteId);
    if (!note) return;

    const content = note.expandedContent || note.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${note.title}.txt`;
    link.click();

    showStatus('Note exported!', 'success');
}

// Delete current note
function deleteCurrentNote() {
    if (!currentNoteId) return;

    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    notesStorage.deleteNote(currentNoteId);
    currentNoteId = null;

    renderNotesList();

    const notes = notesStorage.getAllNotes();
    if (notes.length > 0) {
        loadNote(notes[0].id);
    } else {
        showWelcomeScreen();
    }

    showStatus('Note deleted!', 'success');
}

// Copy expanded note to clipboard
async function copyToClipboard() {
    const content = expandedNote.textContent || expandedNote.innerText;

    if (!content) {
        showStatus('Nothing to copy!', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(content);
        showStatus('Copied to clipboard!', 'success');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showStatus('Failed to copy', 'error');
    }
}

// Export all notes as JSON
function exportAllNotes() {
    const jsonData = notesStorage.exportAllNotes();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `myai-notes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showStatus('All notes exported!', 'success');
}

// Import notes from JSON
function importNotes(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const result = notesStorage.importNotes(e.target.result, true);

        if (result.success) {
            renderNotesList();
            showStatus(`Imported ${result.count} note(s)!`, 'success');

            // Load first note if none selected
            if (!currentNoteId) {
                const notes = notesStorage.getAllNotes();
                if (notes.length > 0) {
                    loadNote(notes[0].id);
                }
            }
        } else {
            showStatus(`Import failed: ${result.error}`, 'error');
        }
    };

    reader.onerror = () => {
        showStatus('Failed to read file', 'error');
    };

    reader.readAsText(file);

    // Reset input so same file can be imported again
    event.target.value = '';
}

// Show status message
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;

    // Auto-clear after 3 seconds
    setTimeout(clearStatus, 3000);
}

// Clear status message
function clearStatus() {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
