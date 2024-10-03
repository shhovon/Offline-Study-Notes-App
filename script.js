const folderList = document.getElementById('folderList');
const noteList = document.getElementById('noteList');
const addFolderBtn = document.getElementById('addFolderBtn');
const newFolderInput = document.getElementById('newFolderInput');
const addNoteBtn = document.getElementById('addNoteBtn');
const noteModal = document.getElementById('noteModal');
const noteTitle = document.getElementById('noteTitle');
const noteFolder = document.getElementById('noteFolder');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const searchInput = document.getElementById('searchInput');
const darkModeToggle = document.getElementById('darkModeToggle');

let folders = JSON.parse(localStorage.getItem('folders')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentNoteId = null;

const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ]
    }
});

function renderFolders() {
    folderList.innerHTML = folders.map(folder => `
        <li class="mb-2 flex justify-between items-center">
            <span class="cursor-pointer hover:text-blue-500">${folder}</span>
            <button class="text-red-500" onclick="deleteFolder('${folder}')">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');
    updateNoteFolder();
}

function renderNotes() {
    const filteredNotes = searchInput.value
        ? notes.filter(note => note.title.toLowerCase().includes(searchInput.value.toLowerCase()))
        : notes;

    noteList.innerHTML = filteredNotes.map(note => `
        <div class="bg-white p-4 rounded shadow">
            <h3 class="text-lg font-semibold mb-2">${note.title}</h3>
            <p class="text-sm text-gray-600 mb-2">Folder: ${note.folder}</p>
            <div class="flex justify-between">
                <button class="text-blue-500" onclick="viewNote(${note.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="text-green-500" onclick="editNote(${note.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="text-red-500" onclick="deleteNote(${note.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function updateNoteFolder() {
    noteFolder.innerHTML = folders.map(folder => `
        <option value="${folder}">${folder}</option>
    `).join('');
}

function addFolder() {
    const newFolder = newFolderInput.value.trim();
    if (newFolder && !folders.includes(newFolder)) {
        folders.push(newFolder);
        localStorage.setItem('folders', JSON.stringify(folders));
        newFolderInput.value = '';
        renderFolders();
    }
}

function deleteFolder(folder) {
    folders = folders.filter(f => f !== folder);
    notes = notes.filter(note => note.folder !== folder);
    localStorage.setItem('folders', JSON.stringify(folders));
    localStorage.setItem('notes', JSON.stringify(notes));
    renderFolders();
    renderNotes();
}

function showNoteModal(edit = false) {
    noteModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent body scrolling
    noteModalTitle.textContent = edit ? 'Edit Note' : 'Add Note';
    if (!edit) {
        noteTitle.value = '';
        quill.setContents([]);
        currentNoteId = null;
    }
}

function hideNoteModal() {
    noteModal.style.display = 'none';
    document.body.style.overflow = ''; // Restore body scrolling
}

function addNote() {
    const title = noteTitle.value.trim();
    const content = quill.getContents();
    const folder = noteFolder.value;

    if (title && folder) {
        if (currentNoteId === null) {
            const newNote = {
                id: Date.now(),
                title,
                content,
                folder
            };
            notes.push(newNote);
        } else {
            const noteIndex = notes.findIndex(note => note.id === currentNoteId);
            if (noteIndex !== -1) {
                notes[noteIndex] = { ...notes[noteIndex], title, content, folder };
            }
        }
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        hideNoteModal();
    }
}

function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        currentNoteId = id;
        noteTitle.value = note.title;
        quill.setContents(note.content);
        noteFolder.value = note.folder;
        showNoteModal(true);
    }
}

function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
}

function viewNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        const viewNoteModal = document.createElement('div');
        viewNoteModal.className = 'fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full';
        viewNoteModal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3 text-center">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">${note.title}</h3>
                    <div class="mt-2 px-7 py-3">
                        <p class="text-sm text-gray-500">
                            ${quill.setContents(note.content), quill.root.innerHTML}
                        </p>
                    </div>
                    <div class="items-center px-4 py-3">
                        <button id="closeViewModal" class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(viewNoteModal);
        document.getElementById('closeViewModal').onclick = () => {
            document.body.removeChild(viewNoteModal);
        };
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

addFolderBtn.addEventListener('click', addFolder);
addNoteBtn.addEventListener('click', () => showNoteModal());
saveNoteBtn.addEventListener('click', addNote);
closeModalBtn.addEventListener('click', hideNoteModal);
searchInput.addEventListener('input', renderNotes);
darkModeToggle.addEventListener('click', toggleDarkMode);

// Initialize
renderFolders();
renderNotes();
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
}

// Auto-save
setInterval(() => {
    if (currentNoteId !== null) {
        const noteIndex = notes.findIndex(note => note.id === currentNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title: noteTitle.value.trim(),
                content: quill.getContents(),
                folder: noteFolder.value
            };
            localStorage.setItem('notes', JSON.stringify(notes));
        }
    }
}, 5000);