const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();

const POST = process.env.POST || 4000;
const authRouter = require("./routes/authRoute");
const storeRouter = require("./routes/storeRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const procategoryRouter = require("./routes/procategoryRoute");
const blogcategoryRouter = require("./routes/blogcategoryRoute");
const brandRouter = require("./routes/brandRoute");
const voucherRouter = require("./routes/vocherRoute");
const colorRouter = require("./routes/colorRouter");
const uploadImageRouter = require("./routes/uploadImageRoute");
const enquiryRouter = require("./routes/enquiryRoute");

const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

const corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

dbConnect();

app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", authRouter);
app.use("/api/store", storeRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/procategory", procategoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/voucher", voucherRouter);
app.use("/api/color", colorRouter);
app.use("/api/upload", uploadImageRouter);
app.use("/api/enquiry", enquiryRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(POST, () => {
  console.log(`Server is running on POST ${POST}`);
});
