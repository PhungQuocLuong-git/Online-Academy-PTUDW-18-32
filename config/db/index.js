const mongoose = require('mongoose');

async function connect() {
    /* try {
        await mongoose.connect('mongodb://localhost:27017/doanweb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
        });
        console.log('Sucessfully Connected !!!')
    } */
    try {
        await mongoose.connect('mongodb+srv://dbUser2:dbUser2@cluster0.krhp6.mongodb.net/doanweb?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
        });
        console.log('Sucessfully Connected !!!')
    }
    catch(error){
        console.log('Fail Connected!!!');
    }
}

module.exports = {connect};