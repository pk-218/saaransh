document.getElementById("summarize-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "extractAndSummarize" },
      (response) => {
        if (response && response.content) {
          document.getElementById("summary").innerText = response.content;
        }
      }
    );
  });
});
