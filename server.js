const express = require("express");
const fs = require("fs");
const jsforce = require("jsforce");
const path = require("path");
const cookieParser = require("cookie-parser");

const studentRoutes = require("./src/students/routes");

const app = express();
const port = process.env.PORT || 3000;

// slds css
const SLDS_DIR = "/node_modules/@salesforce-ux/design-system/assets";
app.use("/slds", express.static(__dirname + SLDS_DIR));

// normal css files
app.use("/public", express.static(__dirname + "/public"));

// ejs
const EJS = "/node_modules/ejs";
app.use("/ejs", express.static(__dirname + EJS));

// ejs partials files
const ejsFiles = "/views/partials";
app.use("/files", express.static(__dirname + ejsFiles));

// register ejs
app.set("view engine", "ejs");

// middleware
app.use(cookieParser());
app.use(express.json());

// jsforce authentication
let conn = null;
let userinfo = null;
const oauth2 = new jsforce.OAuth2({
	loginUrl: process.env.SF_URL,
	clientId: process.env.SF_CLIENT_ID,
	clientSecret: process.env.SF_CLIENT_SECRET,
	redirectUri: process.env.SF_REDIRECT_URI,
});

app.get("/auth", (req, res) => {
	res.redirect(oauth2.getAuthorizationUrl());
});

app.get("/callback", (req, res) => {
	conn = new jsforce.Connection({ oauth2: oauth2 });
	const code = req.query.code;
	conn.authorize(code, (err, userinfo) => {
		if (err) {
			return console.log(err);
		}
		console.log(conn.accessToken);
		console.log(conn.refreshToken);
		console.log(conn.instanceUrl);
		console.log("User ID: " + userinfo.id);
		console.log("Org ID: " + userinfo.organizationId);

		userinfo = userinfo;

		// subscribeToPlatformEvent();

		res.cookie("accessToken", conn.accessToken, {
			maxAge: 1000 * 60 * 60 * 24,
		});
		res.cookie("refreshToken", conn.refreshToken, {
			maxAge: 1000 * 60 * 60 * 24 * 30,
		});
		res.redirect("/");
	});
});

app.get("/files/:filename", (req, res) => {
	const filename = req.params.filename;
	const contents = fs.readFileSync("./partials/" + filename).toString();
	res.send(contents);
});

app.get("/", (req, res) => {
	res.render("index", {
		title: "Home",
		currPageName : 'query',
		loggedin: req.cookies !== null && req.cookies.accessToken !== undefined,
	});
});

app.get('/database', (req,res) =>{
	res.render('database');
})

app.get('/events', (req,res) =>{
	res.render('events');
})


app.get("/query", (req, res, next) => {
	const params = req.query;

	const conn = new jsforce.Connection({
		instanceUrl:
			"https://resourceful-unicorn-24xtue-dev-ed.my.salesforce.com",
		accessToken: req.cookies.accessToken,
	});

	conn.query(params.q, function (err, result) {
		if (err) {
			console.log("server error", err);
			res.status(400).send(err);
		}
		console.log("total : " + result.totalSize);
		console.log("fetched : " + result.records.length);
		res.json(result);
	});
});

app.use("/api/v1/students", studentRoutes);

app.listen(port, () => {
	console.log("App listening on port " + `http://localhost:${port}`);
});
