import { homeContents } from '/assets/pages/home.js';
import { moderationContents } from './assets/pages/moderation.js';
import { configContents } from './assets/pages/config.js';
import { inboxContents } from './assets/pages/inbox.js';
import { livechatContents } from './assets/pages/livechat.js';
import { regisLogContents } from './assets/pages/regislog.js';
import { whatsNewContents } from './assets/pages/whatsnew.js';
import { lostConnectionContents } from './assets/pages/lostconnect.js';
import { profileContents } from './assets/pages/profile.js';

const main = document.getElementById('main');

function createPage(name, contents) {
    const page = document.createElement('div');
    page.id = name;
    page.className = 'scene hidden';
    page.innerHTML = contents;
    main.appendChild(page);
}

createPage('main-scene', homeContents());
createPage('main-moderation', moderationContents());
createPage('main-config', configContents());
createPage('main-inbox', inboxContents())
createPage('main-livechat', livechatContents());
createPage('register-login', regisLogContents());
createPage('main-whatsnew', whatsNewContents());
createPage('connection-lost', lostConnectionContents())
createPage('user-display', profileContents())