infect-api
==========

                                  __        _____              __   
                                 |__| _____/ ____\____   _____/  |_ 
                                 |  |/    \   __\/ __ \_/ ___\   __\ 
                                 |  |   |  \  | \  ___/\  \___|  |  
                                 |__|___|  /__|  \___  >\___  >__|  
                                         \/          \/     \/     


## installation 

OS requirements: ubuntu >= 12.04


### required software

	sudo apt-get install git-core make gcc g++ -y


### node.js ( v0.10.20 )

	mkdir -p /srv/jt/
	cd /srv/jt
	git clone https://github.com/joyent/node.git
	cd node
	git checkout v0.10.20
	./configure
	make 
	sudo make install


### infect api

	mkdir -p /srv/jb
	cd /srv/jb
	git clone https://github.com/joinbox/infect-api.git
	cd infect-api
	git checkout v0.1.0
	npm install
	cp config.js.dist config.js


### configuring the application

edit the config.js config file, the values should beself explaining.
questions? ask michael@joinbox.com


### running the application

	cd /srv/jb/infect-api
	node .


### API Documentation

install the POSTMan chrome extension: https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?hl=en
import the collection from https://www.getpostman.com/collections/135f32d5ad0b9540ff9d