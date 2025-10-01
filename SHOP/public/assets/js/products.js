// Demo product catalog (could later be fetched from the server)
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const COLORS = ['Default', 'Black', 'White', 'Navy', 'Red'];

window.CATALOG = [
  {
    id: 'tee-classic',
    name: 'Classic Chapter Tee',
    price: 18.00,
    img: 'assets/img/tee.jpg',
    imgs: ['assets/img/tee.jpg'],
    desc: 'Soft cotton tee with chapter logo. Unisex sizing S–XXXL.',
    tag: 'Best seller',
    sizes: SIZES,
    colors: ['White', 'Black', 'Navy']
  },
  {
    id: 'hoodie-black',
    name: 'Black Hoodie',
    price: 39.00,
    img: 'assets/img/hoodie.jpg',
    imgs: ['assets/img/hoodie.jpg', 'assets/img/alabama_hoodie.webp'],
    desc: 'Cozy black hoodie with embroidered logo. Unisex sizing S–XXXL.',
    tag: 'New',
    sizes: SIZES,
    colors: ['Black', 'Red']
  },
  {
    id: 'cap',
    name: 'Embroidered Cap',
    price: 22.00,
    img: 'assets/img/cap.jpg',
    imgs: ['assets/img/cap.jpg'],
    desc: 'Adjustable cap with chapter embroidery.',
    sizes: SIZES,
    colors: ['Black', 'White']
  },
  {
    id: 'sticker-pack',
    name: 'Sticker Pack (5)',
    price: 6.00,
    img: 'assets/img/stickers.jpg',
    imgs: ['assets/img/stickers.jpg'],
    desc: 'Five high-quality vinyl stickers.',
    sizes: SIZES,
    colors: ['Default']
  },
  {
    id: 'gloves',
    name: 'Gloves',
    price: 9.50,
    img: 'assets/img/gloves.jpg',
    imgs: ['assets/img/gloves.jpg'],
    desc: 'Warm gloves for chilly days.',
    sizes: SIZES,
    colors: ['Black', 'White']
  }
];