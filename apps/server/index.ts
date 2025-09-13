import express from "express";
import AuthRoutes from "./routes/authRoutes";
import CredentailsRoutes from "./routes/credentailsRoutes";
import Workflows from "./routes/workflowsRoutes";
import cors from "cors";
const app = express();

// parse JSON request body
app.use(express.json());
app.use(cors());
// mount auth routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/credentails", CredentailsRoutes);
app.use("/api/v1/workflows", Workflows);
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
