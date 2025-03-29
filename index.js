let cart = [];
const searchBar = document.getElementById("searchBar");
const productList = document.getElementById("product-list");

// Fetch and display products
function fetchProducts() {
    fetch("http://localhost:3000/products")
        .then(response => response.json())
        .then(products => {
            displayProducts(products);

            // Enable search functionality
            searchBar.addEventListener("input", () => {
                const searchTerm = searchBar.value.toLowerCase();
                const filteredProducts = products.filter(product =>
                    product.name.toLowerCase().includes(searchTerm)
                );
                displayProducts(filteredProducts);
            });
        })
        .catch(error => console.error("Error fetching products:", error));
}

// Display products dynamically
function displayProducts(products) {
    productList.innerHTML = ""; // Clear previous results

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product";
        card.innerHTML = `
            <h2>${product.name}</h2>
            <img src="${product.image}" alt="${product.name}">
            <p>Price Ksh: ${product.price}</p>
            <button onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price})">Add To Cart</button>
        `;
        productList.appendChild(card);
    });
}

// Add to cart function
function addToCart(id, name, price) {
    let existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        fetch(`http://localhost:3000/cart/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: existingItem.quantity + 1 })
        })
        .then(() => {
            existingItem.quantity += 1;
            updateCart();
        })
        .catch(error => console.error("Error updating cart:", error));
    } else {
        fetch("http://localhost:3000/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, name, price, quantity: 1 })
        })
        .then(() => {
            cart.push({ id, name, price, quantity: 1 });
            updateCart();
        })
        .catch(error => console.error("Error adding to cart:", error));
    }
}

// Update cart 
function updateCart() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
        total += item.price * item.quantity;

        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - Ksh ${item.price} x ${item.quantity}
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItems.appendChild(li);
    });

    document.getElementById("cart-total").innerText = `Ksh ${total}`;
}

// Remove product from cart
function removeFromCart(id) {
    let itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        let item = cart[itemIndex];

        if (item.quantity > 1) {
            fetch(`http://localhost:3000/cart/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: item.quantity - 1 })
            })
            .then(() => {
                item.quantity -= 1;
                updateCart();
            })
            .catch(error => console.error("Error updating cart:", error));
        } else {
            fetch(`http://localhost:3000/cart/${id}`, {
                method: "DELETE"
            })
            .then(() => {
                cart.splice(itemIndex, 1);
                updateCart();
            })
            .catch(error => console.error("Error removing from cart:", error));
        }
    }
}

// Submit new product
document.getElementById("product-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const image = document.getElementById("image").value;
    const price = parseFloat(document.getElementById("price").value);

    if (name && image && price) {
        fetch("http://localhost:3000/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, image, price })
        })
        .then(res => res.json())
        .then(product => {
            fetchProducts(); 
            document.getElementById("product-form").reset();
        })
        .catch(error => console.error("Error adding product:", error));
    }
});

// Load products and cart from database on page load
function initialize() {
    fetchProducts(); 
    fetch("http://localhost:3000/cart")
        .then(res => res.json())
        .then(cartItems => {
            cart = cartItems;
            updateCart();
        })
        .catch(error => console.error("Error fetching cart:", error));
}


document.addEventListener("DOMContentLoaded", initialize);
