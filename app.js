// Initialize Dexie
const db = new Dexie("BookmarkApp");
db.version(1).stores({
  spaces: "++id,name",
  folders: "++id,name,spaceId,parentId",
  bookmarks: "++id,title,url,notes,folderId"
});

// Utility function to clear inner HTML
function clearInnerHTML(elementId) {
  document.getElementById(elementId).innerHTML = "";
}

// Function to add a new space
async function addSpace() {
  const spaceName = prompt("Enter space name:");
  if (spaceName) {
    try {
      await db.spaces.add({ name: spaceName });
      await loadSpaces();
    } catch (error) {
      alert("Error adding space: " + error);
    }
  }
}

// Function to load spaces into the select dropdown
async function loadSpaces() {
  const spaces = await db.spaces.toArray();
  const spaceSelect = document.getElementById("space-select");
  clearInnerHTML("space-select");

  spaces.forEach(space => {
    const option = document.createElement("option");
    option.value = space.id;
    option.textContent = space.name;
    spaceSelect.appendChild(option);
  });

  if (spaces.length > 0) {
    await loadFolders(spaces[0].id);
  }
}

// Function to load folders for a selected space
async function loadFolders(spaceId, parentId = null) {
  const folders = await db.folders.where("spaceId").equals(parseInt(spaceId)).and(folder => folder.parentId === parentId).toArray();
  const folderList = document.getElementById("folder-list");
  clearInnerHTML("folder-list");

  if (folders.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No folders available for this space.";
    folderList.appendChild(li);
  } else {
    folders.forEach(folder => {
      const li = document.createElement("li");
      li.textContent = folder.name;
      li.setAttribute("data-id", folder.id);
      folderList.appendChild(li);

      // Load child folders
      loadFolders(spaceId, folder.id);
    });
  }
}


// Function to add a new folder
async function addFolder() {
  const spaceId = document.getElementById("space-select").value;
  const folderName = prompt("Enter folder name:");
  const parentFolderId = prompt("Enter parent folder ID (leave blank for no parent):");

  if (folderName) {
    try {
      await db.folders.add({ name: folderName, spaceId: parseInt(spaceId), parentId: parentFolderId ? parseInt(parentFolderId) : null });
      await loadFolders(spaceId);
    } catch (error) {
      alert("Error adding folder: " + error);
    }
  }
}


// Function to add a new bookmark
async function addBookmark() {
  const folderId = prompt("Enter folder ID to add bookmark to:");
  const title = document.getElementById("bookmark-title").value;
  const url = document.getElementById("bookmark-url").value;
  const notes = document.getElementById("bookmark-notes").value;

  if (title && url) {
    try {
      await db.bookmarks.add({ title, url, notes, folderId: parseInt(folderId) });
      await loadBookmarks(folderId);
    } catch (error) {
      alert("Error adding bookmark: " + error);
    }
   } else {
    alert("Title and URL are required!");
  }
}

// Function to load bookmarks for a selected folder
async function loadBookmarks(folderId) {
  const bookmarks = await db.bookmarks.where("folderId").equals(parseInt(folderId)).toArray();
  const bookmarkList = document.getElementById("bookmark-list");
  clearInnerHTML("bookmark-list");

  if (bookmarks.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No bookmarks available for this folder.";
    bookmarkList.appendChild(li);
  } else {
    bookmarks.forEach(bookmark => {
      const li = document.createElement("li");
      li.textContent = bookmark.title;
      li.setAttribute("data-id", bookmark.id);
      bookmarkList.appendChild(li);
    });
  }
}

// Function to handle space selection change
async function selectSpace() {
  const selectedSpaceId = document.getElementById("space-select").value;
  await loadFolders(selectedSpaceId);
}

// Event listener for space selection change
document.getElementById("space-select").addEventListener("change", selectSpace);

// Initial load of spaces when the application starts
loadSpaces();
