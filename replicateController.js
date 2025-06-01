const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

exports.generateReport = async (req, res) => {
  try {
    const { conversation } = req.body;

    const prompt = conversation
      .map((item) => `${item.question} -> ${item.answer}`)
      .join("\n");

    const input = {
      prompt: prompt,
      system_prompt: "You are a compassionate mental health assistant. Based on the user's responses, provide a supportive mental health summary. Then, include Possible emotional or psychological patterns or conditions (e.g., stress, anxiety, adjustment issues),Practical self-care suggestions (e.g., breathing exercises, journaling, talking to a friend),Encouraging words or motivation and When appropriate, gently suggest seeking professional help without sounding alarming.Keep the tone empathetic, hopeful, and easy to understand."
    };

    const output = await replicate.run("openai/gpt-4o", { input });

    res.json({ summary: output.join("") });
  } catch (err) {
    console.error("Replicate API Error:", err.message);
    res.status(500).json({ error: "Failed to generate report." });
  }
};
