// // textToImageController.js
// controllers/textToImage.controller.js
// src/controllers/textToImage.controller.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Image Generation Controller
export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Gemini 1.5 Flash does not generate images directly.
    // Instead, you describe an image and get base64.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);

    // API response se text/image extract karo
    const response = await result.response;
    const text = response.text(); // usually returns description or base64 if supported

    res.json({
      success: true,
      prompt,
      output: text,
    });
  } catch (error) {
    console.error("Google AI Studio Error:", error);
    res.status(500).json({
      error: "Image generation failed",
      detail: error.message || error,
    });
  }
};


// import dotenv from "dotenv";
// import { GoogleGenAI } from "@google/genai";

// dotenv.config();

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export const generateImage = async (req, res) => {
//   const { prompt } = req.body;
//   if (!prompt || !prompt.trim()) {
//     return res.status(400).json({ error: "Prompt is required" });
//   }

//   try {
//     // Generate image using Google GenAI SDK
//     const response = await ai.models.generateImages({
//       model: process.env.MODEL,
//       prompt: prompt,
//       config: { numberOfImages: 1 } // single image
//     });

//     const generated = response.generatedImages;
//     if (!generated || generated.length === 0) {
//       return res.status(500).json({ error: "Image generation failed", raw: response });
//     }

//     const imageBase64 = generated[0].image.imageBytes;
//     const dataUrl = `data:image/png;base64,${imageBase64}`;

//     res.json({ image: dataUrl });

//   } catch (err) {
//     console.error("Google AI Studio Error:", err);
//     res.status(500).json({ error: "Image generation failed", detail: err.message || err });
//   }
// };
