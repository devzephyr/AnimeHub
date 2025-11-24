const mongoose = require('mongoose');

const ROLE_OPTIONS = ['Ranger', 'Archer', 'Warrior', 'Hobbit', 'Wizard', 'Dwarf'];

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /.+@.+\..+/,
    },
    age: {
      type: Number,
      required: true,
      min: 13,
      max: 999,
    },
    role: {
      type: String,
      enum: ROLE_OPTIONS,
      default: 'Ranger',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

memberSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Member', memberSchema);

