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

async function getLastFmBio(artistName: string): Promise<string | null> {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) return null;
  const q = encodeURIComponent(artistName);
  const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${q}&api_key=${apiKey}&format=json`;
  const res = await fetch(url);
  const data = await res.json();

  // The bio is under data.artist.bio.summary (HTML string)
  let bio = data.artist?.bio?.summary ?? null;

  // Clean the Last.fm credit line
  if (bio) {
    bio = bio.replace(/\s*<a [^>]*>Read more on Last\.?fm<\/a>\.?\s*/gi, '').trim();
  }

  return bio;
}

function extractTextUniversal(description) {
  // Case 1: Already a string
  if (typeof description === 'string') return description;

  // Case 2: Array of nodes (Slate or similar)
  if (Array.isArray(description)) {
    return description
      .map(node => {
        if (node.text) return node.text;
        if (Array.isArray(node.children)) return extractTextUniversal(node.children);
        return '';
      })
      .join(' ');
  }

  // Fallback: Something else (null, object, etc)
  return '';
}

function autoFillSeo(data, model) {
  if (!data) return;
  const locale = data.locale || 'en';

  if (!data.seo) data.seo = {};

  const title = data.title || data.Name || data.subject || data.Title || data.name || '';
  const description =
    data.description ||
    data.bio ||
    data.summary ||
    data.name ||
    (typeof data.body === 'string' ? data.body : '');

  if (!data.seo.metaTitle && title) {
    data.seo.metaTitle = title.substring(0, 60);
  }
  if (!data.seo.metaDescription && description) {
    const text = extractTextUniversal(description);
    const summary = text.substring(0, 100);    
    data.seo.metaDescription = summary;
  }

  // ---- Robust image extraction ----
  let imageField = null;

  if (Array.isArray(data.image) && data.image.length > 0) {
    imageField = data.image[0];
  } else if (data.image && typeof data.image === "object") {
    imageField = data.image;
  } else if (Array.isArray(data.Image) && data.Image.length > 0) {
    imageField = data.Image[0];
  } else if (data.Image && typeof data.Image === "object") {
    imageField = data.Image;
  }

  if (!data.seo.shareImage && imageField) {
    data.seo.shareImage = imageField; // assign only a media object here!
  }

  // Only set externalImageUrl if it's a valid string and no shareImage
  if (!data.seo.shareImage && !data.seo.externalImageUrl && typeof data.spotifyImageUrl === 'string' && data.spotifyImageUrl.startsWith('http')) {
    data.seo.externalImageUrl = data.spotifyImageUrl;
  }


  if (!data.seo.keywords && title) {
    const base = `${title} ${description || ''}`;
    data.seo.keywords = Array.from(
      new Set(
        base
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(Boolean)
      )
    )
      .slice(0, 8)
      .join(', ');
  }
  if (!data.seo.canonicalURL && data.slug && (!model.includes('artist') && !model.includes('event') && !model.includes('news'))) {
    data.seo.canonicalURL = `https://www.dancetoday.com.gr/${locale}`;
  }

  if (!data.seo.metaRobots) {
    data.seo.metaRobots = "index,follow";
  }

  // ---- Structured Data ----
  if (!data.seo.structuredData) {
    // Generate based on content-type
    if (model.includes('artist')) {
      if (!data.seo.canonicalURL && data.slug) {
        data.seo.canonicalURL = `https://www.dancetoday.com.gr/${locale}/artists/${data.slug}`;
      }
      data.seo.structuredData = {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        "name": title,
        "description": description,
        ...(imageField && { "image": getImageUrl(imageField) }),
        ...(data.slug && {
          "url": `https://www.dancetoday.com.gr/${locale}/artists/${data.slug}`,
        }),
      };
    } else if (model.includes('event')) {
      if (!data.seo.canonicalURL && data.slug) {
        data.seo.canonicalURL = `https://www.dancetoday.com.gr/${locale}/events/${data.slug}`;
      }
      data.seo.structuredData = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": title,
        "description": description,
        ...(data.startDate && { "startDate": data.startDate }),
        ...(data.location && {
          "location": {
            "@type": "Place",
            "name": typeof data.location === "string" ? data.location : data.location?.name || ""
          }
        }),
        ...(imageField && { "image": getImageUrl(imageField) }),
        ...(data.slug && {
          "url": `https://www.dancetoday.com.gr/${locale}/events/${data.slug}`,
        }),
      };
    } else if (model.includes('news') || model.includes('article')) {
      if (!data.seo.canonicalURL && data.slug) {
        data.seo.canonicalURL = `https://www.dancetoday.com.gr/${locale}/news/${data.slug}`;
      }
      data.seo.structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        ...(imageField && { "image": getImageUrl(imageField) }),
        ...(data.slug && {
          "url": `https://www.dancetoday.com.gr/${locale}/news/${data.slug}`,
        }),
        ...(data.publishedAt && { "datePublished": data.publishedAt }),
      };
    } else if (model.includes('music-genre')) {
      if (!data.seo.canonicalURL && data.slug) {
        data.seo.canonicalURL = `https://www.dancetoday.com.gr/${locale}/music/${data.slug}`;
      }
      data.seo.structuredData = {
        "@context": "https://schema.org",
        "@type": "Music",
        "headline": title,
        "description": description,
        ...(imageField && { "image": getImageUrl(imageField) }),
        ...(data.slug && {
          "url": `https://www.dancetoday.com.gr/${locale}/news/${data.slug}`,
        }),
        ...(data.publishedAt && { "datePublished": data.publishedAt }),
      };
    }
  }

}

// Helper to extract image URL (works for media object or array)
function getImageUrl(imageField) {
  if (!imageField) return null;

  // If it's a Strapi media array
  if (Array.isArray(imageField) && imageField[0]?.url) {
    return imageField[0].url;
  }

  // If it's a Strapi media object
  if (typeof imageField === 'object' && imageField.url) {
    return imageField.url;
  }

  // If it's already a string (Spotify image)
  if (typeof imageField === 'string') {
    return imageField;
  }

  // Default fallback
  return null;
}



export default {
  /**
   * Runs before your application is initialized.
   */

  register({ strapi }) {
    strapi.documents.use(
      async (context, next) => {
        if (
          context.uid &&
          ['create', 'update'].includes(context.action) &&
          context.params?.data
        ) {
          
          // Automate SEO fields (for any model using SEO component)
          if (
            context.uid === 'api::artist.artist'
          ) {
            const data = context.params.data;

            // Fetch Spotify image if not present
            if (data && data.Name && (!data.spotifyImageUrl || data.spotifyImageUrl === '')) {
              try {
                const url = await getSpotifyImageUrl(data.Name);
                if (url) data.spotifyImageUrl = url;
              } catch (e: any) {
                strapi.log.error('Spotify API error: ' + e.message);
              }
            }

            // Fetch Last.fm bio if not present
            if (data && data.Name && (!data.bio || data.bio === '')) {
              try {
                const bio = await getLastFmBio(data.Name);
                console.log(bio);

                if (bio) data.bio = bio;
              } catch (e: any) {
                strapi.log.error('Last.fm API error: ' + e.message);
              }
            }
          }
          autoFillSeo(context.params.data, context.uid)

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
            { templateReferenceId: 1 },        // Template options
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