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
                await loadSpaces(); // Refresh spaces after adding
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
                await loadFolders(spaces[0].id);
            }
        }

        // Function to load folders for a selected space
        async function loadFolders(spaceId) {
            const folders = await db.folders.where("spaceId").equals(spaceId).toArray();
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
                await db.folders.add({ name: folderName, spaceId: parseInt(spaceId) });
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
                await db.bookmarks.add({ title, url, notes, folderId: parseInt(folderId) });
                await loadBookmarks(folderId); // Refresh bookmarks after adding
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

        // Load spaces on page load
        document.addEventListener("DOMContentLoaded", loadSpaces);
