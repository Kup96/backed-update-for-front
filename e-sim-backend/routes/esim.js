import express from "express"
const router = express.Router();
import bodyParser from 'body-parser';
import { buyPlan, getAllRegions, getCountries, getOperatorBySlug, getOperators, getPlanBySlug, getPlans, getPlansForCountry, getPlansInRegion, getPurchasesDetailsById } from "../controller/esim.controller.js";

router.use(bodyParser.json());

//get methods
router.get('/countries', getCountries)
router.get('/operators', getOperators)
router.get('/plans', getPlans)
router.get('/plan/:slug', getPlanBySlug)
router.get('/plans/country/:countryCode', getPlansForCountry)
router.get('/operator/:slug',getOperatorBySlug)
router.get('/plans/region/:regionSlug',getPlansInRegion)
router.get('/purchases/:id',getPurchasesDetailsById)
router.get('/regions',getAllRegions)
//post methods
router.post('/buyPlan',buyPlan)

export default router