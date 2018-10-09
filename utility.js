const rq = require('request-promise');
const axios = require('axios');

const getChatters = (channelName, _attemptCount = 0) => {
	return rq({
		uri: `https://tmi.twitch.tv/group/user/${channelName}/chatters`,
		json: true
	})
		.then((data) => {
			return Object.entries(data.chatters).reduce(
				(p, [ type, list ]) =>
					p.concat(
						list.map((name) => {
							if (name === channelName) type = 'broadcaster';
							return { name, type };
						})
					),
				[]
			);
		})
		.catch((err) => {
			if (_attemptCount < 3) {
				console.log("i'll try again!");
				return getChatters(channelName, _attemptCount + 1);
			}
			console.log('tried 3 times and failed');
			throw err;
		});
};

const getRandomChatter = (channelName, opts = {}) => {
	let { onlyViewers = false, noBroadcaster = false, skipList = [] } = opts;
	return getChatters(channelName).then((data) => {
		let chatters = data.filter(
			({ name, type }) =>
				!(
					(onlyViewers && type !== 'viewers') ||
					(noBroadcaster && type === 'broadcaster') ||
					skipList.includes(name)
				)
		);
		return chatters.length === 0 ? null : chatters[Math.floor(Math.random() * chatters.length)];
	});
};

// TODO: incomplete! gotta implement the offset to get all the followed channels
// lol nevermind, just check the "_links" property.

const twitch_kraken = axios.create({
	baseURL: 'https://api.twitch.tv/kraken//users',
	params: {
		client_id: '5oi8aqqszxnpa5w2oxn99zsyby1ld2',
		limit: 100
	}
});

async function getFollowedChannels (userName, offset = 0) {
	return twitch_kraken
		.get(`/${userName}/follows/channels`, {
			params: {
				offset
			}
		})
		.then((res) => {
			if (res.data.follows.length === 0) {
				return [];
			}
			else {
				var promise = await getFollowedChannels(userName, offset + 100);
				// await getFollowedChannels(userName, offset + 100).then((res) => res.data.follows).catch(e => e)
				return [
					...res.data.follows.map((obj) => obj.channel.display_name),
					...(promise)
				];
			}
		})
		.catch((err) => {
			throw err;
		});
};

const testMe = (userName, offset = 100) => {
	return twitch_kraken
		.get(`/${userName}/follows/channels`, {
			params: {
				offset
			}
		})
		.then((res) => {
			console.log(res.data.follows[0].channel.display_name);
			return res.data.follows
				.map((obj) => obj.channel.display_name)
		})
		.catch((err) => {
			throw err;
		});
};

module.exports = {
	getChatters,
	getRandomChatter,
	getFollowedChannels,
	testMe
};
