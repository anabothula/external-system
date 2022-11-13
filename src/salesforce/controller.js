const jsforce = require("jsforce");

const userId = "0055h000005kjdJAAQ";
let conn = null;

// jsforce authentication
const oauth2 = new jsforce.OAuth2({
	loginUrl: process.env.SF_URL,
	clientId: process.env.SF_CLIENT_ID,
	clientSecret: process.env.SF_CLIENT_SECRET,
	redirectUri: process.env.SF_REDIRECT_URI,
});

const handleAuth = (req, res) => {
	res.redirect(oauth2.getAuthorizationUrl());
};

const handleCallback = (req, res) => {
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
	});
};

const subscribeToPlatformEvent = () => {
	const channel = "/event/sample__e";
	const replayEvt = new jsforce.StreamingExtension.Replay(channel, -2);

	const client = conn.streaming.createClient([replayEvt]);

	const subscription = client.subscribe(channel, (data) => {
		console.log("Received Flight Approved Event", data);
	});
};

module.exports = {
	handleCallback,
	handleAuth,
};
