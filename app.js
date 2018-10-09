const tmi = require('tmi.js');
const { getFollowedChannels, filterLiveChannels, viewerInChannel } = require('./utility')


const options = {
	options: {
		debug: true   // <=====
	},
	connection: {
		reconnect: true
	},
	identity: {
		username: 'thelazybot1',
		password: 'oauth:y5pz9evrx5rieb3hz02o9ojsh42qrg'
	},
	channels: [ 'riotgames' ]
};


//=================================================================
const viewerName = 'shroud';

(async () => {
	let channels = await getFollowedChannels(viewerName);
	let liveChannels = await filterLiveChannels(channels);
	let userFound = false;
	let userFoundIn = '';
	for (let e of liveChannels) {
		if (await viewerInChannel(viewerName, e.channel)) {
			userFoundIn = e.channel;
			console.log(`${viewerName} found in ${e.channel}!!!!`);
			return;
		} else {
			console.log(`${viewerName} not found in ${e.channel}`);
		}
	}
})();


// const client = new tmi.client(options);
// client.connect();

// client.on('message', (channel, userstate, message, fromSelf) => {
//   if(fromSelf || message[0] !== '!') return false;
//   let chan = channel.slice(1);
//   let params = message.split(' ');
//   let command = params.shift().slice(1).toLowerCase();
//   if(command === 'randomuser') {
//       // Get a random user but skip the user requesting a random user
//       getRandomChatter(chan, { skipList: [ userstate.username ] })
//       .then(user => {
//           if(user === null) {
//               client.say(chan, `${userstate.username}, there was no one to choose.`);
//           }
//           else {
//               let { name, type } = user;
//               client.say(chan, `${userstate.username}, I chose "${name}" with type ${type}!`);
//               console.log(`${userstate.username}, I chose "${name}" with type ${type}!`);
//           }
//       })
//       .catch(err => console.log('[ERR]', err));
//   }
// });



