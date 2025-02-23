document.getElementById("analyze-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractAndSummarize" });
  });

  // Show content section and hide analyze button
  document.getElementById("content-section").classList.remove("hidden");
  document.getElementById("analyze-btn").classList.add("hidden");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getResult") {
      console.log("Received result", request.result);
      document.getElementById("summary").innerText = request.data;
  }
});

// Toggle summary visibility
document.getElementById("toggle-summary").addEventListener("click", () => {
  const summarySection = document.getElementById("summary-section");
  if (summarySection.classList.contains("hidden")) {
      summarySection.classList.remove("hidden");
      document.getElementById("toggle-summary").innerText = "Hide Summary";
  } else {
      summarySection.classList.add("hidden");
      document.getElementById("toggle-summary").innerText = "Show Summary";
  }
});
