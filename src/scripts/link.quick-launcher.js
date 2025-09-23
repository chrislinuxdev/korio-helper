// This file handles loading JSON data, rendering the links and files on the HTML page, and managing user interactions.

document.addEventListener('DOMContentLoaded', async () => {
  const { config, links } = await import('../data/quick-launcher-links.js');
  const TokenManager = (await import('./token-manager.js')).default;
  const AuthHandler = (await import('./auth-handler.js')).default;

  const navTabsContainer = document.getElementById('nav-tabs');
  const sidebarContent = document.getElementById('sidebar-content');
  const launcherContainer = document.getElementById('launcher-container');

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

  async function showGroup(group, activeTab) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach((tab) => tab.classList.remove('active'));
    activeTab.classList.add('active');

    // Clear and populate sidebar content
    sidebarContent.innerHTML = '';

    const linkGroup = document.createElement('div');
    linkGroup.className = 'link-group';

    const groupLinkItems = links.filter((link) => group.links.includes(link.title));

    for (const link of groupLinkItems) {
      const linkElement = document.createElement('a');
      linkElement.className = 'link-item';
      linkElement.href = '#'; // Prevent default navigation

      // Handle click with authentication
      linkElement.addEventListener('click', async (e) => {
        e.preventDefault();
        await AuthHandler.handleLinkClick(link);
      });

      const linkTitle = document.createElement('div');
      linkTitle.textContent = link.title;

      const linkType = document.createElement('div');
      linkType.className = 'link-type';
      linkType.textContent = link.type;

      // Add auth status indicator for ArgoCD links
      if (link.title.includes('ArgoCD')) {
        const isAuth = await TokenManager.isAuthenticated(link.title);
        const authIndicator = document.createElement('div');
        authIndicator.className = 'auth-indicator';
        authIndicator.textContent = isAuth ? '🔐' : '🔓';
        authIndicator.title = isAuth ? 'Authenticated' : 'Click to authenticate';
        authIndicator.style.marginLeft = '8px';
        authIndicator.style.fontSize = '12px';

        // Allow clicking indicator to manage auth
        if (!isAuth) {
          authIndicator.style.cursor = 'pointer';
          authIndicator.addEventListener('click', async (e) => {
            e.stopPropagation();
            await promptForAuthentication(link.title);
          });
        } else {
          // Allow clicking to remove token
          authIndicator.style.cursor = 'pointer';
          authIndicator.addEventListener('click', async (e) => {
            e.stopPropagation();
            await TokenManager.deleteToken(link.title);
            // Refresh the current group to update indicators
            showGroup(group, activeTab);
          });
        }

        linkTitle.appendChild(authIndicator);
      }

      linkElement.appendChild(linkTitle);
      linkElement.appendChild(linkType);
      linkGroup.appendChild(linkElement);
    }

    sidebarContent.appendChild(linkGroup);
  }

  function promptForAuthentication(service) {
    return new Promise((resolve) => {
      // Create modal elements
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      `;

      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;

      dialog.innerHTML = `
        <h3>Enter ${service} Token</h3>
        <input type="password" id="tokenInput" placeholder="Enter your token..." style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;">
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
          <button id="cancelBtn" style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button id="okBtn" style="padding: 8px 16px; border: none; background: #007acc; color: white; border-radius: 4px; cursor: pointer;">OK</button>
        </div>
      `;

      modal.appendChild(dialog);
      document.body.appendChild(modal);

      const tokenInput = dialog.querySelector('#tokenInput');
      const okBtn = dialog.querySelector('#okBtn');
      const cancelBtn = dialog.querySelector('#cancelBtn');

      // Focus the input
      tokenInput.focus();

      // Handle OK button
      okBtn.onclick = () => {
        const token = tokenInput.value.trim();
        document.body.removeChild(modal);
        resolve(token || null);
      };

      // Handle Cancel button
      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(null);
      };

      // Handle Enter key
      tokenInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          okBtn.click();
        } else if (e.key === 'Escape') {
          cancelBtn.click();
        }
      };

      // Handle clicking outside the dialog
      modal.onclick = (e) => {
        if (e.target === modal) {
          cancelBtn.click();
        }
      };
    });
  }

  function renderPlaceholders() {
    config.placeholders.forEach((placeholder) => {
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
