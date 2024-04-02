chrome.action.onClicked.addListener(() => {
    console.log('redirecting...')
    chrome.tabs.create({
        url: "https://companion-rust.facepunch.com/login"
    });
});