// Initialize Dexie database
const db = new Dexie("BookmarkAppDB");
db.version(1).stores({
  spaces: "++id, name, folders"
});

let currentSpace = null;
let currentFolder = null;
let currentBookmarkIndex = -1;

// Initialize the app
async function init() {
  await loadSpaces();
  renderFolders();
  renderBookmarks();
}

// Load spaces from IndexedDB
async function loadSpaces() {
  const spaces = await db.spaces.toArray();

  // Create default space if none exists
  if (spaces.length === 0) {
    await db.spaces.add({ name: "Default", folders: [] });
  }

  const spaceSelect = document.getElementById("space-select");
  spaceSelect.innerHTML = ''; // Clear existing options

  spaces.forEach((space, index) => {
    const option = document.createElement("option");
    option.value = space.id;
    option.innerText = space.name;
    spaceSelect.appendChild(option);

    // Set current space to the first space if not selected
    if (!currentSpace) currentSpace = space;
  });
}

// Select a space
async function selectSpace() {
  const spaceId = parseInt(document.getElementById("space-select").value, 10);
  currentSpace = await db.spaces.get(spaceId);
  renderFolders();
}

// Render folders for the selected space
function renderFolders() {
  const folderList = document.getElementById("folder-list");
  folderList.innerHTML = '';

  if (!currentSpace.folders) currentSpace.folders = [];

  currentSpace.folders.forEach((folder, folderIndex) => {
    const li = document.createElement("li");
    const toggleButton = document.createElement("button");
    toggleButton.innerText = folder.isOpen ? "▼" : "►";
    toggleButton.classList.add("toggle-folder");
    toggleButton.onclick = () => {
      folder.isOpen = !folder.isOpen;
      renderFolders();
    };

    const folderButton = document.createElement("button");
    folderButton.innerText = folder.name;
    folderButton.onclick = () => selectFolder(folderIndex);
    folderButton.classList.add("folder-button");

    li.appendChild(toggleButton);
    li.appendChild(folderButton);

    if (folder.isOpen && folder.subfolders) {
      const subfolderList = document.createElement("ul");
      renderFolders(folder.subfolders, subfolderList);
      li.appendChild(subfolderList);
    }
    folderList.appendChild(li);
  });
}

// Select a folder and show its bookmarks
function selectFolder(folderIndex) {
  currentFolder = currentSpace.folders[folderIndex];
  renderBookmarks();
}

// Render bookmarks in the selected folder
function renderBookmarks() {
  const bookmarkList = document.getElementById("bookmark-list");
  bookmarkList.innerHTML = '';

  if (currentFolder && currentFolder.bookmarks) {
    currentFolder.bookmarks.forEach((bookmark, index) => {
      const li = document.createElement("li");
      li.innerText = bookmark.title;
      li.onclick = () => showBookmarkDetails(index);
      bookmarkList.appendChild(li);
    });
  }
}

// Show bookmark details in the form
function showBookmarkDetails(index) {
  const bookmark = currentFolder.bookmarks[index];
  currentBookmarkIndex = index;
  document.getElementById("bookmark-title").value = bookmark.title;
  document.getElementById("bookmark-url").value = bookmark.url;
  document.getElementById("bookmark-notes").value = bookmark.notes;
}

// Save the current bookmark to IndexedDB
async function saveBookmark() {
  const title = document.getElementById("bookmark-title").value;
  const url = document.getElementById("bookmark-url").value;
  const notes = document.getElementById("bookmark-notes").value;

  const bookmark = { title, url, notes };
  
  if (currentBookmarkIndex !== -1) {
    currentFolder.bookmarks[currentBookmarkIndex] = bookmark;
  } else {
    currentFolder.bookmarks.push(bookmark);
  }

  await db.spaces.put(currentSpace); // Save space with updated folder
  renderBookmarks();
  clearForm();
}

// Add a new blank bookmark
function addBookmark() {
  currentBookmarkIndex = -1;
  clearForm();
}

// Clear the form for adding a new bookmark
function clearForm() {
  document.getElementById("bookmark-title").value = '';
  document.getElementById("bookmark-url").value = '';
  document.getElementById("bookmark-notes").value = '';
}

// Add a new folder to the current space
async function addFolder() {
  const folderName = prompt("Enter folder name:");
  if (folderName) {
    if (!currentSpace.folders) currentSpace.folders = [];
    currentSpace.folders.push({ name: folderName, bookmarks: [], subfolders: [], isOpen: true });
    await db.spaces.put(currentSpace);
    renderFolders();
  }
}

// Add a new space
async function addSpace() {
  const spaceName = prompt("Enter space name:");
  if (spaceName) {
    const newSpace = { name: spaceName, folders: [] };
    await db.spaces.add(newSpace);
    loadSpaces();
  }
}

init();
