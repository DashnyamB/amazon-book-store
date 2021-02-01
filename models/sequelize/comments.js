const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "comments",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      bookId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "book",
          key: "id",
        },
      },
      comment: {
        type: DataTypes.STRING(300),
        allowNull: false,
        get() {
          const comment = this.getDataValue("comment").toLowerCase();
          return comment.charAt(0).toUpperCase() + comment.slice(1);
        },
        set(value) {
          this.setDataValue("comment", value.replace("миа", "****"));
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "comments",
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "FK_comments_1",
          using: "BTREE",
          fields: [{ name: "userId" }],
        },
        {
          name: "FK_Book",
          using: "BTREE",
          fields: [{ name: "bookId" }],
        },
      ],
    }
  );
};
