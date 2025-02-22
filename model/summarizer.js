async function summarizeText(text) {
  const cleanText = preprocessText(text);
  const sentences = cleanText.split('. ').slice(0, 10);
  return sentences.join('. ') + '.';
}

function preprocessText(text) {
  return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}