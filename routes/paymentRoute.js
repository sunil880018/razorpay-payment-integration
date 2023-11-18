const express = require('express');
const payment_route = express();

const bodyParser = require('body-parser');
payment_route.use(bodyParser.json());
payment_route.use(bodyParser.urlencoded({ extended:false }));

const path = require('path');

payment_route.set('view engine','ejs');
payment_route.set('views',path.join(__dirname, '../views'));

// payment_route.use('../utils', express.static('utils/encription.js', { 'extensions': ['js'] }));

const paymentController = require('../controllers/paymentController');

payment_route.get('/', paymentController.renderProductPage);

// order creation
payment_route.post('/createOrder', paymentController.createOrder);
payment_route.get('/order',paymentController.getOrder);
payment_route.get('/fetchPaymentByOrder',paymentController.fetchPaymentByOrder);
payment_route.post('/verifyPayment',paymentController.verifyPayment);

// customer
payment_route.post('/createCustomer', paymentController.createCustomer);
payment_route.put('/editCustomer',paymentController.editCustomerDetails);
payment_route.get('/fetchCustomerById',paymentController.getCustomerDetailsById);

// plans
payment_route.post('/createPlan',paymentController.createPlans);
payment_route.get('/plan',paymentController.getPlanById)

// subscription

payment_route.post('/createSubscription',paymentController.createSubscription);
payment_route.get('/subscription',paymentController.getSubscriptionById);

module.exports = payment_route;