const express = require('express');
const cors = require('cors');
const { connectToMongoDB } = require('./db');
const accessibleLOD_data = require('./routes/AccessibleLOD_data');
const monitoring_requests = require('./routes/monitoring_requests');
const llm = require('./routes/llm');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
    try {
        req.db = await connectToMongoDB(); 
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during the connection to the DB');
    }
});

app.use('/AccessibleLOD_data',accessibleLOD_data);
app.use('/monitoring_requests', monitoring_requests);
app.use('/llm', llm);

app.listen(port,() => {
    console.log(`Server is running on port: ${port}`);
})