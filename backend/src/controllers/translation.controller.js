import fetch from "node-fetch";

export const translateMessage = async (req, res) => {
  try {
    const { message, targetLanguage } = req.body;

    // Validation
    if (!message || !targetLanguage) {
      return res.status(400).json({
        error: "Both 'message' and 'targetLanguage' are required.",
      });
    }

    // Model name: Helsinki-NLP/opus-mt-{source}-{target}
    // NOTE: Ye code assume karta hai ki input message English me hai
    const modelName = `Helsinki-NLP/opus-mt-en-${targetLanguage}`;

    // API request to HuggingFace Inference API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    // Parse response
    const data = await response.json();

    // Handle HuggingFace error
    if (!response.ok || data.error) {
      console.error("❌ HuggingFace API Error:", data.error || data);
      return res
        .status(500)
        .json({ error: data.error || "Translation API failed" });
    }

    // Extract translated text safely
    const translatedText =
      Array.isArray(data) && data[0]?.translation_text
        ? data[0].translation_text
        : message; // fallback

    return res.json({ translatedText });
  } catch (err) {
    console.error("❌ Translation error:", err);
    res.status(500).json({ error: "Translation failed. Please try again." });
  }
};
