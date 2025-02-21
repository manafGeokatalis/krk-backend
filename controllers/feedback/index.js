'use strict'
const fs = require('fs');
const fastifyMultipart = require("@fastify/multipart")
const auth = require("../../middleware/authMiddleware")
const { verifyToken } = require('../../utils/auth')
const FeedbackServices = require('../../services/FeedbackServices')
const { errorResponse, successResponse } = require("../../utils/helpers");

module.exports = async function (fastify) {
    fastify.addHook('preHandler', auth());
    fastify.post('/', async function (request, reply) {
        try {
            const token = request.cookies.token
            const { feedback, rating } = request.body
            const decodeToken = verifyToken(token)

            const payload = {
                user_id: decodeToken?.id,
                feedback,
                rating
            }

            const insert = await FeedbackServices.addFeedback(payload)
            //   const data = await LocationServices.getProvinsi();
            reply.send(successResponse('Feedback berhasil disimpan', insert));
        } catch (error) {
            reply.status(500).send(errorResponse(error.message));
        }
    })
    fastify.get('/check', async function (request, reply) {
        try {
            const token = request.cookies.token
            const decodeToken = verifyToken(token)

            const user_id = decodeToken?.id


            const data = await FeedbackServices.checkFeedbackByUserId(user_id);
            reply.send(successResponse(null, data));
        } catch (error) {
            reply.status(500).send(errorResponse(error.message));
        }
    })
}