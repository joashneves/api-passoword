exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      unique: true,
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    username: {
      type: "varchar(30)",
      unique: true,
      notNull: true,
    },
    email: {
      type: "varchar(254)",
      unique: true,
      notNull: true,
    },
    password: {
      type: "varchar(60)",
      notNull: true,
    },
    role:{
      type: "varchar(60)",
      notNull: true,
      default: 'commun'
    },
    created_at: {
      notNull: true,
      type: "timestamptz",
      default: pgm.func("timezone('UTC', now())"),
    },
    updated_at: {
      notNull: true,
      type: "timestamptz",
      default: pgm.func("timezone('UTC', now())"),
    },
  });
};

exports.down = false;