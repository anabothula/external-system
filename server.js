const express = require("express");
const studentRoutes = require("./src/students/routes");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.use("/api/v1/students", studentRoutes);

app.listen(port, () => {
	console.log("App listening on port " + port);
});
