// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const User = sequelize.define('User', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     email: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//     },
//     name: {
//         type: DataTypes.STRING,
//     },
//     role: {
//         type: DataTypes.STRING,
//         defaultValue: 'basic',
//     },
//     secret_key: {  // Replaces password
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     created_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },
//     updated_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//     },
// }, {
//     tableName: 'Users',
//     timestamps: true,
//     underscored: true,
//     freezeTableName: true,
// });

// module.exports = User;

const { Model, DataTypes } = require('sequelize');

class User extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            name: {
                type: DataTypes.STRING,
            },
            role: {
                type: DataTypes.STRING,
                defaultValue: 'basic',
            },
            secret_key: {  // Replaces password
                type: DataTypes.STRING,
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize, // ✅ Pass Sequelize instance
            modelName: 'User', // ✅ Set model name
            tableName: 'Users', // ✅ Ensure correct table name
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        });
    }
}

module.exports = User;

