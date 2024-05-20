import express from "express"
const router = express.Router();
import bodyParser from 'body-parser';
import { buyPlan, getCountries, getOperatorBySlug, getOperators, getPlanBySlug, getPlans, getPlansForCountry, getPlansInRegion } from "../controller/esim.controller.js";

router.use(bodyParser.json());

//get methods
router.get('/countries', getCountries)
router.get('/operators', getOperators)
router.get('/plans', getPlans)
router.get('/plan/:slug', getPlanBySlug)
router.get('/plans/country/:countryCode', getPlansForCountry)
router.get('/operator/:slug',getOperatorBySlug)
router.get('/plans/region/:regionSlug',getPlansInRegion)

//post methods
router.post('/buyPlan',buyPlan)

export default router