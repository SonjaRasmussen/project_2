module.exports = function(sequelize, DataTypes) {
  var Reward = sequelize.define("Reward", {
    item: DataTypes.STRING
  });

  Reward.associate = function(models) {
    // We're saying that a reward should belong to a registered user
    // A task can't be created without a user due to the foreign key constraint
    Reward.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
  };
  return Reward;
};
