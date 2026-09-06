const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");
const { db } = require("../models/listing");

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/staynest');
}

const initDb = async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:'6a8c4918ca0add013bb3fc36'}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDb();