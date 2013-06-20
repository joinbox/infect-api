

	// node test --port=2345 --trace-http-request


	var assert = require( "assert" )
		, project = require( "./index" );

	assert.ok( project.root && project.root.length > 0, "failed to detect project root!" );
	assert.ok( project.config && project.config.test, "filed to load the project config!" );
