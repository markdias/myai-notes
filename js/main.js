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
const setNoteButton = document.getElementById('setNoteButton');
const toggleExpandedButton = document.getElementById('toggleExpandedButton');
const regenerateSelectionButton = document.getElementById('regenerateSelectionButton');
const noteEditorWrapper = document.getElementById('noteEditorWrapper');
const noteDisplayContainer = document.getElementById('noteDisplayContainer');
const noteDisplay = document.getElementById('noteDisplay');
const editNoteButton = document.getElementById('editNoteButton');
const settingsButton = document.getElementById('settingsButton');
const publishedNotesButton = document.getElementById('publishedNotesButton');
const statusMessage = document.getElementById('statusMessage');
const exportAllButton = document.getElementById('exportAllButton');
const importNotesButton = document.getElementById('importNotesButton');
const importFileInput = document.getElementById('importFileInput');
const publishedNotesPanel = document.getElementById('publishedNotesPanel');
const publishedNotesList = document.getElementById('publishedNotesList');
const closePublishedNotes = document.getElementById('closePublishedNotes');
const publishedPanelBackdrop = document.getElementById('publishedPanelBackdrop');

const expandButtonText = expandButton?.querySelector('.button-text');
const expandButtonSpinner = expandButton?.querySelector('.spinner');

let lastExpandedText = '';
let isRegenerating = false;
let isExpandedHidden = false;
let lastFocusedElementBeforePanel = null;

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
    if (setNoteButton) {
        setNoteButton.addEventListener('click', applyExpandedTextToNote);
    }
    if (editNoteButton) {
        editNoteButton.addEventListener('click', () => showManualNoteEditor(true));
    }
    if (toggleExpandedButton) {
        toggleExpandedButton.addEventListener('click', () => setExpandedNoteHidden(!isExpandedHidden));
    }
    if (regenerateSelectionButton) {
        regenerateSelectionButton.addEventListener('click', regenerateSelection);
    }
    settingsButton.addEventListener('click', () => {
        window.location.href = 'settings.html';
    });
    if (publishedNotesButton) {
        publishedNotesButton.addEventListener('click', openPublishedNotesPanel);
    }
    if (closePublishedNotes) {
        closePublishedNotes.addEventListener('click', closePublishedNotesPanel);
    }
    if (publishedPanelBackdrop) {
        publishedPanelBackdrop.addEventListener('click', closePublishedNotesPanel);
    }
    exportAllButton.addEventListener('click', exportAllNotes);
    importNotesButton.addEventListener('click', () => {
        importFileInput.click();
    });
    importFileInput.addEventListener('change', importNotes);

    document.addEventListener('selectionchange', handleSelectionChange);
    noteInput.addEventListener('keyup', handleSelectionChange);
    noteInput.addEventListener('mouseup', handleSelectionChange);
    noteInput.addEventListener('select', handleSelectionChange);
    noteInput.addEventListener('input', handleSelectionChange);
    if (noteDisplay) {
        noteDisplay.addEventListener('mouseup', handleSelectionChange);
        noteDisplay.addEventListener('keyup', handleSelectionChange);
    }
    if (expandedNote) {
        expandedNote.addEventListener('mouseup', handleSelectionChange);
        expandedNote.addEventListener('keyup', handleSelectionChange);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && publishedNotesPanel && !publishedNotesPanel.hidden) {
            closePublishedNotesPanel();
        }
    });

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

    handleSelectionChange();
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

    refreshPublishedNotesIfOpen();
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
    setExpandedNoteHidden(false);

    noteTitleInput.value = note.title;
    noteInput.value = note.content;

    if (note.expandedContent) {
        renderMarkdown(note.expandedContent);
    } else {
        expandedNote.innerHTML = '';
        lastExpandedText = '';
        updateSetNoteButtonVisibility('');
        updateToggleExpandedButtonVisibility('');
    }

    const shouldShowDisplay = Boolean(note.expandedContent && note.content && note.content.trim() === note.expandedContent.trim());
    if (shouldShowDisplay) {
        showGeneratedNoteDisplay(note.expandedContent);
    } else {
        showManualNoteEditor();
    }

    renderNotesList();
    clearStatus();
    handleSelectionChange();
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
    showManualNoteEditor();
}

// Expand note using AI (OpenAI or Claude)
async function expandNote() {
    if (isLoading) return;

    const noteText = noteInput.value.trim();
    if (!noteText) {
        showStatus('Please write something first.', 'error');
        return;
    }

    const useProvider = getPreferredProvider();

    if (!useProvider) {
        showStatus('Please set an API key for at least one enabled provider in Settings.', 'error');
        return;
    }

    isLoading = true;
    expandButton.disabled = true;
    if (expandButtonText) {
        expandButtonText.style.display = 'none';
    }
    if (expandButtonSpinner) {
        expandButtonSpinner.style.display = 'inline';
    }
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
        if (expandButtonText) {
            expandButtonText.style.display = 'inline';
        }
        if (expandButtonSpinner) {
            expandButtonSpinner.style.display = 'none';
        }
    }
}

// Expand note using OpenAI API
async function expandWithOpenAI(noteText) {
    return callOpenAICompletion({
        systemPrompt: 'You are a helpful assistant that expands short notes into detailed, well-structured text. Format your response in Markdown for better readability.',
        userPrompt: `Please expand the following note into a detailed, well-structured text.\n\n${noteText}`
    });
}

// Expand note using Claude API
async function expandWithClaude(noteText) {
    return callClaudeCompletion({
        systemPrompt: 'You are a helpful assistant that expands short notes into detailed, well-structured text. Format your response in Markdown for better readability.',
        userPrompt: `Please expand the following note into a detailed, well-structured text.\n\n${noteText}`
    });
}

// Render markdown content
function renderMarkdown(text) {
    try {
        expandedNote.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('Error rendering markdown:', error);
        expandedNote.textContent = text;
    }

    lastExpandedText = text || '';
    if (expandedNote) {
        expandedNote.dataset.raw = lastExpandedText;
    }
    setExpandedNoteHidden(false);
    updateSetNoteButtonVisibility(text);
    updateToggleExpandedButtonVisibility(text);
}

function updateSetNoteButtonVisibility(text) {
    if (!setNoteButton) return;

    if (text && text.trim()) {
        setNoteButton.style.display = 'inline-flex';
        setNoteButton.disabled = false;
    } else {
        setNoteButton.style.display = 'none';
    }
}

function showGeneratedNoteDisplay(text) {
    if (!noteDisplayContainer || !noteEditorWrapper || !noteDisplay) return;

    try {
        noteDisplay.innerHTML = marked.parse(text);
    } catch (error) {
        console.error('Error rendering applied note markdown:', error);
        noteDisplay.textContent = text;
    }

    noteEditorWrapper.style.display = 'none';
    noteDisplayContainer.style.display = 'flex';
    handleSelectionChange();
}

function showManualNoteEditor(focus = false) {
    if (!noteDisplayContainer || !noteEditorWrapper) return;

    noteEditorWrapper.style.display = 'flex';
    noteDisplayContainer.style.display = 'none';

    if (focus && noteInput) {
        noteInput.focus();
    }

    handleSelectionChange();
}

function applyExpandedTextToNote() {
    const textToApply = (lastExpandedText || '').trim();

    if (!textToApply) {
        showStatus('Expand a note before applying it.', 'error');
        return;
    }

    noteInput.value = lastExpandedText;
    showGeneratedNoteDisplay(lastExpandedText);
    setExpandedNoteHidden(false);
    updateToggleExpandedButtonVisibility(lastExpandedText);

    if (currentNoteId) {
        notesStorage.updateNote(currentNoteId, {
            content: lastExpandedText,
            expandedContent: lastExpandedText
        });
        renderNotesList();
    }

    showStatus('Generated text applied to the note.', 'success');
}

async function regenerateSelection() {
    if (isRegenerating) {
        return;
    }

    const provider = getPreferredProvider();
    if (!provider) {
        showStatus('Please set an API key for at least one enabled provider in Settings.', 'error');
        return;
    }

    const selectionInfo = getSelectionInfo();
    if (!selectionInfo) {
        showStatus('Highlight a portion of the note to regenerate it.', 'error');
        return;
    }

    const { text, start, end, context } = selectionInfo;
    if (!text || start === null || end === null) {
        showStatus('Unable to map the selected text back to the saved note. Try selecting the text from the editor view.', 'error');
        return;
    }

    const trimmedSelection = text.trim();
    if (!trimmedSelection) {
        showStatus('Highlight a portion of the note to regenerate it.', 'error');
        return;
    }

    isRegenerating = true;
    if (regenerateSelectionButton) {
        regenerateSelectionButton.disabled = true;
        regenerateSelectionButton.textContent = '⏳ Regenerating...';
    }
    showStatus('Regenerating the selected section...', 'info');

    try {
        let regenerated;
        if (provider === 'claude') {
            regenerated = await regenerateWithClaude(trimmedSelection, context);
        } else {
            regenerated = await regenerateWithOpenAI(trimmedSelection, context);
        }

        const replacement = (regenerated || '').trim();
        if (!replacement) {
            throw new Error('The AI response did not contain any content to insert.');
        }

        const newContent = context.slice(0, start) + replacement + context.slice(end);
        noteInput.value = newContent;
        lastExpandedText = newContent;
        showGeneratedNoteDisplay(newContent);
        setExpandedNoteHidden(false);
        updateToggleExpandedButtonVisibility(newContent);

        if (currentNoteId) {
            notesStorage.updateNote(currentNoteId, {
                content: newContent,
                expandedContent: newContent
            });
            renderNotesList();
        }

        clearSelectionRange();
        showStatus('Section regenerated successfully.', 'success');
    } catch (error) {
        console.error('Error regenerating selection:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        isRegenerating = false;
        if (regenerateSelectionButton) {
            regenerateSelectionButton.textContent = '🔁 Regenerate Selection';
        }
        handleSelectionChange();
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
    const existingNote = notesStorage.getNoteById(currentNoteId);
    const expandedContent = (lastExpandedText && lastExpandedText.trim())
        ? lastExpandedText
        : (existingNote?.expandedContent || '');

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

function setExpandedNoteHidden(hidden) {
    if (!expandedNote) return;

    isExpandedHidden = Boolean(hidden);
    expandedNote.style.display = hidden ? 'none' : 'block';
    expandedNote.setAttribute('aria-hidden', hidden ? 'true' : 'false');

    updateToggleExpandedButtonVisibility(lastExpandedText);
}

function updateToggleExpandedButtonVisibility(text) {
    if (!toggleExpandedButton) return;

    if (text && text.trim()) {
        toggleExpandedButton.style.display = 'inline-flex';
        toggleExpandedButton.disabled = false;
        toggleExpandedButton.textContent = isExpandedHidden ? '👁️ Show' : '🙈 Hide';
        toggleExpandedButton.title = isExpandedHidden ? 'Show expanded note' : 'Hide expanded note';
    } else {
        toggleExpandedButton.style.display = 'none';
    }
}

function handleSelectionChange() {
    if (!regenerateSelectionButton) return;

    const providerAvailable = Boolean(getPreferredProvider());
    let hasSelection = false;

    if (document.activeElement === noteInput) {
        const start = noteInput.selectionStart;
        const end = noteInput.selectionEnd;
        hasSelection = typeof start === 'number' && typeof end === 'number' && start !== end;
    } else {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            const anchorValid = isNodeWithin(selection.anchorNode, noteDisplay) || isNodeWithin(selection.anchorNode, expandedNote);
            const focusValid = isNodeWithin(selection.focusNode, noteDisplay) || isNodeWithin(selection.focusNode, expandedNote);
            hasSelection = anchorValid && focusValid;
        }
    }

    regenerateSelectionButton.disabled = !providerAvailable || !hasSelection || isRegenerating;
}

function getSelectionInfo() {
    const context = noteInput.value || '';

    if (document.activeElement === noteInput) {
        const start = noteInput.selectionStart;
        const end = noteInput.selectionEnd;
        if (typeof start === 'number' && typeof end === 'number' && start !== end) {
            return {
                text: context.slice(start, end),
                start,
                end,
                context
            };
        }
        return null;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
        return null;
    }

    const selectionText = selection.toString();
    if (!selectionText.trim()) {
        return null;
    }

    const anchorValid = isNodeWithin(selection.anchorNode, noteDisplay) || isNodeWithin(selection.anchorNode, expandedNote);
    const focusValid = isNodeWithin(selection.focusNode, noteDisplay) || isNodeWithin(selection.focusNode, expandedNote);

    if (!anchorValid || !focusValid) {
        return null;
    }

    const startIndex = context.indexOf(selectionText);
    if (startIndex === -1) {
        return {
            text: selectionText,
            start: null,
            end: null,
            context
        };
    }

    return {
        text: selectionText,
        start: startIndex,
        end: startIndex + selectionText.length,
        context
    };
}

function clearSelectionRange() {
    if (document.activeElement === noteInput && typeof noteInput.setSelectionRange === 'function') {
        const position = noteInput.selectionEnd ?? noteInput.selectionStart ?? noteInput.value.length;
        noteInput.setSelectionRange(position, position);
    }

    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
    }
}

function isNodeWithin(node, container) {
    if (!node || !container) return false;
    return node === container || container.contains(node);
}

function openPublishedNotesPanel() {
    if (!publishedNotesPanel) return;

    lastFocusedElementBeforePanel = document.activeElement;
    populatePublishedNotes();
    publishedNotesPanel.hidden = false;
    publishedNotesPanel.setAttribute('aria-hidden', 'false');

    if (publishedPanelBackdrop) {
        publishedPanelBackdrop.hidden = false;
    }

    if (closePublishedNotes) {
        closePublishedNotes.focus();
    }
}

function closePublishedNotesPanel() {
    if (!publishedNotesPanel) return;

    publishedNotesPanel.hidden = true;
    publishedNotesPanel.setAttribute('aria-hidden', 'true');

    if (publishedPanelBackdrop) {
        publishedPanelBackdrop.hidden = true;
    }

    if (lastFocusedElementBeforePanel && typeof lastFocusedElementBeforePanel.focus === 'function') {
        lastFocusedElementBeforePanel.focus();
    }

    lastFocusedElementBeforePanel = null;
}

function populatePublishedNotes() {
    if (!publishedNotesList) return;

    const notes = notesStorage.getNotesSortedByDate();
    publishedNotesList.innerHTML = '';

    if (notes.length === 0) {
        publishedNotesList.innerHTML = '<div class="published-note-empty">No published notes yet. Save or generate a note to see it here.</div>';
        return;
    }

    notes.forEach(note => {
        const card = document.createElement('article');
        card.className = 'published-note-card';

        const title = escapeHtml(note.title || 'Untitled Note');
        const updatedAt = new Date(note.updatedAt);
        const formattedDate = isNaN(updatedAt.getTime()) ? '' : updatedAt.toLocaleString();
        const content = (note.expandedContent && note.expandedContent.trim()) || note.content || '';
        let renderedContent = '';

        if (content) {
            try {
                renderedContent = marked.parse(content);
            } catch (error) {
                console.error('Error rendering published note markdown:', error);
                renderedContent = `<pre>${escapeHtml(content)}</pre>`;
            }
        } else {
            renderedContent = '<p style="color: var(--text-secondary);">This note does not have any content yet.</p>';
        }

        card.innerHTML = `
            <h3>${title}</h3>
            <div class="published-note-meta">Updated ${formattedDate || 'recently'}</div>
            <div class="published-note-content">${renderedContent}</div>
        `;

        card.addEventListener('click', () => {
            closePublishedNotesPanel();
            loadNote(note.id);
        });

        publishedNotesList.appendChild(card);
    });
}

function refreshPublishedNotesIfOpen() {
    if (publishedNotesPanel && !publishedNotesPanel.hidden) {
        populatePublishedNotes();
    }
}

function getPreferredProvider() {
    const claudeEnabled = localStorage.getItem('myai_claude_enabled') === 'true';
    const openaiEnabled = localStorage.getItem('myai_openai_enabled') !== 'false';
    const claudeKey = localStorage.getItem('myai_claude_api_key');
    const openaiKey = localStorage.getItem('myai_api_key');

    if (claudeEnabled && claudeKey) {
        return 'claude';
    }
    if (openaiEnabled && openaiKey) {
        return 'openai';
    }
    if (claudeKey) {
        return 'claude';
    }
    if (openaiKey) {
        return 'openai';
    }
    return null;
}

async function callOpenAICompletion({ systemPrompt, userPrompt }) {
    const apiKey = localStorage.getItem('myai_api_key');
    const model = localStorage.getItem('myai_openai_model') || 'gpt-4o-mini';
    const temperature = parseFloat(localStorage.getItem('myai_temperature') || '0.7');

    if (!apiKey) {
        throw new Error('OpenAI API key is missing. Please add it on the Settings page before trying again.');
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature
            })
        });

        if (!response.ok) {
            let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.error?.message) {
                    errorMessage = errorData.error.message;
                }
            } catch (parseError) {
                console.error('Failed to parse OpenAI error response:', parseError);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from OpenAI API');
        }

        return data.choices[0].message.content;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error('Network error: Unable to connect to OpenAI API. Please check your internet connection and verify that https://api.openai.com is accessible.');
        }
        throw error;
    }
}

async function callClaudeCompletion({ systemPrompt, userPrompt }) {
    const apiKey = localStorage.getItem('myai_claude_api_key');
    const model = localStorage.getItem('myai_claude_model') || 'claude-3-5-sonnet-20241022';
    const temperature = parseFloat(localStorage.getItem('myai_temperature') || '0.7');

    if (!apiKey) {
        throw new Error('Claude API key is missing. Please add it on the Settings page before trying again.');
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model,
                max_tokens: 4096,
                temperature,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ]
            })
        });

        if (!response.ok) {
            let errorMessage = `Claude API error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.error?.message) {
                    errorMessage = errorData.error.message;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (parseError) {
                console.error('Failed to parse Claude error response:', parseError);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!data.content || !data.content[0] || !data.content[0].text) {
            throw new Error('Invalid response format from Claude API');
        }

        return data.content[0].text;
    } catch (error) {
        if (error instanceof TypeError) {
            const offline = typeof navigator !== 'undefined' && navigator && navigator.onLine === false;
            const servedFromFile = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';

            let errorMessage = 'Network error: Unable to connect to Claude API. Please check your internet connection and verify that https://api.anthropic.com is accessible.';

            if (offline) {
                errorMessage = 'You appear to be offline. Please reconnect to the internet and try again.';
            } else if (servedFromFile) {
                errorMessage += ' This often happens when the app is opened directly from the file system. Run the app through a local web server (see the README) so that the browser allows secure API requests.';
            } else {
                errorMessage += ' If you recently enabled Claude access, make sure the "Browser access" option is turned on for your API key in the Anthropic Console.';
            }

            throw new Error(errorMessage);
        }
        throw error;
    }
}

function buildRewritePrompts(selectionText, context) {
    const systemPrompt = 'You are a helpful assistant that rewrites sections of Markdown notes. Preserve the tone, structure, and formatting of the surrounding content. Return Markdown that can replace the selected section directly.';
    const userPrompt = `Here is the complete note in Markdown:\n\n${context}\n\nRewrite ONLY the section enclosed between the <<< and >>> markers. Keep any relevant Markdown formatting and return the replacement section only.\n<<<\n${selectionText}\n>>>`;

    return { systemPrompt, userPrompt };
}

async function regenerateWithOpenAI(selectionText, context) {
    const prompts = buildRewritePrompts(selectionText, context);
    return callOpenAICompletion(prompts);
}

async function regenerateWithClaude(selectionText, context) {
    const prompts = buildRewritePrompts(selectionText, context);
    return callClaudeCompletion(prompts);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
