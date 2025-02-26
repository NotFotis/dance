"use strict";
import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::saved-event.saved-event", ({ strapi }) => ({
  async create(ctx) {
    const { data } = ctx.request.body;

    if (!data || !data.user || !data.event) {
      return ctx.badRequest("Missing required fields: user and event");
    }

    try {
      // Ensure the user exists
      const userExists = await strapi.entityService.findOne("plugin::users-permissions.user", data.user);
      if (!userExists) {
        return ctx.badRequest("User not found");
      }

      // Ensure the event exists
      const eventExists = await strapi.entityService.findOne("api::event.event", data.event);
      if (!eventExists) {
        return ctx.badRequest("Event not found");
      }

      // Create the saved event entry
      const savedEvent = await strapi.entityService.create("api::saved-event.saved-event", {
        data: {
          user: data.user,
          event: data.event
        }
      });

      return savedEvent;
    } catch (error) {
      console.error("Error saving event:", error);
      return ctx.internalServerError("Something went wrong");
    }
  }
}));
