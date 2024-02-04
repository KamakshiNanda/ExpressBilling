const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = (req, res, next) => {
	const { authorization } = req.headers;
	console.log(req.url);
	// authorization === 'Bearer lahygdhsihuyhsytws'
	//console.log('inside require auth:',req.url);
	if(!authorization) {
		if(!req.url.startsWith('/confirm-signup')&&!req.url.startsWith('/payment-complete') && !req.url.startsWith('/payment-cancel')
		&& !req.url.startsWith('/forgot-password') && !req.url.startsWith('/reset-password') && !req.url.startsWith('/change-password') &&
		!req.url.startsWith('/signup') && !req.url.startsWith('/signin') && !req.url.startsWith('/confirm-email')&& !req.url.startsWith('/expressbilling/apis/user-images'))
		{
			return res.status(401).send({ error: 'You must be logged in.' });
		}
		else if(req.url.startsWith('/confirm-email'))
		{
			jwt.verify(req.query.token, 'MY_SECRET_KEY', async (err, payload) => {
				if (err){
					return res.status(401).send({error: 'Request timed out.'});
				}
				const { userId, email } = payload;
				const user = await User.findById(userId);
				req.user = user;
				req.email = email;
				next();
			});
		}
		else
		{
			console.log(req.url);
			next();
		}
	}
	else{
		const token= authorization.replace('Bearer ', '');
		jwt.verify(token, 'MY_SECRET_KEY', async (err, payload) => {
			if (err){
				return res.status(401).send({error: 'You must be logged in.'});
			}
			const { userId } = payload;
			const user = await User.findById(userId);
			req.user = user;
			next();
		});
	}
};