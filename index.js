const express = require('express');
const path = require('path');
const SneaksAPI = require('sneaks-api');
const sneaks = new SneaksAPI();
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

// Initialize express
const app = express();
const PORT = process.env.PORT || 3028;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve all static files (HTML, CSS, JS, images) from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sneaks API Route
app.get(['/','/homepage'], (req, res) => {
    res.sendFile(path.join(__dirname, '../public/homepage.html'));
});

app.get('/shoes', (req, res) => {
    const { style, brand } = req.query;
    let searchQuery = "Puma, Nike, Adidas, Jordan";
    
    if (brand) {
        searchQuery = brand;
    }
    
    sneaks.getProducts(searchQuery, 25, function(err, products) {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({ error: 'Error fetching products' });
        } else {
            // Apply style filter if provided
            if (style) {
                products = products.filter(product => product.style.toLowerCase().includes(style.toLowerCase()));
            }
            res.json(products);
        }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});