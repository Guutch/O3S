// Database model for storing IG cookies
const { Model, DataTypes } = require('sequelize');

class InstagramAccount extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            cookies: {
                type: DataTypes.TEXT, // Store serialized cookie JSON
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
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
            modelName: 'InstagramAccount', // ✅ Set model name
            tableName: 'InstagramAccounts', // ✅ Ensure this matches DB
            timestamps: true,
            underscored: false,
        });
    }
}

module.exports = InstagramAccount;
