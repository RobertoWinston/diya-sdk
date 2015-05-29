/* maya-client
 *
 * Copyright (c) 2014, Partnering Robotics, All rights reserved.
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; version
 *  3.0 of the License. This library is distributed in the hope
 * that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

var util = require('util');
var Message = require('../message');

function pico(node){	
	var that = this;
	this.node = node;
	return this;
}

// 

pico.prototype.power = function(){

	this.node.get({
		service: 'pico',
		func: 'Power'
	}, function(data){
		/*if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);*/
		
	}); 
}

pico.prototype.zoom = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Zoom'
	}, function(data){
		/*if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);*/
		
	}); 
}


pico.prototype.back = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Back'
	}, function(data){
		/*if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		*/
	}); 
}


pico.prototype.up = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Up'
	}, function(data){
	/*	if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
	*/	
	}); 
}


pico.prototype.left = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Left'
	}, function(data){
	/*	if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
	*/	
	}); 
}


pico.prototype.ok = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Ok'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}


pico.prototype.right = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Right'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}


pico.prototype.down = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Down'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}

pico.prototype.prev = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Prev'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}

pico.prototype.play = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Play'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}
pico.prototype.next = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Next'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}

pico.prototype.lumiDown = function(callback){

	this.node.get({
		service: 'pico',
		func: 'LumiDown'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}

pico.prototype.lumiUp = function(callback){

	this.node.get({
		service: 'pico',
		func: 'LumiUp'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}

pico.prototype.volumeDown = function(callback){

	this.node.get({
		service: 'pico',
		func: 'VolumeDown'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}


pico.prototype.mute = function(callback){

	this.node.get({
		service: 'pico',
		func: 'Mute'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}

pico.prototype.volumeUp = function(callback){

	this.node.get({
		service: 'pico',
		func: 'VolumeUp'
	}, function(data){
		if(data.pico) 
			callback(null,data.pico); 
		if(data.error)
			callback(data.error,null);
		
	}); 
}


		
		
var exp = {
		pico: pico
}

module.exports = exp; 
