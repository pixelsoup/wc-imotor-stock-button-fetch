class ImotorStock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = /*html*/ `
      <link rel="stylesheet" href="/wc-imotor-stock/wc-imotor-stock.css">
      <div class="stockLoaderItemWrapper">
        <label>Dealer Id</label>
        <input type="number" class="dealer-id-input" placeholder="e.g. 2343" min="1" />
        <button class="load-stock">Load Stock Items</button>
        <div class="stockLoaderListWrapper"></div>
      </div>
      <template class="stock-content-template">
        <div class="template-content-wrapper">
          <h3 class="number-of-stock"></h3>
          <ul class="stock-items-list"></ul>
        </div>
      </template>
      <template class="stock-item-template">
        <li class="stock-item">
          <span class="stock-item-make"></span> -
          <span class="stock-item-model"></span> -
          <span class="stock-item-price"></span>
        </li>
      </template>
    `;
  }

  connectedCallback() {
    this.shadowRoot.querySelector('.load-stock').addEventListener('click', () => this.loadStock());
  }

  async loadStock() {
    const dealerIdInput = this.shadowRoot.querySelector('.dealer-id-input');
    const dealerId = dealerIdInput.value;
    const stockItemsListWrapper = this.shadowRoot.querySelector('.stockLoaderListWrapper');
    const itemTemplate = this.shadowRoot.querySelector('.stock-item-template');
    const countTemplate = this.shadowRoot.querySelector('.stock-content-template');

    if (!dealerId) {
      alert('Please enter a valid Dealer ID.');
      return;
    }

    try {
      const response = await fetch(`https://s3.ap-southeast-2.amazonaws.com/stock.publish/dealer_${dealerId}/stock.json`);
      const data = await response.json();

      stockItemsListWrapper.innerHTML = '';

      if (!data || data.length === 0) {
        alert('There is stock data but it\'s empty.');
        return;
      }

      const contentClone = document.importNode(countTemplate.content, true);
      contentClone.querySelector('.number-of-stock').textContent = `(${data.length}) Stock Items`;
      stockItemsListWrapper.appendChild(contentClone.querySelector('.template-content-wrapper'));

      const stockItemsListEl = stockItemsListWrapper.querySelector('.stock-items-list');

      data.forEach(item => {
        const itemClone = document.importNode(itemTemplate.content, true);
        itemClone.querySelector('.stock-item-make').textContent = item.make || 'Unknown Make';
        itemClone.querySelector('.stock-item-model').textContent = item.model || 'Unknown Model';
        itemClone.querySelector('.stock-item-price').textContent = `$${(item.price || 0).toFixed(2)}`;
        stockItemsListEl.appendChild(itemClone);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('There is no data available for this Dealer ID.');
    }
  }
}

customElements.define('imotor-stock', ImotorStock);