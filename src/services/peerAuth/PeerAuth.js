var DiyaSelector = require('../../DiyaSelector').DiyaSelector;
var d1 = require('../../DiyaSelector');





/**
* Installs a new DiyaNode device (with address 'ip') into an existing network, by
* contacting an existing DiyaNode device with address 'bootstrap_ip' :
*   1) Contact the new node to get its public key
*   2) Add this public key to the existing node TrustedPeers list
*   3) Add the existing node's public key to the new node's TrustedPeers list
*   4) Ask the new node to join the network by calling @see{d1().join()}
*
* NOTE : This operation requires the given user to have root role on both nodes
*
* @param ip : the IP address of the new device
* @param bootstrap_ip : the IP address of the bootstrap device
* @param bootstrap_net : the IP address where the new device will connect to the boostrap one
* @param user : a user identifier with root role on both nodes
* @param password : the password for 'user'
* @param callback : of the form callback(new_peer_name,bootstrap_peer_name, err, data)
*/
d1.installNode = function(ip, bootstrap_ip, bootstrap_net, user, password, callback) {
	if(typeof ip !== 'string') throw "[installNode] ip should be an IP address";
	if(typeof bootstrap_ip !== 'string') throw "[installNode] bootstrap_ip should be an IP address";
	if(typeof bootstrap_net !== 'string') throw "[installNode] bootstrap_net should be an IP address";

		d1.connectAsUser(ip, user, password).then(function(peer, err, data){
				d1().givePublicKey(function(peer, err, data) {
					if(err) return callback(peer, null, err, null);
					else {
						INFO("Add trusted peer " + peer + "(ip=" + ip + ") with public key <p style='font-size:8px'>" + data.public_key + "</p>");
						d1.connectAsUser(bootstrap_ip, user, password).then(function(){
							d1().addTrustedPeer(peer, data.public_key, function(bootstrap_peer, err, data) {
									if(err=='AlreadyTrusted') ERR(peer + " already trusted by " + bootstrap_peer);
									else if(err) return callback(peer, bootstrap_peer, err, null);
									else {
										INFO(bootstrap_peer + "(ip="+ bootstrap_ip +") added " + peer + "(ip=" + ip + ") as a Trusted Peer");
										INFO("In return, add " + bootstrap_peer + " to " + peer + " as a Trusted Peer with public key  <p style='font-size:8px'>" + data.public_key + "</p>");
										d1.connectAsUser(ip, user, password).then(function(){
											d1().addTrustedPeer(bootstrap_peer, data.public_key, function(peer, err, data) {
												if(err=='AlreadyTrusted') ERR(bootstrap_peer + " already trusted by " + peer);
												else if(err) callback(peer, bootstrap_peer, err, null);
												else INFO(peer + "(ip="+ ip +") added " + bootstrap_peer + "(ip="+ bootstrap_ip +") as a Trusted Peer");

												// Once Keys have been exchanged ask to join the network
												OK("KEYS OK ! Now, let "+peer+"(ip="+ip+") join the network via "+bootstrap_peer+"(ip="+bootstrap_net+") ...");
												d1().join(bootstrap_net, true, function(peer, err, data){
													if(!err) OK("JOINED !!!");
													return callback(peer, bootstrap_peer, err, data);
												});
											});
										});
									}
							});
						});
					}
				});
		});


}




/**
 * Make the selected DiyaNodes join an existing DiyaNodes Mesh Network by contacting
 * the given bootstrap peers.
 *
 * NOTE : This operation requires root role
 *
 * @param bootstrap_ips : an array of bootstrap IP addresses to contact to join the Network
 * @param bPermanent : if true, permanently add the bootstrap peers as automatic bootstrap peers for the selected nodes.
 *
 */
DiyaSelector.prototype.join = function(bootstrap_ips, bPermanent, callback){
	if(typeof bootstrap_ips === 'string') bootstrap_ips = [ bootstrap_ips ];
	if(bootstrap_ips.constructor !== Array) throw "join() : bootstrap_ips should be an array of peers URIs";
	this.request(
		{service : 'meshNetwork', func: 'Join', data: { bootstrap_ips: bootstrap_ips, bPermanent: bPermanent }},
		function(peerId, err, data) {callback(peerId, err, data);}
	);
};



/**
 * Ask the selected DiyaNodes for their public keys
 */
DiyaSelector.prototype.givePublicKey = function(callback){
	return this.request(
		{ service: 'peerAuth',	func: 'GivePublicKey',	data: {} },
		function(peerId, err, data){callback(peerId,err,data);
	});
};

/**
 * Add a new trusted peer RSA public key to the selected DiyaNodes
 * NOTE : This operation requires root role
 *
 * @param name : the name of the new trusted DiyaNode peer
 * @param public_key : the RSA public key of the new trusted DiyaNode peer
 */
DiyaSelector.prototype.addTrustedPeer = function(name, public_key, callback){
	return this.request({ service: 'peerAuth',	func: 'AddTrustedPeer',	data: { name: name, public_key: public_key }},
		function(peerId,err,data){callback(peerId,err,data);}
	);
};


/**
 * Check if the selected DiyaNodes trust the given peers
 * @param peers : an array of peer names
 */
DiyaSelector.prototype.areTrusted = function(peers, callback){
	return this.request(
		{ service: 'peerAuth',	func: 'AreTrusted',	data: { peers: peers } },
		function(peerId, err, data) {
			var allTrusted = data.trusted;
			if(allTrusted) OK(peers + " are trusted by " + peerId);
			else ERR("Some peers in " + peers + " are untrusted by " + peerId);
		}
	);
};
