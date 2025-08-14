// 客户端 API Key 安全管理工具
// 提供加密存储、安全清除等功能

// 检查是否在浏览器环境中
const isBrowser = () => typeof window !== 'undefined';

// 简单的客户端加密（基于浏览器指纹和时间戳）
const generateKey = (): string => {
  if (!isBrowser()) return 'fallback-key';
  
  const userAgent = navigator.userAgent;
  const screenInfo = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return btoa(`${userAgent}-${screenInfo}-${timezone}`).slice(0, 16);
};

// 简单的 XOR 加密（比明文存储安全，但不是军用级加密）
const encrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
};

const decrypt = (encryptedText: string, key: string): string => {
  try {
    const decoded = atob(encryptedText);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
};

export class SecureApiKeyManager {
  private static readonly STORAGE_PREFIX = 'secure_api_key_';
  private static readonly EXPIRY_KEY = '_expiry';
  private static readonly DEFAULT_EXPIRY_HOURS = 24; // 24小时过期
  
  // 存储加密的 API Key
  static store(provider: string, apiKey: string, rememberMe: boolean = false): void {
    if (!apiKey.trim() || !isBrowser()) return;
    
    const key = generateKey();
    const encrypted = encrypt(apiKey.trim(), key);
    const storageKey = this.STORAGE_PREFIX + provider;
    const expiryKey = storageKey + this.EXPIRY_KEY;
    
    // 计算过期时间
    const expiryTime = Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : this.DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000); // 记住我：7天，否则24小时
    
    try {
      sessionStorage.setItem(storageKey, encrypted);
      sessionStorage.setItem(expiryKey, expiryTime.toString());
      
      // 如果选择记住，也存储到 localStorage（但仍然加密）
      if (rememberMe) {
        localStorage.setItem(storageKey, encrypted);
        localStorage.setItem(expiryKey, expiryTime.toString());
      }
    } catch (error) {
      console.warn('API Key 存储失败:', error);
    }
  }
  
  // 获取解密的 API Key
  static retrieve(provider: string): string | null {
    if (!isBrowser()) return null;
    
    const storageKey = this.STORAGE_PREFIX + provider;
    const expiryKey = storageKey + this.EXPIRY_KEY;
    
    try {
      // 先检查 sessionStorage，再检查 localStorage
      let encrypted = sessionStorage.getItem(storageKey);
      let expiryStr = sessionStorage.getItem(expiryKey);
      
      if (!encrypted || !expiryStr) {
        encrypted = localStorage.getItem(storageKey);
        expiryStr = localStorage.getItem(expiryKey);
      }
      
      if (!encrypted || !expiryStr) return null;
      
      // 检查是否过期
      const expiry = parseInt(expiryStr, 10);
      if (Date.now() > expiry) {
        this.clear(provider);
        return null;
      }
      
      const key = generateKey();
      const decrypted = decrypt(encrypted, key);
      
      // 验证解密结果是否有效（简单验证）
      if (decrypted && decrypted.length > 10 && !decrypted.includes('\0')) {
        return decrypted;
      }
      
      return null;
    } catch (error) {
      console.warn('API Key 获取失败:', error);
      return null;
    }
  }
  
  // 清除特定提供商的 API Key
  static clear(provider: string): void {
    if (!isBrowser()) return;
    
    const storageKey = this.STORAGE_PREFIX + provider;
    const expiryKey = storageKey + this.EXPIRY_KEY;
    
    try {
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(expiryKey);
      localStorage.removeItem(storageKey);
      localStorage.removeItem(expiryKey);
    } catch (error) {
      console.warn('API Key 清除失败:', error);
    }
  }
  
  // 清除所有 API Keys
  static clearAll(): void {
    const providers = ['openai', 'grok', 'xai', 'deepseek'];
    providers.forEach(provider => this.clear(provider));
  }
  
  // 检查是否存在有效的 API Key
  static hasValidKey(provider: string): boolean {
    if (!isBrowser()) return false;
    return this.retrieve(provider) !== null;
  }
  
  // 获取所有已存储的提供商
  static getStoredProviders(): string[] {
    if (!isBrowser()) return [];
    
    const providers: string[] = [];
    const prefix = this.STORAGE_PREFIX;
    
    try {
      // 检查 sessionStorage 和 localStorage
      [sessionStorage, localStorage].forEach(storage => {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(prefix) && !key.endsWith(this.EXPIRY_KEY)) {
            const provider = key.replace(prefix, '');
            if (!providers.includes(provider)) {
              providers.push(provider);
            }
          }
        }
      });
    } catch (error) {
      console.warn('获取存储的提供商失败:', error);
    }
    
    return providers;
  }
  
  // 安全提示
  static getSecurityReminder(): string {
    return `
🔒 API Key 安全提醒：
• API Key 仅在本地浏览器中临时存储
• 使用简单加密保护，避免明文存储
• 会话结束或过期后自动清除
• 请勿在公共设备上选择"记住我"
• 定期更换您的 API Key
    `.trim();
  }
}