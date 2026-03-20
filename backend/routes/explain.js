import express from "express";

const router = express.Router();

router.post("/explain", async (req, res) => {
  try {
    const { title, plot } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // free/cheap model
        messages: [
          {
            role: "user",
            content: `Explain the movie "${title}" in simple words based on this plot: ${plot}. Keep it short, simple, and easy to understand.`
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      explanation: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;