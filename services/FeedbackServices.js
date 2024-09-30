const db = require("../models");

class FeedbackServices {
    async addFeedback(payload) {
        const { user_id, feedback, rating } = payload;

        try {
            // const existingFeedback = await db.feedbacks.findOne({ where: { user_id } });
            // console.log(existingFeedback, 'a')
            // If not, create new feedback
            return await db.feedbacks.create({
                user_id,
                feedback,
                rating,
            });
        } catch (error) {
            console.log(error)
            throw new Error(error.message);
        }
    }

    async checkFeedbackByUserId(user_id) {
        try {
            const feedback = await db.feedbacks.findOne({ where: { user_id } });
            return feedback
        } catch (error) {
            console.log(error)
            throw new Error(error.message);
        }
    }
}

module.exports = new FeedbackServices;