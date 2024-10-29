// Initialize Dexie
const db = new Dexie("BookmarkApp");
db.version(1).stores({
  spaces: "++id,name", // Space (Database)
  folders: "++id,name,spaceId", // Folders associated with a space
  bookmarks: "++id,title,url,notes,folderId" // Bookmarks associated with a folder
});

// Function to add a new space
async function addSpace() {
  const spaceName = prompt("Enter space name:");
  if (spaceName) {
    await db.spaces.add({ name: spaceName });
    loadSpaces();
  }
}

// Function to load spaces into the select dropdown
async function loadSpaces() {
  const spaces = await db.spaces.toArray();
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
    loadFolders(spaces[0].id);
  }
}

// Function to load folders for a selected space
async function loadFolders(spaceId) {
  const folders = await db.folders.where("spaceId").equals(spaceId).toArray();
  const folderList = document.getElementById("folder-list");
  folderList.innerHTML = ""; // Clear existing folders

  folders.forEach(folder => {
    const li = document.createElement("li");
    li.textContent = folder.name;
    folderList.appendChild(li);
  });
}

// Function to add a new folder
async function addFolder() {
  const spaceId = document.getElementById("space-select").value;
  const folderName = prompt("Enter folder name:");
  if (folderName) {
    await db.folders.add({ name: folderName, spaceId: parseInt(spaceId) });
    loadFolders(spaceId);
  }
}

// Function to add a new bookmark
async function addBookmark() {
  const folderId = prompt("Enter folder ID to add bookmark to:");
  const title = document.getElementById("bookmark-title").value;
  const url = document.getElementById("bookmark-url").value;
  const notes = document.getElementById("bookmark-notes").value;

  if (title && url) {
    await db.bookmarks.add({ title, url, notes, folderId: parseInt(folderId) });
    loadBookmarks(folderId);
  } else {
    alert("Title and URL are required!");
  }
}

// Function to load bookmarks for a selected folder
async function loadBookmarks(folderId) {
  const bookmarks = await db.bookmarks.where("folderId").equals(folderId).toArray();
  const bookmarkList = document.getElementById("bookmark-list");
  bookmarkList.innerHTML = ""; // Clear existing bookmarks

  bookmarks.forEach(bookmark => {
    const li = document.createElement("li");
    li.textContent = bookmark.title;
    bookmarkList.appendChild(li);
  });
}

// Function to save bookmark details
async function saveBookmark() {
  const title = document.getElementById("bookmark-title").value;
  const url = document.getElementById("bookmark-url").value;
  const notes = document.getElementById("bookmark-notes").value;

  // Here you can implement logic to save or update bookmarks
}

// Load spaces on initial load
loadSpaces();
