# Lower Thirds Tool

## Instalation

* checkout git repo
* create a virtualenv and activate it (`virtualenv env && . ./env/bin/activate`)
* run `pip install -r requirements.txt` to install the required python packages
* optionally install uwsgi and gevent if you plan to run the backend in production mode (`pip install -r requirements.standalone.txt`)
* run `npm install`
* run `npm run build` to build the Vue.js components and compile the sass stylesheets to css
* create a settings.yml configuration file, see `settings.example.yml` for details
* run `./startserver.sh` to run the backend in production mode
