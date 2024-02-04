const express = require('express');
const mongoose = require('mongoose');
const nodeMailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const UserImage = mongoose.model('UserImage');
const router = express.Router();

router.get('/expressbilling/apis/user', async (req, res) => {
    console.log(req.user._id);
    const id = req.user._id;
    try {
        var user = await User.findOne({ _id: id });
        console.log(user);
        res.send(user);
    }
    catch (err) {
        console.log('Could not find items of the list.', err);
        res.send(400).send('Bad Request');
    }
}
);

router.post('/expressbilling/apis/userImage', async (req, res) => {
    //console.log(req.body);
    try {
        const userImage = new UserImage();
        userImage.image = req.body.image;
        await userImage.save();
        res.send('Image addedd.');
    }
    catch (err) {
        console.log('error while adding user image', err);
        res.status(402).send('Invalid Input');
    }
});

router.get('/expressbilling/apis/user-images', async (req, res) => {
    //console.log(req.body);
    try {
        var images = await UserImage.find({}, { image: 1, _id: 0 });
        console.log('images:', images);
        res.send(images);
    }
    catch (err) {
        console.log('error in fetching images:', err);
        res.status(501).send('Internal error');
    }
});

router.get('/confirm-email', async (req, res) => {
    console.log(req.email,req.user);
    try {
        var d = new Date();
        await User.updateOne({ _id: req.user._id },
            {
                $set: {
                    email : req.email
                }
            });
        res.send(`<html>
        <head>
           <style>
              @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
     :root {
       --primary-color: #f5826e;
     }
     * {
       margin: 0;
       padding: 0;
       box-sizing: border-box;
       font-family: 'Roboto', sans-serif;
       letter-spacing: 0.5px;
     }
     body {
       background-color: var(--primary-color);
     }
     .invoice-card {
       display: flex;
       flex-direction: column;
       position: absolute;
       padding: 10px 2em;
       top: 50%;
       left: 50%;
       transform: translate(-50%, -50%);
       min-height: 20em;
       width: 30em;
       background-color: #fff;
       border-radius: 5px;
       box-shadow: 0px 10px 30px 5px rgba(0, 0, 0, 0.15);
     }
     .invoice-card > div {
       margin: 5px 0;
     }
     .invoice-title {
       flex: 1;
     }
     .invoice-title #date {
       display: block;
       margin: 8px 0;
       font-size: 12px;
     }
     .invoice-title #main-title {
       display: flex;
       justify-content: space-between;
       margin-top: 2em;
     }
     .invoice-title #main-title h4 {
       letter-spacing: 2.5px;
     }
     .invoice-title span {
       color: rgba(0, 0, 0, 0.4);
     }
     .invoice-details {
       flex: 1;
       display: flex;
       align-items: center;
     }
     .invoice-table {
       width: 100%;
       border-collapse: collapse;
     }
     .invoice-table thead tr td {
       font-size: 12px;
       letter-spacing: 1px;
       color: grey;
       padding: 8px 0;
     }
     .invoice-table tbody tr td {
         padding: 8px 0;
         letter-spacing: 0;
         color: #434343;
         font-size: smaller;
     }
     .invoice-table .row-data #unit {
       text-align: center;
     }
     .invoice-table .row-data span {
       font-size: 13px;
       color: rgba(0, 0, 0, 0.6);
     }
     .invoice-footer {
         flex: 2;
         display: flex;
         justify-content: center;
         align-items: flex-start;
         flex-direction: column;
     }
     .invoice-footer #later {
       margin-right: 5px;
     }
     .btn {
       border: none;
       padding: 5px 0px;
       background: none;
       cursor: pointer;
       letter-spacing: 1px;
       outline: none;
     }
     .btn.btn-secondary {
       color: rgba(0, 0, 0, 0.3);
     }
     .btn.btn-primary {
       color: var(--primary-color);
     }
     .btn#later {
       margin-right: 2em;
     }
           </style>
        </head>
        <body>
           <div class="invoice-card">
       <div class="invoice-title">
         <div id="main-title">
           <h4>EXPRESS BILLING</h4>
         </div>
         <span id="date">${d.toDateString()}</span>
       </div>
       <div class="invoice-details">
         <table class="invoice-table">
             <tr class="row-data">
               <td>Your email address has been updated successfully.</td>
             </tr>
             <tr class="row-data">
               <td><b>Thank You</b> for choosing us.</td>
             </tr>
           </tbody>
         </table>
       </div>
       <div class="invoice-footer">
         <button class="btn btn-secondary" id="later">With regards</button>
         <button class="btn btn-primary">Team Express Billing</button>
       </div>
     </div>
        </body>
     </html>`);
    }
    catch (err) {
        console.log('error in updating email:', err);
        res.status(501).send('Request timed out');
    }
});

router.post('/expressbilling/apis/user/update-password', async (req, res) => {
    console.log(req.body);

    const { password, newPassword } = req.body;
    if (!newPassword || !password) {
        return res.status(422).send({ error: 'Must provide password.' });
    }

    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
        console.log('no such user');
        return res.status(422).send({ error: 'Invalid request.' });
    }
    try {
        await user.comparePassword(password);
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return err;
            }
            bcrypt.hash(newPassword, salt, async (err, hash) => {
                if (err) {
                    return err;
                }
                console.log('hash:', hash);
                await User.updateOne({ _id: req.user._id },
                    {
                        $set: {
                            password: hash
                        }
                    });
                return hash;
            });
        });
        res.send('Password updated.');
    } catch (err) {
        console.log(err);
        return res.status(422).send({ error: 'Invalid password.' });
    }
});

router.post('/expressbilling/apis/user/update-details', async (req, res) => {
    try {
        console.log(req.body.user.name, req.body.user.email, req.body.user.mob);
        await User.updateOne({ _id: req.user._id },
            {
                $set: {
                    name: req.body.user.name.trim(),
                    mob: req.body.user.mob,
                    avatar :req.body.user.avatar
                }
            });
        var user = await User.findById(req.user._id);
        console.log('user:', user);
        if (user.email != req.body.user.email) {
            var existsEmail = await User.findOne({ email: req.body.user.email });
            if (existsEmail) {
                res.send('Email already in use.');
            }
            else {
                try {
                    var d = new Date();
                    const token = jwt.sign({ userId: req.user._id ,email: req.body.user.email}, 'MY_SECRET_KEY', { expiresIn: Math.floor(Date.now() / 1000) + (60 * 60) });
                    let transporter = nodeMailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: 'expressbilling02@gmail.com',
                            pass: 'bhumi@1601'
                        }
                    });
                    let mailOptions = {
                        to: req.body.user.email,
                        subject: 'Confirm email',
                        html: `<html>
                        <head>
                           <style>
                              .banner-color {
                              background-color: #eb681f;
                              }
                              .title-color {
                              color: #0066cc;
                              }
                              .button-color {
                              background-color: #0066cc;
                              }
                              @media screen and (min-width: 500px) {
                              .banner-color {
                              background-color: #0066cc;
                              }
                              .title-color {
                              color: #eb681f;
                              }
                              .button-color {
                              background-color: #eb681f;
                              }
                              }
                           </style>
                        </head>
                        <body>
                           <div style="background-color:#ececec;padding:0;margin:0 auto;font-weight:200;width:100%!important">
                              <table align="center" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                 <tbody>
                                    <tr>
                                       <td align="center">
                                          <center style="width:100%">
                                             <table bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;max-width:512px;font-weight:200;width:inherit;font-family:Helvetica,Arial,sans-serif" width="512">
                                                <tbody>
                                                   <tr>
                                                      <td bgcolor="#F3F3F3" width="100%" style="background-color:#f3f3f3;padding:12px;border-bottom:1px solid #ececec">
                                                         <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;width:100%!important;font-family:Helvetica,Arial,sans-serif;min-width:100%!important" width="100%">
                                                            <tbody>
                                                               <tr>
                                                                  <td align="left" valign="middle" width="50%"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:14px;line-height:20px;font-family:sans-serif;font-weight:bold">Express Billing</span></td>
                                                                  <td valign="middle" width="50%" align="right" style="padding:0 0 0 10px"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px">${d.toDateString()}</span></td>
                                                                  <td width="1">&nbsp;</td>
                                                               </tr>
                                                            </tbody>
                                                         </table>
                                                      </td>
                                                   </tr>
                                                   <tr>
                                                      <td align="left">
                                                         <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                            <tbody>
                                                               <tr>
                                                                  <td width="100%">
                                                                     <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                        <tbody>
                                                                           <tr>
                                                                              <td align="center" bgcolor="#8BC34A" style="padding:20px 48px;color:#ffffff" class="banner-color">
                                                                                 <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                                    <tbody>
                                                                                       <tr>
                                                                                          <td align="center" width="100%">
                                                                                             <h1 style="padding:0;margin:0;color:#ffffff;font-weight:500;font-size:20px;line-height:24px">Confirm your email address</h1>
                                                                                          </td>
                                                                                       </tr>
                                                                                    </tbody>
                                                                                 </table>
                                                                              </td>
                                                                           </tr>
                                                                           <tr>
                                                                              <td align="center" style="padding:20px 0 10px 0">
                                                                                 <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                                    <tbody>
                                                                                       <tr>
                                                                                          <td align="center" width="100%" style="padding: 0 15px;text-align: justify;color: rgb(76, 76, 76);font-size: 12px;line-height: 18px;">
                                                                                             <h3 style="font-weight: 600; padding: 0px; margin: 0px; font-size: 16px; line-height: 24px; text-align: center;" class="title-color">Hi ${req.body.user.name.split(" ")[0]},</h3>
                                                                                             <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;color: black;">Once you've confirmed your email address, you'll be proficient to use all the features of express billing application using this email address.</p>
                                                                                             <div style="font-weight: 200; text-align: center; margin: 25px;"><a href='http://af46de88797f.ngrok.io/confirm-email?token=${token}' style="padding:0.6em 1em;border-radius:600px;color:#ffffff;font-size:14px;text-decoration:none;font-weight:bold" class="button-color">Click to confirm</a></div>
                                                                                          </td>
                                                                                       </tr>
                                                                                    </tbody>
                                                                                 </table>
                                                                              </td>
                                                                           </tr>
                                                                           <tr>
                                                                           </tr>
                                                                           <tr>
                                                                           </tr>
                                                                        </tbody>
                                                                     </table>
                                                                  </td>
                                                               </tr>
                                                            </tbody>
                                                         </table>
                                                      </td>
                                                   </tr>
                                                   <tr>
                                                      <td align="left">
                                                         <table bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" style="padding:0 24px;color:#999999;font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                            <tbody>
                                                               <tr>
                                                                  <td align="center" width="100%">
                                                                     <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                        <tbody>
                                                                           <tr>
                                                                              <td align="center" valign="middle" width="100%" style="border-top:1px solid #d9d9d9;padding:12px 0px 20px 0px;text-align:center;color:#4c4c4c;font-weight:200;font-size:12px;line-height:18px">Regards,
                                                                                 <br><b>Team Express Billing</b>
                                                                              </td>
                                                                           </tr>
                                                                        </tbody>
                                                                     </table>
                                                                  </td>
                                                               </tr>
                                                               <tr>
                                                                  <td align="center" width="100%">
                                                                     <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;font-family:Helvetica,Arial,sans-serif" width="100%">
                                                                        <tbody>
                                                                           <tr>
                                                                              <td align="center" style="padding:0 0 8px 0" width="100%"></td>
                                                                           </tr>
                                                                        </tbody>
                                                                     </table>
                                                                  </td>
                                                               </tr>
                                                            </tbody>
                                                         </table>
                                                      </td>
                                                   </tr>
                                                </tbody>
                                             </table>
                                          </center>
                                       </td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </body>
                     </html>`
                    }
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                    });
                    res.send('Confirm your email address.');
                } catch (err) {
                    console.log(err);
                    res.send('Invalid email address.');
                }
            }

        }
        else
            res.send(req.body);
    }
    catch (err) {
        res.status(422).send('Invalid request.')
    }
})

module.exports = router;