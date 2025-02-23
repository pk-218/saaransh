chrome.runtime.onInstalled.addListener(() => {
  console.log("Legalease Lens installed.");
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "fetchPages") {
    const links = request.data;
    const pagePromises = links.map(async (link) => {
      const response = await fetch(link);
      const text = await response.text();
      const sanitizedText = text.replace(/\n/g, " ").replace(/\"/g, "'");
      const bodyStart = sanitizedText.indexOf("<body");
      const bodyClose = sanitizedText.indexOf("</body>", bodyStart);
      let bodyString = sanitizedText.substring(
        bodyStart,
        bodyClose + "</body>".length
      );
      let scriptStart = bodyString.indexOf("<script");
      while (scriptStart !== -1) {
        const scriptEnd =
          bodyString.indexOf("</script>", scriptStart) + "</script>".length;
        bodyString =
          bodyString.substring(0, scriptStart) +
          bodyString.substring(scriptEnd);
        scriptStart = bodyString.indexOf("<script");
      }
      return bodyString;
    });
    const pages = await Promise.all(pagePromises);
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "parsePageAsHTML",
      data: pages,
    });
    return true;
  }
  if (request.action === "summarizeDocuments") {
    console.log("request.data", request.data);
    console.log("request.errors", request.errors);
    return true;
  }
});
