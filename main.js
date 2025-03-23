const md = markdownit({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
  
      return ''; // use external default escaping
    },
    html: false,
    linkify: true,
    typographer: false,
    breaks: true,
    image: false
  })
  .disable('image')
  .disable('code');
  

document.getElementById("rl-username").value = "";
document.getElementById("rl-password").value = "";
document.getElementById("rl-invitecode").value = "";

function displayError (errText) {
    document.getElementById("error-text").innerText = errText;
    if (errText.includes("{{Reload}}")) {
        document.getElementById("error-text").innerHTML = errText.replaceAll("{{Reload}}", "<span class='text-clickable' onclick='window.location.reload();'>Reload</span>");
    }
    document.getElementById("error-bar").classList.remove("hidden");
};

function closePopup () {
    document.getElementById("error-bar").classList.add("hidden");
};

const version = "1.6.3b";
const serverVersion = "Helium-1.0.0a";
let last_cmd = "";
let username = "";
let logged_in = false; // unused?
let authed = false;
let scene = "loading";
let ulist = [];
let raw_ulist = {};
let posts = [];
let replies = [];
let attachments = [];
let editing = false;
let edit_id = "";
let delete_all = false;
let guest = false;
let timeUpdate = null;

let replace_text = false;
let detect_file_type = false;
let presets = false;
let text_replacements = {
    "\\n": "\n",
    ":x:": "❌",
    ":+1:": ":yuhhuh:",
    ":-1:": ":nuhhuh:",
    ":check:": "✅",
    ":b:": "🅱️"
};

const timeZones = {
  alwayshavealwayswill: "America/Detroit",
  cole: "America/Detroit",
  delusions: "Europe/London",
  engineerrunner: "Europe/London",
  mybearworld: "Europe/Berlin",
  noodles: "-05:00",
  notfenixio: "Europe/Madrid",
  pix: "America/Detroit",
  pkmnq: "+08:00",
  wlodekm: "Europe/Kyiv",
}

if (localStorage.getItem("beardeer:theme") == null) {
    localStorage.setItem("beardeer:theme", "helium")
}

if (localStorage.getItem("customCSS")) {
    document.getElementById("custom-style").innerText = localStorage.getItem("beardeer:customCSS");
    document.getElementById("mc-theme-custom").value = localStorage.getItem("beardeer:customCSS");
}

document.getElementById("top-style").href = `themes/${localStorage.getItem("beardeer:theme")}.css`;

const settings_template = {"replace_text": true, "detect_file_type": false, "debug": true, "imgbb_key": "", "presets": false }

if (localStorage.getItem("beardeer:settings") == null) {
    localStorage.setItem("beardeer:settings", JSON.stringify(settings_template))
};

if (localStorage.getItem("beardeer:last_inbox_id") == null) {
    localStorage.setItem("beardeer:last_inbox_id", "")
}

let settings = JSON.parse(localStorage.getItem("beardeer:settings"));

for (const i in settings_template) {
    if (!i in settings) {
        settings[i] = settings_template[i]
        localStorage.setItem("beardeer:settings", JSON.stringify(settings))
    }
}

function stgsTriggers() {
    if (settings.replace_text) {
        replace_text = true;
        document.getElementById("mc-button-replace").innerText = "(enabled) Replace text";
    } else {
        replace_text = false;
        document.getElementById("mc-button-replace").innerText = "(disabled) Replace text";
    };
    //if (settings.detect_file_type) {
        //detect_file_type = true;
        //document.getElementById("mc-button-detectft").innerText = "(enabled) Detect file types";
    //} else {
    //     detect_file_type = false;
    //     document.getElementById("mc-button-detectft").innerText = "(disabled) Detect file types";
    // };
    if (settings.presets) {
        presets = true;
        document.getElementById("ms-button-presets").innerText = "Back";
        document.querySelector("#ms-do-not-the-spamming").toggleAttribute("hidden", false);
        document.querySelector("#ms-msg").toggleAttribute("hidden", true);
        document.querySelector("#ms-button-post").toggleAttribute("hidden", true);
        document.querySelector("#ms-presets").toggleAttribute("hidden", false);
    } else {
        presets = false;
        document.getElementById("ms-button-presets").innerText = "MK8 Presets";
        document.querySelector("#ms-do-not-the-spamming").toggleAttribute("hidden", true);
        document.querySelector("#ms-msg").toggleAttribute("hidden", false);
        document.querySelector("#ms-button-post").toggleAttribute("hidden", false);
        document.querySelector("#ms-presets").toggleAttribute("hidden", true);
    };
};

function updateStg(setting) {
    if (setting == "replace_text") {
        settings.replace_text = !settings.replace_text;
    } else if (setting == "imgbb_key") {
        settings.imgbb_key = document.getElementById("mc-imgbb-key").value;
        document.getElementById("mc-imgbb-key").value = "";
    } else if (setting == "detect_file_type") {
        settings.detect_file_type = !settings.detect_file_type;
    } else if (setting == "presets") {
        settings.presets = !settings.presets;
    }
    localStorage.setItem("beardeer:settings", JSON.stringify(settings));
    stgsTriggers();
};

stgsTriggers();

async function uploadFile(file) {
    // ORIGINAL CREDIT TO:
    // @:3 on SoktDeer
    // @ArrowAced on GitHub
    // https://gist.github.com/ArrowAced/7d342a06cc8325f272cd42d6442f6466 // note: gone?
    // note: very much so modified since then, mainly because i need to use imgbb because cors sucks
    const data = new FormData();
    data.set('key', settings.imgbb_key);
    data.set('image', file);

    const init = {
        method: 'POST',
        body: data
    };
    const res = await fetch("https://api.imgbb.com/1/upload", init);
    const rsp = await res.json()
    if ("data" in rsp && "image" in rsp.data && "url" in rsp.data.image) {
        if (rsp.data.image.url.startsWith('https://i.ibb.co/')) {
            return rsp.data.image.url;
        } else {
            throw new Error(rsp);
        };
    } else {
            throw new Error(rsp);
        };
};

document.getElementById("mw-new").innerHTML = md.render(
`*Version 1.6.3b - March 22nd*

## 1.6.3b additions
### Custom CSS
You can put custom CSS in settings under Theme.

## 1.6.2b additions
### Post editing and deletion
You can now edit and delete posts! Simply use the respective "Edit" and "Delete" buttons on your posts.
Please note that this does *not* update the contents of replies in real-time just yet!

### Jump to replies
You can now click on a reply in a post to jump to it!

### Show a user...
There is now a "Show a user..." button! Type in a username, and it will take you to their profile.`
)

const prodUrl = "wss://sokt.fraudulent.loan";
const loclUrl = "ws://127.0.0.1:3636";

//
//   DO NOT FORGET TO CHANGE THE URL
//

const ws = new WebSocket(prodUrl)

ws.onmessage = function (event) {
    let incoming = JSON.parse(event.data);
    if (settings.debug) { console.log(incoming) };

    if (incoming.command == "greet") {
        closePopup();
        document.getElementById("rl-version").innerText = `BearDeer (based on BossDeer ${version}) - ${incoming.version}`;
        document.getElementById("mc-version").innerText = `${version} - ${incoming.version}`;
        if (incoming.version != serverVersion) {
            displayError(`The server is on a newer version than this version of BossDeer was designed for. You may experience problems. (Expected "${serverVersion}", got "${incoming.version}")`);
        };
        ulist = Object.keys(incoming.ulist);
        raw_ulist = incoming.ulist;
        updateUlist();
        posts = incoming.messages;
        if (localStorage.getItem("beardeer:username") == null || localStorage.getItem("beardeer:token") == null) {
            scene = "register-login";
            document.getElementById("loading").classList.toggle("hidden");
            document.getElementById("register-login").classList.toggle("hidden")
        } else {
            username = localStorage.getItem("beardeer:username").toLowerCase();
            last_cmd = "login_token";
            ws.send(JSON.stringify({command: "login_token", token: localStorage.getItem("beardeer:token"), client: `BearDeer ${version}`}))
        };
    } else if (incoming.command == "ulist") {
        ulist = Object.keys(incoming.ulist);
        raw_ulist = incoming.ulist;
        updateUlist();
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
                document.getElementById("register-login").classList.toggle("hidden");
            } else if (scene == "loading") {
                document.getElementById("loading").classList.toggle("hidden");
            };
            scene = "main-scene";
            if ([JSON.stringify([]), JSON.stringify(["PROTECTED"])].includes(JSON.stringify(incoming.user.permissions))) {
                document.getElementById("ms-button-mod").classList.add("hidden");
            } else {
                document.getElementById("ms-button-mod").classList.remove("hidden");
            };
            if (incoming.user.permissions.includes("DELETE")) {
                delete_all = true;
            }
            buddies = incoming.user.buddies;
            document.getElementById("main-scene").classList.toggle("hidden");
            document.getElementById("ms-name").innerText = `@${username}`
            last_cmd = "get_inbox"
            authed = true;
            for (const i in posts) {
                loadPost(posts[i], true, false);
            };
            ws.send(JSON.stringify({command: "get_inbox"}))
        };
    };
    if ("token" in incoming && incoming.listener == "RegisterLoginPswdListener") {
        localStorage.setItem("beardeer:username", username);
        localStorage.setItem("beardeer:token", incoming.token);
        if (last_cmd == "register") {
            window.location.reload();
        };
        logged_in = true;
    } else if (incoming.command == "new_post") {
        posts.splice(0, 0, incoming.data);
        if (authed || guest) {
        loadPost(incoming.data, false, false);
        }
    } else if (incoming.command == "deleted_post") {
        removepost(incoming._id, incoming.deleted_by_author)
    } else if (incoming.command == "edited_post") {
        editedpost(incoming._id, incoming.content)
    } else if (last_cmd == "gen_invite" && "invite_code" in incoming) {
        document.getElementById("mm-invite-code").innerText = `Your invite code is "${incoming.invite_code}". Use it on any SoktDeer client to sign up!\nhttps://deer.fraudulent.loan/\n\nCodes: ${incoming.invite_codes}`
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
        if (incoming.user.verified) {
            document.getElementById("ud-d-tags").innerHTML += ' <span title="This user is verified." class="inline-icon material-symbols-outlined">check_circle</span>'
        };
        if (incoming.user.bot) {
            document.getElementById("ud-d-tags").innerHTML += ' <span title="This user is a robot." class="inline-icon material-symbols-outlined">smart_toy</span>'
        };
        if (incoming.user.banned_until > new Date().getTime() / 1000) {
            document.getElementById("ud-banned-span").innerText = `Banned until ${new Date(incoming.user.banned_until * 1000).toLocaleString()}`;
            document.getElementById("ud-banned").classList.remove("hidden");
        } else {
            document.getElementById("ud-banned").classList.add("hidden");
        };
        document.getElementById("ud-bio").innerText = bio;
        if (incoming.user.profile.lastfm) {
            document.getElementById("ud-lastfm-container").classList.add("hidden");
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var lfm = JSON.parse(xhttp.responseText);
                    if (settings.debug) { console.log(lfm) };
                    if (!"track" in lfm) {
                        document.getElementById("ud-lastfm-container").classList.add("hidden");
                    } else if (lfm.track["@attr"] && lfm.track["@attr"].nowplaying) {
                        document.getElementById("ud-lastfm-container").classList.remove("hidden")
                        document.getElementById("ud-lastfm-cover").src = lfm.track.image[lfm.track.image.length - 1]["#text"];
                        document.getElementById("ud-lastfm-name").innerText = lfm.track.name;
                        document.getElementById("ud-lastfm-album").innerText = `on "${lfm.track.album["#text"]}"`;
                        document.getElementById("ud-lastfm-artist").innerText = `by "${lfm.track.artist["#text"]}"`;
                    } else {
                        document.getElementById("ud-lastfm-container").classList.add("hidden");
                    };
                }
            };
            xhttp.open("GET", `https://lastfm-last-played.biancarosa.com.br/${incoming.user.profile.lastfm}/latest-song`, true);
            xhttp.send();
        } else {
            document.getElementById("ud-lastfm-container").classList.add("hidden")
        };
        switchScene('user-display');
    } else if (last_cmd == "get_support_code" && "user" in incoming) {
        document.getElementById("mc-support").innerHTML = "";
        document.getElementById("mc-support").innerText = "Support code: " + incoming.code + "\nDO NOT SHARE!";
    } else if (last_cmd == "get_support_codeUser" && "user" in incoming) {
        if (document.getElementById("mm-content-support").value == incoming["code"]) {
            document.getElementById("mm-support-verify").innerText = incoming["user"] + "'s support code is valid!"
            document.getElementById("mm-content-support").value = "";
        } else {
            document.getElementById("mm-support-verify").innerText = incoming["user"] + "'s support code is NOT valid."
            document.getElementById("mm-content-support").value = "";
        }
    } else if (incoming["listener"] == "daAccountBossDeer" && incoming.error == false) {
        logOut();
    } else if (incoming["listener"] == "pwAccountBossDeer" && incoming.error == false) {
        logOut();
    };
};

ws.onclose = function (event) {
    closePopup();
    switchScene("connection-lost");
};

ws.onerror = function (event) {
    closePopup();
    switchScene("connection-lost");
};

const clientIcon = (c) =>
  c.startsWith("BossDeer ") ? " 🦌"
  : c.startsWith("BearDeer" ) ? " 🐻"
  : c.startsWith("BetterDeer ") ? " ✨"
  : c.startsWith("PresetDeer ") ? " 🧩"
  : c.startsWith("Kansas") ? " 🇺🇸"
  : c === "Unknown" ? "❓"
  : "🤖"

function updateUlist() {
    var ulstring = "";
    for (const i in ulist) {
        ulstring += `<span class="clickable" title="${raw_ulist[ulist[i]]['client']}" onclick="showUser('${ulist[i]}');">${ulist[i]} ${clientIcon(raw_ulist[ulist[i]].client)}</span>` //vulnerable!
        if (i != ulist.length - 1) {
            ulstring += ", "
        };
    };
    if (!(ulist.includes(username)) && ulist.length != 0 && guest == false) {
        document.getElementById("ms-ulist").innerHTML = `${ulist.length} user online (${ulstring})❓ (Try <a href='javascript:window.location.reload();'>refreshing the page</a>?)`;
    } else if (ulist.length == 1 && guest == false) {
        document.getElementById("ms-ulist").innerHTML = "You are the only user online. 😥🦌";
    } else if (ulist.length == 1) {
        document.getElementById("ms-ulist").innerHTML = `${ulist.length} user online (${ulstring})`;
    } else if (ulist.length == 0) {
        if (guest) {
            document.getElementById("ms-ulist").innerHTML = "Nobody is online. 😥🦌";
        } else {
            document.getElementById("ms-ulist").innerHTML = "Nobody is online. 😥❓ (Try <a href='javascript:window.location.reload();'>refreshing the page</a>?)";
        };
    } else {
        document.getElementById("ms-ulist").innerHTML = `${ulist.length} users online (${ulstring})`;
    };
}

function switchScene (newScene, isguest) {
    if (newScene == "main-inbox") {
        last_cmd = "get_inbox"
        ws.send(JSON.stringify({command: "get_inbox"}))
    };
    if (scene == "user-display") {
        document.getElementById("ud-avatar").src = "assets/default.png";
    };
    if (newScene == "main-scene" && isguest == true) {
        for (const i in posts) {
            loadPost(posts[i], true, false);
        };
        document.getElementById("ms-hide-guest-nav").classList.toggle("hidden");
        document.getElementById("ms-show-guest-nav").classList.toggle("hidden");
        document.getElementById("ms-name").innerText = "Guest";
        document.getElementById("ms-name").disabled = true;
        document.getElementById("ms-make-post").classList.toggle("hidden");
    };
    document.getElementById(scene).classList.toggle("hidden");
    document.getElementById(newScene).classList.toggle("hidden");
    scene = newScene;
    document.getElementById("ms-userbox").classList.add("hidden");
    document.getElementById("rl-username-s").value = "";
    document.getElementById("rl-username").value = "";
    document.getElementById("rl-password-s").value = "";
    document.getElementById("rl-password").value = "";
    document.getElementById("rl-invitecode").value = "";
};

function rltab (tab) {
    document.getElementById("rl-username-s").value = "";
    document.getElementById("rl-username").value = "";
    document.getElementById("rl-password-s").value = "";
    document.getElementById("rl-password").value = "";
    document.getElementById("rl-invitecode").value = "";
    if (tab == "login") {
        document.getElementById("rl-signup-container").classList.add("hidden");
        document.getElementById("rl-login-container").classList.remove("hidden");
        document.getElementById("rl-t-login").disabled = true;
        document.getElementById("rl-t-signup").disabled = false;
    } else if (tab == "signup") {
        document.getElementById("rl-signup-container").classList.remove("hidden");
        document.getElementById("rl-login-container").classList.add("hidden");
        document.getElementById("rl-t-login").disabled = false;
        document.getElementById("rl-t-signup").disabled = true;
    };
};

function userBox () {
    document.getElementById("ms-userbox").classList.toggle("hidden");
};

rltab('login');

function register() {
    last_cmd = "register";
    username = document.getElementById("rl-username-s").value.toLowerCase();
    ws.send(JSON.stringify({command: "register", username: username, password: document.getElementById("rl-password-s").value, invite_code: document.getElementById("rl-invitecode").value, listener: "RegisterLoginPswdListener"}))
};

function logIn() {
    last_cmd = "login_pswd";
    username = document.getElementById("rl-username").value.toLowerCase();
    ws.send(JSON.stringify({command: "login_pswd", username: username, password: document.getElementById("rl-password").value, client: `BearDeer ${version}`, listener: "RegisterLoginPswdListener"}))
};

function logOut() {
    localStorage.removeItem("beardeer:username");
    localStorage.removeItem("beardeer:token");
    window.location.reload();
};

const emoji = {
  yuhhuh: "https://i.ibb.co/d4VsTJS4/1227268820213698611.webp",
  nuhhuh: "https://i.ibb.co/zHNfVwsF/nuhhuh.webp",
  me: "https://i.ibb.co/204mNMJp/me.webp",
  keeneThumbsUp: "https://i.ibb.co/gbmr7LPh/keene-Thumbs-Up.png",
  goobert: "https://i.ibb.co/hRFdhGmw/goobert.png",
  theProfilePictureThatNoodlesUsedOnTheTwentyFirstOfMarchTwentyTwentyFive: "https://i.ibb.co/rR9J3L47/wink.png",
  true: "https://i.ibb.co/kgfz2G6T/Screenshot-2025-03-04-172131.png",
  whar: "https://i.ibb.co/cXYmWqRk/1143938761919570000.png",
  wink: "https://i.ibb.co/rR9J3L47/wink.png",
}
const emojify = (s) => {
  return s
    .replace(/:([a-zA-Z]+):/gi, (s, name) =>
      name in emoji ?
        `<img src=${emoji[name]} style="vertical-align: middle;" />`
      : name);
}

function replyElement(replies) {
  const el = document.createElement("div");
  for (const i in replies) {
      let reply_loaded = `→ ${replies[i].author.display_name} (@${replies[i].author.username}): ${emojify(md.renderInline(replies[i].content))}`
      let replyContent = document.createElement("span");
      replyContent.innerHTML = reply_loaded;
      replyContent.classList.add("reply");
      replyContent.classList.add("clickable");
      replyContent.setAttribute("onclick", `document.getElementById("${replies[i]._id}").scrollIntoView({ behavior: "smooth" });`)
      el.appendChild(replyContent);

      let brl = document.createElement("br");
      el.appendChild(brl);
  };
  return el;
}

function loadPost(resf, isFetch, isInbox) {
    if (settings.debug) { console.log("Loading post " + resf._id) };

    var sts = new Date(resf.created * 1000).toLocaleString();
    var replies_loaded = replyElement(resf.replies)

    var post = document.createElement("div");
    post.classList.add("post");
    post.setAttribute("id", resf._id)

    if (!isInbox) {
    var avatar = document.createElement("img");
    if (resf.author.avatar) {
        avatar.src = resf.author.avatar;
    } else {
        avatar.src = "assets/default.png";
    };
    avatar.setAttribute("onerror", "this.src = 'assets/default.png';")
    avatar.setAttribute("onclick", `showUser("${resf.author.username}");`); // TODO: use this more often
    avatar.classList.add("clickable");
    avatar.classList.add("pfp");
    post.appendChild(avatar);

    var postUsername = document.createElement("span");
    postUsername.innerHTML = `<b>${resf.author.display_name}</b> (<span class="mono">@${resf.author.username}</span>)`;
    //console.log(`${resf.author.username}: ${resf.author.verified}, ${resf.author.bot}`)
    if (resf.author.verified) {
        postUsername.innerHTML += ' <span title="This user is verified." class="inline-icon material-symbols-outlined">check_circle</span>'
    };
    if (resf.author.bot) {
        postUsername.innerHTML += ' <span title="This user is a robot." class="inline-icon material-symbols-outlined">smart_toy</span>'
    };
    postUsername.setAttribute("onclick", `showUser("${resf.author.username}");`);
    postUsername.classList.add("clickable");
    post.appendChild(postUsername);

    var breaklineA = document.createElement("br");
    post.appendChild(breaklineA);
    }

    var postDetails = document.createElement("small");
    if (isInbox) {
        postDetails.innerHTML = `${sts}`;
    } else {
        postDetails.innerHTML = `${sts} - <span class="text-clickable" onclick="reply(${JSON.stringify(resf).replace(/"/g, "&quot;")});">Reply</span>`;
    };
    if (resf.author?.username == username) {
        postDetails.innerHTML += ` - <span class="text-clickable" onclick="editer('${resf._id}');">Edit</span>`
    }
    if (resf.author?.username == username || delete_all) {
        postDetails.innerHTML += ` - <span class="text-clickable" onclick="deletepost('${resf._id}');">Delete</span>`
    }
    post.appendChild(postDetails);
    
    var breaklineB = document.createElement("br");
    post.appendChild(breaklineB);
    
    if (!isInbox) {
    if (resf.replies.length != 0) {
        post.appendChild(replies_loaded);
            
            
        var horlineB = document.createElement("hr");
        post.appendChild(horlineB);
    };
    }

    var postContent = document.createElement("span");
    postContent.classList.add("post-content");
    postContent.setAttribute("id", "content-" + resf._id)
    postContent.innerHTML = emojify(md.render(resf.content));
    post.appendChild(postContent);

    if (resf.attachments.length != 0) {
        var horline = document.createElement("hr");
        post.appendChild(horline);
        
        var attachmentDetails = document.createElement("span");
        for (const x in resf.attachments) {
            attachmentDetails.innerHTML += `<a target="_blank" rel="noopener noreferrer" id="p-${resf._id}-attachment-${Number(x)}">Loading...</a><br>`
        }
        post.appendChild(attachmentDetails)


        // Code below provided by SpeedBee411 (@speedbee411)
        // note: modified

        for (let i = 0; i < resf.attachments.length; i++) {
            var dft_debug = {
                "dft_enabled": detect_file_type,
                "postid": resf._id,
                "attachment": i,
                "pth": null,
                "type": null
            };
                    let attachment = document.createElement("img");
                    attachment.src = resf.attachments[i];
                    attachment.classList.add("attachment");
                    attachment.setAttribute("onerror", "this.remove();");
                    post.appendChild(attachment);
        }
    }
        // End of provided code
    
    var postboxid;
    if (isInbox) {postboxid = "mi-posts"} else {postboxid = "ms-posts"}; // this oneliner is ugly imo

    if (isFetch) {
        document.getElementById(postboxid).appendChild(post);
    } else {
        document.getElementById(postboxid).insertBefore(post, document.getElementById(postboxid).firstChild);
    }

    for (const x in resf.attachments) {
        document.getElementById(`p-${resf._id}-attachment-${Number(x)}`).innerText = `Attachment ${Number(x) + 1} (${resf.attachments[x]})`
        document.getElementById(`p-${resf._id}-attachment-${Number(x)}`).href = resf.attachments[x];
    }
}

function sendPreset(el) {
  document.getElementById("ms-msg").value = el.textContent;
  sendPost();
}

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
    document.getElementById("ms-msg").value = "";
    resizePostBox();
    attachments = [];
    replies = [];
    updateDetailsMsg();
    } else {
        editpost(edit_id);
    }
};

function postInbox() {
    last_cmd = "post_inbox";
    ws.send(JSON.stringify({command: "post_inbox", content: document.getElementById("mm-content-inbox").value.replaceAll("\\n", "\n"), replies: [], attachments: []}))
    document.getElementById("mm-content-inbox").value = "";
};

function ban() {
    last_cmd = "post";
    if (document.getElementById("mm-until-ban").value != "") {
        var buntil = new Date(document.getElementById("mm-until-ban").value).getTime() / 1000
    } else {
        var buntil = 0
    };
    ws.send(JSON.stringify({command: "ban", username: document.getElementById("mm-username-ban").value, banned_until: buntil, ban_reason: document.getElementById("mm-reason-ban").value}))
    document.getElementById("mm-username-ban").value = "";
    document.getElementById("mm-until-ban").value = "";
    document.getElementById("mm-reason-ban").value = "";
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
    document.getElementById("mc-avatar").value = "";
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
    document.getElementById("mc-bio").value = "";
};

function setLastfm() {
    last_cmd = "set_lastfm";
    ws.send(JSON.stringify({command: "set_property", property: "lastfm", value: document.getElementById("mc-lastfm").value}))
    document.getElementById("mc-lastfm").value = "";
};

function updateDetailsMsg() {
    if (editing) {
        document.getElementById("ms-details").innerHTML = `Editing post ${edit_id} - <span class="text-clickable" onclick="clearAll();">Quit editing</span>`
    } else if (replies.length == 0 && attachments.length == 0) {
        document.getElementById("ms-details").innerText = ""
    } else if (replies.length == 0) {
        if (attachments.length == 1) {var plurals = ""} else {var plurals = "s"}
        document.getElementById("ms-details").innerHTML = `${attachments.length} attachment${plurals} - <span class="text-clickable" onclick="clearAll();">Remove all</span>`
    } else if (attachments.length == 0) {
        if (replies.length == 1) {var plurals = "y"} else {var plurals = "ies"} 
        document.getElementById("ms-details").innerHTML = `${replies.length} repl${plurals} - <span class="text-clickable" onclick="clearAll();">Remove all</span>`
    } else {
        if (replies.length == 1) {var plurals = "y"} else {var plurals = "ies"}
        if (attachments.length == 1) {var plurals_b = ""} else {var plurals_b = "s"}
        document.getElementById("ms-details").innerHTML = `${replies.length} repl${plurals}, ${attachments.length} attachment${plurals_b} - <span class="text-clickable" onclick="clearAll();">Remove all</span>`
    };
    console.log("hi?")
    document.getElementById("ms-replies").innerHTML = "";
    document.getElementById("ms-replies").append(replyElement(replies));
};

function addAttachment() {
    if (!editing) {
    var ata = window.prompt("Add an attachment via whitelisted URL")
    if (![null,""].includes(ata)) {
        if (attachments.length != 3) {
            attachments.push(ata);
        };
    };
    updateDetailsMsg();
    };
};

function addUpload() {
    if (!editing) {
    if (settings.imgbb_key) {
        document.getElementById("ms-attach").click()
    } else {
        displayError("Please set an ImgBB API key!");
    };
    }
};

async function attachFile() {
    var iter = 0;
    var fl = document.getElementById("ms-attach").files;
    if (fl.length != 0) {
        displayError("Uploading...");
        var uploaded = true;
    } else {
        var uploaded = false;
    };
    for (const i in fl) {
        if (fl[i] instanceof File) {
            iter += 1;
            if (1 + attachments.length <= 3) {
                try {
                    var f = await uploadFile(fl[i]);
                    attachments.push(f);
                } catch(err) {
                    uploaded = false;
                    console.warn(err);
                    displayError("Couldn't upload file to ImgBB.");
                };
            };
        };
    };
    if (uploaded) {
        closePopup();
    };
    document.getElementById("ms-attach").value = "";
    updateDetailsMsg();
};

function reply(id) {
    if (!editing) {
    if (replies.length != 3) {
        replies.push(id);
    };
    document.getElementById("ms-msg").focus();
    updateDetailsMsg();
    }
};

function resizePostBox() {
  const input = document.querySelector("#ms-msg");
  requestAnimationFrame(() => {
    input.style.minHeight = "auto";
    input.style.minHeight = input.scrollHeight + "px";
  })
}

function deletepost(id) {
    var wdp = confirm("Are you sure you want to delete this post?")
    if (wdp) { 
        last_cmd = "delete_post";
        ws.send(JSON.stringify({command: "delete_post", id: id}))
    }
};

function editer(id) {
    edit_id = id;
    editing = true;
    document.getElementById("ms-msg").focus();
    updateDetailsMsg();
    resizePostBox();
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
    document.getElementById("ms-msg").value = "";
    attachments = [];
    replies = [];
    editing = false;
    updateDetailsMsg();
};

function removepost(id, dba) {
    try {
        document.getElementById(id).classList.remove("post");
        if (dba) {
            document.getElementById(id).innerHTML = "<small class='reply' style='vertical-align:top;'><i>post deleted by author</i></small>";
        } else {
            document.getElementById(id).innerHTML = "<small class='reply' style='vertical-align:top;'><i>post deleted by moderator</i></small>";
        }
    } catch {}
}

function editedpost(id, content) {
    try {
        document.getElementById("content-" + id).innerHTML = md.render(content);
    } catch {}
}

function clearAll() {
    if (editing) {
        document.getElementById("ms-msg").value = "";
    }
    editing = false;
    replies = [];
    attachments = [];
    updateDetailsMsg();
};

function forceKick() {
    last_cmd = "force_kick";
    ws.send(JSON.stringify({command: "force_kick", username: document.getElementById("mm-username-forcekick").value}))
    document.getElementById("mm-username-forcekick").value = "";
};


function showUserPrompt() {
    var un = prompt("Username?") 
    if (un) {
        showUser(un);
  }
}

function showUser(user) {
    last_cmd = "get_user";
    ws.send(JSON.stringify({command: "get_user", username: user}))
};

function getSupportCode() {
    last_cmd = "get_support_code";
    ws.send(JSON.stringify({command: "get_support_code", username: ""}))
};

function getSupportCodeUser() {
    last_cmd = "get_support_codeUser";
    ws.send(JSON.stringify({command: "get_support_code", username: document.getElementById("mm-username-support").value}))
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

const suggestionsEl = document.querySelector("#ms-suggestions");
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
  console.log(el.selectionStart, JSON.stringify(pre), JSON.stringify(post));
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


const BOTS = [
  {
    showIf: () => ulist.includes("bot"),
    prefix: "/",
    commands: ["help", "ping", "whoami", "dice", "expose ", "grrr", "me", "orange", "work", "fish", "about", "gold", "glungus", "thesoupiscoldandthesaladishot"],
  },
  {
    showIf: () => ulist.includes("h"),
    prefix: "@h ",
    commands: ["elp", "quote", "cat", "death", "math ", "kill ", "balance", "labor", "reverselabor", "shop", "buy "],
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

const msgBox = document.querySelector("#ms-msg");
["touchstart", "keyup", "mouseup", "keydown", "focus"].forEach((e) => {
  msgBox.addEventListener(e, () => selection(msgBox));
})

function setTheme(theme) {
    localStorage.setItem("beardeer:theme", theme)
    document.getElementById("top-style").href = `themes/${theme}.css`;
}

function setCustomTheme() {
    var ccss = document.getElementById("mc-theme-custom").value;
    localStorage.setItem("customCSS", ccss);
    document.getElementById("custom-style").innerText = ccss;
}

function ping() {
    ws.send(JSON.stringify({command: "ping", listener: "PingBossDeer"}))
};

setInterval(ping, 2500)
