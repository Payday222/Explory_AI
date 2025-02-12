const mongoose = require('mongoose');
const express = require('express');
const url = "mongodb://188.127.1.110:27017/";

mongoose.connect(url, function(err, db) {
    if(err) {
        console.log("error connecting to Mongo, ", err);
    }
    var dbo = db.db('explory');
    var obj = { testString: "test" }
    dbo.collection('messageHistory').insertOne(obj, function(err, res) {
        if(err) {
            console.log('error inserting to db: ', err);
        } else {
            console.log('document inserted, ', res);
            db.close();
        }
    });
});


const PORT = 3007;
app.listen(PORT, () => {
    console.log('version2 running on ', PORT);
})