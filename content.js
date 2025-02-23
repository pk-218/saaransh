function extractLinks() {
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
  return matches;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractAndSummarize") {
    const links = extractLinks();
    chrome.runtime.sendMessage({ action: "fetchPages", data: links });
    return true;
  }
  if (request.action === "parsePageAsHTML") {
    const parser = new DOMParser();
    const documents = [];
    const errors = [];
    const sentences = [];
    for (let page of request.data) {
      try {
        const document = parser.parseFromString(page, "text/html");
        if (document.querySelector("parsererror")) {
          errors.push(content.querySelector("parsererror").textContent);
        }
        const paragraphs = document.getElementsByTagName("p");
        for (let i = 0; i < paragraphs.length; i++) {
          if (paragraphs[i].innerText.includes(".")) {
            sentences.push(paragraphs[i].innerText);
          }
        }
        documents.push(document);
        console.log("Parsed document: ", document);
      } catch (e) {
        errors.push(e);
      }
    }
    console.log("All documents", documents);
    chrome.runtime.sendMessage({
      action: "getResult",
      result: documents,
      data: sentences,
    });
    // sendResponse({ result: documents });
    // chrome.runtime.sendMessage(
    //   { action: "summarizeDocuments", data: documents, errors: errors }
    // );
    return true;
  }
});
