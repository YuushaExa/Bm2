document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('bookmarkFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const sortedBookmarks = parseAndSortBookmarks(content);
        displayBookmarks(sortedBookmarks);
    };
    reader.readAsText(file);
});

function parseAndSortBookmarks(bookmarksHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(bookmarksHTML, 'text/html');
    
    const bookmarks = [];
    
    // Recursive function to extract bookmarks and folders
    function extractBookmarks(node) {
        const folders = Array.from(node.querySelectorAll('DT[PERSONAL_TOOLBAR_FOLDER], DT[ADD_FOLDER]'));
        const links = Array.from(node.querySelectorAll('DT > A'));

        // Process folders
        folders.forEach(folder => {
            const folderName = folder.querySelector('H3').textContent;
            const subBookmarks = [];
            extractBookmarks(folder, subBookmarks);
            bookmarks.push({ title: folderName, bookmarks: subBookmarks });
        });

        // Process links
        links.forEach(link => {
            bookmarks.push({
                title: link.textContent,
                url: link.href
            });
        });
    }

    extractBookmarks(doc.body);

    return bookmarks;
}

function displayBookmarks(bookmarks) {
    const sortedBookmarksDiv = document.getElementById('sortedBookmarks');
    sortedBookmarksDiv.innerHTML = ''; // Clear previous bookmarks

    if (bookmarks.length === 0) {
        sortedBookmarksDiv.innerHTML = '<p>No bookmarks found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    bookmarks.forEach(item => {
        if (item.bookmarks) {
            const li = document.createElement('li');
            li.textContent = item.title;
            li.appendChild(displaySubBookmarks(item.bookmarks));
            ul.appendChild(li);
        } else {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${item.url}" target="_blank">${item.title}</a>`;
            ul.appendChild(li);
        }
    });

    sortedBookmarksDiv.appendChild(ul);
}

function displaySubBookmarks(bookmarks) {
    const ul = document.createElement('ul');
    bookmarks.forEach(item => {
        if (item.bookmarks) {
            const li = document.createElement('li');
            li.textContent = item.title;
            li.appendChild(displaySubBookmarks(item.bookmarks));
            ul.appendChild(li);
        } else {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${item.url}" target="_blank">${item.title}</a>`;
            ul.appendChild(li);
        }
    });
    return ul;
}
