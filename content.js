async function fetchText(url) {
  return new Promise((resolve) => {
    console.log("Trying to fetch text from", url);
    chrome.runtime.sendMessage(
      { action: "fetchText", url: url },
      (response) => {
        if (response && response.success) {
          console.log(`📄 Extracted Response from ${url}:`, response.response);
          console.log(`📄 Extracted Text from ${url}:`, response.data);
          resolve(response.data);
        } else {
          console.error(`❌ Failed to fetch ${url}:`, response.error);
          resolve(null);
        }
      }
    );
  });
}


async function extractAndSummarizePolicies() {
  let links = [];
  let matches = [];
  const matchingWords = ["term", "policy", "privacy", "tos"];
  const anchorTags = document.getElementsByTagName("a");

  for (let i = 0; i < anchorTags.length; i++) {
    if (anchorTags[i].href) {
      links.push(anchorTags[i].href);
    }
  }

  matchingWords.forEach((word) => {
    links.forEach((link) => {
      if (link.toLowerCase().includes(word)) {
        matches.push(link);
      }
    });
  });

  matches = [...new Set(matches)];
  if (matches.length === 0) {
    console.log("❌ No Privacy Policy or Terms links found.");
    return;
  }

  console.log("🔍 Found Privacy Policy / Terms links:", matches);

  let summaries = [];
  for (let url of matches) {
    const text = await fetchText(url);
    if (text) {
      // const summary = await summarizeText(text);
      summaries.push({ url, summary });
    }
  }

  chrome.runtime.sendMessage({ action: "summarizedData", data: summaries });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractAndSummarize") {
    extractAndSummarizePolicies().then(() => sendResponse({ success: true }));
    return true; // Keeps the message channel open for async response
  }
});
