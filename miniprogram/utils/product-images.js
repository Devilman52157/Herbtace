const { API_BASE_URL } = require('./config.js');

const BASE = API_BASE_URL.replace(/\/+$/, '') + '/products';

const PRODUCT_IMAGES = {
  easy1: `${BASE}/easy1.png`,
  easy2: `${BASE}/easy2.png`,
  easy3: `${BASE}/easy3.png`,
  easy4: `${BASE}/easy4.png`,
  easy5: `${BASE}/easy5.png`,
  easy6: `${BASE}/easy6.png`,
  easy7: `${BASE}/easy7.png`,
  easy8: `${BASE}/easy8.png`,
  home1: `${BASE}/home1.png`,
  home2: `${BASE}/home2.png`,
  home3: `${BASE}/home3.png`,
  home4: `${BASE}/home4.png`,
  home5: `${BASE}/home5.png`,
  spec1: `${BASE}/spec1.png`,
  spec2: `${BASE}/spec2.png`,
  spec3: `${BASE}/spec3.png`,
  spec4: `${BASE}/spec4.png`,
  spec5: `${BASE}/spec5.png`,
};

module.exports = PRODUCT_IMAGES;
