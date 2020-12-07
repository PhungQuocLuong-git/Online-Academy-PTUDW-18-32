const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/lpl_education_dev', {
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