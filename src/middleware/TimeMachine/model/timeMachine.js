const Sequelize = require('sequelize');

module.exports = async (app) => {
  // Define the model for Task
  const TimeMachine = await app.context.db.define('TimeMachine', {
    ip: Sequelize.STRING,
    fps: Sequelize.STRING,
    videoLength: Sequelize.STRING,
  });

  // Update the database tables to contain 'Task'
  await app.context.db.sync();
  return TimeMachine;
};
