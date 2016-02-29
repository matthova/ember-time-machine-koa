const Promise = require(`bluebird`);

/**
 * Handle all logic at this endpoint for reading all of the tasks
 */
const renderUi = (self) => {
  self.router.get(self.routeEndpoint, async (ctx) => {
    try {
      // Pass the settings to the front end
      ctx.render(`TimeMachine/index`, {
        title: `Ember Time Machine`,
        ip: self.ip,
        fps: self.fps,
        videoLength: self.videoLength,
      });
    } catch (ex) {
      ctx.body = { status: `Ember Time Machine request error: ${ex}` };
      ctx.status = 500;
    }
  });
};

/**
 * Handle all logic at this endpoint for updating a single task
 */
const updateTimeMachine = (self) => {
  self.router.put(`/`, async (ctx) => {
    try {
      const ip = ctx.request.body.ip;
      const fps = ctx.request.body.fps;
      const videoLength = ctx.request.body.videoLength;
      const timeMachines = await self.TimeMachine.findAll();
      const timeMachine = timeMachines[0];
      await timeMachine.updateAttributes({
        ip,
        fps,
        videoLength,
      });
      self.ip = ip;
      self.fps = fps;
      self.videoLength = videoLength;
      ctx.body = { status: "success" };
    } catch (ex) {
      ctx.body = { status: `Ember Time Machine "Update Settings" request error: ${ex}` };
      ctx.status = 500;
    }
  });
};

const toDoListRoutes = (self) => {
  renderUi(self);
  updateTimeMachine(self);
};

module.exports = toDoListRoutes;
