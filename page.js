const main = document.getElementById('main');

async function createPage(name) {
    const page = document.createElement('div');
    const contents = await (await fetch("./assets/pages/" + name + ".html")).text();
    page.id = name;
    page.className = 'scene hidden';
    page.innerHTML = contents;
    main.appendChild(page);
}

async function createScript(src, defer) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        if (defer) {
            script.defer = defer;
        }
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

async function createAllPagesAndLoadScripts() {
    const pagePromises = [
        createPage('main-scene'),
        createPage('main-moderation'),
        createPage('main-config'),
        createPage('main-inbox'),
        createPage('main-livechat'),
        createPage('register-login'),
        createPage('main-whatsnew'),
        createPage('connection-lost'),
        createPage('user-display')
    ];
    await Promise.all(pagePromises);
    chaosEvents.dispatchEvent(new Event('ready'))
}
createAllPagesAndLoadScripts();