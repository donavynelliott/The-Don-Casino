/**
 * Created by Sergey Pomorin on 07.03.2017.
 * v 1.0.0
 */
 
var urlInfura = "https://mainnet.infura.io/JCnK5ifEPH9qcQkX0Ahl";

var Infura = function() {
	if(options_rpc){
		urlInfura = "http://46.101.244.101:8545";
    } else if(options_testnet){
		urlInfura = "https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl";
	}
};

Infura.prototype.sendRequest = function(name, params, callback){
	var method = name;
	var arParams = [params, "latest"];
	
	switch(name){
		case "buyTicket":
			method = "eth_getTransactionCount";
			break;
		case "gameTxHash":
		case "sendRaw":
			method = "eth_sendRawTransaction";
			arParams = [params];
			break;
		case "getBalance":
		case "getBalanceBank":
			method = "eth_getBalance";
			break;
		case "getBlockNumber":
			method = "eth_blockNumber";
			arParams = [];
			break;
		default:
			method = "eth_call";
			break;
	}
	
	$.ajax({
		type: "POST",
		url: urlInfura,
		dataType: 'json',
		async: false,
		data: JSON.stringify({"jsonrpc":'2.0',
								"method":method,
								"params":arParams,
								"id":1}),
		success: function (d) {
			callback(name, d.result);
		}
	})
};