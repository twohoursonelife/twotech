# twotech

> Two Hours One Life Crafting Reference

View here: https://twotech.twohoursonelife.com

This site is built using the game data directly from [the game data repository](https://github.com/twohoursonelife/OneLifeData7).
It shows the relationships between items, and lets you explore how things are crafted.

Unlike the wiki, which contains "wisdom" about the game, this site contains only "knowledge".
This is a reference. For a better guide, go to the [game wiki](https://twohoursonelife.fandom.com/wiki/Two_Hours,_One_Life_Wiki).


## Setting up, building and running twotech

The project is split into two parts:
- A node script that processes the latest data from the game data repository
- The site itself, built in VueJS

### Creating a live twotech website

For instructions on setting up a live twotech webpage on the internet, see [SERVER.md](SERVER.md).

### Running server in Docker

This option lets you both build and run the twotech webpage localling in a Docker container, forwarding ports out to your host machine to access the website.

#### Build
Do this anytime you want to fully rebuild the server data and server itself.
```
./docker-build.sh
```

#### Run
This runs the built Docker image, mapping the container's port 80 to the host's port 80 (change "PORT" environment variable to change the host-side port).
```
PORT=8080 ./docker-run.sh
```

To access the local twotech site, in a web browser, goto `<HOST_MACHINE_IP>:8080`

### Processing Script

If all you're after is the twotech data used for the site, but not building/hosting the actual webserver, you could just run the process script.

### Local Process build

The script is under the folder `process`. It will pull the latest data from the game data repository (if provided `download` as a command line argument), and then generate JSON files for the objects. It will also composite the sprites and create PNGs for each object in the game.

To get it running, you will need to install [ImageMagick](https://www.imagemagick.org/script/index.php), [Canvas dependencies](https://github.com/Automattic/node-canvas/blob/v1.x/Readme.md#installation), and [SoX](http://sox.sourceforge.net).

```
sudo apt-get install imagemagick libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++ libsox-fmt-mp3 sox
```

See [SERVER.md](/SERVER.md) for a thorough deployment setup guide.

``` bash
cd process

# install dependencies
npm install

cd ..

# run script including downloading latest data and processing sprites
node process download

# if you want to re-process the sprites without downloading data
node process sprites

# if you want to re-process the sounds without downloading data
node process sounds

# or process without generating sprites
node process
```

### Docker Process build

> Note 1: This is for a Linux machine with Docker installed.

> Note 2: This creates a separate process directory, to not mess with the main build.

To only generate the twotech processed data used for the website, first run:
```
./prepare-process-docker.sh
```

This will build the Docker image used for the build environment, and then set up the process directory for use.

You can then run different build commands within a container of this image:
```
./docker-env-run.sh node process-docker
```
```
./docker-env-run.sh node process-docker download
```
```
./docker-env-run.sh node process-docker sprites
```
```
./docker-env-run.sh node process-docker sounds
```

### Modded Support

_Following forking this project, the following is less supported and we do not make use of this ourselves._

If you have a modded version of `OneLifeData7`, consider forking this repository and setting these environment variables before processing:

``` bash
export ONETECH_MOD_NAME="My Awesome Mod"
export ONETECH_MOD_URL="https://my-awesome-mod.com"
export ONETECH_PROCESS_GIT_PATH="/path/to/my/awesome-mod-data"
# or
export ONETECH_PROCESS_GIT_URL="https://github.com/my/awesome-mod-data"
```

After you have run the process and build scripts, push the changes up to your own fork. If you want to use GitHub Pages, you will need to remove `static` from `.gitignore`, and then you can go to the GitHub project settings and setup GitHub Pages to use the master branch. This will make the site publicly accessible.
