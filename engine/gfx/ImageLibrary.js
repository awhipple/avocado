import Image from "./Image.js";

export default class ImageLibrary {
  images = {}
  preloadPromises = {};

  constructor(path = "./images/") {
    this.path = path;
  }

  get(name) {
    name = name.toLowerCase();
    return this.images[name] || this._loadImage(name);
  }

  preload(name) {
    if ( typeof name === 'string' ) {
      name = [ name ];
    }
    for ( var i = 0; i < name.length; i++ ) {
      this.get(name[i]);
    }
  }

  load() {
    return Promise.all(Object.values(this.preloadPromises));
  }

  save(img, name) {
    this.images[name] = new Image(img);
  }

  _loadImage(name) {
    var img = new window.Image;
    img.src = this.path + name + ".png";
    var image = new Image(img);
    this.preloadPromises[name] = new Promise((resolve) => {
      img.onload = () => {
        image.width = img.width;
        image.height = img.height;
        resolve();
      };
    });

    return this.images[name] = image;
  }
}