module.exports = (sequelize, DataTypes) => {
  return sequelize.define ('file', {
    // instantiating will automatically set the flag to true if not set
    flag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    uuid: {
      type:DataTypes.STRING
    },

    filename: {
      type:DataTypes.STRING
    },   

  }, {
      timestamps: true,

      // don't delete database entries but set the newly added attribute deletedAt
      // to the current date (when deletion was done). paranoid will only work if
      // timestamps are enabled
      paranoid: true,
    });
}
