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

export interface CityAttraction extends Attraction {
  cityKey: string;
  cityName: string;
}

export const ATTRACTIONS: CityAttraction[] = [
  // New York City
  {
    id: '1',
    cityKey: 'nyc',
    cityName: 'New York City',
    name: 'Statue of Liberty',
    coordinate: { latitude: 40.6892, longitude: -74.0445 },
    fact: 'A gift from France in 1886',
    description:
      "The iconic copper statue stands 305 feet tall and has welcomed millions of immigrants to America. It was a gift of friendship from the people of France to the United States and is recognized as a universal symbol of freedom and democracy.",
    imageUrl: 'https://images.unsplash.com/photo-1569983407155-b119ed08a7f9?w=800',
    category: 'landmark',
  },
  {
    id: '2',
    cityKey: 'nyc',
    cityName: 'New York City',
    name: 'Central Park',
    coordinate: { latitude: 40.7829, longitude: -73.9654 },
    fact: 'One of the most filmed locations in the world',
    description:
      'This 843-acre green oasis in the heart of Manhattan opened in 1857. It features lakes, theaters, playgrounds, and hosts over 25 million visitors annually. The park has been featured in over 240 movies.',
    imageUrl: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800',
    category: 'park',
  },
  {
    id: '3',
    cityKey: 'nyc',
    cityName: 'New York City',
    name: 'Empire State Building',
    coordinate: { latitude: 40.7484, longitude: -73.9857 },
    fact: 'Built in just 410 days during the Great Depression',
    description:
      "This 102-story Art Deco skyscraper was the world's tallest building for nearly 40 years. Its construction employed 3,400 workers and was completed ahead of schedule in 1931.",
    imageUrl: 'https://images.unsplash.com/photo-1566404791232-af9fe0ae1f3e?w=800',
    category: 'landmark',
  },
  {
    id: '4',
    cityKey: 'nyc',
    cityName: 'New York City',
    name: 'Brooklyn Bridge',
    coordinate: { latitude: 40.7061, longitude: -73.9969 },
    fact: 'The first steel-wire suspension bridge ever built',
    description:
      'Completed in 1883, this iconic bridge spans the East River connecting Manhattan and Brooklyn. At the time of its opening, it was the longest suspension bridge in the world, with a main span of 1,595 feet.',
    imageUrl: 'https://images.unsplash.com/photo-1547937657-c22ea74dd280?w=800',
    category: 'landmark',
  },
  {
    id: '5',
    cityKey: 'nyc',
    cityName: 'New York City',
    name: 'Times Square',
    coordinate: { latitude: 40.758, longitude: -73.9855 },
    fact: 'Over 300,000 people pass through daily',
    description:
      "Known as \"The Crossroads of the World,\" this major commercial intersection is famous for its bright lights, Broadway theaters, and New Year's Eve ball drop. It attracts over 50 million visitors annually.",
    imageUrl: 'https://images.unsplash.com/photo-1519098635131-4c8f806d1e82?w=800',
    category: 'cultural',
  },
  {
    id: '6',
    cityKey: 'nyc',
    cityName: 'New York City',
    name: 'Metropolitan Museum of Art',
    coordinate: { latitude: 40.7794, longitude: -73.9632 },
    fact: 'Houses over 2 million works spanning 5,000 years',
    description:
      'Founded in 1870, The Met is the largest art museum in the United States. Its permanent collection contains works from ancient Egypt to modern American and European art.',
    imageUrl: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800',
    category: 'museum',
  },
  {
    id: '7',
    cityKey: 'nyc',
    cityName: 'New York City',
    name: 'One World Trade Center',
    coordinate: { latitude: 40.7127, longitude: -74.0134 },
    fact: 'Its height of 1,776 feet represents the year of American independence',
    description:
      'Completed in 2014, this is the tallest building in the Western Hemisphere. Built on the site of the original World Trade Center, it stands as a symbol of resilience and renewal.',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    category: 'landmark',
  },

  // Tbilisi
  {
    id: 'tbilisi-1',
    cityKey: 'tbilisi',
    cityName: 'Tbilisi',
    name: 'Narikala Fortress',
    coordinate: { latitude: 41.6888, longitude: 44.809 },
    fact: 'Built in the 4th century, predating the founding of Tbilisi',
    description:
      'This ancient fortress overlooks the Old Town and the Mtkvari River. The fortress was built by the Persians and has been destroyed and rebuilt multiple times throughout history. A cable car provides stunning views of the city.',
    imageUrl: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800',
    category: 'landmark',
  },
  {
    id: 'tbilisi-2',
    cityKey: 'tbilisi',
    cityName: 'Tbilisi',
    name: 'Old Town (Dzveli Tbilisi)',
    coordinate: { latitude: 41.6919, longitude: 44.8076 },
    fact: 'Home to sulfur bathhouses that gave the city its name',
    description:
      "The historic heart of Tbilisi features narrow winding streets, traditional balconied houses, and famous sulfur baths. \"Tbilisi\" means \"warm location\" referring to the area's natural hot springs.",
    imageUrl: 'https://images.unsplash.com/photo-1552165867-a56e13be7c5e?w=800',
    category: 'cultural',
  },
  {
    id: 'tbilisi-3',
    cityKey: 'tbilisi',
    cityName: 'Tbilisi',
    name: 'Holy Trinity Cathedral',
    coordinate: { latitude: 41.6975, longitude: 44.8172 },
    fact: 'One of the tallest Orthodox cathedrals in the world',
    description:
      'Completed in 2004, Sameba Cathedral stands 84 meters tall and can accommodate 15,000 worshippers. It combines traditional Georgian architecture with Byzantine styles and features stunning gold-domed towers.',
    imageUrl: 'https://images.unsplash.com/photo-1565022536102-236e2bc58a5d?w=800',
    category: 'cultural',
  },
  {
    id: 'tbilisi-4',
    cityKey: 'tbilisi',
    cityName: 'Tbilisi',
    name: 'Bridge of Peace',
    coordinate: { latitude: 41.6929, longitude: 44.8084 },
    fact: 'A bow-shaped pedestrian bridge with 30,000 LED lights',
    description:
      'This modern glass and steel bridge opened in 2010, designed by Italian architect Michele De Lucchi. At night, it displays a light show using LED bulbs that communicate in Morse code about elements of the periodic table.',
    imageUrl: 'https://images.unsplash.com/photo-1598125760172-c5095134f1db?w=800',
    category: 'landmark',
  },
  {
    id: 'tbilisi-5',
    cityKey: 'tbilisi',
    cityName: 'Tbilisi',
    name: 'Georgian National Museum',
    coordinate: { latitude: 41.6946, longitude: 44.7986 },
    fact: 'Houses the famous Colchian gold collection from the 3rd millennium BC',
    description:
      'Established in 2004, this museum combines several important collections including archaeological artifacts, ethnographic treasures, and exhibits on Soviet occupation. The gold treasury is world-renowned.',
    imageUrl: 'https://images.unsplash.com/photo-1611692225801-13e629258147?w=800',
    category: 'museum',
  },
  {
    id: 'tbilisi-6',
    cityKey: 'tbilisi',
    cityName: 'Tbilisi',
    name: 'Mtatsminda Park',
    coordinate: { latitude: 41.694, longitude: 44.7873 },
    fact: 'Sits atop Mount Mtatsminda at 770 meters above sea level',
    description:
      'This historic amusement park offers panoramic views of Tbilisi. Accessible by funicular railway built in 1905, it features attractions, restaurants, and observation decks with breathtaking city vistas.',
    imageUrl: 'https://images.unsplash.com/photo-1558882268-6c2b49f39b8a?w=800',
    category: 'park',
  },
  {
    id: 'tbilisi-7',
    cityKey: 'tbilisi',
    cityName: 'Tbilisi',
    name: 'Rustaveli Avenue',
    coordinate: { latitude: 41.6954, longitude: 44.8007 },
    fact: "Tbilisi's main thoroughfare named after medieval poet Shota Rustaveli",
    description:
      "This central avenue is lined with museums, theaters, cafes, and historic buildings showcasing various architectural styles. It's the cultural heart of the city and hosts major public events.",
    imageUrl: 'https://images.unsplash.com/photo-1602520034992-57f2d45a0c6f?w=800',
    category: 'cultural',
  },
];

export function getAttractionsByCity(cityKey: string): CityAttraction[] {
  return ATTRACTIONS.filter((a) => a.cityKey === cityKey);
}
