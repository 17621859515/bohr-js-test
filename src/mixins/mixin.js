let encodeAddress = require("./address")

function addressSplice(item, num) {
	if (typeof item != 'undefined' && item != null) {
		if (item.length > 30) {
			if (item.indexOf("0x") == 0)
				return item.substr(2, num) + '...' + item.substr(item.length - num, item.length)
			else
				return item.substr(0, num) + '...' + item.substr(item.length - num, item.length)
		}
	}
	return ""
};

function addressEncode(path) {
	return addressEncode16(path);
};

function addressEncode16(path) {
	let address = splice0x(path)
	if (address.length !== 40) {
		return address;
	}
	return encodeAddress.do58EncodeAddress('0600' + address);
};

function splice0x(str) {
	if (str && str.length > 0) {
		if (str.indexOf("0x") !== 0) {

			return str
		}
		let t = str.replace("0x", "")
		return t
	}
	return str
};

function getMainBlance(available) {
	return parseFloat(available / Math.pow(10, 9).toFixed(7));
};

function addressDecode(path) {
	if (path && path.indexOf('B') == 0) {
		path = encodeAddress.do58DecodeAddress(path);
		path = (path.replace('0600', '')).toLowerCase();
		path = `0x${path}`;
	}
	return path;
};

export {
	addressEncode,
	addressSplice,
	splice0x,
	getMainBlance,
	addressDecode
}
