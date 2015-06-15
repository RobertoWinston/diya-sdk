/* maya-client
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

/**
   Todo : 
   check err for each data
   improve API : getData(sensorName, dataConfig)
                   return adapted vector for display with D3 to reduce code in IHM ?
                 updateData(sensorName, dataConfig)
		 set and get for the different dataConfig params
		 
*/


var util = require('util');


var Message = require('../message');

/**
 *  callback : function called after model updated
 * */
function QEI(node, callback, sampling){
    var that = this;
    this.node = node;
    
    /*** structure of data config ***
	 criteria :
	    time:
	       deb: {[null],time} (/ means most recent) // stored a UTC in ms (num)
	       end: {[null], time} (/ means most oldest) // stored as UTC in ms (num)
	    robot: {ArrayOf ID or ["all"]}
	    place: {ArrayOf ID or ["all"]}
	 operator: {[last], max, moy, sd} -( maybe moy should be default
	 ...

	 sensors : {[all] or ArrayOf SensorName}
	 
	 sampling: {[all] or int}
    */
    this.dataConfig = {
	criteria: {
	    time: {
		deb: null,
		end: null
	    },
	    robot: [1],
	    place: [1,2]
	},
	operator: 'last',
	sensors: {},
	sampling: 10 //sampling
    };
    this.callback = callback || function(res){}; /* callback, usually after getModel */
    
    node.get({
	service: "qei",
	func: "DataRequest",
	data: {
	    type:"msgInit",
	    dataConfig: {
		operator: 'last',
		sensors: {},
		sampling: 1 //sampling
	    }
	}
    }, function(data){
	that.dataModel= {};
	console.log("init: data : "+JSON.stringify(data));

	// TODO : add init loop process

	if(data.header.error) {
	    // TODO : check/use err status and adapt behavior accordingly
	    console.log("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
	    return;
	}
	
	that._getDataModelFromRecv(data);
	console.log(JSON.stringify(that.dataModel));
	/** TO BE REMOVED ? */
	/*that.updateQualityIndex();
	that._updateLevels(that.dataModel);
	that.callback(that.dataModel);*/

	that.timedRequest = function() {
	    var now = new Date();
	    now = now.getTime();
	    var deb_time = now - 5*60*1000;
	    console.log("now "+now+" / deb time "+deb_time);
	    /* that.dataConfig.criteria.time = {
		deb: deb_time,
		end: now
	    };*/
	    node.get({
		service: "qei",
		func: "DataRequest",
		data: {
		    type:"splReq",
		    dataConfig: that.dataConfig
		}
	    }, function(data){
		console.log(JSON.stringify(data));
		if(data.header.error) {
		    // TODO : check/use err status and adapt behavior accordingly
		    console.log("timedRequest:\n"+JSON.stringify(data.header.dataConfig));
		    console.log("Data request failed ("+data.header.error.st+"): "+data.header.error.msg);
		    return;
		}
		// console.log(JSON.stringify(that.dataModel));
		that._getDataModelFromRecv(data);
		// console.log(JSON.stringify(that.dataModel));
		
		that.updateQualityIndex();
		that._updateLevels(that.dataModel);
		that.callback(that.dataModel);
	    });
	    setTimeout(that.timedRequest,3000);
	};
	setTimeout(that.timedRequest(),3000);

	/*	node.listen({
		service: "qei",
		func: "SubscribeQei"
		}, function(res) {
		that._getDataModelFromRecv(res.data);
		that._updateLevels(that.dataModel);
		that.callback(that.dataModel);
		});
	*/
    });

    console.log("DiyaSDK - QEI: created");
    return this;
}
/**
 * Get dataModel : 
 * {
 * 	time: [FLOAT, ...],
 * 	"senseurXX": {
 * 			data:[FLOAT, ...],
 * 			qualityIndex:[FLOAT, ...],
 * 			range: [FLOAT, FLOAT],
 * 			unit: string,
 *      label: string
 * 		},
 *   ... ("senseursYY")
 * }
 */
QEI.prototype.getDataModel = function(){
    return this.dataModel;
}
QEI.prototype.getDataRange = function(){
    return this.dataModel.range;
}
QEI.prototype.updateQualityIndex = function(){
    var that=this;
    var dm = this.dataModel;
    
    for(var d in dm) {
	if(d=='time' || !dm[d].data) continue;
	
	if(!dm[d].qualityIndex || dm[d].data.length != dm[d].qualityIndex.length)
	    dm[d].qualityIndex = new Array(dm[d].data.length);
	
	dm[d].data.forEach(function(v,i) {
	    dm[d].qualityIndex[i] = checkQuality(v,dm[d].qualityConfig);
	});
    }
};

QEI.prototype.getDataconfortRange = function(){
    return this.dataModel.confortRange;
};
QEI.prototype.getDataConfig = function(){
    return this.dataConfig;
};
QEI.prototype.getDataOperator = function(){
    return this.dataConfig.operator;
};
/**
 * TO BE IMPLEMENTED : operator management in DN-QEI
 * @param  {String}  newOperator : {[last], max, moy, sd}
 */
QEI.prototype.setDataOperator = function(newOperator){
    this.dataConfig.operator = newOperator;
};
QEI.prototype.getDataSampling = function(){
    return this.dataConfig.sampling;
};
QEI.prototype.setSampling = function(numSamples){
    this.dataConfig.sampling = numSamples;
};
QEI.prototype.getDataTimeDeb = function(){
    return new Date(this.dataConfig.criteria.time.deb);
};
/**
 *  @param {Date} newTimeDeb
 */
QEI.prototype.setDataTimeDeb = function(newTimeDeb){
    this.dataConfig.criteria.time.deb = newTimeDeb.getTime();
};
QEI.prototype.getDataTimeEnd = function(){
    return new Date(this.dataConfig.criteria.time.end);
};
/**
 *  @param {Date} newTimeEnd
 */
QEI.prototype.setDataTimeEnd = function(newTimeEnd){
    this.dataConfig.criteria.time.end = newTimeEnd.getTime();
};


QEI.prototype._updateConfinementLevel = function(model){
    /** check if co2 and voct are available ? */
    var co2 = model['CO2'].data[model['CO2'].data.length - 1];
    var voct = model['VOCt'].data[model['VOCt'].data.length - 1];
    var confinement = Math.max(co2, voct);

    if(confinement < 800){
	return 3;
    }
    if(confinement < 1600){
	return 2;
    }
    if(confinement < 2400){
	return 1;
    }
    if(confinement < 3000){
	return 0;
    }
    /* default */
    return 0;
};

QEI.prototype._updateAirQualityLevel = function(confinement, model){
    var fineDustQualityIndex = model['Fine Dust'].qualityIndex[model['Fine Dust'].qualityIndex.length-1];
    var ozoneQualityIndex = model['Ozone'].qualityIndex[model['Ozone'].qualityIndex.length-1];

    var qualityIndex = fineDustQualityIndex + ozoneQualityIndex;
    if(qualityIndex < 2) return confinement - 1;
    else return confinement;
}

QEI.prototype._updateEnvQualityLevel = function(airQuality, model){
    var humidityQualityIndex = model['Humidity'].qualityIndex[model['Humidity'].qualityIndex.length-1];
    var temperatureQualityIndex = model['Temperature'].qualityIndex[model['Temperature'].qualityIndex.length-1];

    var qualityIndex = humidityQualityIndex + temperatureQualityIndex;
    if(qualityIndex < 2) return airQuality - 1;
    else return airQuality;	
}

QEI.prototype._updateLevels = function(model){
    this.confinement = this._updateConfinementLevel(model);
    this.airQuality = this._updateAirQualityLevel(this.confinement, model);
    this.envQuality = this._updateEnvQualityLevel(this.airQuality, model);
}

QEI.prototype.getConfinementLevel = function(){
    return this.confinement;
}

QEI.prototype.getAirQualityLevel = function(){
    return this.airQuality;
}

QEI.prototype.getEnvQualityLevel = function(){
    return this.envQuality;
}


var checkQuality = function(data, qualityConfig){
    var quality;
    if(data && qualityConfig) {
	if(data>qualityConfig.confortRange[1] || data<qualityConfig.confortRange[0])
	    quality=0;
	else
	    quality=1.0;
	return quality;
    }
    return 1.0;
}

/**
 * Update internal model with received data
 * @param  {Object} data data received from DiyaNode by websocket
 * @return {[type]}     [description]
 */
QEI.prototype._getDataModelFromRecv = function(data){
    var dataModel=this.dataModel;
    /*\
      |*|
      |*|  utilitaires de manipulations de chaînes base 64 / binaires / UTF-8
      |*|
      |*|  https://developer.mozilla.org/fr/docs/Décoder_encoder_en_base64
      |*|
      \*/
    /** Decoder un tableau d'octets depuis une chaîne en base64 */
    b64ToUint6 = function(nChr) {
	return nChr > 64 && nChr < 91 ?
	    nChr - 65
	    : nChr > 96 && nChr < 123 ?
	    nChr - 71
	    : nChr > 47 && nChr < 58 ?
	    nChr + 4
	    : nChr === 43 ?
	    62
	    : nChr === 47 ?
	    63
	    :	0;
    };
    /**
     * Decode base64 string to UInt8Array
     * @param  {String} sBase64     base64 coded string
     * @param  {int} nBlocksSize size of blocks of bytes to be read. Output byteArray length will be a multiple of this value.
     * @return {Uint8Array}             tab of decoded bytes
     */
    base64DecToArr = function(sBase64, nBlocksSize) {
	var
	sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
	nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
	buffer = new ArrayBuffer(nOutLen), taBytes = new Uint8Array(buffer);

	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
	    nMod4 = nInIdx & 3; /* n mod 4 */
	    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
	    if (nMod4 === 3 || nInLen - nInIdx === 1) {
		for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
		    taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
		}
		nUint24 = 0;

	    }
	}
	// console.log("u8int : "+JSON.stringify(taBytes));
	return buffer;
    };
    
    if(data && data.header) {
	//~ console.log('rcvdata '+JSON.stringify(data));
	// if(!data.header.sampling) data.header.sampling=1;
	
	/** case 1 : 1 value received added to dataModel - deprecated ? */
	if(data.header.sampling==1) {
	    if(data.header.timeEnd) {
		if(!dataModel.time) dataModel.time=[];
		dataModel.time.push(data.header.timeEnd);
		if(dataModel.time.length > this.sampling) {
		    dataModel.time = dataModel.time.slice(dataModel.time.length - this.sampling);
		}
	    }
	    for (var n in data) {
		if(n != "header" && n != "time") {
		    console.log(JSON.stringify(data[n]));
		    if(!dataModel[n]) {
			dataModel[n]={};
			dataModel[n].data=[];
		    }

		    /* update data range */
		    dataModel[n].range=data[n].range;
		    /* update data label */
		    dataModel[n].label=data[n].label;
		    /* update data unit */
		    dataModel[n].unit=data[n].unit;
		    /* update data confortRange */
		    dataModel[n].qualityConfig={confortRange: data[n].confortRange};

		    if(data[n].data.length > 0) {
			/* decode data to Float32Array*/
			var buf = base64DecToArr(data[n].data, 4);
			// console.log(JSON.stringify(buf));
			var fArray = new Float32Array(buf);

			if(data[n].size != fArray.length) console.log("Mismatch of size "+data[n].size+" vs "+fArray.length);
			if(data[n].size != 1) console.log("Expected 1 value received :"+data[n].size);
			
			if(!dataModel[n].data) dataModel[n].data=[];
			dataModel[n].data.push(fArray[0]);
			if(dataModel[n].data.length > this.sampling) {
			    dataModel[n].data = dataModel[n].data.slice(dataModel[n].data.length - this.sampling);
			}
		    }
		    else {
			if(data[n].size != 0) console.log("Size mismatch received data (no data versus size="+data[n].size+")");
			dataModel[n].data = [];
		    }
		    this.updateQualityIndex();
		    //~ console.log('mydata '+JSON.stringify(dataModel[n].data));
		}
	    }
	}
	else {
	    /** case 2 : history data - many values received */
	    /** TODO  */
	    for (var n in data) {
		if(n == 'time') {
		    /* case 1 : time data transmitted, 1 value */
		    /** TODO **/
		}
		else if(n != "header") { 
		    // console.log(n);
		    if(!dataModel[n]) {
			dataModel[n]={};
			dataModel[n].data=[];
		    }


		    /* update data range */
		    dataModel[n].range=data[n].range;
		    /* update data label */
		    dataModel[n].label=data[n].label;
		    /* update data unit */
		    dataModel[n].unit=data[n].unit;
		    /* update data confortRange */
		    dataModel[n].qualityConfig={confortRange: data[n].confortRange};

		    if(data[n].data.length > 0) {
			/* decode data to Float32Array*/
			var buf = base64DecToArr(data[n].data, 4); 
			// console.log(JSON.stringify(buf));
			var fArray = new Float32Array(buf);

			if(data[n].size != fArray.length) console.log("Mismatch of size "+data[n].size+" vs "+fArray.length);
			// /* increase size of data if necessary */
			if(fArray.length>dataModel[n].data.length) {
			    // dataModel[n].size=data[n].size;
			    dataModel[n].data = new Array(dataModel[n].size);
			}
			/* update nb of samples stored */
			for(var i in fArray) {
			    dataModel[n].data[parseInt(i)]=fArray[i]; /* keep first val - name of column */
			}
		    }
		    else {
			if(data[n].size != 0) console.log("Size mismatch received data (no data versus size="+data[n].size+")");
			dataModel[n].data = [];
		    }
		    // dataModel[n].data = Array.from(fArray);
		    // console.log('mydata '+JSON.stringify(dataModel[n].data));
		}
	    }
	}
    }
    else {
	console.log("No Data to read or header is missing !");
    }
    return this.dataModel;
}


var exp = {
    QEI: QEI
}

module.exports = exp; 
