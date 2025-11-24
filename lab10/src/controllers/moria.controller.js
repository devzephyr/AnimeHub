const OpenAI = require("openai");
const { ok, fail } = require("../utils/responses");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory state
let conversationHistory = [];
let riddleState = null;

// Normalization helper
function normalize(s) {
    return s
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\p{Diacritic}]/gu, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

// Validation helper
function validateAnswer(userText, state) {
    if (!state) return false;
    const user = normalize(userText);
    const accepted = new Set([
        normalize(state.answer),
        ...state.acceptable.map(normalize)
    ]);
    if (accepted.has(user)) return true;

    // Optional rule-based checks
    if (state.rules?.some(r => /allow articles/i.test(r))) {
        const a = user.replace(/^(a|an|the)\s+/, '');
        if (accepted.has(a)) return true;
    }
    if (state.rules?.some(r => /allow synonyms/i.test(r))) {
        if (user.includes(normalize(state.answer))) return true;
    }
    return false;
}

// Mock Riddle Generator
function generateRiddleMock() {
    const pool = [
        {
            riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
            answer: "echo",
            acceptable: ["echo", "an echo", "the echo"],
            rules: ["lowercase", "trim", "strip punctuation", "allow articles"],
            hint: "It answers when you call into the mountains."
        },
        {
            riddle: "Voiceless it cries, wingless flutters, toothless bites, mouthless mutters. What is it?",
            answer: "wind",
            acceptable: ["wind", "the wind"],
            rules: ["lowercase", "trim", "strip punctuation", "allow articles"],
            hint: "You feel it but cannot see it."
        },
        {
            riddle: "The more of this there is, the less you see. What is it?",
            answer: "darkness",
            acceptable: ["darkness", "the dark", "dark"],
            rules: ["lowercase", "trim", "strip punctuation", "allow synonyms"],
            hint: "It reigns in the deepest mines."
        }
    ];
    return pool[Math.floor(Math.random() * pool.length)];
}

// AI Riddle Generator
async function generateRiddleWithAI() {
    if (!process.env.OPENAI_API_KEY) return generateRiddleMock();

    try {
        const system = `You are the Gatekeeper at the Doors of Durin. Generate a single, clean fantasy riddle for an adventurer to solve. Output strict JSON only, matching this schema:
    {"riddle": string, "answer": string, "acceptable": string[], "rules": string[], "hint": string}
    Rules:
    - riddle: concise 1–3 sentences, no spoilers.
    - answer: the canonical expected answer (single word or short phrase).
    - acceptable: variations/synonyms/plurals/misspellings that should count as correct.
    - rules: short normalization/validation rules (e.g., lowercase, trim, strip punctuation, allow synonyms).
    - hint: a subtle hint that doesn’t reveal the answer outright.
    - THE OUTPUT MUST BE VALID JSON ONLY.`;

        const response = await client.chat.completions.create({
            model: "gpt-4o", // Using a standard model available
            messages: [{ role: "system", content: system }],
            response_format: { type: "json_object" }
        });

        const text = response.choices[0].message.content;
        return JSON.parse(text);
    } catch (error) {
        console.error("AI generation failed, falling back to mock:", error);
        return generateRiddleMock();
    }
}

// Controllers
exports.getStart = async (req, res, next) => {
    try {
        // Generate new riddle on start
        riddleState = await generateRiddleWithAI();
        conversationHistory = []; // Reset history

        const greeting = "I am the Gatekeeper of Durin's Door. Speak the answer to my riddle and the way shall be opened.";
        const message = `${greeting}\n\n${riddleState.riddle}`;

        conversationHistory.push({ role: 'ai', content: message });

        res.json(ok(message, { riddle: riddleState.riddle }));
    } catch (error) {
        next(error);
    }
};

exports.postAsk = async (req, res, next) => {
    try {
        // Guard: Ensure riddle exists
        if (!riddleState) {
            return res.status(400).json(fail("The Gatekeeper is sleeping. Please reload (call /start) to wake him."));
        }

        const { prompt } = req.body;
        if (!prompt) return res.status(400).json(fail("Prompt is required"));

        conversationHistory.push({ role: 'user', content: prompt });

        const isCorrect = validateAnswer(prompt, riddleState);

        if (isCorrect) {
            const successMsg = "The Doors of Durin swing open. You may enter.";
            conversationHistory.push({ role: 'ai', content: successMsg });
            return res.json(ok(successMsg, { opened: true }));
        }

        // Incorrect answer
        let reply = "The stones remain silent.";

        // If AI is available, generate a dynamic refusal/hint
        if (process.env.OPENAI_API_KEY) {
            try {
                const system = `You are the Gatekeeper. The user answered incorrectly. The riddle was: "${riddleState.riddle}". The answer is "${riddleState.answer}". The user said: "${prompt}".
         Respond with a cryptic refusal or a subtle hint. Do not reveal the answer. Keep it short and fantasy-themed.`;

                const response = await client.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        ...conversationHistory.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })),
                        { role: "system", content: system }
                    ]
                });
                reply = response.choices[0].message.content;
            } catch (e) {
                console.error("AI reply failed", e);
                // Fallback to hint if available
                if (riddleState.hint) reply = `Incorrect. Hint: ${riddleState.hint}`;
            }
        } else {
            // Mock fallback
            if (riddleState.hint) reply = `Incorrect. Hint: ${riddleState.hint}`;
        }

        conversationHistory.push({ role: 'ai', content: reply });
        res.json(ok(reply, { opened: false }));

    } catch (error) {
        next(error);
    }
};
