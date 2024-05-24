import express from 'express';
import bodyParser from 'body-parser';
import { handleTransactionAndBalance, checkPaymentStatus } from "../controller/payments.controller.js";


const router = express.Router();

router.use(bodyParser.json());

router.post('/create-transaction', async (req, res) => {
    try {
        const requestData = req.body;
        const result = await handleTransactionAndBalance(requestData, req, res); 
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/check-payments',checkPaymentStatus)

export default router
