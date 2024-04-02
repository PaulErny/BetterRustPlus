const catcherInterval = setInterval(() => {
    console.log('1')
    if (window.ReactNativeWebView === undefined) {
        console.log('2')
        window.ReactNativeWebView = {
            /**
             * Rust+ login website calls ReactNativeWebView.postMessage after successfully logging in with Steam.
             * @param message json string with SteamId and API Token
             * We use the API Token to access the Rust+ API to enhance Rust+ app on rustLink.io
             */
            postMessage: function(message) {
                console.log('3')
                var auth = JSON.parse(message);
                // window.location.href = `https://rustlink.io/register/${encodeURIComponent(auth.Token)}/${encodeURIComponent(auth.SteamId)}`;
                // chrome.browserAction.setPopup({popup: "creds.html"})
                console.log(auth.Token)
                console.log(auth.SteamId)
                clearInterval(catcherInterval)
            },
        };
    }
}, 500);