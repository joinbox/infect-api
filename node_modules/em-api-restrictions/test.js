


	var   Webservice 		= require( "../ee-webservice" )
		, APIRestictions	= require( "./" );



	var service = new Webservice( {
		webserver: {
			http: {
				  interface: 	Webservice.Webserver.IF_ANY 
				, port: 		12001
			}
		}
	} );


	service.use( new APIRestictions( {
		apikeys: {
			"test": { limit: 1 }
		}
	} ) );


	service.listen();

