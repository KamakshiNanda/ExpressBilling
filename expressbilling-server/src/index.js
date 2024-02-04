require('./models/User');
require('./models/Supplier');
require('./models/Category');
require('./models/GST');
require('./models/Item');
require('./models/Demo');
require('./models/List');
require('./models/ListCategory');
require('./models/Feedback');
require('./models/Order');
require('./models/UserImage');

const express= require('express');
const mongoose= require('mongoose');
const bodyParser= require('body-parser');
const authRoutes= require('./routes/authRoutes');
const demoRoutes= require('./routes/demoRoutes');
const supplierRoutes= require('./routes/supplierRoutes');
const categoryRoutes= require('./routes/categoryRoutes');
const inventoryRoutes= require('./routes/inventoryRoutes');
const gstRoutes = require('./routes/GSTRoutes');
const searchRoutes = require('./routes/searchRoutes');
const listRoutes = require('./routes/listRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const engines = require("consolidate");

const app=express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(paymentRoutes);
app.use(authRoutes);
app.use(inventoryRoutes);
app.use(supplierRoutes);
app.use(categoryRoutes);
app.use(gstRoutes);
app.use(searchRoutes);
app.use(listRoutes);
app.use(demoRoutes);
app.use(feedbackRoutes);
app.use(orderRoutes);
app.use(userRoutes);

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

const mongoUri = 'mongodb://admin:kamakshi42@cluster0-shard-00-00-ljnkj.mongodb.net:27017,cluster0-shard-00-01-ljnkj.mongodb.net:27017,cluster0-shard-00-02-ljnkj.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
    console.log('Connected to mongo instance');
});
mongoose.connection.on('error', (err) => {
    console.error('Error connecting to mongo', err);
});

app.get('/', (req,res) => {
    res.send(`Your email: ${req.user.email}`);
});

/*app.post('/demo', (req, res) => {
    console.log(req.body);
    res.send("hey there");
  });*/

app.listen(3000,() => {
    console.log("listning on port 3000");
});