const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI("AIzaSyDrwqgN8TsaAVsu8eW0w0qLmRJdaWE__78");

// Serve static files
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle image analysis
app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        if (!req.body.prompt) {
            return res.status(400).json({ error: 'No prompt provided' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = req.body.prompt;

        const image = {
            inlineData: {
                data: Buffer.from(fs.readFileSync(req.file.path)).toString("base64"),
                mimeType: req.file.mimetype,
            },
        };

        const result = await model.generateContent([prompt, image]);
        
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ result: result.response.text() });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});