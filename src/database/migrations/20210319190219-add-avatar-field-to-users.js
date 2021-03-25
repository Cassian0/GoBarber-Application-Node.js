module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      // Aqui criamos nossa foreignKey relacionando nosso file id com o avatar_id
      // ou seja nossa tabela files com nossa tabala users
      references: { model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      AllowNull: true,
    });
  },

  down: async (queryInterface) =>
    queryInterface.removeColumn('users', 'avatar_id'),
};
