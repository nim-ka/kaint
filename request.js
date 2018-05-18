const http = require("http");
const querystring = require("querystring");

class KARequest {
	constructor (uri, method="GET") {
		this.uri = uri;
		this.method = method;
	}
	
	call (callback, data={}, headers={}) {
		let req = http.request({
			hostname: "www.khanacademy.org",
			path: this.uri,
			method: this.method,
			headers: headers
		}, this.handler(callback));
		
		req.on("error", (error) => {
			throw new Error(`KARequest: ${this.uri}: ${error.message}`);
		});
		
		req.write(querystring.stringify(data));
	}
	
	handler (callback) {
		return (res) => {
			const {
				statusCode,
				statusMessage,
				headers
			} = res;
			
			let error;
			
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
			
			let data = "";
			
			res.on("data", (chunk) => data += chunk);
			
			res.on("end", () => {
				let parsed;
				
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
	
	call (callback, data={}, headers={}) {
		headers["cookie"] = `KAID=${this.KAID}; fkey=${this.fkey}`;
		headers["x-ka-fkey"] = this.fkey;
		
		super.call(callback, headers, data);
	}
}

module.exports = {
	KARequest: KARequest,
	KARequestAuthenticated: KARequestAuthenticated
};
