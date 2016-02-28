const Promise = require('bluebird');

/**
 * Handle all logic at this endpoint for reading all of the tasks
 */
const renderUi = (self) => {
  self.router.get(self.routeEndpoint, async (ctx) => {
    try {
      const timeMachines = await self.TimeMachine.findAll().map((task) => {
        return {
          ip: task.dataValues.ip,
          fps: task.dataValues.fps,
          videoLength: task.dataValues.videoLength,
        };
      });
      const timeMachine = timeMachines[0];
      // Pass the settings to the front end
      ctx.render('TimeMachine/index', {
        title: 'Ember Time Machine',
        ip: timeMachine.ip,
        fps: timeMachine.fps,
        videoLength: timeMachine.videoLength,
      });
    } catch (ex) {
      ctx.body = { status: 'Ember Time Machine request error: ' + ex };
      ctx.status = 500;
    }
  });
};

/**
 * Handle all logic at this endpoint for updating a single task
 */
const updateTimeMachine = (self) => {
  self.router.put('/', async (ctx) => {
    try {
      const ip = ctx.request.body.ip;
      const fps = ctx.request.body.fps;
      const videoLength = ctx.request.body.videoLength;
      console.log('settings to update', ip, fps, videoLength);
      const timeMachines = await self.TimeMachine.findAll();
      const timeMachine = timeMachines[0];
      timeMachine.updateAttributes({
        ip,
        fps,
        videoLength,
      });
      ctx.body = { status: "success" };
    } catch (ex) {
      ctx.body = { status: 'Ember Time Machine "Update Settings" request error: ' + ex };
      ctx.status = 500;
    }
  });
};

const toDoListRoutes = (self) => {
  renderUi(self);
  updateTimeMachine(self);
};

module.exports = toDoListRoutes;
