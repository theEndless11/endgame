const express = require('express');
const mongoose = require('mongoose');
const Ably = require('ably');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb+srv://sneha321:sneha321@cluster0.nl9gh.mongodb.net/chatApp?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));


// MongoDB Message Model
const messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Use middleware
app.use(express.json());
app.use(cors());

// Initialize Ably
const ably = new Ably.Realtime({ key: 'YOUR_ABLY_API_KEY' });
const publicChannel = ably.channels.get('chat');

// Listen for new messages on the public chat and save them to MongoDB
publicChannel.subscribe('message', async (message) => {
    const newMessage = new Message({ text: message.data.text });
    await newMessage.save();
    console.log('Message saved to DB:', message.data.text);
});

// API to get all messages from the MongoDB database
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Serve static files (HTML, JS, etc.) - if you have them in a public folder
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
