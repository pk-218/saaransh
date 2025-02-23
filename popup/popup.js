document.getElementById("summarize-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "extractAndSummarize" });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getResult") {
    console.log("Received result", request.result);
    document.getElementById("summary").innerText = request.data;
  }
});
