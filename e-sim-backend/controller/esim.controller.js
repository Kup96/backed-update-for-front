import newRequestService from "../services/newRequest.js";

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
        res.json(response.data);
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
        res.json(response.data);
    }

    catch(err) {
        console.error(err.response.data)
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
        res.json(response.data);
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
        res.json(response.data);
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

    const {planSlug} = req.body;
    try {
        const response = await newRequestService.post(`/purchases`,{slug:planSlug})
        res.json(response.data);
    }

    catch(err) {
        console.error(err.response.data)
        res.status(500).json({
            error:"Error when purchasing a plan"
        })
    }
}

export const getPurchasesDetailsById = async (req, res, next) => {

    const {id} = req.params;
    try {
        const response = await newRequestService.get(`/purchases/${id}`)
        res.json(response.data);
    }

    catch(err) {
        console.error(err.response.data)
        res.status(500).json({
            error:"Error when fetching a plan"
        })
    }
}

export const getAllRegions = async (req, res, next) => {

    try {
        const response = await newRequestService.get(`/regions`)
        res.json(response.data);
    }

    catch(err) {
        console.error(err.response.data)
        res.status(500).json({
            error:"Error when fetching regions"
        })
    }
}

