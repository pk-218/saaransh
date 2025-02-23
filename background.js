chrome.runtime.onInstalled.addListener(() => {
  console.log("Legalease Lens installed.");
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "fetchPages") {
    const links = request.data;
    const pagePromises = links.map(async (link) => {
      const response = await fetch(link);
      const text = await response.text();
      return text.replace(/\n/g, " ").replace(/\"/g, "'");
    });
    const pages = await Promise.all(pagePromises);
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "parsePageAsHTML",
      data: pages,
    });
    return true;
  }
});

// sentences -> for each sentence create input IDs -> go over each word in vocab, if found, create an entry in inputIDs map
// create attention mask
// convert these to a tensor
// pass this to model for inference
// handle output tensor
// probability
// if p > 0.5 -> Risky
// n sentences -> Sum of p / n -> overall P
// if P > 0.5 risky or not risky
