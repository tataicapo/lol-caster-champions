const express = require('express')
const app = express()
const path = require('path')
const request = require('request');

// config
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));


// variables

var lolApiActived = false
var riotRequest
var riotKey
var server
var partidaVivo


// routes
app.get('/', (req, res) => {
	res.render('index')
})

app.get('/res', async function(req, res) {

	server = req.query.servidor

	console.log('jugado: '+req.query.jugador+' || servidor: '+server)

	var summonerData = await nombre_a_id(req.query.jugador, server)
	var cuentaID = summonerData.accountId
	var jugadorID = summonerData.id

	console.log('ID del jugador: '+jugadorID)
	console.log('ID de la cuenta: '+cuentaID)
	//console.log('partidaVivo: '+summonerData)

	//var jugadorHistorial = await historial(jugadorID, server)
	//console.log(jugadorHistorial)

	var partidaVivo = await partidaActual(jugadorID, server)

	res.send(partidaVivo);

})





app.get('/champ', function(req, res) {

	var champ = req.query.champ

	if(champ == 'undefined'){

		res.send('error');

	} else{

		champJson = require('./json/champion/'+champ+'.json')

		res.send(champJson);

	}
})






// listering for server
app.listen(app.get('port'), () => {
	console.log('server iniciado:', app.get('port'))
})



async function nombre_a_id(nombre, server){
	return new Promise(function(resolve, reject) {
		activarLolApi()

		riotRequest.request(server, 'summoner', '/lol/summoner/v4/summoners/by-name/'+nombre, function (err, data) {
			resolve(data)
		})
  })
}


async function historial(id, server){
	return new Promise(function(resolve, reject) {

		var elEstring = "/lol/match/v4/matchlists/by-account/" + id
		riotRequest.request(server, 'summoner', elEstring, function (err, data) {

			resolve(data.matches)

		})
	})
}

async function partidaActual(id, server){
	return new Promise(function(resolve, reject) {
		activarLolApi()
		
		
		riotRequest.request(server, 'spectator', '/lol/spectator/v4/active-games/by-summoner/'+id, function (err, data) {
			//console.log(data)
			resolve(data)
		})
	})
}






function activarLolApi(){

	if(lolApiActived == false){

	if(process.env.service_account != undefined){

		url_token = JSON.parse(process.env.url_token)

	} else{

		url_token = require('../no-borrar/url-token.json')

	}

	riotKey = url_token.riotApi

	var solicitarApiLol = require('riot-lol-api');
	riotRequest = new solicitarApiLol(riotKey);

	lolApiActived = true

	}
}
