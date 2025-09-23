class TokenManager {
  static async storeToken(service, token) {
    try {
      if (!window.electronAPI) {
        console.error('electronAPI not available - check preload script');
        return;
      }
      await window.electronAPI.storeToken(service, token);
      console.log(`Token stored for ${service}`);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  static async getToken(service) {
    try {
      if (!window.electronAPI) {
        console.error('electronAPI not available - check preload script');
        return null;
      }
      return await window.electronAPI.getToken(service);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  static async deleteToken(service) {
    try {
      if (!window.electronAPI) {
        console.error('electronAPI not available - check preload script');
        return;
      }
      await window.electronAPI.deleteToken(service);
      console.log(`Token deleted for ${service}`);
    } catch (error) {
      console.error('Failed to delete token:', error);
    }
  }

  static async isAuthenticated(service) {
    const token = await this.getToken(service);
    return token !== null && token !== undefined;
  }
}

export default TokenManager;
