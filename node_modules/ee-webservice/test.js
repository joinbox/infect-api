


	var   Webservice 	= require( "./" )
		, Mutlilang 	= require( "../em-multilang" );



	var service = new Webservice( {
		http: {
			  interface: 	Webservice.Webserver.IF_ANY 
			, port: 		12001
		}
	} );


	service.use( new Mutlilang( {
		  defaultLanguage: 		"en"
		, languages: 			[ "en", "fr", "it", "de" ]
		, externalRedirect: 	false
	} ) );


	service.listen();

