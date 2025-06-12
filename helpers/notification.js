let notifPerms = '';
let requested = false
let lePinged = false;
let pings = 0;

function handlePings() {
    window.actuallyLoadPost = loadPost;

    Notification.requestPermission().then((result) => {
        notifPerms = result
        if (result != 'granted') {
            document.addEventListener('click', () => {
                if (requested) return;
                requested = true
                Notification.requestPermission().then((result) => {
                    console.log(result);
                    notifPerms = result
                });
            })
        } else {
            console.log(result)
            requested = true;
        }
    });

    document.addEventListener('focus', () => {
    	if (!lePinged) return;
    	pings = 0;
    	lePinged = false;
        document.title = 'BearDeer'
    })

    loadPost = function (resf, isFetch, isInbox) {
        if (isFetch) return actuallyLoadPost(resf, isFetch, isInbox);
		if (document.hasFocus()) return actuallyLoadPost(resf, isFetch, isInbox);; // do not the ping if focused

        if (resf.content.includes(`@${username}`) || resf.replies.find(r => r.author.username == username)) {
            lePinged = true;
            pings++;

            // const audio = document.createElement('audio');
            document.title = `(${pings}) BearDeer`
            // audio.src = 'https://files.catbox.moe/62fie9.wav'
            // audio.play();

            if (notifPerms == 'granted')
                new Notification(resf?.author.display_name ?? resf?.author.username, { body: resf.content, icon: resf.author.avatar ?? "/assets/default.png" });
        }
        actuallyLoadPost(resf, isFetch, isInbox);
    }
}