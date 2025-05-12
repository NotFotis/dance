// src/index.ts

export default {
  /**
   * Runs before your application is initialized.
   */
  register() {},

  /**
   * Runs before your application starts.
   * Sets up lifecycle hooks using Email Designer v5 plugin.
   */
  async bootstrap({ strapi }) {
    // Configuration
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
    const DEFAULT_FROM = process.env.DEFAULT_FROM_EMAIL || 'no-reply@yourdomain.com';

    // --- Confirmation Email Hook ------------------------------------------
    strapi.db.lifecycles.subscribe({
      models: ['api::subscriber.subscriber'],
      async afterCreate(event) {
        const { result } = event;
        const email = result.email;
        if (!email) return;

        // Send confirmation email via Email Designer v5
        await strapi
          .plugin('email-designer-v5')
          .service('email')
          .sendTemplatedEmail(
            { to: email, from: DEFAULT_FROM },              // Email options
            { templateReferenceId: 1},        // Template options
            { email }                                      // Data for template variables
          );
      },
    });

    // --- Newsletter Email Hook ---------------------------------------------
    strapi.db.lifecycles.subscribe({
      models: ['api::newsletter.newsletter'],
      async afterCreate(event) {
        const { result } = event;
        if (!result.publishedAt) return;
        await sendNewsletter(result);
      },
      async afterUpdate(event) {
        const { result, params } = event;
        if (!params.data?.publishedAt) return;
        await sendNewsletter(result);
      },
    });

    /**
     * Helper: send newsletter to all confirmed subscribers
     */
    async function sendNewsletter(entry) {
      // Fetch confirmed subscriber emails
      const subs = await strapi.entityService.findMany('api::subscriber.subscriber', {
        filters: { confirmed: true },
        fields: ['email'],
      });
      const emails = subs.map(s => s.email).filter(Boolean);
      if (!emails.length) return;

      // Convert body blocks to HTML string
      const contentHtml =
        typeof entry.body === 'string' ? entry.body : blocksToHtml(entry.body);

      // Send templated newsletter to each subscriber
      await Promise.all(
        emails.map(email =>
          strapi
            .plugin('email-designer-v5')
            .service('email')
            .sendTemplatedEmail(
              { to: email, from: DEFAULT_FROM },             // Email options
              { templateReferenceId: 2 },         // Template options
              {
                email,                                        // Available in template as {{= email }}
                subject: entry.subject,                       // {{= subject }}
                content: contentHtml,                         // {{= content }}
                unsubscribeUrl: `${STRAPI_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`
              }                                             // Data for template variables
            )
        )
      );
    }

    /**
     * Convert Strapi rich-text blocks to basic HTML string
     */
    function blocksToHtml(blocks) {
      return blocks
        .map(block => {
          const text = Array.isArray(block.children)
            ? block.children.map(c => escapeHtml(String(c.text || ''))).join('')
            : '';
          switch (block.type) {
            case 'paragraph':
              return `${text}`;
            case 'heading':
              return `<h2>${text}</h2>`;
            case 'list': {
              const tag = block.format === 'unordered' ? 'ul' : 'ol';
              const items = Array.isArray(block.children)
                ? block.children.map(c => `<li>${escapeHtml(String(c.text || ''))}</li>`).join('')
                : '';
              return `<${tag}>${items}</${tag}>`;
            }
            default:
              return text;
          }
        })
        .join('');
    }

    /**
     * Escape special HTML characters in text nodes
     */
    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  },
};