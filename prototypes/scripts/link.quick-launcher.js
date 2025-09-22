// This file handles loading JSON data, rendering the links and files on the HTML page, and managing user interactions.

document.addEventListener('DOMContentLoaded', () => {
    const linksContainer = document.getElementById('launcher-container');

    // Embed the data directly instead of fetching
    const config = {
        "layout": {
            "theme": "light",
            "displayMode": "grid",
            "itemsPerRow": 3
        },
        "settings": {
            "showIcons": true,
            "showTitles": true,
            "enableSearch": true
        }
    };

    const links = [
        {
            "title": "ArgoCD - Dev",
            "url": "https://argocd-dev.korioclinical.com",
            "type": "web"
        },
        {
            "title": "GitHub",
            "url": "https://www.github.com",
            "type": "web"
        },
        {
            "title": "Local Project Folder",
            "url": "file:///Users/chris/Documents/projects",
            "type": "file"
        },
        {
            "title": "Documentation",
            "url": "file:///Users/chris/Documents/docs/manual.pdf",
            "type": "file"
        },
        {
            "title": "Stack Overflow",
            "url": "https://stackoverflow.com",
            "type": "web"
        },
        {
            "title": "Personal Blog",
            "url": "https://www.chrisblog.com",
            "type": "web"
        },
        {
            "title": "Notes",
            "url": "file:///Users/chris/Documents/notes.txt",
            "type": "file"
        }
    ];

    function renderLinks(links) {
        links.forEach(link => {
            const linkElement = document.createElement('div');
            linkElement.className = 'link-item';

            const linkTitle = document.createElement('a');
            linkTitle.textContent = link.title;
            linkTitle.href = link.url;
            linkTitle.target = '_blank';

            linkElement.appendChild(linkTitle);
            linksContainer.appendChild(linkElement);
        });
    }

    renderLinks(links);
});