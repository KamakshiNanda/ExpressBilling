const express = require('express');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const router = express.Router();

router.post('/signup', async (req, res) => {
   console.log('got the request.');
   const { name, email, mob, password, avatar } = req.body;
   try {
      console.log(name, email, mob, password, avatar);
      var em = await User.findOne({ email });
      if (em) {
         console.log('Email address already in use.', em);
         res.status(422).send('Email address already in use.');
      }
      else {
         try {
            var d = new Date();
            const token = jwt.sign({ name, email, mob, password, avatar },
               'MY_SECRET_KEY', { expiresIn: Math.floor(Date.now() / 1000) + (60 * 60) });
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
               to: email,
               subject: 'Confirm your email address',
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
                                                                                             <h3 style="font-weight: 600; padding: 0px; margin: 0px; font-size: 16px; line-height: 24px; text-align: center;" class="title-color">Hi ${name.split(" ")[0]},</h3>
                                                                                             <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;color: black;">Confirm your email address in order to complete your sign up proccess.
                                                                                             After that you'll be proficient to use all the features of express billing application using this email address.</p>
                                                                                             <div style="font-weight: 200; text-align: center; margin: 25px;"><a href='http://af46de88797f.ngrok.io/confirm-signup?token=${token}' style="padding:0.6em 1em;border-radius:600px;color:#ffffff;font-size:14px;text-decoration:none;font-weight:bold" class="button-color">Click to confirm</a></div>
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
   catch (err) {
      res.status(422).send('Invalid request.')
   }
});

router.get('/confirm-signup', async (req, res) => {
   jwt.verify(req.query.token, 'MY_SECRET_KEY', async (err, payload) => {
      if (err) {
         return res.status(401).send({ error: 'Request timed out.' });
      }
      const { name, email, mob, password, avatar } = payload;
      try {
         var d = new Date();
         const user = new User({ name, email, mob, password, avatar, createDate: d });
         await user.save();
         console.log(user);
         //console.log('token generated');
         //const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
         //console.log(token);
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
                   <td>Your account has been created successfully.</td>
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
      } catch (err) {
         console.log(err);
         return res.status(422).send("This token in not valid.");
      }
   });
});

router.post('/signin', async (req, res) => {
   const { email, password } = req.body;
   console.log('got the request');
   if (!email || !password) {
      return res.status(422).send({ error: 'Must provide email and password.' });
   }

   const user = await User.findOne({ email });
   if (!user) {
      return res.status(422).send({ error: 'Invalid email or password.' });
   }
   try {
      await user.comparePassword(password);
      const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
      res.send({ token });
   } catch (err) {
      return res.status(422).send({ error: 'Invalid email or password.' });
   }
});

router.post('/forgot-password', async (req, res) => {
   console.log('got the request.');
   const { email } = req.body;
   try {
      console.log(email);
      var em = await User.findOne({ email });
      if (!em) {
         console.log('Email not registered.', em);
         res.send('Confirm your email address.');
      }
      else {
         try {
            var d = new Date();
            const token = jwt.sign({ email }, 'MY_SECRET_KEY', { expiresIn: Math.floor(Date.now() / 1000) + (60 * 60) });
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
               to: email,
               subject: "Reset your Express Billing account's password",
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
                                                                                            <h1 style="padding:0;margin:0;color:#ffffff;font-weight:500;font-size:20px;line-height:24px">Reset Password</h1>
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
                                                                                            <h3 style="font-weight: 600; padding: 0px; margin: 0px; font-size: 16px; line-height: 24px; text-align: center;" class="title-color">Forgot your password?</h3>
                                                                                            <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;color: black;">
                                                                                            Don't worry, we've got your back.</p>
                                                                                            <div style="font-weight: 200; text-align: center; margin: 25px;"><a href='http://af46de88797f.ngrok.io/reset-password?token=${token}' style="padding:0.6em 1em;border-radius:600px;color:#ffffff;font-size:14px;text-decoration:none;font-weight:bold" class="button-color">Reset my password</a></div>
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
   catch (err) {
      res.status(422).send('Invalid request.')
   }
});

router.get('/reset-password', async (req, res) => {
   try {
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
                 .invoice-card>div {
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
                     margin-bottom: 20px;
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
                     /* align-items: center; */
                     flex-direction: column;
                 }
                 .invoice-table {
                     width: 100%;
                     border-collapse: collapse;
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
                 .form-control {
                     display: block;
                     width: 100%;
                     height: calc(2.25rem + 2px);
                     padding: .375rem .75rem;
                     font-size: 1rem;
                     line-height: 1.5;
                     color: #495057;
                     background-color: #fff;
                     background-clip: padding-box;
                     border: 1px solid #ced4da;
                     border-radius: .25rem;
                     transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
                 }
                 label {
                     display: inline-block;
                     margin-bottom: .5rem;
                 }
                 .form-group {
                     display: flex;
                     flex-direction: column;
                     margin-bottom: 10px;
                 }
             </style>
         </head>
         <body>
             <div class="invoice-card">
                 <div class="invoice-title">
                     <div id="main-title">
                         <h4>RESET PASSWORD</h4>
                     </div>
                 </div>
                 <form class="invoice-details" method='post' action="http://af46de88797f.ngrok.io/change-password?token=${req.query.token}" onsubmit="return validateForm()">
                     <div class="form-group">
                         <label for="password">New Password:</label>
                         <input type="password" class="form-control" id="pswd" placeholder="Enter password" name="password"
                             required>
                     </div>
                     <div class="form-group">
                         <label for="cf-password">Confirm password:</label>
                         <div class="form-group" style='display: flex;'>
                             <input type="password" class="form-control" id="cf-password" placeholder="Confirm password"
                                 name="newPassword" required>
                         </div>
                     </div>
                     <p style='margin-bottom: 20px;color: rgb(196, 29, 0);display: none;' id='error'>Both passwords should match.
                     </p>
                     <button type="submit" class="btn btn-default"
                         style="color: white;width: 40%;height: 36px;align-self: center; background-color: var(--primary-color);margin-bottom: 30px;">
                         Reset
                     </button>
                 </form>
             </div>
         </body>
         <script>
             function validateForm() {
                 var pswd = document.getElementById('pswd');
                 var cfpswd = document.getElementById('cf-password');
                 var error = document.getElementById('error');
                 console.log(pswd.value.length);
                 if (pswd.value.length <= 6) {
                     error.innerHTML = 'Password should contain atleast 6 characters.'
                     error.style.display = 'inherit';
                     return false;
                 }
                 else if (pswd.value != cfpswd.value) {
                     error.innerHTML = 'Both the passwords should match.'
                     error.style.display = 'inherit';
                     return false;
                 }
                 error.style.display = 'none';
                 return true;
             }
         </script>
         </html>`);
   } catch (err) {
      console.log(err);
      return res.status(422).send("This token in not valid.");
   }
});

router.post('/change-password', async (req, res) => {
   const { password, newPassword } = req.body;
   console.log(password);
   if (!newPassword || !password) {
      return res.status(422).send({ error: 'Must provide password.' });
   }
   try {
      console.log('password:', req.body.password, req.query.token);
      jwt.verify(req.query.token, 'MY_SECRET_KEY', async (err, payload) => {
         if (err) {
            return res.status(401).send({ error: 'Request timed out.' });
         }
         const { email } = payload;
         bcrypt.genSalt(10, (err, salt) => {
            if (err) {
               return err;
            }
            bcrypt.hash(password, salt, async (err, hash) => {
               if (err) {
                  return err;
               }
               console.log('hash:', hash);
               await User.updateOne({ email },
                  {
                     $set: {
                        password: hash
                     }
                  });
               return hash;
            });
         });
      });
      var d = new Date();
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
               <td>Your password has been updated successfully.</td>
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
   } catch (err) {
      console.log(err);
      return res.status(422).send({ error: 'No such email.' });
   }
});


module.exports = router;