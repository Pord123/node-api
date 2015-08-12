export function up(queryInterface, Sequelize) {
  queryInterface.createTable('memberships', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    committeeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'committees', key: 'id' }
    },
    termId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'terms', key: 'id' }
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: false
    },
    endDate: Sequelize.DATE,
    approved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  });
}

export function down(queryInterface) {
  queryInterface.dropTable('memberships');
}
