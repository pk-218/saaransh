document.getElementById('summarize-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "extractText" }, (response) => {
      if (response && response.content) {
        summarizeText(response.content).then(summary => {
          document.getElementById('summary').innerText = summary;
        });
      }
    });
  });
});