const Razorpay = require('razorpay');
const { Encryption } = require('../utils/encription.js');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const {
    createHmac,
} = require('node:crypto');
class RazorpayConfig {
    constructor(apiKey, apiSecret) {
        this.razorpayInstance = new Razorpay({
            key_id: apiKey,
            key_secret: apiSecret,
        });
    }
    getRazorpayInstance() {
        return this.razorpayInstance;
    }
}
// const razorpayInstance = new Razorpay({
//     key_id: RAZORPAY_ID_KEY,
//     key_secret: RAZORPAY_SECRET_KEY
// });

// console.log(razorpayInstance)

const renderProductPage = async (req, res) => {

    try {

        res.render('product');

    } catch (error) {
        console.log(error.message);
    }

}

const createOrder = async (req, res) => {
    try {
        const amount = req.body.amount * 100
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        razorpayInstance.orders.create(options,
            (err, order) => {
                console.log('-----------order',order)
                if (!err) {
                    // const key = Encryption(RAZORPAY_ID_KEY)
                    res.status(200).send({
                        success: true,
                        msg: 'Order Created',
                        order_id: order.id,
                        amount: amount,
                        // key_id: key, // hash the key for security purpose
                        key_id: RAZORPAY_ID_KEY, // hash the key for security purpose
                        product_name: req.body.name,
                        description: req.body.description,
                        contact: "8567345632",
                        name: "Sandeep Sharma",
                        email: "sandeep@gmail.com",
                    });
                }
                else {
                    res.status(400).send({ success: false, msg: 'Something went wrong!', err: err });
                }
            }
        );

    } catch (error) {
        console.log(error.message);
    }
}

// define webhook

// step 1. install ngrok :  brew install ngrok/ngrok/ngrok
// step 2. run ngrok: ngrok http <port> , port will be same as backend server
// step 3. ngrok gives you a global link
// example: https://1b59-3-109-102-124.ngrok.io/verifyPayment
// step 4. set this link in razorpay webhook dashboard.


const verifyPayment = async (req, res) => {

    const { event, payload, account_id } = req.body;
    // Handle the Razorpay webhook event for payment failure
    if (event === 'payment.failed') {
        // Implement your payment failure handling logic here
        console.log('Payment Failed Event Received:', event);
        res.status(500).send('Payment failed.');
    } else {
        const secret = process.env.RAZORPAY_SECRET_KEY;
        const razorpay_signature = req.headers["x-razorpay-signature"];
        const hmac = createHmac('sha256', secret);
        hmac.update(JSON.stringify(req.body))
        const digest = hmac.digest("hex");
        if (digest === razorpay_signature) {
            res.status(200).send({ payload: payload, account_id: account_id, msg: 'payment successful' });
        } else {
            res.status(500).send({ payment_msg: 'payment wrong' });
        }

    }

}

const getOrder = async (req, res) => {
    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const order_id = req.body.order_id
        const order = await razorpayInstance.orders.fetch(order_id)
        return res.send({ order });
    } catch (err) {
        return res.send({ err });
    }

}

const fetchPaymentByOrder = async (req, res) => {
    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const order_id = req.body.order_id
        razorpayInstance.orders.fetchPayments(order_id, (err, paymentDetails) => {
            if (!err) {
                return res.send({ paymentDetails })
            } else {
                return res.send({ err })
            }
        })
    } catch (error) {
        return res.send({ error })
    }
}
// customer individuals or entities that make payments using the Razorpay platform. Customers are the end-users or buyers who initiate transactions and make payments for products or services. 
const createCustomer = async (req, res) => {
    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const name = req.body.name;
        const email = req.body.email;
        const contact = req.body.contact;
        const customer = await razorpayInstance.customers.create({ name, email, contact });
        return res.send({ customer });
    } catch (error) {
        return res.send({ error })
    }
}

const getCustomerDetailsById = async (req, res) => {
    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const customerId = req.body.customer_id;
        const customer = await razorpayInstance.customers.fetch(customerId);
        return res.send({ customer })
    } catch (error) {
        return res.send({ error });
    }
}

const editCustomerDetails = async (req, res) => {
    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const customerId = req.body.customer_id;
        const CustomerDetailsObj = {
            email: req.body.email,
            name: req.body.name,
            contact: req.body.contact
        }
        const customerEditedResponse = await razorpayInstance.customers.edit(customerId, CustomerDetailsObj)
        return res.send({ customerEditedResponse })
    } catch (error) {
        return res.send({ error });
    }
}

// Razorpay Subscription allows you to charge your customers periodically based on the plan they have choosen.

// Its an automated process, requires one time approval from the customers by authentication transaction from the card. Once the card is successfully authenticated, the card is charged automatically at the start of every billing cycle.
const createPlans = async (req, res) => {
    // {
    //     "period": "weekly",
    //     "interval": 1,
    //     "item": {
    //       "name": "Test plan - Weekly",
    //       "amount": 69900,
    //       "currency": "INR",
    //       "description": "Description for the test plan - Weekly"
    //     },
    //     "notes": {
    //       "notes_key_1": "Tea, Earl Grey, Hot",
    //       "notes_key_2": "Tea, Earl Grey… decaf."
    //     }
    //   }
    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const period = req.body.period;// combined with interval, defines the frequency. like daily,weekly,monthly,yearly etc.
        const interval = req.body.interval; // This, combined with period, defines the frequency. If the billing cycle is 2 months, the value should be 2.
        const item = {
            planName: eq.body.item.planName,
            amount: req.body.amount,
            currency: req.body.currency,
            description: req.body.description
        }
        razorpayInstance.plans.create({ period, interval, item }, (error, planDetails) => {
            if (error) {
                return res.send({ error });
            } else {
                return res.send({ planDetails });
            }
        })
    } catch (error) {
        return res.send({ error })
    }
}

const getPlanById = async (req, res) => {
    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const planId = req.plan_id;
        const planDetails = await razorpayInstance.plans.fetch(planId);
        return res.send({ planDetails });
    } catch (error) {
        return res.send({ error })
    }
}

const createSubscription = async (req, res) => {
    // {
    //     "plan_id":"{plan_id}",
    //     "total_count":6,
    //     "quantity":1,
    //     "start_at":1735689600,
    //     "expire_by":1893456000,
    //     "customer_notify":1,
    //     "addons":[
    //       {
    //         "item":{
    //           "name":"Delivery charges",
    //           "amount":30000,
    //           "currency":"INR"
    //         }
    //       }
    //     ],
    //     "offer_id":"{offer_id}",
    //     "notes":{
    //       "notes_key_1":"Tea, Earl Grey, Hot",
    //       "notes_key_2":"Tea, Earl Grey… decaf."
    //     }
    //   }


    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const planId = req.body.plan_id;
        const totalCount = req.body.total_count;
        const quantity = req.body.quantity;
        const startAt = Math.floor(new Date().getTime() / 1000);//  Convert the date to a Unix timestamp in seconds
        const expireBy = new Date(startAt.getTime() + 30 * 24 * 60 * 60 * 1000); // added 30 days
        const customerNotify = 1;
        const item = {
            name: eq.body.item.name,
            amount: req.body.amount,
            currency: req.body.currency,
        }
        const offerId = "offer_8784"
        const subscription = await razorpayInstance.subscriptions.create({ planId, totalCount, quantity, startAt, expireBy, customerNotify, item, offerId });
        return res.send({ subscription });
    } catch (error) {
        return res.send({ error })
    }

}

const getSubscriptionById = async (req, res) => {
    try {
        const razorpayInstance = new RazorpayConfig(RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY).getRazorpayInstance();
        const subscriptionId = req.body.subscription_id;
        const subscriptionDetails = await razorpayInstance.subscriptions.fetch(subscriptionId);
        return res.send({ subscriptionDetails });
    } catch (error) {
        return res.send({ error })
    }
}
module.exports = {
    renderProductPage,
    createOrder,
    getOrder,
    verifyPayment,
    fetchPaymentByOrder,
    createCustomer,
    getCustomerDetailsById,
    editCustomerDetails,
    createPlans,
    getPlanById,
    createSubscription,
    getSubscriptionById
}