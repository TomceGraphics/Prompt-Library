// Legacy shim: keep file but delegate to module entry when loaded directly
// If someone still includes main.js, dynamically import the module app
if (!window.__PROMPT_LIB_APP_BOOTSTRAPPED__) {
    window.__PROMPT_LIB_APP_BOOTSTRAPPED__ = true;
    try {
        import('./app.js');
    } catch (e) {
        console.warn('Module app failed to load from legacy main.js:', e);
    }
}