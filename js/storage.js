// Storage management for MyAI Notes
// All notes are stored in localStorage

const STORAGE_KEY = 'myai_notes';

class NotesStorage {
    constructor() {
        this.notes = this.loadNotes();
    }

    // Load all notes from localStorage
    loadNotes() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading notes:', error);
            return [];
        }
    }

    // Save all notes to localStorage
    saveNotes() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes));
            return true;
        } catch (error) {
            console.error('Error saving notes:', error);
            return false;
        }
    }

    // Get all notes
    getAllNotes() {
        return this.notes;
    }

    // Get a note by ID
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    // Create a new note
    createNote(title = 'Untitled Note', content = '', expandedContent = '') {
        const note = {
            id: this.generateId(),
            title: title || 'Untitled Note',
            content: content,
            expandedContent: expandedContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.notes.unshift(note); // Add to beginning
        this.saveNotes();
        return note;
    }

    // Update an existing note
    updateNote(id, updates) {
        const index = this.notes.findIndex(note => note.id === id);
        if (index !== -1) {
            this.notes[index] = {
                ...this.notes[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveNotes();
            return this.notes[index];
        }
        return null;
    }

    // Delete a note
    deleteNote(id) {
        const index = this.notes.findIndex(note => note.id === id);
        if (index !== -1) {
            this.notes.splice(index, 1);
            this.saveNotes();
            return true;
        }
        return false;
    }

    // Generate a unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Export all notes as JSON
    exportAllNotes() {
        return JSON.stringify(this.notes, null, 2);
    }

    // Import notes from JSON
    importNotes(jsonString, merge = false) {
        try {
            const importedNotes = JSON.parse(jsonString);

            // Validate the imported data
            if (!Array.isArray(importedNotes)) {
                throw new Error('Invalid format: expected an array of notes');
            }

            // Validate each note has required fields
            for (const note of importedNotes) {
                if (!note.id || !note.title) {
                    throw new Error('Invalid note format: missing required fields');
                }
            }

            if (merge) {
                // Merge with existing notes, avoiding duplicates by ID
                const existingIds = new Set(this.notes.map(n => n.id));
                const newNotes = importedNotes.filter(n => !existingIds.has(n.id));
                this.notes = [...this.notes, ...newNotes];
            } else {
                // Replace all notes
                this.notes = importedNotes;
            }

            this.saveNotes();
            return { success: true, count: importedNotes.length };
        } catch (error) {
            console.error('Error importing notes:', error);
            return { success: false, error: error.message };
        }
    }

    // Search notes
    searchNotes(query) {
        const lowerQuery = query.toLowerCase();
        return this.notes.filter(note =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.expandedContent.toLowerCase().includes(lowerQuery)
        );
    }

    // Get notes sorted by date
    getNotesSortedByDate(ascending = false) {
        return [...this.notes].sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }
}

// Create a global instance
const notesStorage = new NotesStorage();
