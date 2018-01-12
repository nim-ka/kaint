const util = require("util");
const { KARequest, KARequestAuthenticated } = require("./request.js");

const API = {
	PROFILE_KAID: "/api/internal/user/profile?kaid=%s",
	PROFILE_USERNAME: "/api/internal/user/profile?username=%s",
	NOTIFICATIONS: "/api/internal/user/notifications/readable",
	CLEARNOTIFICATIONS: "/api/internal/user/notifications/clear_brand_new",
	COMMENTS: "/api/internal/discussions/%s/replies",
	REPLY: "/api/internal/discussions/%s/replies", // Identical to COMMENTS but kept in for sugar
	TIPSANDTHANKS: "/api/internal/discussions/scratchpad/%s/comments",
	PROGRAMS_KAID: "/api/internal/user/scratchpads?kaid=%s",
	PROGRAMS_USERNAME: "/api/internal/user/scratchpads?username=%s"
};

class KAUser {
	constructor (username, kaid, KAID, fkey, callback) {
		this.kaid = kaid;
		this.KAID = KAID;
		this.fkey = fkey;
		
		let finishInit = () => {
			this.self = {
				profile: (...data) => this.request(util.format(API.PROFILE_KAID, this.kaid, ...data)),
				notifications: (...data) => this.request(util.format(API.NOTIFICATIONS, ...data)),
				programs: (...data) => this.request(util.format(API.PROGRAMS_KAID, this.kaid, ...data)),
				
				clearNotifications: (...data) => this.request(util.format(API.CLEARNOTIFICATIONS, ...data), "POST"),
				reply: (...data) => this.request(util.format(API.REPLY, ...data), "POST")
			};
			
			callback(this);
		};
		
		if (!kaid) {
			if (!username) {
				throw new Error("KAUser: No identification (lowercase kaid, username) provided to constructor");
			}
		}
		
		if (!KAID) {
			throw new Error(`KAUser: ${kaid || username}: No (internal) KAID provided`);
		}
		
		if (!fkey) {
			throw new Error(`KAUser: ${kaid || username}: No fkey provided`);
		}
		
		if (username && !kaid) {
			new KARequestAuthenticated(API.PROFILE_USERNAME(username), KAID, fkey).call((data) => {
				this.kaid = data.kaid;
				finishInit();
			});
		} else {
			finishInit();
		}
	}
	
	request (uri, method="GET") {
		return new KARequestAuthenticated(uri, this.KAID, this.fkey, method);
	}
}

module.exports = {
	KAUser: KAUser,
	API: API
};
