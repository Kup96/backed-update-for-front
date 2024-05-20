import User from "../models/UserSchema";

const SECRET = process.env.DB_SECRET;


async function profile(req, res) {
    const { headers } = req;
    const authorization = headers.authorization || null;

    try {
        const decoded = jwt.verify(authorization.replace('Bearer ', ''), SECRET);
        const userId = decoded.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            res.status(401).json("User not found");
        }

        // const welcomeMessage = `Welcome, ${user.FirstName}!`;

        const response = {
            user
        };

        res.status(200).json({response})
    }catch (error) {
        console.error(error);
        res.status(401).json("Error get User..");
    }
}



async function getProducts(req, res) {
    const { headers } = req;
    const authorization = headers.authorization || null;
    let userCountryCode = null;

    try {
        if (authorization) {
            const decoded = jwt.verify(authorization.replace('Bearer ', ''), SECRET);
            const userId = decoded.id;

            if (!decoded) {
                return res.status(401).json("User not found");
            }

            const user = await User.findById(userId);
            userCountryCode = user.Country;
        }

        const limit = parseInt(req.query.limit) || 10; 
        const offset = parseInt(req.query.offset) || 0;
        const baseUrl = process.env.GIFTCARDS_BASE_URL;
        let productsResponse;

        if (userCountryCode) {
            productsResponse = await axios.get(`${baseUrl}/countries/${userCountryCode}/products`, {
                headers: {
                    Accept: 'application/com.reloadly.giftcards-v1+json',
                    Authorization: `Bearer ${process.env.TOKEN_CARD_GIFTS}`
                }
            });
        } else {
            productsResponse = await axios.get(`${baseUrl}/products`, { 
                headers: {
                    Accept: 'application/com.reloadly.giftcards-v1+json',
                    Authorization: `Bearer ${process.env.TOKEN_CARD_GIFTS}`
                }
            });
        }

        let products = productsResponse.data;

        products = products.slice(offset, offset + limit);

        products.forEach(product => {
            if (product.fixedRecipientDenominations) {
                product.fixedRecipientDenominations = product.fixedRecipientDenominations.map(price => Math.round(price * 1.40));
            }
        });

        res.status(200).json(products);

    } catch (error) {
        console.error('Помилка при отриманні продуктів:', error.message);
        res.status(500).json('Error server');
    }
}
async function getProductById(req, res) {
    try {
        const producId = req.params.producId;

        const baseUrl = process.env.GIFTCARDS_BASE_URL;
        const productsResponse = await axios.get(`${baseUrl}/products/${producId}`, {
            headers: {
                Accept: 'application/com.reloadly.giftcards-v1+json',
                Authorization: `Bearer ${process.env.TOKEN_CARD_GIFTS}`
            }
        });

        let products =[productsResponse.data]; 

        if (!productsResponse.data) {
            return res.status(404).json('Product not found or is no longer available, please contact support');
        }

        products.forEach(product => {
            if (product.fixedRecipientDenominations) {
                product.fixedRecipientDenominations = product.fixedRecipientDenominations.map(price => Math.round(price * 1.40));
            }
        });

        res.status(200).json(products);

    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            return res.status(error.response.status || 500).json(error.response.data.message);
        } else {
            console.error('Помилка при отриманні продукта за ID:', error.message);
            return res.status(500).json('Error server');
        }
    }
}

async function buyCards(req, res) {
    const { headers, body } = req;
    const authorization = headers.authorization || null;

    try {
        if (!authorization) {
            return res.status(401).json("Unauthorized");
        }
        const baseUrl = process.env.GIFTCARDS_BASE_URL;

        const decoded = jwt.verify(authorization.replace('Bearer ', ''), SECRET);
        const userId = decoded.id;

        if (!decoded) {
            return res.status(401).json("User not found");
        }
        
        const checkBalanceApi = await axios.get(
            `${baseUrl}/accounts/balance`,
            {
                headers: {
                    Accept: 'application/com.reloadly.giftcards-v1+json',
                    Authorization: `Bearer ${process.env.TOKEN_CARD_GIFTS}`,
                }
            }
        );
    
        const statusbalance = checkBalanceApi.data;
    
        if (statusbalance.balance < process.env.MINIMUM_BALANCE) {
            return res.status(400).json({
                error: "Sorry, we are currently experiencing technical difficulties and cannot process orders. Please try again later."
            });
        }
    
        console.log(statusbalance);
        const user = await User.findById(userId);
        const userEmail = user.email;
        const userCountryCode = user.Country; 

        if (!userEmail) {
            return res.status(400).json("User email not found");
        }

        const items = body.items;

        let totalAmount = 0;
        const products = items.map(item => {
            const unitPriceWithFee = item.unitPrice * 1.40;     
            const itemTotal = unitPriceWithFee * item.quantity * 10;
            totalAmount += itemTotal;
            return {
                ...item,
                recipientEmail: user.email,
                recipientPhoneDetails: {
                    ...item.recipientPhoneDetails,
                    countryCode: userCountryCode 
                },
                customIdentifier: uuidv4()
            };
        });
        console.log(totalAmount)
        if (user.balance < totalAmount) {
            return res.status(400).json("Insufficient funds");
        }

        user.balance -= totalAmount;

        await user.save();

        const purchasePromises = products.map(async product => {
            try {
                const response = await axios.post(`${baseUrl}/orders`, product, {
                    headers: {
                        Accept: 'application/com.reloadly.giftcards-v1+json',
                        Authorization: `Bearer ${process.env.TOKEN_CARD_GIFTS}`,
                    }
                });
        
                const transactionId = response.data.transactionId;
        
                user.TransactionIdProducts.push(transactionId);
                return response.data;

            } catch (error) {
                console.error('Error purchasing card:', error.message);
            }
        });
        
        const results = await Promise.all(purchasePromises);
        
        await user.save();

        res.status(200).json(results);
    } catch (error) {
        console.error('Error while buying cards:', error.message);
        res.status(500).json('Server error');
    }
}
module.exports = { 
    profile,
    catalogs,
    getProducts,
    getProductById,
    buyCards
}