chrome.runtime.onInstalled.addListener(() => {
  console.log("Legalease Lens installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchText") {
      (async () => {
          try {
              const response = await fetch(request.url);
              console.log("Response ",response);
              const text = await response.text();
              const extractedText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              console.log("Extracted text :",extractedText.substring(0, 500));
              sendResponse({ success: true, data: extractedText, response : response }); // Limit output
          } catch (error) {
              console.error("❌ Fetch error:", error);
              sendResponse({ success: false, error: "CORS blocked or fetch failed." });
          }
      })();
      return true; // 🔥 Keeps the connection open for async response
  }
});
