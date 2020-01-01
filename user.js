const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const User = sequelize.define('user', {
    vkId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },

    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },

    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

User.sync({
    alter: true
});

module.exports = User;
