import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Rule-based SEO content generator
 * @param {string} topic - Main topic
 * @param {string[]} keywords - Array of keywords
 * @param {number} totalWords - Total word target (default 1000)
 * @param {number} keywordFrequency - Number of times each keyword should appear
 * @returns {object} { content, metaDescription }
 */
export const generateSEOContent = (topic, keywords = [], totalWords = 1000, keywordFrequency = 8) => {
  const paragraphs = [];
  const metaDescription = `Learn all about ${topic} with tips, examples, and guidance including ${keywords.join(", ")}.`;

  // Calculate approx words per paragraph
  const wordsPerParagraph = 100;
  const numParagraphs = Math.ceil(totalWords / wordsPerParagraph);

  // Repeat keywords to meet frequency
  const keywordPool = [];
  keywords.forEach((kw) => {
    for (let i = 0; i < keywordFrequency; i++) keywordPool.push(kw);
  });

  for (let i = 0; i < numParagraphs; i++) {
    let paragraph = `This paragraph is about ${topic}. `;

    // Insert 1-2 keywords per paragraph randomly
    if (keywordPool.length > 0) {
      const kwIndex = Math.floor(Math.random() * keywordPool.length);
      paragraph += `It also discusses ${keywordPool[kwIndex]}. `;
      // Remove used keyword to maintain count
      keywordPool.splice(kwIndex, 1);
    }

    // Add filler sentences to reach ~100 words
    paragraph += `Here we provide detailed insights, examples, and guidance about ${topic} to help the reader understand the topic deeply. `;
    paragraph += `This paragraph contains useful tips, tricks, and information that is relevant to ${topic}. `;

    paragraphs.push(paragraph);
  }

  const content = paragraphs.join("\n\n");
  return { content, metaDescription };
};

// SEO Audit function
export const performSEOAudit = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $("title").text() || "No title";
    const metaDesc = $('meta[name="description"]').attr("content") || "No meta description";
    const h1Tags = [];
    $("h1").each((i, el) => h1Tags.push($(el).text()));

    return { title, metaDesc, h1Tags };
  } catch (err) {
    return { error: "Failed to fetch URL" };
  }
};

// Controller for POST /api/seo-optimize
export const seoOptimize = async (req, res) => {
  const { content, keywords, auditUrl } = req.body;

  if (!content || !keywords || keywords.length === 0) {
    return res.status(400).json({ success: false, message: "Content and keywords are required" });
  }

  // Generate SEO-friendly 1000-word content with keywords
  const { content: optimizedContent, metaDescription } = generateSEOContent(content, keywords, 1000, 8);

  // SEO audit if URL is provided
  let seoAudit = null;
  if (auditUrl) {
    seoAudit = await performSEOAudit(auditUrl);
  }

  res.json({ success: true, optimizedContent, metaDescription, seoAudit });
};
