export interface Attraction {
  id: string;
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  fact: string;
  description: string;
  imageUrl: string;
  category: 'landmark' | 'museum' | 'park' | 'cultural';
}

export const NYC_ATTRACTIONS: Attraction[] = [
  {
    id: '1',
    name: 'Statue of Liberty',
    coordinate: {
      latitude: 40.6892,
      longitude: -74.0445,
    },
    fact: 'A gift from France in 1886',
    description: 'The iconic copper statue stands 305 feet tall and has welcomed millions of immigrants to America. It was a gift of friendship from the people of France to the United States and is recognized as a universal symbol of freedom and democracy.',
    imageUrl: 'https://images.unsplash.com/photo-1569983407155-b119ed08a7f9?w=800',
    category: 'landmark',
  },
  {
    id: '2',
    name: 'Central Park',
    coordinate: {
      latitude: 40.7829,
      longitude: -73.9654,
    },
    fact: 'One of the most filmed locations in the world',
    description: 'This 843-acre green oasis in the heart of Manhattan opened in 1857. It features lakes, theaters, playgrounds, and hosts over 25 million visitors annually. The park has been featured in over 240 movies.',
    imageUrl: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800',
    category: 'park',
  },
  {
    id: '3',
    name: 'Empire State Building',
    coordinate: {
      latitude: 40.7484,
      longitude: -73.9857,
    },
    fact: 'Built in just 410 days during the Great Depression',
    description: 'This 102-story Art Deco skyscraper was the world\'s tallest building for nearly 40 years. Its construction employed 3,400 workers and was completed ahead of schedule in 1931.',
    imageUrl: 'https://images.unsplash.com/photo-1566404791232-af9fe0ae1f3e?w=800',
    category: 'landmark',
  },
  {
    id: '4',
    name: 'Brooklyn Bridge',
    coordinate: {
      latitude: 40.7061,
      longitude: -73.9969,
    },
    fact: 'The first steel-wire suspension bridge ever built',
    description: 'Completed in 1883, this iconic bridge spans the East River connecting Manhattan and Brooklyn. At the time of its opening, it was the longest suspension bridge in the world, with a main span of 1,595 feet.',
    imageUrl: 'https://images.unsplash.com/photo-1547937657-c22ea74dd280?w=800',
    category: 'landmark',
  },
  {
    id: '5',
    name: 'Times Square',
    coordinate: {
      latitude: 40.758,
      longitude: -73.9855,
    },
    fact: 'Over 300,000 people pass through daily',
    description: 'Known as "The Crossroads of the World," this major commercial intersection is famous for its bright lights, Broadway theaters, and New Year\'s Eve ball drop. It attracts over 50 million visitors annually.',
    imageUrl: 'https://images.unsplash.com/photo-1519098635131-4c8f806d1e82?w=800',
    category: 'cultural',
  },
  {
    id: '6',
    name: 'Metropolitan Museum of Art',
    coordinate: {
      latitude: 40.7794,
      longitude: -73.9632,
    },
    fact: 'Houses over 2 million works spanning 5,000 years',
    description: 'Founded in 1870, The Met is the largest art museum in the United States. Its permanent collection contains works from ancient Egypt to modern American and European art.',
    imageUrl: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800',
    category: 'museum',
  },
  {
    id: '7',
    name: 'One World Trade Center',
    coordinate: {
      latitude: 40.7127,
      longitude: -74.0134,
    },
    fact: 'Its height of 1,776 feet represents the year of American independence',
    description: 'Completed in 2014, this is the tallest building in the Western Hemisphere. Built on the site of the original World Trade Center, it stands as a symbol of resilience and renewal.',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    category: 'landmark',
  },
];
