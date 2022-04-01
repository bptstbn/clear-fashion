// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

const API_URL = 'https://clearfashionapi.vercel.app/';

// current products on the page
let currentProducts = [];
let currentPagination = {};

let filterPrice = '';
let filterBrand = '';
let sort = '';


// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectSort = document.querySelector('#sort-select');
const selectFilterPrice = document.querySelector('#filter-price-select');
const selectFilterBrand = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNewProducs = document.querySelector('#nbNewProducts');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');
const spanLastReleasedDate = document.querySelector('#lastReleasedDate');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, limit = 12) => {
  try 
  {
    var url = API_URL + `products/search?page=${page}&limit=${limit}`;
    if (filterPrice != '')
    {
      console.log(filterPrice);
    }
    if (filterBrand != '')
    {
      url += `&brand=${filterBrand}`;
    }
    if (sort != '')
    {
      url += `&sortby=${sort}`
    }
    const response = await fetch(url);
    const body = await response.json();

    if (body.success !== true) 
    {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    
    console.log(body.data.meta);
    return body.data;
  }
  catch (error) 
  {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');
  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};


const fetchBrands = async () => {
  try 
  {
    const response = await fetch(API_URL + 'brands');
    const body = await response.json();
    return body;
  }
  catch (error) 
  {
    console.error(error);
  }
};


const renderBrands = async(products) => {
  var brands = await fetchBrands();
  brands.unshift('');
  console.log(brands);
  const options = Array.from(
    {'length': brands.length},
    (value, index) => `<option value="${brands[index]}">${brands[index]}</option>`
  ).join('');
  selectFilterBrand.innerHTML = options;
  var selectedIndex = 0;
  selectedIndex = brands.indexOf(filterBrand);
  selectFilterBrand.selectedIndex = selectedIndex;
};

function pvalue(items, x)
{
  // items = sortByCheap(items);
  var p = Math.floor(items.length*(1-x));
  return items[p]['price'];
}

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = (products, pagination) => {
  const {count} = pagination;
  spanNbProducts.innerHTML = count;
  spanNbNewProducs.innerHTML = products.filter(({ released }) => ((new Date() - new Date(released)) / (1000 * 7 * 24 * 60 * 60)) <= 2).length;
  spanP50.innerHTML = pvalue(products, 0.5);
  spanP90.innerHTML = pvalue(products, 0.90);
  spanP95.innerHTML = pvalue(products, 0.95);
  // spanLastReleasedDate.innerHTML = sortByRecent(products)[0].released;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(products, pagination);
  renderBrands(products);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */

selectShow.addEventListener('change', event => {
  fetchProducts(1, parseInt(event.target.value))
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
  });



document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});


selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value), currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectFilterPrice.addEventListener('change', event => {
  filterPrice = event.target.value;
  fetchProducts(1, currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectFilterBrand.addEventListener('change', event => {
  filterBrand = event.target.value;
  fetchProducts(1, currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectSort.addEventListener('change', event => {
  sort = event.target.value;
  fetchProducts(1, currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});