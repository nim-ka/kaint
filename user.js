const { KARequest, KARequestAuthenticated } = require("./request.js");

const API = {
	PROFILE_KAID: (kaid) => "/api/internal/user/profile?kaid=${kaid}",
	PROFILE_USERNAME: (username) => "/api/internal/user/profile?username=${username}",
	NOTIFICATIONS: () => "/api/internal/user/notifications/readable",
	CLEARNOTIFICATIONS: () => "/api/internal/user/notifications/clear_brand_new",
	COMMENTS: (kaencrypted) => `/api/internal/discussions/${kaencrypted}/replies`,
	TIPSANDTHANKS: (programID) => `/api/internal/discussions/scratchpad/${programID}/comments`,
	PROGRAMS_KAID: (kaid) => `/api/internal/user/scratchpads?kaid=${kaid}`,
	PROGRAMS_USERNAME: (username) => `/api/internal/user/scratchpads?username=${username}`
};

class KAUser {
	constructor (username, kaid, KAID, fkey, callback) {
		this.kaid = kaid;
		this.KAID = KAID;
		this.fkey = fkey;
		
		let finishInit = () => {
			// put endpoints stuff for all the stuff in api stuff im bored help
			
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
	
	fetchNewNotifications (callback) {
		this.profile.call((data) => {
			let newNotifs = data.countBrandNewNotifications;
			
			this.notifications.call((data) => {
				callback(data.notifications.slice(0, newNotifs));
			});
		});
	}
}

module.exports = {
	KAUser: KAUser,
	API: API
};
