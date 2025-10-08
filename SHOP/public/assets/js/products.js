// Demo product catalog (could later be fetched from the server)
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const COLORS = ['Default', 'Black', 'White', 'Navy', 'Red'];

window.CATALOG = [
  {
    id: 'tee-classic',
  name: 'Creighton Tee',
    price: 18.00,
  img: 'assets/img/creighton tee.webp',
  imgs: ['assets/img/creighton tee.webp'],
    tag: 'Best seller',
    sizes: SIZES,
    colors: ['White', 'Black', 'Navy']
  },
  {
    id: 'hoodie-black',
  name: 'Duke Tee',
    price: 39.00,
  img: 'assets/img/Duke tee.webp',
  imgs: ['assets/img/Duke tee.webp'],
    tag: 'New',
    sizes: SIZES,
    colors: ['Black', 'Red']
  },
  {
    id: 'cap',
  name: 'Georgia Tech Tee',
    price: 22.00,
  img: 'assets/img/georgia tech tee.webp',
  imgs: ['assets/img/georgia tech tee.webp'],
    sizes: SIZES,
    colors: ['Black', 'White']
  },
  {
    id: 'sticker-pack',
  name: 'Houston Tee',
    price: 6.00,
  img: 'assets/img/houston tee.webp',
  imgs: ['assets/img/houston tee.webp'],
    sizes: SIZES,
    colors: ['Default']
  },
  {
    id: 'gloves',
  name: 'Kansas Tee',
    price: 9.50,
  img: 'assets/img/kansas tee.webp',
  imgs: ['assets/img/kansas tee.webp'],
    sizes: SIZES,
    colors: ['Black', 'White']
  },
  {
    id: 'tee-vintage',
  name: 'Maryland Tee',
    price: 20.00,
  img: 'assets/img/maryland tee.webp',
  imgs: ['assets/img/maryland tee.webp'],
    tag: 'Limited',
    sizes: SIZES,
    colors: ['White', 'Black']
  },
  {
    id: 'tee-long-sleeve',
  name: 'Memphis Tee',
    price: 24.00,
  img: 'assets/img/memphis tee.webp',
  imgs: ['assets/img/memphis tee.webp'],
    tag: 'Popular',
    sizes: SIZES,
    colors: ['Navy', 'White']
  },
  {
    id: 'tee-athletic',
  name: 'Michigan Tee',
    price: 22.00,
  img: 'assets/img/michigan tee.webp',
  imgs: ['assets/img/michigan tee.webp'],
    tag: 'New',
    sizes: SIZES,
    colors: ['Red', 'Black']
  },
  {
  id: 'tee-vintage',
  name: 'Ohio Tee',
    price: 19.00,
  img: 'assets/img/ohio tee.webp',
  imgs: ['assets/img/ohio tee.webp'],
  tag: 'Vintage',
    sizes: SIZES,
    colors: ['Navy', 'White', 'Red']
  },
  {
    id: 'tee-retro',
  name: 'Oklahoma Tee',
    price: 21.00,
  img: 'assets/img/oklahoma tee.webp',
  imgs: ['assets/img/oklahoma tee.webp'],
    tag: 'Retro',
    sizes: SIZES,
    colors: ['Black', 'White']
  },
  {
    id: 'tee-eco',
  name: 'UConn Tee',
    price: 23.00,
  img: 'assets/img/uconn tee.webp',
  imgs: ['assets/img/uconn tee.webp'],
    tag: 'Eco',
    sizes: SIZES,
    colors: ['White', 'Navy']
  },
  {
    id: 'tee-premium',
  name: 'UNLV Tee',
    price: 26.00,
  img: 'assets/img/unlv tee.webp',
  imgs: ['assets/img/unlv tee.webp'],
    tag: 'Premium',
    sizes: SIZES,
    colors: ['Black', 'Red']
  },
  {
    id: 'tee-basic',
    name: 'Basic Chapter Tee',
    price: 15.00,
      img: 'assets/img/basic_tee.jpg',
      imgs: ['assets/img/basic_tee.jpg'],
    tag: 'Basic',
    sizes: SIZES,
    colors: ['White', 'Black']
  },
  {
    id: 'tee-colorblock',
    name: 'Colorblock Chapter Tee',
    price: 21.00,
      img: 'assets/img/colorblock_tee.jpg',
      imgs: ['assets/img/colorblock_tee.jpg'],
    tag: 'Trendy',
    sizes: SIZES,
    colors: ['Red', 'Navy']
  },
  {
    id: 'tee-varsity',
    name: 'Varsity Chapter Tee',
    price: 20.00,
      img: 'assets/img/varsity_tee.jpg',
      imgs: ['assets/img/varsity_tee.jpg'],
    tag: 'Varsity',
    sizes: SIZES,
    colors: ['Navy', 'White']
  },
  {
    id: 'tee-slim',
    name: 'Slim Fit Chapter Tee',
    price: 19.50,
      img: 'assets/img/slim_fit_tee.jpg',
      imgs: ['assets/img/slim_fit_tee.jpg'],
    tag: 'Slim',
    sizes: SIZES,
    colors: ['Black', 'White']
  },
  {
    id: 'tee-graphic',
    name: 'Graphic Chapter Tee',
    price: 22.50,
      img: 'assets/img/graphic_tee.jpg',
      imgs: ['assets/img/graphic_tee.jpg'],
    tag: 'Graphic',
    sizes: SIZES,
    colors: ['Red', 'Black']
  },
  {
    id: 'tee-sport',
    name: 'Sport Chapter Tee',
    price: 23.00,
      img: 'assets/img/sport_tee.jpg',
      imgs: ['assets/img/sport_tee.jpg'],
    tag: 'Sport',
    sizes: SIZES,
    colors: ['Navy', 'White']
  },
  {
    id: 'tee-minimal',
    name: 'Minimal Chapter Tee',
    price: 17.00,
      img: 'assets/img/minimal_tee.jpg',
      imgs: ['assets/img/minimal_tee.jpg'],
    tag: 'Minimal',
    sizes: SIZES,
    colors: ['White', 'Black']
  },
  {
    id: 'tee-heritage',
    name: 'Heritage Chapter Tee',
    price: 25.00,
      img: 'assets/img/heritage_tee.jpg',
      imgs: ['assets/img/heritage_tee.jpg'],
    tag: 'Heritage',
    sizes: SIZES,
    colors: ['Navy', 'Red']
  }
];