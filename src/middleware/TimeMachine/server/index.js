const router = require('koa-router')();

const timeMachineRoutes = require('./routes');
const timeMachine = require('./model/timeMachine');

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
  }

  /**
   * initialize the to-do list endpoint
   */
  async initialize() {
    try {
      await this.setupRouter();
      // initial setup of the db
      this.TimeMachine = await timeMachine(this.app);
      const results = await this.TimeMachine.findAll();
      // If the time machine settings haven't been created ye, create them now
      if (results.length === 0) {
        await this.TimeMachine.create({
          ip: '0.0.0.0',
          fps: '24',
          videoLength: '10',
        });
      }
      this.logger.info('Time Machine instance initialized');
    } catch (ex) {
      this.logger.error('Time Machine initialization error', ex);
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

      this.logger.info('Time Machine router setup');
      return true;
    } catch (ex) {
      this.logger.error('Time Machine router setup error', ex);
      return false;
    }
  }
}

module.exports = TimeMachine;
