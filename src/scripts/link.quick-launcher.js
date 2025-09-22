// This file handles loading JSON data, rendering the links and files on the HTML page, and managing user interactions.

document.addEventListener('DOMContentLoaded', () => {
    const navTabsContainer = document.getElementById('nav-tabs');
    const sidebarContent = document.getElementById('sidebar-content');
    const launcherContainer = document.getElementById('launcher-container');

    const config = {
        "groups": [
            {
                "name": "Development",
                "links": ["GitHub", "ArgoCD - Dev"]
            },
            {
                "name": "Reference",
                "links": ["Stack Overflow", "Documentation"]
            },
            {
                "name": "Personal",
                "links": ["Personal Blog", "Notes"]
            },
            {
                "name": "Local Files",
                "links": ["Local Project Folder"]
            }
        ],
        "placeholders": [
            "System Monitor",
            "Recent Files",
            "Quick Notes",
            "Weather"
        ]
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

    function createNavTabs() {
        config.groups.forEach((group, index) => {
            const tab = document.createElement('button');
            tab.className = 'nav-tab';
            tab.textContent = group.name;
            tab.addEventListener('click', () => showGroup(group, tab));
            navTabsContainer.appendChild(tab);

            // Set first tab as active by default
            if (index === 0) {
                tab.classList.add('active');
                showGroup(group, tab);
            }
        });
    }

    function showGroup(group, activeTab) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        activeTab.classList.add('active');

        // Clear and populate sidebar content
        sidebarContent.innerHTML = '';

        const linkGroup = document.createElement('div');
        linkGroup.className = 'link-group';

        const groupLinkItems = links.filter(link => group.links.includes(link.title));

        groupLinkItems.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.className = 'link-item';
            linkElement.href = link.url;
            linkElement.target = '_blank';

            const linkTitle = document.createElement('div');
            linkTitle.textContent = link.title;

            const linkType = document.createElement('div');
            linkType.className = 'link-type';
            linkType.textContent = link.type;

            linkElement.appendChild(linkTitle);
            linkElement.appendChild(linkType);
            linkGroup.appendChild(linkElement);
        });

        sidebarContent.appendChild(linkGroup);
    }

    function renderPlaceholders() {
        config.placeholders.forEach(placeholder => {
            const placeholderElement = document.createElement('div');
            placeholderElement.className = 'placeholder-section';
            placeholderElement.textContent = `+ ${placeholder}`;
            launcherContainer.appendChild(placeholderElement);
        });
    }

    // Initialize
    createNavTabs();
    renderPlaceholders();
});