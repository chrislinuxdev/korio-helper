class AuthHandler {
  static async injectTokenForUrl(url) {
    const TokenManager = (await import('./token-manager.js')).default;

    // Map URLs to token keys
    const tokenMap = {
      'argocd-dev.korioclinical.com': 'ArgoCD - Dev',
      'argocd-test.korioclinical.com': 'ArgoCD - Test',
      'argocd-platform.korioclinical.com': 'ArgoCD - Platform',
      'argocd-staging.korioclinical.com': 'ArgoCD - Staging',
      'argocd-prod.korioclinical.com': 'ArgoCD - Prod',
    };

    for (const [domain, tokenKey] of Object.entries(tokenMap)) {
      if (url.includes(domain)) {
        const token = await TokenManager.getToken(tokenKey);
        if (token) {
          // You could inject this as a header or URL parameter
          return `${url}?token=${token}`;
        }
      }
    }

    return url;
  }

  static async handleLinkClick(link) {
    const enhancedUrl = await this.injectTokenForUrl(link.url);

    // Open with token if available
    if (link.type === 'web') {
      // Open in external browser
      require('electron').shell.openExternal(enhancedUrl);
    } else if (link.type === 'file') {
      // Open file
      require('electron').shell.openPath(link.url.replace('file://', ''));
    }
  }
}

export default AuthHandler;
