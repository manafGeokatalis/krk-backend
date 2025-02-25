'use strict'
const fs = require('fs');
const fastifyMultipart = require("@fastify/multipart")
const auth = require("../../middleware/authMiddleware")
const { verifyToken } = require('../../utils/auth')
const { MONTH } = require('../../utils/date')
const StatistikService = require('../../services/StatistikService')

const { errorResponse, successResponse } = require("../../utils/helpers");

module.exports = async function (fastify) {


    fastify.get('/summary', async function (request, reply) {
        try {
            const permohonanProgressCount = await StatistikService.getPermohonanProgressCounts()
            const feedbackCount = await StatistikService.getTotalFeedbackCount()
            const countVisitor = await StatistikService.getCountVisitThisMonth()
            const response = {
                ...permohonanProgressCount,
                feedback: feedbackCount,
                visitor_this_month: countVisitor
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

    fastify.get('/list-visitor', async function (request, reply) {
        const year = parseInt(request.query.year)


        const getVisitorPerMonth = await StatistikService.getVisitorPerMonth(year)
        const getNewUserPerMonth = await StatistikService.getNewUser(year)
        const getAvgFeedback = await StatistikService.getAvgFeedback(year)

        const res = MONTH.map((item, key) => ({
            bulan: item,
            total_visitors: getVisitorPerMonth[key].total_visitors,
            total_user: getNewUserPerMonth[key].total_user,
            avg_feedback: getAvgFeedback[key].average_feedback

        }))

        reply.send(successResponse(null, res));
    })

    fastify.get('/list-feedback', async function (request, reply) {
        try {
            const page = parseInt(request.query.page) || 1;
            const perPage = parseInt(request.query.perPage) || 10;
            const order = request.query.order || 'desc';
            const orderBy = request.query.orderBy || 'created_at';
            const response = await StatistikService.getListFeedback(page, perPage, order, orderBy)


            reply.send(successResponse(null, response));

        } catch (error) {
            reply.status(500).send(errorResponse(error.message));
        }
    })

    fastify.get('/get-visitor-device', async function (request, reply) {
        try {
            const response = await StatistikService.getVisitorDevice()

            const data = response.result.map((item) => ({
                value: item.count,
                label: item.device_type,
                user_agent: item.user_agent,
                percent: (item.count / response.count) * 100
            }))
            reply.send(successResponse(null, data));

        } catch (error) {
            reply.status(500).send(errorResponse(error.message))
        }
    })
}