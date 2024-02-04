const express = require('express');
const mongoose = require('mongoose');
const nodeMailer = require('nodemailer');
const requireAuth = require('../middlewares/requireAuth');
const Order = mongoose.model('Order');
const User = mongoose.model('User');

const router = express.Router();

router.use(requireAuth);

router.post('/expressbilling/apis/order', async (req, res) => {
    try {
        //var items = req.body.order;
        console.log('array:', req.body);
        console.log('user:', req.user.name);
        const order = new Order();
        order.userId = req.user._id;
        var d = new Date();
        order.createDate = d;
        order.paymentStatus = false;
        order.total = req.body.total;
        order.savings = req.body.savings;
        order.items = req.body.order;
        await order.save();

        console.log('Saved order:', order);
        res.send(order);
    }
    catch (err) {
        console.log('error while adding list');
        res.status(400).send('Bad data.');
    }
});

router.get('/expressbilling/apis/order', async (req, res) => {
    //console.log(req.query.id);
    console.log('id:', req.query.id);
    try {
        var order = await Order.findOne({ _id: req.query.id });
        console.log(order);
        res.send(order);
    }
    catch (err) {
        console.log('Could not find items of the list.', err);
        res.send(400).send('Bad Request');
    }
});

router.get('/expressbilling/apis/orders', async (req, res) => {
    try {
        var orders = await Order.find({ userId: req.user._id }).sort({ 'createDate': -1 });
        var order = [];
        for (var i in orders) {
            var items = 0;
            for (var j in orders[i].items) {
                items++;
            }
            //console.log(i,'=',items);
            order.push({ ...orders[i]._doc, items });
        }
        res.send(order);
    }
    catch (err) {
        console.log('Could not find items of the list.', err);
        res.send(502).send('Something went wrong.');
    }
});

router.post('/expressbilling/apis/order/updatePaymentStatus', async (req, res) => {
    try {
        console.log(req.body);
        var d = new Date();
        await Order.updateOne({ _id: req.body.id },
            {
                $set: {
                    paymentStatus: true,
                    paymentMode: req.body.mode,
                    createDate: d
                }
            });
        const user = await User.findOne({ _id: req.user._id }, { email: 1, _id: 0 });
        const order = await Order.findOne({ _id:req.body.id });
        sendEmail(user, order);
        res.send('Payment complete');
    }
    catch (err) {
        console.log(err);
        res.status(400).send('Cannot modify quantity.');
    }
});

const sendEmail = async (user, order) => {
    try {
        var items = '';
        var d = new Date();
        if (order) {
            for (var i in order.items) {
                items += `
            <tr class="item">
            <td>
                ${order.items[i].title}
            </td>
            <td>
                ₹${order.items[i].rate}
            </td>
            </tr>`
            }
            let transporter = nodeMailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    // should be replaced with real sender's account
                    user: 'expressbilling02@gmail.com',
                    pass: 'bhumi@1601'
                }
            });
            let mailOptions = {
                // should be replaced with real recipient's account
                to: user.email,
                subject: 'Invoice Express Billing',
                text: 'For clients with plaintext support only',
                html: `
                            <!doctype html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <title>Invoice</title>
                                <style>
                                .invoice-box {
                                    max-width: 800px;
                                    margin: auto;
                                    padding: 30px;
                                    border: 1px solid #eee;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, .15);
                                    font-size: 16px;
                                    line-height: 24px;
                                    font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                                    color: #555;
                                }
                                .invoice-box table {
                                    width: 100%;
                                    line-height: inherit;
                                    text-align: left;
                                }
                                .invoice-box table td {
                                    padding: 5px;
                                    vertical-align: top;
                                }
                                .invoice-box table tr td:nth-child(2) {
                                    text-align: right;
                                }
                                .invoice-box table tr.top table td {
                                    padding-bottom: 20px;
                                }
                                .invoice-box table tr.top table td.title {
                                    font-size: 45px;
                                    line-height: 45px;
                                    color: #333;
                                }
                                .invoice-box table tr.information table td {
                                    padding-bottom: 40px;
                                }
                                .invoice-box table tr.heading td {
                                    background: #eee;
                                    border-bottom: 1px solid #ddd;
                                    font-weight: bold;
                                }
                                .invoice-box table tr.details td {
                                    padding-bottom: 20px;
                                }
                                .invoice-box table tr.item td{
                                    border-bottom: 1px solid #eee;
                                }
                                .invoice-box table tr.item.last td {
                                    border-bottom: none;
                                }
                                .invoice-box table tr.total td:nth-child(2) {
                                    border-top: 2px solid #eee;
                                    font-weight: bold;
                                }
                                @media only screen and (max-width: 600px) {
                                    .invoice-box table tr.top table td {
                                        width: 100%;
                                        display: block;
                                        text-align: center;
                                    }
                                    .invoice-box table tr.information table td {
                                        width: 100%;
                                        display: block;
                                        text-align: center;
                                    }
                                }
                                /** RTL **/
                                .rtl {
                                    direction: rtl;
                                    font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
                                }
                                .rtl table {
                                    text-align: right;
                                }
                                .rtl table tr td:nth-child(2) {
                                    text-align: left;
                                }
                                </style>
                            </head>
                            <body>
                    <div class="invoice-box">
                        <table cellpadding="0" cellspacing="0">
                            <tr class="top">
                                <td colspan="2">
                                    <table>
                                        <tr>
                                            <td class="title">
                                                <h3 style="font-family:cursive;">Express Billing</h3>
                                            </td>
                                            <td>
                                                <p style="color: rgba(85, 73, 206, 1);font-weight: 600;">Created: ${d.toDateString()}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr class="information">
                                <td colspan="2">
                                    <table>
                                        <tr>
                                            <td>
                                                Sparksuite, Inc.<br>
                                                12345 Sunny Road<br>
                                                Sunnyville, CA 12345
                                            </td>
                                            <td>
                                                Intorque<br>
                                                Biraj Shah<br>
                                                birajshah1809@gmail.com
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr class="heading">
                                <td>
                                    Payment Method
                                </td>
                                <td>
                                    Online
                                </td>
                            </tr>
                            <tr class="details">
                                <td>
                                    PAYYOU
                                </td>
                                <td>
                                    ₹${order.total}
                                </td>
                            </tr>
                            <tr class="heading">
                                <td>
                                    Item
                                </td>
                                <td>
                                    Price
                                </td>
                            </tr>
                            `+ `
                            ${items}
                            <tr class="total">
                                <td></td>
                                <td>
                                Total: ₹${order.total}
                                </td>
                            </tr>
                        </table>
                    </div>
                    <h5>Order ID:</h5>
                    <p>${order._id}</p>
                </body>
            </html>`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(400).send('Cannot modify quantity.');
    }
};

module.exports = router;