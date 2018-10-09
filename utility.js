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


const twitch_kraken = axios.create({
	baseURL: 'https://api.twitch.tv/kraken',
	params: {
		client_id: '5oi8aqqszxnpa5w2oxn99zsyby1ld2'
	}
});

const getFollowedChannels = (userName, offset = 0) => {
	return twitch_kraken
		.get(`/users/${userName}/follows/channels`, {
			params: {
				limit: 100,
				offset
			}
		})
		.then(async (res) => {
			if (res.data.follows.length === 0) {
				return [];
			}
			else {
				return res.data.follows.map((obj) => obj.channel.display_name)
					.concat(await getFollowedChannels(userName, offset + 100));
			}
		})
		.catch((err) => {
			throw err;
		});
};

const filterLiveChannels = (channelsList) => {
	 let promisesArr = channelsList.map((channelName, i) => {
		return twitch_kraken
		.get(`/streams/${channelName}`);
	});
	
	return Promise.all(promisesArr)
	.then((res) => {
		return res.filter((e) => e.data.stream)
							.map(({data}) => {
								return {
									name: data.stream.channel.name,
									viewers: data.stream.viewers
								};
							});
	});
}


module.exports = {
	getChatters,
	getRandomChatter,
	getFollowedChannels,
	filterLiveChannels
};
