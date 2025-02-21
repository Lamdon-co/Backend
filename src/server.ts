import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

// Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
