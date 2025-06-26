import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAdvertisingOptions extends Struct.ComponentSchema {
  collectionName: 'components_shared_advertising_options';
  info: {
    displayName: 'advertisingOptions';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface SharedDiscussionTopics extends Struct.ComponentSchema {
  collectionName: 'components_shared_discussion_topics';
  info: {
    displayName: 'discussionTopics';
  };
  attributes: {
    link: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedFeaturedMember extends Struct.ComponentSchema {
  collectionName: 'components_shared_featured_members';
  info: {
    displayName: 'featuredMember';
  };
  attributes: {
    name: Schema.Attribute.String;
    quote: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedMixes extends Struct.ComponentSchema {
  collectionName: 'components_shared_mixes';
  info: {
    displayName: 'mixes';
  };
  attributes: {
    embedCode: Schema.Attribute.Blocks;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    externalImageUrl: Schema.Attribute.String;
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaRobots: Schema.Attribute.Enumeration<
      ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow']
    > &
      Schema.Attribute.DefaultTo<'index,follow'>;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
    structuredData: Schema.Attribute.JSON;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: '';
    displayName: 'SocialLink';
    icon: 'globe';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      [
        'Facebook',
        'Instagram',
        'X',
        'Beatport',
        'Spotify',
        'Soundcloud',
        'Apple Music',
        'Tidal',
      ]
    >;
    URL: Schema.Attribute.String;
  };
}

export interface SharedStats extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'stats';
  };
  attributes: {
    description: Schema.Attribute.Text;
    text: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface SharedTeamMembers extends Struct.ComponentSchema {
  collectionName: 'components_shared_team_members';
  info: {
    displayName: 'teamMembers';
  };
  attributes: {
    bio: Schema.Attribute.Blocks;
    name: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    role: Schema.Attribute.String;
    socials: Schema.Attribute.Component<'shared.social-link', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.advertising-options': SharedAdvertisingOptions;
      'shared.discussion-topics': SharedDiscussionTopics;
      'shared.featured-member': SharedFeaturedMember;
      'shared.media': SharedMedia;
      'shared.mixes': SharedMixes;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.social-link': SharedSocialLink;
      'shared.stats': SharedStats;
      'shared.team-members': SharedTeamMembers;
    }
  }
}
