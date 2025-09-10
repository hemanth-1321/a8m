import express from "express";
import AuthRoutes from "./routes/authRoutes";
import CredentailsRoutes from "./routes/credentailsRoutes";
const app = express();

// parse JSON request body
app.use(express.json());

// mount auth routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/credentails", CredentailsRoutes);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
