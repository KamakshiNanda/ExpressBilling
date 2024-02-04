const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const paypal = require('paypal-rest-sdk');

const router = express.Router();

router.use(requireAuth);
var totalAmount = 50;

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AacFAMn68U6lGNVCjHFOxfPSVmCLSD5dpX47OYD_FNRJIkLYoW5qBLXTHDQYmQttkAIR8iQgBS8zUc1K',
    'client_secret': 'ENPXqXiHlMJjOyZhHBI3sN8Cdba16pet5-QMsYrwMZlChneroT-ETNM9fVvxb18aVlEVcKDWa72T5A1q'
});

router.get('/expressbilling/payment', (req, res) => {
    console.log('got the request');
    res.render('payment');
});

router.get('/expressbilling/paypal', (req, res) => {
    console.log('got the request');
    console.log(req.query.total);
    if(req.query.total)
        totalAmount= req.query.total;
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://af46de88797f.ngrok.io/payment-complete",
            "cancel_url": "http://af46de88797f.ngrok.io/payment-cancel"
        },
        "transactions": [{
            "item_list": {
                "items": []
            },
            "amount": {
                "currency": "USD",
                "total": `${(totalAmount/70).toFixed(2)}`
            },
            "description": "Pay to Express Billing."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log(error);
            res.status(401).send('bad data');
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
});

router.get('/payment-complete', (req, res) => {
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: `${(totalAmount/70).toFixed(2)}`
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });
});

router.get('/payment-cancel', (req,res) => {
    res.render('cancel');
});

module.exports = router;