class StockSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });
    this.stocks = [];
    this.filteredStocks = [];
    this.render();
    this.fetchStockData();
  }

  async fetchStockData() {
    const response = await fetch('https://s3.ap-southeast-2.amazonaws.com/stock.publish/dealer_2893/stock.json');
    this.stocks = await response.json();
    this.filteredStocks = this.stocks.slice(0, 15); // Initially show top 15
    this.updateResults();
  }

  connectedCallback() {
    this.shadowRoot.querySelector('input[type="search"]').addEventListener('input', (e) => this.filterStocks(e.target.value));
  }

  filterStocks(query) {
    const lowerCaseQuery = query.toLowerCase();
    this.filteredStocks = this.stocks.filter(stock =>
      stock.make.toLowerCase().includes(lowerCaseQuery) ||
      stock.model.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 15); // Limit to top 15 results
    this.updateResults();
  }

  updateResults() {
    const resultsContainer = this.shadowRoot.querySelector('.results');
    resultsContainer.innerHTML = ''; // Clear previous results
    if (this.filteredStocks.length > 0) {
      this.filteredStocks.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.classList.add('stock-item');

        // Create the link with hardcoded dealer-id and primary-col
        const link = `/?dealer-id=2343&primary-col=crimson&make=${encodeURIComponent(stock.make)}&model=${encodeURIComponent(stock.model)}`;

        stockItem.innerHTML = `
                    <a href="${link}" class="stock-link">
                        <img src="${stock.images[0]}" alt="${stock.make} ${stock.model}" />
                        <div>
                            <strong>${stock.make} ${stock.model}</strong><br>
                            Price: ${stock.price} ${stock.priceQualifier}
                        </div>
                    </a>
                `;
        resultsContainer.appendChild(stockItem);
      });
    } else {
      resultsContainer.innerHTML = '<div>No results found</div>';
    }
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
    <style>
    input[type="search"] {
        width: 340px;
        padding: 8px;
        margin-bottom: 10px;
    }
    .results {
        border: 1px solid #ccc;
        max-height: 400px;
        overflow-y: auto;
        width: 340px;
    }
    .stock-item {
        display: flex;
        align-items: center;
        padding: 10px;
    }
    .stock-item img {
        width: 50px;
        height: auto;
        margin-right: 10px;
    }
</style>
            <input type="search" placeholder="Search by Make or Model" />
            <div class="results"></div>
        `;
  }
}

customElements.define('stock-search', StockSearch);