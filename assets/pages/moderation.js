export function moderationContents() {
    return `
            <button onclick="switchScene('main-scene');">Return to Home</button><br>
            <p>Welcome to the moderation tool menu.</p>
            <div id="mm-flex">
                <div class="mm-container">
                    <h3 class="header-notop">Ban</h3>
                    <input id="mm-username-ban" placeholder="Username..." type="text"></input><br>
                    <input id="mm-until-ban" type="datetime-local"></input><br>
                    <input id="mm-reason-ban" placeholder="Reason..." type="text"></input><br>
                    <button onclick="ban();">Ban User</button>
                </div>
                <div class="mm-container">
                    <h3 class="header-notop">Invite code</h3>
                    <span id="mm-invite-code"></span><br>
                    <button onclick="genInviteCode();">Generate invite code</button><br>
                    <button onclick="resetInvites();">Reset invite codes</button>
                </div>
                <div class="mm-container">
                    <h3 class="header-notop">Forcekick</h3>
                    <input id="mm-username-forcekick" placeholder="Username..." type="text"></input><br>
                    <button onclick="forceKick();">Forcekick</button>
                </div>
                <div class="mm-container">
                    <h3 class="header-notop">Inbox</h3>
                    <textarea id="mm-content-inbox" placeholder="Message..." type="text" width=80></textarea><br>
                    <button onclick="postInbox();">Post inbox</button>
                </div>
                <div class="mm-container">
                    <h3 class="header-notop">User IPs</h3>
                    <input id="mm-username-ip" placeholder="Username..." type="text"></input><br>
                    <button onclick="getIPs();">Get recent IPs</button>
                    <button onclick="clearIPs();">Clear</button><br>
                    <span id="mm-ips"></span>
                </div>
                <div class="mm-container">
                    <h3 class="header-notop">banish to the SHADOW REALM</h3>
                    <input id="mm-ip-banish" placeholder="IP..." type="text"></input><br>
                    <button onclick="banish();">Begone, foul beast</button>
                </div>
                <div class="mm-container">
                    <small>This function has not yet been re-implemented into SoktDeer Helium.</small><br>
                    <h3 class="header-notop">Lockdown server</h3>
                    <button onclick="toggleLock();" disabled>Toggle lock</button>
                </div>
            </div>
    `
}