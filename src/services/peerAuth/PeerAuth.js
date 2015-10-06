var DiyaSelector = require('../../DiyaSelector').DiyaSelector;



/**
 * Make the selected DiyaNodes join an existing DiyaNodes Mesh Network by contacting
 * the given bootstrap peers.
 * 
 * NOTE : This operation requires root role 
 * 
 * @param bootstrap_peers
 */
DiyaSelector.prototype.join = function(bootstrap_peers, callback){
	if(typeof bootstrap_peers === 'string') bootstrap_peers = [ boostrap_peers ];
	if(typeof bootstrap_peers !== 'array') throw "join() : bootstrap_peers should be an array of peers URIs";

	return this.givePublicKey(function(joining_peer, err, data){
		
		Logger.error("YOUPI !! " + data.keys().join(","));
		
		d1(bootstrap_peers).addTrustedPeer();
	});
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