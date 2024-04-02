const inject = document.createElement('script');
inject.src = chrome.runtime.getURL('scripts/tokenCatcher.js');
inject.onload = function() {
    this.remove();
};
(document.head || document.documentElement)
    .appendChild(inject);

const button = document.querySelector("body > div > div > div.overlay-buttons > form > button > span");
const description = document.querySelector("body > div > div > div.overlay-body > p");
if (button && description) {
    // Change the login button
    button.innerHTML = "Link to BetterRust+";

    // Change the description
    description.style.color = "green";
    description.innerHTML = "Linking will allow BetterRust+ to view your Steam ID and Rust+ Token.";
}