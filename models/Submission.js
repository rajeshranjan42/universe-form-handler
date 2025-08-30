const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    data: {
        type: Object,
        required: true
    },
    source: {
        type: String,
        default: 'Unknown'
    },
    ip: String,
    userAgent: String,
    processed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better performance
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ source: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
