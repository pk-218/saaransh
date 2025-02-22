import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Risk thresholds (customizable)
RISK_THRESHOLDS = {
    "Low Risk": (0.33, 0.5),
    "Moderate Risk": (0.5, 0.75),
    "High Risk": (0.75, 1.0)
}

def get_risk_type(probability):
    for risk_type, (low, high) in RISK_THRESHOLDS.items():
        if low <= probability < high:
            return risk_type
    return "Low Risk"  # Default fallback

def assess_sentence_risk(sentence, model, tokenizer):
    """
    Assesses risk probability and risk type for a sentence.

    Returns:
        dict: {"sentence": str, "probability": float, "risk_type": str}
    """
    prompt = f"Is this sentence a risk to personal data privacy? {sentence} Answer yes or no:"
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, padding=True, max_length=512)

    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=1)
        risk_prob = probabilities[0, 1].item()  # Probability of "risky" class

    risk_type = get_risk_type(risk_prob)
    return {"sentence": sentence, "probability": risk_prob, "risk_type": risk_type}

def process_text(text, model, tokenizer, top_n=5):
    """
    Processes text to find top high-risk paragraphs.

    Args:
        text (str): Full text to process.
        model: Trained classification model.
        tokenizer: Tokenizer for the model.
        top_n (int): Number of top risky paragraphs to return.

    Returns:
        dict: Top N risky paragraphs with details.
    """
    paragraphs = re.split(r'\n\s*\n', text.strip())
    paragraph_results = []

    for idx, paragraph in enumerate(paragraphs):
        sentences = re.split(r'(?<=[.!?])\s+', paragraph)
        sentence_risks = [assess_sentence_risk(s, model, tokenizer) for s in sentences if s.strip()]

        # Extract high-risk sentences (Moderate or High risk)
        high_risk_sentences = [s for s in sentence_risks if s['risk_type'] in ["Moderate Risk", "High Risk"]]

        # Determine paragraph-level risk based on max sentence probability
        max_risk_prob = max((s['probability'] for s in sentence_risks), default=0.0)
        paragraph_results.append({
            "paragraph_index": idx,
            "paragraph_text": paragraph,
            "high_risk_sentences": high_risk_sentences,
            "max_risk_probability": max_risk_prob
        })

    # Select top N paragraphs based on max_risk_probability
    top_paragraphs = sorted(paragraph_results, key=lambda x: x['max_risk_probability'], reverse=True)[:top_n]

    # Format output dictionary
    output = {
        f"Paragraph {item['paragraph_index'] + 1}": {
            "paragraph_text": item['paragraph_text'],
            "high_risk_sentences": [{"sentence": s['sentence'], "risk_type": s['risk_type']} for s in item['high_risk_sentences']],
            "paragraph_max_risk_probability": item['max_risk_probability']
        } for item in top_paragraphs
    }
    
    return output

# Load LegalBERT model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("nlpaueb/legal-bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("nlpaueb/legal-bert-base-uncased", num_labels=2)

# Example text with multiple paragraphs
text = """
We may share your personal data with third-party marketing partners. This allows us to offer you personalized promotions. We comply with industry standards.

Our system uses encryption to protect your data. However, we may collect your location data even when the app is not in use. Biometric data is stored without encryption.

The user has the right to request deletion of their data. Data is used to improve user experience.

We store financial data for transaction purposes. We may disclose personal information to comply with legal obligations or requests from law enforcement agencies.
"""

# Process text and get top 5 risky paragraphs
top_risky_paragraphs = process_text(text, model, tokenizer, top_n=5)

# Output results
import json
print(json.dumps(top_risky_paragraphs, indent=4))

# sample output (Thought json type output would be better to highlight red sentences in red Pankaj;)
# {
#     "Paragraph 2": {
#         "paragraph_text": "...",
#         "high_risk_sentences": [
#             {"sentence": "We may collect your location data even when the app is not in use.", "risk_type": "High Risk"},
#             {"sentence": "Biometric data is stored without encryption.", "risk_type": "High Risk"}
#         ],
#         "paragraph_max_risk_probability": 0.85
#     },
#     ...
# }

