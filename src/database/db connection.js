import mongoose from "mongoose";
export const dbconnection =() => {
    mongoose.connect(process.env.url).then(() => {
        console.log('conecting to database')
    }).catch((error) => {
        console.log('Error connecting to the database:', error.message)
    })
}