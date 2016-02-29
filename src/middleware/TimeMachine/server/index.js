const router = require(`koa-router`)();
const gpio = require(`gpio`);
const request = require(`request-promise`);

const timeMachineRoutes = require(`./routes`);
const timeMachineModel = require(`./model/timeMachine`);

/**
 * This is a ToDoList class.
 */
class TimeMachine {
  /**
   * Time Machine constructor
   * @param {Object} app - The parent Koa app.
   * @param {string} routeEndpoint - The relative endpoint.
   * @example
   * let myToDoList = new ToDoList(app, '/toDoList');
   */
  constructor(app, routeEndpoint) {
    this.app = app;
    this.logger = app.context.logger;
    this.routeEndpoint = routeEndpoint;
    this.router = router;
    this.gpioPin = 4;
    this.ip = undefined;
    this.fps = undefined;
    this.videoLength = undefined;

    this.state = `Unavailable`;
    this.photoTaken = false;
    this.totalLayers = undefined;
    this.layersPerPhoto = undefined;
    this.currentPhoto = undefined;
    this.totalPhotos = undefined;
  }

  /**
   * initialize the to-do list endpoint
   */
  async initialize() {
    try {
      // set up the router
      await this.setupRouter();

      // set up the database
      this.TimeMachine = await timeMachineModel(this.app);
      let timeMachines = await this.TimeMachine.findAll();

      // If the time machine settings haven't been created yet, create them now
      if (timeMachines.length === 0) {
        await this.TimeMachine.create({
          ip: `0.0.0.0`,
          fps: `24`,
          videoLength: `10`,
        });
      }

      // now save the database settings to the class object
      timeMachines = await this.TimeMachine.findAll();
      const timeMachine = timeMachines[0];
      this.ip = timeMachine.dataValues.ip;
      this.fps = timeMachine.dataValues.fps;
      this.videoLength = timeMachine.dataValues.videoLength;

      // setup the gpio. once the gpio is ready
      // set the raspberry pi to ping ember at an interval
      this.gpio = gpio.export(this.gpioPin, {
        direction: 'out',
        ready: () => {
          setInterval(this.pingEmber, 500);
        },
      });

      this.logger.info(`Time Machine instance initialized`);
    } catch (ex) {
      this.logger.error(`Time Machine initialization error`, ex);
    }
  }

  /**
   * setupRouter sets up the Time Machine instance's router
   */
  async setupRouter() {
    try {
      timeMachineRoutes(this);
      // Register all router routes with the app
      this.app
      .use(this.router.routes())
      .use(this.router.allowedMethods());

      this.logger.info(`Time Machine router setup`);
      return true;
    } catch (ex) {
      this.logger.error(`Time Machine router setup error`, ex);
      return false;
    }
  }

  async pingEmber() {
    try {
      console.log('eyyy');
      const requestParams = {
        method: `POST`,
        uri: `http://${this.ip}/command`,
        body: {
          command: `getStatus`,
        },
        json: true,
      };
      const res = await request(requestParams);
      this.parseStatus(res);
    } catch(ex) {
      console.log('request error');
    }
  }

/*
    this.state = `Unavailable`;
    this.photoTaken = false;
    this.totalLayers = undefined;
    this.layersPerPhoto = undefined;
    this.currentPhoto = undefined;
    this.totalPhotos = undefined;
*/

  async parseStatus(status) {
    try {
      if (this.totalLayers === 0) {
        this.updateLayersPerPhoto(status);
      }

      this.state = status.response.state.toLowerCase();
      // get the current layer

      switch (this.state) {
        case `exposing`:
          if (!this.photoTaken) {
            this.photoTaken = true;
            if (this.currentLayer % this.layersPerPhoto === 0) {
              await this.takePhoto();
            }
          }
          break;
        case `separating`:
          this.photoTaken = false;
          break;
        case `homing`:
        case `movingtostartposition`:
          this.takePhoto();
          break;
        case `home`:
          this.totalLayers = 0;
          break;
        default:
          console.log('wuuuuhh', this.state);
          break;
      }
    } catch(ex) {
      console.log('parse request error', ex);
    }
  }

  async takePhoto() {
    this.gpio.set(1);
    await Promise.delay(100);
    this.gpio.set(0);
  }

  async updateLayersPerPhoto(status) {
    this.totalLayers = Number(status.response.total_layers);
    if (this.totalLayers > 0) {
      this.layersPerPhoto = Math.round(this.totalLayers / this.fps / this.videoLength);
    }
  }
}

module.exports = TimeMachine;
