# twotech

> Two Hours One Life Crafting Reference

View here: https://twotech.twohoursonelife.com

This site is built using the game data directly from [the game data repository](https://github.com/twohoursonelife/OneLifeData7).
It shows the relationships between items, and lets you explore how things are crafted.

Unlike the wiki, which contains "wisdom" about the game, this site contains only "knowledge".
This is a reference. For a better guide, go to the [game wiki](https://twohoursonelife.fandom.com/wiki/Two_Hours,_One_Life_Wiki).


## Build Setup

The project is split into two parts:
- A node script that processes the latest data from the game data repository
- The site itself, built in VueJS


### Site

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
# to simulate edge subdomain visit edge.lvh.me:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).


### Processing Script

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
npm run process -- download

# if you want to re-process the sprites without downloading data
npm run process -- sprites

# if you want to re-process the sounds without downloading data
npm run process -- sounds

# or process without generating sprites
npm run process
```

### Processing Script (Docker version)

> Note 1: This is for a Linux machine with Docker installed.

> Note 2: This creates a separate process directory, to not mess with the main build.

To only generate the twotech processed data used for the website, first run:
```
./prepare-process-docker.sh
```

This will build the Docker image used for the build environment, and then set up the process directory for use.

You can then run different build commands within a container of this image:
```
./docker-run.sh npm run process
```
```
./docker-run.sh npm run process -- download
```
```
./docker-run.sh npm run process -- sprites
```
```
./docker-run.sh npm run process -- sounds
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
