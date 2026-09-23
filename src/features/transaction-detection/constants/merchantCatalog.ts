export interface MerchantCatalogEntry {
  canonicalName: string;
  categoryHint: string;
  aliases: RegExp[];
}

export const KNOWN_MERCHANTS: MerchantCatalogEntry[] = [
  // Food & Dining
  {
    canonicalName: 'Swiggy',
    categoryHint: 'Food & Dining',
    aliases: [/swiggy/i, /bundl\s*technologies/i],
  },
  {
    canonicalName: 'Zomato',
    categoryHint: 'Food & Dining',
    aliases: [/zomato/i],
  },
  {
    canonicalName: 'McDonalds',
    categoryHint: 'Food & Dining',
    aliases: [/mcdonald/i, /hardcastle/i],
  },
  {
    canonicalName: 'Domino’s',
    categoryHint: 'Food & Dining',
    aliases: [/domino/i, /jubilant\s*food/i],
  },
  {
    canonicalName: 'Starbucks',
    categoryHint: 'Food & Dining',
    aliases: [/starbucks/i, /tata\s*starbucks/i],
  },

  // Groceries & Shopping
  {
    canonicalName: 'Amazon',
    categoryHint: 'Shopping',
    aliases: [/amazon/i, /amzn/i, /amazon\s*pay/i, /amazon\s*seller/i],
  },
  {
    canonicalName: 'Flipkart',
    categoryHint: 'Shopping',
    aliases: [/flipkart/i],
  },
  {
    canonicalName: 'Blinkit',
    categoryHint: 'Groceries',
    aliases: [/blinkit/i, /grofers/i],
  },
  {
    canonicalName: 'Zepto',
    categoryHint: 'Groceries',
    aliases: [/zepto/i, /kirana/i],
  },
  {
    canonicalName: 'Instamart',
    categoryHint: 'Groceries',
    aliases: [/instamart/i],
  },
  {
    canonicalName: 'DMart',
    categoryHint: 'Groceries',
    aliases: [/dmart/i, /avenue\s*supermarts/i],
  },
  {
    canonicalName: 'BigBasket',
    categoryHint: 'Groceries',
    aliases: [/bigbasket/i, /innovative\s*retail/i],
  },

  // Transportation
  {
    canonicalName: 'Uber',
    categoryHint: 'Transportation',
    aliases: [/uber/i],
  },
  {
    canonicalName: 'Ola',
    categoryHint: 'Transportation',
    aliases: [/ola\s*cabs/i, /ani\s*technologies/i],
  },
  {
    canonicalName: 'Rapido',
    categoryHint: 'Transportation',
    aliases: [/rapido/i, /roppen\s*transportation/i],
  },
  {
    canonicalName: 'IRCTC',
    categoryHint: 'Travel',
    aliases: [/irctc/i, /indian\s*railways/i],
  },
  {
    canonicalName: 'MakeMyTrip',
    categoryHint: 'Travel',
    aliases: [/makemytrip/i, /mmt/i],
  },

  // Entertainment & Subscriptions
  {
    canonicalName: 'Netflix',
    categoryHint: 'Entertainment',
    aliases: [/netflix/i],
  },
  {
    canonicalName: 'Spotify',
    categoryHint: 'Entertainment',
    aliases: [/spotify/i],
  },
  {
    canonicalName: 'Hotstar',
    categoryHint: 'Entertainment',
    aliases: [/hotstar/i, /disney/i, /novi\s*digital/i],
  },
  {
    canonicalName: 'BookMyShow',
    categoryHint: 'Entertainment',
    aliases: [/bookmyshow/i, /bigtree\s*entertainment/i],
  },

  // Utilities & Bills
  {
    canonicalName: 'Airtel',
    categoryHint: 'Utilities',
    aliases: [/airtel/i, /bharti\s*airtel/i],
  },
  {
    canonicalName: 'Jio',
    categoryHint: 'Utilities',
    aliases: [/jio/i, /reliance\s*jio/i],
  },
  {
    canonicalName: 'Tata Power',
    categoryHint: 'Utilities',
    aliases: [/tata\s*power/i],
  },
  {
    canonicalName: 'BESCOM',
    categoryHint: 'Utilities',
    aliases: [/bescom/i],
  },

  // Fuel
  {
    canonicalName: 'Indian Oil',
    categoryHint: 'Fuel',
    aliases: [/indian\s*oil/i, /iocl/i],
  },
  {
    canonicalName: 'Bharat Petroleum',
    categoryHint: 'Fuel',
    aliases: [/bharat\s*petroleum/i, /bpcl/i],
  },
  {
    canonicalName: 'Hindustan Petroleum',
    categoryHint: 'Fuel',
    aliases: [/hindustan\s*petroleum/i, /hpcl/i],
  },
];
