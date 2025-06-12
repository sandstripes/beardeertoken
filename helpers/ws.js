const prodUrl = "wss://chaos.goog-search.eu.org/";
const loclUrl = "ws://10.88.0.3:3000";

//
//   DO NOT FORGET TO CHANGE THE URL
//

let wsurl = prodUrl;
if (localStorage.getItem("beardeer:serverurl")) {
    wsurl = localStorage.getItem("beardeer:serverurl");
}


class WsHelper {
    /** @type {WebSocket} */
    ws;
    /** @private @type {number} */
    id = 0;
    /** @typedef {Record<string, Record<number, {(...args: any[]) => void, once: boolean}>>} handlerRecord  */
    /** @private @type {handlerRecord} */
    handlers = {};
    /** @private @type {handlerRecord} */
    commandHandlers = {};
    /** @private @type {handlerRecord} */
    listenerHandlers = {};
    /**
     * get a unique event id
     * @private
     * @returns {number}
     */
    getId() {
        return this.id++;
    }

    /**
     * @private
     * @param {handlerRecord} handlerDict 
     * @param {string} category 
     * @param {(...args: any[]) => void} handler 
     * @param {boolean} [once=false] 
     * @returns {number}
     */
    initHandler(handlerDict, category, handler, once=false) {
        if (!handlerDict[category])
            handlerDict[category] = {};
        const id = this.getId();
        handlerDict[category][id] = {
            handler,
            once
        };
        return id;
    }

    /**
     * @overload
     * @param {"command"} event
     * @param {(command: string, data: Record<string, any>)}
     */
    /**
     * set a listener for an event
     * @param {string} event the name of the event
     * @param {(...args: any[]) => void} handler a handler for the event
     */
    on(event, handler) {
        return this.initHandler(this.handlers, event, handler, false)
    }
    /**
     * @overload
     * @param {"command"} event
     * @param {(command: string, data: Record<string, any>)}
     */
    /**
     * set a listener for an event
     * @param {string} event the name of the event
     * @param {(...args: any[]) => void} handler a handler for the event
     */
    once(event, handler) {
        return this.initHandler(this.handlers, event, handler, true)
    }
    /**
     * set a listener for a command
     * @param {string} commandName the name of the event
     * @param {(Record<string, any>) => void} handler a handler for the event
     */
    onCommand(commandName, handler) {
        return this.initHandler(this.commandHandlers, commandName, handler, false)
    }
    /**
     * set a listener for a command
     * @param {string} commandName the name of the event
     * @param {(Record<string, any>) => void} handler a handler for the event
     */
    onceCommand(commandName, handler) {
        return this.initHandler(this.commandHandlers, commandName, handler, true)
    }
    /**
     * set a listener for a listener,, fires ur handler when we get a response with ur listener
     * @param {string} listener the name of the event
     * @param {(Record<string, any>) => void} handler a handler for the event
     */
    onListener(listener, handler) {
        return this.initHandler(this.listenerHandlers, listener, handler, false)
    }
    /**
     * set a listener for a listener,, fires ur handler when we get a response with ur listener
     * @param {string} listener the name of the event
     * @param {(Record<string, any>) => void} handler a handler for the event
     */
    onceListener(listener, handler) {
        return this.initHandler(this.listenerHandlers, listener, handler, true)
    }

    off(id) {
        const handler = [this.handlers, this.commandHandlers, this.listenerHandlers]
            .find(h => Object.values(h)
                    .find(f => f[id]));
        if (!handler)
            return;
        const category = Object.entries(handler)
            .find(([_, f]) => f[id])[0];
        delete category[id];
    }

    /**
     * @param {handlerRecord} handlers the handlers
     * @param {string} event event name
     * @param {any} [data] the event data
     */
    fireEvent(handlers, event, data) {

    }

    /**
     * a helper class for all your soktdeer needs
     * @param {WebSocket} ws the soktdeer websocket
     */
    constructor(ws) {
        this.ws = ws;
        ws.addEventListener('open', () => {});
    }
}


let ws;
chaosEvents.doWhenReady(() => {
    ws = new WebSocket(wsurl)
    ws.onmessage = function (event) {
        let incoming = JSON.parse(event.data);
        if (settings.debug) { console.log(incoming) };

        if (incoming.command == "greet") {
            closePopup();
            chaosEvents.doWhenReady(() => {
                document.getElementById("rl-version").innerText = `BearDeer (based on BossDeer ${version}) - ${incoming.version}`;
                document.getElementById("mc-version").innerText = `${version} - ${incoming.version}`;
            })
            if (incoming.server_contributors) {
                for (const x in incoming.server_contributors) {
                    chaosEvents.doWhenReady(() => {
                        document.getElementById("mc-contributors").innerText += `\n${incoming.server_contributors[x]}`;
                    })
                }
            }
            if (incoming.version != serverVersion) {
                displayError(`The server is on a newer version than this version of BossDeer was designed for. You may experience problems. (Expected "${serverVersion}", got "${incoming.version}")`);
            };
            ulist = Object.keys(incoming.ulist);
            raw_ulist = incoming.ulist;
            chaosEvents.doWhenReady(() => {
                updateUlist();
            })
            for (const x in incoming.messages) {
                posts[incoming.messages[x]._id] = incoming.messages[x]
            }
            posts_list = incoming.messages
            if (localStorage.getItem("beardeer:username") == null || localStorage.getItem("beardeer:token") == null) {
                scene = "register-login";
                handleAppearElement(["loading", "register-login"])
            } else {
                username = localStorage.getItem("beardeer:username").toLowerCase();
                last_cmd = "login_token";
                ws.send(JSON.stringify({command: "login_token", token: localStorage.getItem("beardeer:token"), client: `BearDeer ${version}`}))
            };
        } else if (incoming.command == "ulist") {
            ulist = Object.keys(incoming.ulist);
            raw_ulist = incoming.ulist;
            chaosEvents.doWhenReady(() => {
                updateUlist();
            })
        };
        if ("error" in incoming) {
            if (incoming.error) {
                if (incoming.code == "banned") {
                    displayError(`Account is banned until ${new Date(incoming.banned_until * 1000).toLocaleString()} for "${incoming.ban_reason}"`)
                } else {
                    displayError(`We hit an error. ${incoming.context} (${incoming.code})`);
                };
            } else if (incoming.listener == "PingBossDeer") {
                last_ping = Date.now();
            } else if (last_cmd == "login_token" || last_cmd == "login_pswd") {
                if (scene == "register-login") {
                    handleAppearElement(["register-login"])
                } else if (scene == "loading") {
                    handleAppearElement(["loading"])
                };
                scene = "main-scene";
                if ([JSON.stringify([]), JSON.stringify(["PROTECTED"])].includes(JSON.stringify(incoming.user.permissions))) {
                    handleAppearElement(["ms-button-mod"], "hide")
                } else {
                    document.getElementById("ms-button-mod").classList.remove("hidden");
                };
                if (incoming.user.permissions.includes("DELETE")) {
                    delete_all = true;
                }
                buddies = incoming.user.buddies;
                handleAppearElement(["main-scene"])
                chaosEvents.doWhenReady(() => {
                    document.getElementById("ms-name").innerText = `@${username}`
                })
                last_cmd = "get_inbox"
                authed = true;
                for (const i in posts_list.reverse()) {
                    loadPost(posts_list[i], true, false);
                };
                posts_list = undefined;
                ws.send(JSON.stringify({command: "get_inbox"}))
            };
        };
        commandHandler:
        if ("token" in incoming && incoming.listener == "RegisterLoginPswdListener") {
            localStorage.setItem("beardeer:username", username);
            localStorage.setItem("beardeer:token", incoming.token);
            if (last_cmd == "register") {
                window.location.reload();
            };
            logged_in = true;
        } else if (incoming.command == "new_post") {
            if (incoming.origin == 'livechat') {
                lcPosts[incoming.data._id] = incoming.data;
                if (lcPosts_list) {
                    lcPosts_list.splice(0, 0, incoming.data);
                }
                if (authed || guest) {
                    loadPost(incoming.data, false, false);
                }
                break commandHandler
            }
            posts[incoming.data._id] = incoming.data;
            if (posts_list) {
                posts_list.splice(0, 0, incoming.data);
            }
            if (authed || guest) {
              loadPost(incoming.data, false, false);
            }
        } else if (incoming.command == "deleted_post") {
            removepost(incoming._id, incoming.deleted_by_author)
            if (incoming._id in posts) {
                delete posts[incoming._id];
            }
        } else if (incoming.command == "edited_post") {
            editedpost(incoming._id, incoming.content)
        } else if (last_cmd == "gen_invite" && "invite_code" in incoming) {
            document.getElementById("mm-invite-code").innerText = `Your invite code is "${incoming.invite_code}". Use it on any SoktDeer client to sign up!\nhttps://soktdeer.com/\n\nCodes: ${incoming.invite_codes}`
        } else if (last_cmd == "get_inbox" && "inbox" in incoming) {
            document.getElementById("mi-posts").innerHTML = ""
            for (const i in incoming.inbox) {
                loadPost(incoming.inbox[i], true, true);
            };
            if (!incoming.inbox.length == 0) {
                if (localStorage.getItem("beardeer:last_inbox_id") != incoming.inbox[0]._id) {
                    document.getElementById("ms-button-inbox").innerText = "Inbox*";
                    localStorage.setItem("beardeer:last_inbox_id", incoming.inbox[0]._id)
                } else {
                    document.getElementById("ms-button-inbox").innerText = "Inbox";
                }
            };
        } else if (last_cmd == "get_user" && "user" in incoming) {
            var bio;
            document.getElementById("ud-d-tags").innerHTML = "";
            if (incoming.user.profile.bio == "") {bio = "This user does not have a bio."} else {bio = incoming.user.profile.bio};
            document.getElementById("ud-avatar").src = incoming.user.avatar;
            document.getElementById("ud-display-name").innerText = incoming.user.display_name;
            document.getElementById("ud-username").innerText = "@" + incoming.user.username;
            if (incoming.user.username in timeZones) {
              const formatter = new Intl.DateTimeFormat([], {
                timeZone: timeZones[incoming.user.username],
                dateStyle: "short",
                timeStyle: "medium"
              });
              const updateTimeZone = () => {
                document.getElementById("ud-tz").innerText = formatter.format(new Date());
              };
              clearInterval(timeUpdate);
              updateTimeZone();
              timeUpdate = setInterval(updateTimeZone, 500);
            } else {
              document.getElementById("ud-tz").innerText = "Unknown";
            }
            document.getElementById("ud-created").innerText = new Date(incoming.user.created * 1000).toLocaleString();
            document.getElementById("ud-permissions").innerText = `Permissions: ${incoming.user.permissions.toString().toLowerCase().replaceAll(",", ", ")}`;
            document.getElementById("ud-special").innerHTML = ""
            if (incoming.user.bot) {
                document.getElementById("ud-d-tags").innerHTML += ' <span title="This user is a robot." class="inline-icon material-symbols-outlined">smart_toy</span>'
            };
            if (incoming.user.banned_until > new Date().getTime() / 1000) {
                document.getElementById("ud-banned-span").innerText = `Banned until ${new Date(incoming.user.banned_until * 1000).toLocaleString()}`;
                handleAppearElement(["ud-banned"], "show")
            } else {
                handleAppearElement(["ud-banned"], "hide")
            };
            document.getElementById("ud-bio").innerHTML = md.render(bio);
            if (incoming.user.profile.lastfm) {
                handleAppearElement(["ud-lastfm-container"], "hide")
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var lfm = JSON.parse(xhttp.responseText);
                        if (settings.debug) { console.log(lfm) };
                        if (!"track" in lfm) {
                            handleAppearElement(["ud-lastfm-container"], "hide")
                        } else if (lfm.track["@attr"] && lfm.track["@attr"].nowplaying) {
                            handleAppearElement(["ud-lastfm-container"], "show")
                            document.getElementById("ud-lastfm-cover").src = lfm.track.image[lfm.track.image.length - 1]["#text"];
                            document.getElementById("ud-lastfm-name").innerText = lfm.track.name;
                            document.getElementById("ud-lastfm-album").innerText = `on "${lfm.track.album["#text"]}"`;
                            document.getElementById("ud-lastfm-artist").innerText = `by "${lfm.track.artist["#text"]}"`;
                        } else {
                            handleAppearElement(["ud-lastfm-container"], "hide")
                        };
                    }
                };
                xhttp.open("GET", `https://lastfm.kije.workers.dev/${incoming.user.profile.lastfm}`, true);
                xhttp.send();
            } else {
                handleAppearElement(["ud-lastfm-container"], "hide")
            };
            switchScene('user-display');
        } else if (last_cmd == "get_ips" && "ips" in incoming) {
            document.getElementById("mm-ips").innerText = incoming.ips.toString().replaceAll(",", "\n");
        } else if (incoming["listener"] == "daAccountBossDeer" && incoming.error == false) {
            logOut();
        } else if (incoming["listener"] == "pwAccountBossDeer" && incoming.error == false) {
            logOut();
        };
    };

    ws.onclose = function() {
        closePopup();
        switchScene("connection-lost");
    };

    ws.onerror = function() {
        closePopup();
        switchScene("connection-lost");
    };

    const soktHelper = window.soktHelper = new WsHelper(ws)
})

function switchScene (newScene, isguest) {
    if (newScene == "main-inbox") {
        last_cmd = "get_inbox"
        ws.send(JSON.stringify({command: "get_inbox"}))
    };
    if (scene == "user-display") {
        document.getElementById("ud-avatar").src = "assets/default.png";
    };
    if (newScene == "main-scene" && isguest == true) {
        for (const i in posts_list) {
            loadPost(posts_list[i], true, false);
        };
        document.getElementById("ms-name").innerText = "Guest";
        document.getElementById("ms-name").disabled = true;
        handleAppearElement(["ms-hide-guest-nav", "ms-show-guest-nav", "ms-make-post"])
    };
    handleAppearElement([scene, newScene])
    scene = newScene;
    handleAppearElement(["ms-userbox"], "hide")
    clearValueOf(["rl-username", "rl-username-s", "rl-password", "rl-password-s", "rl-invitecode", ])
};

function register() {
    last_cmd = "register";
    username = document.getElementById("rl-username-s").value.toLowerCase();
    ws.send(JSON.stringify({
        command: "register",
        username,
        password: document.getElementById("rl-password-s").value,
        invite_code: document.getElementById("rl-invitecode").value,
        listener: "RegisterLoginPswdListener"
    }))
};

function logIn() {
    last_cmd = "login_pswd";
    username = document.getElementById("rl-username").value.toLowerCase();
    ws.send(JSON.stringify({command: "login_pswd", username: username, password: document.getElementById("rl-password").value, client: `BearDeer ${version}`, listener: "RegisterLoginPswdListener"}))
};

function ping() {
    if (ws.status == WebSocket.OPEN) {
        ws.send(JSON.stringify({command: "ping", listener: "PingBossDeer"}))
    }
};
setInterval(ping, 2500);

function sendPost() {
    if (!editing) {
        last_cmd = "post";
        var content = document.getElementById("ms-msg").value;
        if (replace_text) {
            for (const i in text_replacements) {
                content = content.replaceAll(i, text_replacements[i]);
            };
        };
        ws.send(JSON.stringify({command: "post", content: content, replies: replies.map((reply) => reply._id), attachments: attachments}))
        clearValueOf(["ms-msg"])
        resizePostBox();
        attachments = [];
        replies = [];
        updateDetailsMsg();
    } else {
        editpost(edit_id);
    }
};

function sendLcPost() {
    if (!editing) {
        last_cmd = "post";
        var content = document.getElementById("ml-msg").value;
        if (replace_text) {
            for (const i in text_replacements) {
                content = content.replaceAll(i, text_replacements[i]);
            };
        };
        ws.send(JSON.stringify({command: "post", content: content, replies: replies, attachments: attachments, chat: 'livechat'}))
        clearValueOf(["ml-msg"])
        attachments = [];
        replies = [];
        updateDetailsMsg();
    }
};

function postInbox() {
    last_cmd = "post_inbox";
    ws.send(JSON.stringify({command: "post_inbox", content: document.getElementById("mm-content-inbox").value.replaceAll("\\n", "\n"), replies: [], attachments: []}))
    clearValueOf(["mm-content-inbox"])
};

function ban() {
    last_cmd = "post";
    if (document.getElementById("mm-until-ban").value != "") {
        var buntil = new Date(document.getElementById("mm-until-ban").value).getTime() / 1000
    } else {
        var buntil = 0
    };
    ws.send(JSON.stringify({command: "ban", username: document.getElementById("mm-username-ban").value, banned_until: buntil, ban_reason: document.getElementById("mm-reason-ban").value}))
    clearValueOf(["mm-username-ban", "mm-until-ban", "mm-reason-ban"])
};

function genInviteCode() {
    last_cmd = "gen_invite";
    ws.send(JSON.stringify({command: "gen_invite"}))
};

function resetInvites() {
    last_cmd = "reset_invites";
    ws.send(JSON.stringify({command: "reset_invites"}))
};

function setDisplayName() {
    last_cmd = "set_display_name";
    ws.send(JSON.stringify({command: "set_property", property: "display_name", value: document.getElementById("mc-display-name").value}))
    document.getElementById("mc-display-name").value = "";
};

function setAvatar() {
    last_cmd = "set_avatar";
    ws.send(JSON.stringify({command: "set_property", property: "avatar", value: document.getElementById("mc-avatar").value}))
    clearValueOf(["mc-avatar"])
};

function setBio() {
    last_cmd = "set_bio";
    var bio = document.getElementById("mc-bio").value;
    if (replace_text) {
        for (const i in text_replacements) {
            bio = bio.replaceAll(i, text_replacements[i]);
        };
    };
    ws.send(JSON.stringify({command: "set_property", property: "bio", value: bio}))
    clearValueOf(["mc-bio"])
};

function setLastfm() {
    last_cmd = "set_lastfm";
    ws.send(JSON.stringify({command: "set_property", property: "lastfm", value: document.getElementById("mc-lastfm").value}))
    clearValueOf(["mc-lastfm"])
};

function deleteAcc() {
    last_cmd = "delete_account";
    ws.send(JSON.stringify({command: "delete_account", password: document.getElementById("mc-da-password").value, listener: "daAccountBossDeer"}))
    document.getElementById("mc-da-password").value = "";
};

function changePswd() {
    last_cmd = "change_password";
    ws.send(JSON.stringify({command: "change_password", password: document.getElementById("mc-pw-password").value, new_password: document.getElementById("mc-pw-new-password").value, listener: "pwAccountBossDeer"}))
    document.getElementById("mc-pw-new-password").value = "";
    document.getElementById("mc-pw-password").value = "";
};

function toggleLock() {
    last_cmd = "toggle_lock";
    ws.send(JSON.stringify({command: "toggle_lock"}))
};

function textinput() {
    // TODO
}

let suggestionsEl;
chaosEvents.doWhenReady(() => {
  document.querySelector("#ms-suggestions");
});
function selection(el) {
  const suggestions = determineSuggestions(el);
  suggestionsEl.innerHTML = "";
  if (suggestions === null) return;
  suggestionsEl.append(...suggestions.map(({ desc, string, newPos }) => {
    const btn = document.createElement("button");
    btn.textContent = desc;
    btn.addEventListener("click", () => {
      el.value = string;
      el.setSelectionRange(newPos, newPos);
      el.focus();
      selection(el);
    })
    return btn;
  }))
};

function determineSuggestions(el) {
  suggestionsEl.classList.remove("hidden");
  if (el.selectionStart !== el.selectionEnd) return null;
  const botSuggestions = determineBotSuggestions(el);
  if (botSuggestions !== null) return botSuggestions;
  const pre = el.value.slice(0, el.selectionStart);
  const post = el.value.slice(el.selectionStart);
  const mentionMatch = pre.match(/@([a-zA-Z\-_0-9]*)$/);
  if (mentionMatch) {
    const usernamePrefix = mentionMatch[1];
    const matchingUsers = ulist.filter((username) => username !== usernamePrefix && username.startsWith(usernamePrefix));
    return matchingUsers.map((user) => ({
      desc: "@" + user,
      string: pre.slice(0, -mentionMatch[0].length) + "@" + user +
        (post.startsWith(" ") ? "" : " ") + post,
      newPos: el.selectionStart + 1 + (user.length - usernamePrefix.length)
    }));
  }
  return null;
}

chaosEvents.doWhenReady(() => {
  const msgBox = document.querySelector("#ms-msg");
  ["touchstart", "keyup", "mouseup", "keydown", "focus"].forEach((e) => {
    msgBox.addEventListener(e, () => selection(msgBox));
  })
})


const BOTS = [
  {
    showIf: () => ulist.includes("bot"),
    prefix: "/",
    commands: ["help", "ping", "whoami", "dice", "expose ", "grrr", "me", "orange", "work", "fish", "about", "golf", "glungus", "thesoupiscoldandthesaladishot", "count ", "math ", "lb", "pi", "bal", "8ball", "glup", "notify ", "reversefish", "hEmulator ", "shameposts"]
  },
  {
    showIf: () => ulist.includes("h"),
    prefix: "@h ",
    commands: ["elp", "quote", "cat", "death", "math ", "kill ", "balance", "labor", "reverselabor", "shop", "buy "],
  },
  {
    showIf: () => ulist.includes("sb4bot"),
    prefix: "@sb4bot ",
    commands: ["help", "balance", "notify ", "reversework", "rps ", "rng ", "wawameter ", "work"],
  }
]
function determineBotSuggestions(el) {
  if (el.selectionStart !== el.value.length) return null;
  const bot = BOTS.find(
    (bot) => el.value.startsWith(bot.prefix) && bot.showIf()
  );
  if (!bot) return null;
  return bot.commands
    .map((command) => bot.prefix + command)
    .filter((command) => command !== el.value && command.startsWith(el.value))
    .map((command) => ({
      desc: command.trim(),
      string: command,
      newPos: command.length,
    }));
}




function changePswd() {
    last_cmd = "change_password";
    ws.send(JSON.stringify({command: "change_password", password: document.getElementById("mc-pw-password").value, new_password: document.getElementById("mc-pw-new-password").value, listener: "pwAccountBossDeer"}))
    clearValueOf(["mc-pw-new-password", "mc-pw-password"])
};

function banish() {
    last_cmd = "banish_to_the_SHADOW_REALM"
    ws.send(JSON.stringify({command: "banish_to_the_SHADOW_REALM", ip: document.getElementById("mm-ip-banish").value}))
    clearValueOf(["mm-ip-banish"])
}

function resizePostBox() {
  const input = document.querySelector("#ms-msg");
  requestAnimationFrame(() => {
    input.style.minHeight = "auto";
    input.style.minHeight = input.scrollHeight + "px";
  })
}
chaosEvents.doWhenReady(() => {
  resizePostBox();
})

function deletepost(id) {
    var wdp = confirm("Are you sure you want to delete this post?")
    if (wdp) { 
        last_cmd = "delete_post";
        ws.send(JSON.stringify({command: "delete_post", id: id}))
    }
};

function editpost(id) {
    last_cmd = "edit_post";
    var content = document.getElementById("ms-msg").value;
    if (replace_text) {
        for (const i in text_replacements) {
            content = content.replaceAll(i, text_replacements[i]);
        };
    };
    ws.send(JSON.stringify({command: "edit_post", id: id, content: content}))
    clearValueOf(["ms-msg"])
    attachments = [];
    replies = [];
    editing = false;
    updateDetailsMsg();
};

function showUser(user) {
    last_cmd = "get_user";
    ws.send(JSON.stringify({command: "get_user", username: user}))
};

function getIPs() {
    last_cmd = "get_ips";
    ws.send(JSON.stringify({command: "get_ips", username: document.getElementById("mm-username-ip").value}))
};