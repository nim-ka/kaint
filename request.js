const http = require("http");

class KARequest {
	constructor (uri, method="GET") {
		this.uri = uri;
		this.method = method;
	}
	
	call (callback, headers={}) {
		http.request({
			hostname: "www.khanacademy.org",
			path: this.uri,
			method: this.method,
			headers: headers
		}, this.handler(callback)).on("error", (error) => {
			throw new Error(`KARequest: ${this.uri}: ${error.message}`);
		});
	}
	
	handler (callback) {
		return (res) => {
			const {
				statusCode,
				statusMessage,
				headers
			} = res;
			
			var error;
			
			if (statusCode != 200) {
				error = `KARequest: ${this.uri}: HTTP status ${statusCode} ${statusMessage}`;
			} else if (!headers["content-type"].startsWith("application/json")) {
				error = `KARequest: ${this.uri}: Content-Type is ${headers["content-type"]} not application/json`;
			}
			
			if (error) {
				throw new Error(error);
				return res.resume();
			}
			
			res.setEncoding("utf8");
			
			var data = "";
			
			res.on("data", (chunk) => data += chunk);
			
			res.on("end", () => {
				var parsed;
				
				try {
					parsed = JSON.parse(data);
				} catch (error) {
					throw new Error(`KARequest: ${this.uri}: Could not parse as JSON the following data: ${data}`);
				}
				
				callback(parsed);
			});
		};
	}
}

class KARequestAuthenticated extends KARequest {
	constructor (uri, kaid, fkey, method="GET") {
		super(uri, method);
		
		this.KAID = kaid;
		this.fkey = fkey;
	}
	
	call (callback, headers={}) {
		headers["cookie"] = `KAID=${this.KAID}; fkey=${this.fkey}`;
		headers["x-ka-fkey"] = this.fkey;
		
		super.call(callback, headers);
	}
}

module.exports = {
	KARequest: KARequest,
	KARequestAuthenticated: KARequestAuthenticated
};
