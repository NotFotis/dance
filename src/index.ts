// src/index.ts
import fetch from 'node-fetch';

async function getSpotifyToken(): Promise<string> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token as string;
}

async function getSpotifyImageUrl(artistName: string): Promise<string | null> {
  const token = await getSpotifyToken();
  const q = encodeURIComponent(artistName);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=artist&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  const artist = data.artists?.items?.[0];
  return artist?.images?.[0]?.url ?? null;
}

export default {
  /**
   * Runs before your application is initialized.
   */
  
  register({ strapi }: { strapi: any }) {
    strapi.documents.use(
      async (
        context: {
          uid: string;
          action: string;
          params: { data: Record<string, any> };
        },
        next: () => Promise<void>
      ) => {
        // Only run for 'artist' create and update
        if (
          context.uid === 'api::artist.artist' &&
          ['create', 'update'].includes(context.action)
        ) {
          const data = context.params.data;
          console.log(data);
          
          // Use 'Name' field as per your schema (case-sensitive)
          if (
            data &&
            data.Name &&
            (!data.spotifyImageUrl || data.spotifyImageUrl === '')
          ) {
            try {
              const url = await getSpotifyImageUrl(data.Name);
              if (url) {
                data.spotifyImageUrl = url;
              }
            } catch (e: any) {
              strapi.log.error('Spotify API error: ' + e.message);
            }
          }
        }
        return next();
      }
    );
  },


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