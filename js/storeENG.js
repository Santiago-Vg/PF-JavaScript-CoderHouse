// APP TIENDA ONLINE V.5 

let cart = []

    document.addEventListener('DOMContentLoaded', () => {
        fetchData()
        if (localStorage.getItem('cart')) {
            cart = JSON.parse(localStorage.getItem('cart'))
        }
        createCart()
        showCartLength()
    })


    const searchInput = document.getElementById('product-search')
    const cartTooltip = document.getElementsByClassName('cart-tooltip')[0]
    const cards = document.getElementById('cards')
    const cartModal = document.getElementById('modal-cart')
    const cartProducts = document.getElementById('items')
    const cartFooter = document.getElementById('cart-footer')
    const cartDiscountFooter = document.getElementById('discounts')
    const cartButtons = document.getElementsByClassName('text-end')[0]
    const discountsModal = document.getElementById('discApplier')
    const discCancelBtn = document.getElementById('discBtnCancel')
    const addProductModal = document.getElementById('addProduct-modal')
    const thanksModal = document.getElementById('thanks-modal')


    const fetchData = async () => {
        try {
            const res = await fetch('../api.json')
            const products = await res.json()
            const collections = document.getElementById('collections')
            const filteredProducts = products.filter(el => el.collection === collections.value)
            if (filteredProducts.length === 0) {
                createCards(products)
            } else {
                createCards(filteredProducts)
            }
        } catch (error){
            console.log(error);
        }
    }

    const createCards = (products) => {
        cards.innerHTML = ''
        products.forEach(element => {
            cards.innerHTML += `
                <div class="card col-md-3 col-10 mb-5 align-items-center" id="${element.id}">
                    <img class="store-img img-fluid w-75" src="${element.thumbnailUrl}">
                    <h2 class="piece-name">${element.titleEng}</h2>
                    <p class="piece-value">${element.price}</p>
                    <button class="btn ver-mas-btn buy" onclick="addToCart(${element.id}); openModal(addProductModal)">Add to Cart</button>
                </div>`
        })
    }

    const search = () => {
        let searchInputText = searchInput.value.toLowerCase()
        for (i = 0; i < 16; i++) {
            let product = cards.getElementsByClassName('card')[i]
            if (!product.innerHTML.toLowerCase().includes(searchInputText)) {
                product.style.display="none"
            } else {
                product.style.display=""
            }
        }
    }

    const productIndex = (productId) => {
        const index = cart.findIndex(element => element.id === productId)
        return index
    }

    const addToCart = async (elementId) => {
        try {
            const res = await fetch('../api.json')
            const products = await res.json()
            const productId = elementId - 1
            const cartProduct = {
                id: products[productId].id,
                title: products[productId].title,
                titleEng: products[productId].titleEng,
                image: products[productId].thumbnailUrl,
                price: products[productId].price,
                amount: 1
            }
            if (productIndex(cartProduct.id) >= 0) {
                cart[productIndex(cartProduct.id)].amount++
            } else {
                cart.push(cartProduct)
            }
            createCart()
            showCartLength()
        } catch (error){
            console.log(error);
        }
    }

    const showCart = () => {
        cartModal.style.display="block"
    }

    const closeCart = (event) => {
        if (event.target === cartModal) {
            cartModal.style.display="none"
        }
    }

    const createCart = () => {
        cartProducts.innerHTML = ''
        cart.forEach( (element) => {
            cartProducts.innerHTML += `
                <div>
                    <tr>
                        <th scope="row">${element.id}</th>
                        <td class="prod-td"><img class="cart-img" src="${element.image}" alt="">${element.titleEng}</td>
                        <td>${element.amount}</td>
                        <td id="${element.id}">
                            <button class="add-btn" onclick=addBTN(${element.id})>+</button>
                            <button class="rem-btn" onclick=remBTN(${element.id})>-</button>
                        </td>
                        <td><span>$ ${parseFloat(element.amount) * parseFloat(element.price)}</span></td>
                    </tr>
                </div>`
        })
        createFooter()
        localStorage.setItem('cart', JSON.stringify(cart))
    }

    const showCartLength = () => {
        if(cart.length === 0) {
            cartTooltip.style.display="none"
        } else {
            cartTooltip.style.display="inline"
            cartTooltip.innerHTML = `${cart.reduce((acc, {amount}) => acc + amount, 0)}`
        }
    }

    const createFooter = () => {
        cartFooter.innerHTML = ''
        if (cart.length === 0) {
            cartFooter.innerHTML = '<th scope="row" colspan="5">YOUR CART IS EMPTY - Click on "Add to Cart" to start buying!</th>'
            cartDiscountFooter.style.display="none"
            cartButtons.style.display="none"
            return
        } else {
            const nAmount = cart.reduce((acc, {amount}) => acc + amount, 0)
            const nPrice = cart.reduce((acc, {amount, price}) => acc + parseFloat(amount) * parseFloat(price), 0)
            cartFooter.innerHTML = `
            <div id="cart-footer">
                <th scope="row">TOTAL PRODUCTS</th>
                <td>${nAmount}</td>
                <td>
                    <button class="btn empty-btn btn-sm" onclick=emptyCart()> empty cart</button>
                </td>
                <td class="font-weight-bold">$ <span id="cart-prize">${nPrice}</span></td>
            </div>`
            cartDiscountFooter.style.display=""
            cartButtons.style.display=""
        }
    }
    createFooter()

    const emptyCart = () => {
        cart = []
        createCart()
        showCartLength()
    }

    const addBTN = (elementId) => {
        cartItem = cart[productIndex(elementId)]
        cartItem.amount++
        createCart()
        showCartLength()
        cartDiscountFooter.style.display="none"
    }

    const remBTN = (elementId) => {
        cartItem = cart[productIndex(elementId)]
        cartItem.amount--
        if (cartItem.amount === 0) {
            cart.splice(productIndex(elementId),1)
        }
        createCart()
        showCartLength()
        cartDiscountFooter.style.display="none"
    }

    const openDiscModal = () => {
        discountsModal.style.display="block"
    } 

    const closeDiscModal = (event) => {
        if(event.target === discountsModal || event.target === discCancelBtn){
            discountsModal.style.display="none"
        } 
        
    } 

    const discGenerator = () => {
        createCart()
        let cartOldValue = document.getElementById('cart-prize')
        let cartPrice =  parseInt(cartOldValue.innerHTML) 
        const checkedDiscount = document.querySelector('input[name="discount"]:checked').value
        const discounts = {
            'macro': cartPrice * 0.9,
            'galicia': cartPrice * 0.75,
            'santander': cartPrice * 0.5,
            'none': cartPrice
        }
        cartOldValue.setAttribute("class", 'old-prize')
        cartDiscountFooter.innerHTML = `
            <div id="cart-footer">
                <td></td>
                <td></td>
                <th scope="row">Total (Coupon Applied)</th>
                <td>$ <span id="new-prize">${discounts[checkedDiscount]}</span></td>
            </div>
            `
        discountsModal.style.display="none"
        return ( discounts[checkedDiscount] / cartPrice )
    }

    const openModal = (modal) => {
        modal.style.display="block"
    }

    const closeModal = (modal) => {
        modal.style.display="none"
        cartModal.style.display="none"
    }

    const closeThanksModal = () => {
        goToPayment()
        thanksModal.style.display="none"
        cartModal.style.display="none"
    }

    const goToPayment = async () => {

        const cartMercadoPago = cart.map( element => ({
            title: element.titleEng,
            description: "",
            picture_url: element.image,
            category_id: element.id,
            quantity: element.amount,
            currency_id: "ARS",
            unit_price: element.price * discGenerator()
        }) )

        const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: "POST",
            headers: {
                Authorization: 'Bearer TEST-326890859283949-052415-93fee1fbe9cd97d4538a22ee51d26730-12515680'
            },
            body: JSON.stringify({
                items: cartMercadoPago
            })
        })

        const data = await resp.json()
        window.open(data.init_point, "_blank")
        
        emptyCart()
        window.location.href = "../index.html";
    }