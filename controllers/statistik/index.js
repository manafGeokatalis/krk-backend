'use strict'
const fs = require('fs');
const fastifyMultipart = require("@fastify/multipart")
const auth = require("../../middleware/authMiddleware")
const { verifyToken } = require('../../utils/auth')
const { MONTH } = require('../../utils/date')
const StatistikService = require('../../services/StatistikService')

const { errorResponse, successResponse } = require("../../utils/helpers");

module.exports = async function (fastify) {
    fastify.addHook('preHandler', auth());


    fastify.get('/summary', async function (request, reply) {
        try {
            const permohonanProgressCount = await StatistikService.getPermohonanProgressCounts()
            const feedbackCount = await StatistikService.getTotalFeedbackCount()
            const response = {
                ...permohonanProgressCount,
                feedback: feedbackCount
            }
            reply.send(successResponse(null, response));

        } catch (error) {
            reply.status(500).send(errorResponse(error.message));
        }
    })

    fastify.get('/list-statistik', async function (request, reply) {
        try {
            const year = parseInt(request.query.year)
            const response = await StatistikService.getListStatistik(year)

            const res = response.map((item) => ({
                bulan: MONTH[item.month],
                pengajuan_masuk: Number(item.pengajuan_masuk),
                pengajuan_selesai: Number(item.pengajuan_selesai)
            }))

            reply.send(successResponse(null, res));

        } catch (error) {
            reply.status(500).send(errorResponse(error.message));
        }
    })

    fastify.get('/list-feedback', async function (request, reply) {
        try {
            const page = parseInt(request.query.page) || 1;
            const perPage = parseInt(request.query.perPage) || 10;
            const order = request.query.order || 'desc';
            const orderBy = request.query.orderBy || 'created_at';
            console.log(orderBy, 'order')
            const response = await StatistikService.getListFeedback(page, perPage, order, orderBy)


            reply.send(successResponse(null, response));

        } catch (error) {
            reply.status(500).send(errorResponse(error.message));
        }
    })
}