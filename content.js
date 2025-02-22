chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    const text = document.body.innerText;
    sendResponse({ content: text });
  }
});