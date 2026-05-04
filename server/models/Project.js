const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    liveLink: {
      type: String,
      default: '',
      trim: true,
    },
    githubLink: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
