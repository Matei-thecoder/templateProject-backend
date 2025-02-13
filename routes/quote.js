const express = require('express');
const router = express.Router();
const pool = require('../db');
const sendMail = require('../mailer');

router.get('/', async(req,res)=>{
    console.log("here");
    res.send('Here are the quotes')
})

//gets all quotes
router.get('/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users.quotes;');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

//post a quotes(for client)

router.post('/add',async(req,res)=>{
    try{
        /*const {NrOfRepairs, Manufacturer,Model,Fault, MoreFault, Comments, Name, Email, 
        Phone, Country,RepairCenter} = req.body;
        const id = 1;
        //verificarea pt existenta a variabilelor de facut in frontend

        const result = await pool.query(
            'INSERT INTO users.quotes ("Noofrepairs", "Manufacturer", "Model","Fault","MoreFaults","Comments","Name","Email","Phone","Country","RepairCenterLocation") VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
            [NrOfRepairs, Manufacturer,Model,Fault,MoreFault,Comments,Name,Email,Phone,Country,RepairCenter]
        );

        res.status(201).json(result.rows[0]); // Return the new user*/
        const { quotes } = req.body;

        if (!quotes || !Array.isArray(quotes)) {
            return res.status(400).json({ error: "Invalid input format" });
        }

        const query = `
            INSERT INTO users.quotes ("Noofrepairs","Manufacturer", "Model", "Fault", "MoreFaults", "Comments", "Name", "Email", "Phone", "Country", "RepairCenterLocation")
            VALUES (0,$1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING "ID";
        `;

        const insertedIds = [];
        for (const quote of quotes) {
            const values = [
                quote.Manufacturer, quote.Model, quote.Fault, quote.MoreFault,
                quote.Comments, quote.Name, quote.Email, quote.Phone, quote.Country, quote.RepairCenterLocation
            ];
            const result = await pool.query(query, values);
            insertedIds.push(result.rows[0].ID);
        }

        res.status(201).json({ message: "Forms submitted successfully", ids: insertedIds });

    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('Server error');
    }
});

//gets quote by id

router.get('/get/:id', async (req,res)=>{
    const id = req.params.id;
    try{
        const result  = await pool.query(`SELECT * FROM users.quotes WHERE "ID"=${id}`);
        res.status(201).json(result.rows[0]);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('server error');
    }
});
router.post('/sendemail/:id', async(req,res)=>{
    const id = req.params.id;
    const fee = req.body.fee;
    try{
        const getEmail = await pool.query(`SELECT * FROM users.quotes WHERE "ID"=${id}`);
        try{
            sendMail(getEmail.rows[0].Email, getEmail.rows[0].Manufacturer, getEmail.rows[0].Model, getEmail.rows[0].Fault, getEmail.rows[0].Comments, fee );
            res.status(201).send('Email send successfully');
        }

        catch(e)
        {
            console.log(e);
            res.status(500).send("problem sending email");
        }
        
        //res.send(getEmail.rows[0].Email);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('server error');
    }
})



module.exports = router;
