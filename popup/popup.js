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

function sanitizeText(text) {
  const bodyStart = text.indexOf("<body");
  const bodyClose = text.indexOf("</body>", bodyStart);
  let bodyString = text.substring(bodyStart, bodyClose + "</body>".length);
  let scriptStart = bodyString.indexOf("<script");
  while (scriptStart !== -1) {
    const scriptEnd =
      bodyString.indexOf("</script>", scriptStart) + "</script>".length;
    bodyString =
      bodyString.substring(0, scriptStart) + bodyString.substring(scriptEnd);
    scriptStart = bodyString.indexOf("<script");
  }
  return bodyString;
}

async function tokenize(sentence) {
  const tokens = sentence.toLowerCase().split(/\s+/);
  const vocabulary = await (
    await fetch(chrome.runtime.getURL("./model/vocab.json"))
  ).json();
  const tokenIds = tokens.map(
    (token) => vocabulary[token] || vocabulary["[UNK]"] || 0
  );
  const maxLength = 512;
  if (tokenIds.length < maxLength) {
    while (tokenIds.length < maxLength) {
      tokenIds.push(0);
    }
  } else if (tokenIds.length > maxLength) {
    tokenIds = tokenIds.slice(0, maxLength);
  }
  return tokenIds;
}

function softmax(arr) {
  const expArr = arr.map((val) => Math.exp(val));
  const sumExpArr = expArr.reduce((sum, val) => sum + val, 0);
  return expArr.map((val) => val / sumExpArr);
}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "getResult") {
    console.log("Received result", request.result);
    document.getElementById("summary").innerText = request.data;
  }
});


