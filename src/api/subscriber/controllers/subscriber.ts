'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::subscriber.subscriber',
  ({ strapi }) => ({
    /**
     * GET /api/subscribers/confirm?email=foo@bar.com
     * Marks the subscriber as confirmed = true
     */
    async confirm(ctx) {
      const { email } = ctx.query;
      if (!email) {
        return ctx.badRequest('Missing email query parameter');
      }

      // Find the subscriber by email
      const subs = await strapi.entityService.findMany('api::subscriber.subscriber', {
        filters: { email },
        fields: ['id', 'confirmed'],
        limit: 1,
      });
      if (!subs.length) {
        return ctx.notFound('No subscription found for that email');
      }

      // Update confirmed flag
      await strapi.entityService.update('api::subscriber.subscriber', subs[0].id, {
        data: { confirmed: true },
      });

      // Redirect to your front-end thank-you page (or return JSON)
      return ctx.redirect(`${process.env.FRONTEND_URL}/thank-you`);
    },

    /**
     * GET /api/subscribers/unsubscribe?email=foo@bar.com
     * Marks the subscriber as confirmed = false
     */
    async unsubscribe(ctx) {
      const { email } = ctx.query;
      if (!email) {
        return ctx.badRequest('Missing email query parameter');
      }

      // Find the subscriber by email
      const subs = await strapi.entityService.findMany('api::subscriber.subscriber', {
        filters: { email },
        fields: ['id', 'confirmed'],
        limit: 1,
      });
      if (!subs.length) {
        return ctx.notFound('No subscription found for that email');
      }

      // Update confirmed flag off
      await strapi.entityService.update('api::subscriber.subscriber', subs[0].id, {
        data: { confirmed: false },
      });

      // Redirect to your front-end goodbye page (or return JSON)
      return ctx.redirect(`${process.env.FRONTEND_URL}/goodbye`);
    },
  })
);
