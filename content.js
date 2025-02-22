chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    let links = [];
    let matches = [];
    const matchingWords = ["term", "policy", "privacy", "tos"];
    const anchorTags = document.getElementsByTagName("a");
    for (let i = 0; i < anchorTags.length; i++) {
      links.push(anchorTags[i].href);
    }
    matchingWords.map((word) => {
      links.map((link) => {
        if (link.toLowerCase().includes(word)) {
          matches.push(link);
        }
      });
    });
    sendResponse({
      content: matches,
    });
  }
});
