let folders = [
  { name: 'All', bookmarks: [], subfolders: [], isOpen: true }
];

let currentFolder = folders[0];
let currentBookmarkIndex = -1;

// Render the folder structure with collapse functionality
function renderFolders(folders, parentElement) {
  parentElement.innerHTML = ''; // Clear existing folder list

  folders.forEach((folder, folderIndex) => {
    const li = document.createElement('li');

    // Create a toggle button to collapse/expand subfolders
    const toggleButton = document.createElement('button');
    toggleButton.innerText = folder.isOpen ? '▼' : '►'; // ▼ for open, ► for closed
    toggleButton.classList.add('toggle-folder');
    toggleButton.onclick = () => {
      folder.isOpen = !folder.isOpen; // Toggle the open state
      renderFolders(folders, parentElement); // Re-render folders
    };

    // Create a folder button to select the folder
    const folderButton = document.createElement('button');
    folderButton.innerText = folder.name;
    folderButton.onclick = () => selectFolder(folderIndex, folders);
    folderButton.classList.add('folder-button');

    // Append the toggle button and folder button to the list item
    li.appendChild(toggleButton);
    li.appendChild(folderButton);

    // Append the subfolders (only if the folder is open)
    if (folder.isOpen && folder.subfolders.length > 0) {
      const subfolderList = document.createElement('ul');
      renderFolders(folder.subfolders, subfolderList); // Recursively render subfolders
      li.appendChild(subfolderList);
    }

    parentElement.appendChild(li);
  });
}

// Select a folder and show its bookmarks
function selectFolder(folderIndex, parentFolder) {
  currentFolder = parentFolder[folderIndex];
  renderBookmarks();
}

// Render bookmarks in the selected folder
function renderBookmarks() {
  const bookmarkList = document.getElementById('bookmark-list');
  bookmarkList.innerHTML = '';

  currentFolder.bookmarks.forEach((bookmark, index) => {
    const li = document.createElement('li');
    li.innerText = bookmark.title;
    li.onclick = () => showBookmarkDetails(index);
    bookmarkList.appendChild(li);
  });
}

// Show details of a selected bookmark
function showBookmarkDetails(index) {
  const bookmark = currentFolder.bookmarks[index];
  currentBookmarkIndex = index;

  document.getElementById('bookmark-title').value = bookmark.title;
  document.getElementById('bookmark-url').value = bookmark.url;
  document.getElementById('bookmark-notes').value = bookmark.notes;
}

// Save the current bookmark after editing
function saveBookmark() {
  const title = document.getElementById('bookmark-title').value;
  const url = document.getElementById('bookmark-url').value;
  const notes = document.getElementById('bookmark-notes').value;

  const bookmark = { title, url, notes };

  if (currentBookmarkIndex !== -1) {
    // Update existing bookmark
    currentFolder.bookmarks[currentBookmarkIndex] = bookmark;
  } else {
    // Add new bookmark
    currentFolder.bookmarks.push(bookmark);
  }

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
  document.getElementById('bookmark-title').value = '';
  document.getElementById('bookmark-url').value = '';
  document.getElementById('bookmark-notes').value = '';
}

// Add a new folder
function addFolder() {
  const folderName = prompt('Enter folder name:');
  if (folderName) {
    currentFolder.subfolders.push({ name: folderName, bookmarks: [], subfolders: [], isOpen: true });
    renderFolders(folders, document.getElementById('folder-list'));
  }
}

// Initialize the app
function init() {
  renderFolders(folders, document.getElementById('folder-list'));
  renderBookmarks();
}

init();
