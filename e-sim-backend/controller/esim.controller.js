import newRequestService from "../services/newRequest.js";
import bodyParser from 'body-parser';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from "../models/UserSchema.js"
const SECRET = process.env.JWT_SECRET;

export const getCountries = async (req, res, next) => {

    try {
        const response = await newRequestService.get("/countries")
        res.json(response.data);
    }

    catch(err) {
        console.error(err)
        res.status(500).json({
            error:"No coutries found"
        })
    }
}

export const getOperators = async (req, res, next) => {

    try {
        const response = await newRequestService.get("/operators")
        res.json(response.data);
    }

    catch(err) {
        console.error(err)
        res.status(500).json({
            error:"No operators found"
        })
    }
}

export const getPlans = async (req, res, next) => {

    try {
        const response = await newRequestService.get("/plans")
        let getPlans = response.data;
        const newRetailPrice = response.data.retailPrice
        console.log(newRetailPrice)
        getPlans.forEach(operator => {
            if (operator.retailPrice) {
                const retailPrice = parseFloat(operator.retailPrice);
                operator.retailPrice = (retailPrice * 1.40 * 10).toFixed(2);
                operator.oldRetailPrice = retailPrice.toFixed(2);

            }
        });

        res.json(getPlans);



    }




    catch(err) {
        console.error(err)
        res.status(500).json({
            error:"No plans found"
        })
    }
}
export const getPlanBySlug = async (req, res, next) => {

    const {slug} = req.params;
    try {
        const response = await newRequestService.get(`/plan/${slug}`)

        let getPlan = response.data;

        if (getPlan.retailPrice) {
            const retailPrice = parseFloat(getPlan.retailPrice);
            const newRetailPrice = (retailPrice * 1.40 * 10).toFixed(2);

            getPlan.oldRetailPrice = retailPrice.toFixed(2);
            getPlan.retailPrice = newRetailPrice;
        }


        res.json(getPlan);


    }

    catch(err) {
        console.log(err)
        res.status(500).json({
            error:"No plan found"
        })
    }
}
export const getPlanDetails = async (req, res, next) => {

    const {slug} = req.params;
    try {
        const response = await newRequestService.get(`/plan/pricing-details/${slug}`)
        res.json(response.data);
    }

    catch(err) {
        console.error(err.response.data)
        res.status(500).json({
            error:"No plan details found"
        })
    }
}
export const getPlansForCountry = async (req, res, next) => {

    const {countryCode} = req.params;
    try {
        const response = await newRequestService.get(`/plans/countries/${countryCode}`)
        let getPlans = response.data;

        if (Array.isArray(getPlans)) {
            getPlans = getPlans.map(plan => {
                if (plan.retailPrice) {
                    const retailPrice = parseFloat(plan.retailPrice);
                    const newRetailPrice = (retailPrice * 1.40 * 10).toFixed(2);

                    plan.oldRetailPrice = retailPrice.toFixed(2);
                    plan.retailPrice = newRetailPrice;
                }
                return plan;
            });
        }

        res.json(getPlans);
    }

    catch(err) {
        console.error(err.response.data)
        res.status(500).json({
            error:"No plan details found"
        })
    }
}
export const getOperatorBySlug = async (req, res, next) => {

    const {slug} = req.params;
    try {
        const response = await newRequestService.get(`/plans/operators/${slug}`)
        let getPlans = response.data;

        if (Array.isArray(getPlans)) {
            getPlans = getPlans.map(plan => {
                if (plan.retailPrice) {
                    const retailPrice = parseFloat(plan.retailPrice);
                    const newRetailPrice = (retailPrice * 1.40 * 10).toFixed(2);

                    plan.oldRetailPrice = retailPrice.toFixed(2);
                    plan.retailPrice = newRetailPrice;
                }
                return plan;
            });
        }

        res.json(getPlans);
    }

    catch(err) {
        console.error(err.response.data)
        res.status(500).json({
            error:"No operator found"
        })
    }
}
export const getPlansInRegion = async (req, res, next) => {
    const {regionSlug} = req.params;
    try {
        const response = await newRequestService.get(`/plans/regions/${regionSlug}`)
        res.json(response.data);
    }

    catch(err) {
        console.error(err.response.data)
        res.status(500).json({
            error:"No operator found"
        })
    }
}

export const buyPlan = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader.split(' ')[1];
    const { planSlug } = req.body;

    try {
        const response = await newRequestService.post(`/purchases`, { slug: planSlug });

        const { purchaseId, retail } = response.data.purchase;

        const retailPriceFloat = parseFloat(retail);
        console.log(retail)
        const cost = parseFloat((retailPriceFloat * 0.40 * 10).toFixed(2));

        const decoded = jwt.verify(token, SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.balance < cost) {
            return res.status(400).json({
                error: "Insufficient funds"
            });
        }
        user.balance -= cost;

        if (!user.TransactionIdProducts) {
            user.TransactionIdProducts = [];
        }
        user.TransactionIdProducts.push(purchaseId);

        await user.save();

        res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({
            error: "Error when purchasing a plan"
        });
    }
};

export const getPurchasesDetailsById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const response = await newRequestService.get(`/purchases/${id}`);
        let getPlan = response.data;

        if (getPlan.retail) {
            const retailPrice = parseFloat(getPlan.retail);
            const newRetailPrice = (retailPrice * 1.40 * 10).toFixed(2);

            getPlan.oldRetailPrice = retailPrice.toFixed(2);
            getPlan.retail = newRetailPrice;
        }

        res.json(getPlan);
    } catch (err) {
        console.error(err.response ? err.response.data : err);
        res.status(500).json({
            error: "Error when fetching a plan"
        });
    }
};

export const getAllRegions = async (req, res, next) => {

    try {
        const response = await newRequestService.get(`/regions`)
        res.json(response.data);
    }

    catch(err) {
        console.log(err)
        console.error(err.response.data)
        res.status(500).json({
            error:"Error when fetching regions"
        })
    }
}

