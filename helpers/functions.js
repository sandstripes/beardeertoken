function clearValueOf(array) {
    array.forEach(id => {
        document.getElementById(id).value = ""
    });
}

function closePopup () {
    document.getElementById("error-bar").classList.add("hidden");
};

function userBox () {
    handleAppearElement(["ms-userbox"])
}

function handleAppearElement(ids, mode) {
    ids.forEach(id => {
    if (mode === "hide") {
        document.getElementById(id).classList.add("hidden");
    } else if (mode === "show") {
        document.getElementById(id).classList.remove("hidden");
    } else {
        document.getElementById(id).classList.toggle("hidden");
    }
    });
}

function displayError (errText) {
    document.getElementById("error-text").innerText = errText;
    if (errText.includes("{{Reload}}")) {
        document.getElementById("error-text").innerHTML = errText.replaceAll("{{Reload}}", "<span class='text-clickable' onclick='window.location.reload();'>Reload</span>");
    }
    handleAppearElement(["error-bar"], "show")
};

function addAttachment() {
    if (!editing) {
        var ata = window.prompt("Add an attachment via whitelisted URL")
        if (![null,""].includes(ata)) {
            if (attachments.length != 5) {
                attachments.push(ata);
            };
        };
        updateDetailsMsg();
    };
};

function addUpload() {
    if (!editing) {
        if (settings.upload_key && settings.upload_service) {
            document.getElementById("ms-attach").click()
        } else {
            displayError("Please set up uploading in settings!");
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
            if (1 + attachments.length <= 5) {
                try {
                    if (settings.upload_service == "imgbb") {
                        var f = await uploadFile(fl[i]);
                    } else if (settings.upload_service == "fraud") {
                        var f = await uploadFileFraud(fl[i]);
                    } else {
                        throw "No service";
                    }
                    attachments.push(f);
                } catch(err) {
                    uploaded = false;
                    console.warn(err);
                    displayError("Couldn't upload file.");
                };
            };
        };
    };
    if (uploaded) {
        closePopup();
    };
    clearValueOf(["ms-attach"])
    updateDetailsMsg();
};
