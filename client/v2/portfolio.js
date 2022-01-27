// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};

let filterPrice = '';
let filterDate = '';
let filterBrand = '';
let isFilteringByBrand = false;
let sort = '';


const allProducts = async () => 
{
  try 
  {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${1}&size=${139}`
    );
    const body = await response.json();

    if (body.success !== true) 
    {
      console.error(body);
    }
    return body.data;
  }
  catch (error) 
  {
    console.error(error);
  };
};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectSort = document.querySelector('#sort-select');
const selectFilterPrice = document.querySelector('#filter-price-select');
const selectFilterDate = document.querySelector('#filter-date-select');
const selectFilterBrand = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');

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
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${1}&size=${139}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    var result = body.data.result;
    var meta = body.data.meta;
    result = filterProductsByPrice(result);
    result = filterProductsByReleaseDate(result);
    result = filterProductsByBrand(result);
    result = sortProducts(result);
    meta.count = result.length;
    body.data = {result, meta};
    return sliceProducts(body.data, page, size);
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

function sliceProducts(products, page, size)
{
  var result = products.result;
  result = result.slice((page-1)*size, page*size);
  var meta = products.meta;
  meta.currentPage = page;
  meta.pageSize = size;
  meta.pageCount = Math.floor(1+meta.count/meta.pageSize);
  var items = {result, meta};
  return items;
}

function filterProductsByPrice(result)
{
  if (filterPrice == 'A')
    {
      result = result.filter(({ price }) => price <= 50);
    }
    else if (filterPrice == 'B')
    {
      result = result.filter(({ price }) => price > 50 && price <= 100);
    }
    else if (filterPrice == 'C')
    {
      result = result.filter(({ price }) => price > 100 && price <= 200);
    }
    else if (filterPrice == 'D')
    {
      result = result.filter(({ price }) => price > 200);
    }
    return result;
}

function filterProductsByReleaseDate(result)
{
  if (filterDate == 'A')
    {
      result = result.filter(({ released }) => ((new Date() - new Date(released)) / (1000 * 7 * 24 * 60 * 60)) <= 2);
    }
    else if (filterDate == 'B')
    {
      result = result.filter(({ released }) => ((new Date() - new Date(released)) / (1000 * 7 * 24 * 60 * 60)).between(2, 26));
    }
    else if (filterDate == 'C')
    {
      result = result.filter(({ released }) => ((new Date() - new Date(released)) / (1000 * 7 * 24 * 60 * 60)) > 26);
    }
    return result;
}

function filterProductsByBrand(result)
{
  if (filterBrand != '')
  {
    result = result.filter(({ brand }) => brand == filterBrand);
  }
  return result;
}

function sortProducts(result)
{
  if (sort == 'price-asc')
  {
    result = sortByCheap(result);
  }
  else if (sort == 'price-desc')
  {
    result = sortByCheap(result).reverse();
  }
  else if (sort == 'date-asc')
  {
    result = sortByRecent(result);
  }
  else if (sort == 'date-desc')
  {
    result = sortByRecent(result).reverse();
  }
  return result;
}

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

const renderBrands = async(products) => {
  const items = await allProducts();
  var brands = new Set(items.result.map(item => item.brand))
  brands = Array.from(brands);
  brands.unshift('');
  const options = Array.from(
    {'length': brands.length},
    (value, index) => `<option value="${brands[index]}">${brands[index]}</option>`
  ).join('');
  selectFilterBrand.innerHTML = options;
  var selectedIndex = 0;
  if (isFilteringByBrand)
  {
    try
    {
      selectedIndex = brands.indexOf(products[0].brand);
    }
    catch
    {
      selectedIndex = 0
    }
  }
  selectFilterBrand.selectedIndex = selectedIndex;
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderBrands(products);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
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

selectFilterDate.addEventListener('change', event => {
  filterDate = event.target.value;
  fetchProducts(1, currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectFilterBrand.addEventListener('change', event => {
  filterBrand = event.target.value;
  isFilteringByBrand = (filterBrand != '');
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

function sortByCheap(items)
{
  return items.sort(function(a, b) 
  {
    return parseFloat(a.price) - parseFloat(b.price);
  });
}

function sortByRecent(items)
{
  return items.sort(function(a, b) 
  {
    return new Date(b.released) - new Date(a.released);
  });
}

Number.prototype.between = function(a, b) 
{
  var min = Math.min.apply(Math, [a, b]);
  var max = Math.max.apply(Math, [a, b]);
  return this > min && this <= max;
};