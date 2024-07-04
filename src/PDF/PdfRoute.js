import express from 'express';
import { generatePdf } from "./PdfController.js";
import cors from 'cors';
const router = express.Router();


router.get('/generatePDF/:id', cors(), async(req, res)=>{
    await generatePdf(req, res);
} )

export default router;