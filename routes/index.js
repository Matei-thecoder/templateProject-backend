const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to my project!');
    //add connection to frontend;
});

module.exports = router;
