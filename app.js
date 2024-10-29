// Initialize IndexedDB
const dbName = "BookmarkApp";
let db;

// Open the database
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;

  // Create object stores
  const spacesStore = db.createObjectStore("spaces", { keyPath: "id", autoIncrement: true });
  const foldersStore = db.createObjectStore("folders", { keyPath: "id", autoIncrement: true });
  const bookmarksStore = db.createObjectStore("bookmarks", { keyPath: "id", autoIncrement: true });

  foldersStore.createIndex("spaceId", "spaceId", { unique: false });
  bookmarksStore.createIndex("folderId", "folderId", { unique: false });
};

request.onsuccess = function(event) {
  db = event.target.result;
  loadSpaces(); // Load spaces on successful database open
};

request.onerror = function(event) {
  console.error("Database error: " + event.target.errorCode);
};

// Function to add a new space
async function addSpace() {
  const spaceName = prompt("Enter space name:");
  if (spaceName) {
    const transaction = db.transaction(["spaces"], "readwrite");
    const store = transaction.objectStore("spaces");
    await store.add({ name: spaceName });
    await loadSpaces(); // Refresh spaces after adding
  }
}

// Function to load spaces into the select dropdown
async function loadSpaces() {
  const transaction = db.transaction(["spaces"], "readonly");
  const store = transaction.objectStore("spaces");
  const spaces = await getAll(store);
  
  const spaceSelect = document.getElementById("space-select");
  spaceSelect.innerHTML = ""; // Clear existing options

  spaces.forEach(space => {
    const option = document.createElement("option");
    option.value = space.id;
    option.textContent = space.name;
    spaceSelect.appendChild(option);
  });

  // Load folders for the first space by default
  if (spaces.length > 0) {
    await loadFolders(spaces[0].id);
  }
}

// Function to load folders for a selected space
async function loadFolders(spaceId) {
  const transaction = db.transaction(["folders"], "readonly");
  const store = transaction.objectStore("folders");
  const index = store.index("spaceId");
  const folders = await getAll(index, spaceId);

  const folderList = document.getElementById("folder-list");
  folderList.innerHTML = ""; // Clear existing folders

  if (folders.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No folders available for this space.";
    folderList.appendChild(li);
  } else {
    folders.forEach(folder => {
      const li = document.createElement("li");
      li.textContent = folder.name;
      li.setAttribute("data-id", folder.id); // Store folder ID for future reference
      folderList.appendChild(li);
    });

    // Optionally, load bookmarks for the first folder if any
    await loadBookmarks(folders[0].id);
  }
}

// Function to add a new folder
async function addFolder() {
  const spaceId = document.getElementById("space-select").value;
  const folderName = prompt("Enter folder name:");
  if (folderName) {
    const transaction = db.transaction(["folders"], "readwrite");
    const store = transaction.objectStore("folders");
    await store.add({ name: folderName, spaceId: parseInt(spaceId) });
    await loadFolders(spaceId); // Refresh folders after adding
  }
}

// Function to add a new bookmark
async function addBookmark() {
  const folderId = prompt("Enter folder ID to add bookmark to:");
  const title = document.getElementById("bookmark-title").value;
  const url = document.getElementById("bookmark-url").value;
  const notes = document.getElementById("bookmark-notes").value;

  if (title && url) {
    const transaction = db.transaction(["bookmarks"], "readwrite");
    const store = transaction.objectStore("bookmarks");
    await store.add({ title, url, notes, folderId: parseInt(folderId) });
    await loadBookmarks(folderId); // Refresh bookmarks after adding
  } else {
    alert("Title and URL are required!");
  }
}

// Function to load bookmarks for a selected folder
async function loadBookmarks(folderId) {
  const transaction = db.transaction(["bookmarks"], "readonly");
  const store = transaction.objectStore("bookmarks");
    const index = store.index("folderId");
  const bookmarks = await getAll(index, folderId);
  
  const bookmarkList = document.getElementById("bookmark-list");
  bookmarkList.innerHTML = ""; // Clear existing bookmarks

  bookmarks.forEach(bookmark => {
    const li = document.createElement("li");
    li.textContent = bookmark.title;
    li.setAttribute("data-id", bookmark.id); // Store bookmark ID for future reference
    bookmarkList.appendChild(li);
  });
}

// Function to handle space selection change
async function selectSpace() {
  const selectedSpaceId = document.getElementById("space-select").value;
  await loadFolders(selectedSpaceId); // Load folders for the selected space
}

// Event listener for space selection change
document.getElementById("space-select").addEventListener("change", selectSpace);

// Helper function to get all records from an object store or index
function getAll(store, key) {
  return new Promise((resolve, reject) => {
    const request = key ? store.getAll(IDBKeyRange.only(key)) : store.getAll();
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

// Load spaces on page load
window.onload = function() {
  loadSpaces();
};

