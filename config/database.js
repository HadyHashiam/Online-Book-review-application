const mongoose = require("mongoose");
mongoose.set('strictQuery', true);

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((conn) => {
      console.log(`connected with db Successfully`);
    })
    .catch((err) => {
      console.error(`Database Error: ${err}`);
      process.exit(1);
    });
};



module.exports = dbConnection;
