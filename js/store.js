// APP TIENDA ONLINE V.5 (con jQuery)

// DECLARAR CARRITO
let cart = []

// CARGAR CONTENIDO
    $(function() {
        getData()
        if (localStorage.getItem('cart')) {
            cart = JSON.parse(localStorage.getItem('cart'))
        }
        createCart()
        showCartLength()
    })

// VINCULAR PRODUCTOS DESDE API.JSON
    const getData = () => {
        $.ajax({
            method: 'GET',
            url: '../api.json',
            success: function(response){
                const filteredProducts = response.filter(product => product.collection === $('#collections').val())
                if (filteredProducts.length === 0) {
                    createCards(response)
                } else {
                    createCards(filteredProducts)
                }
            }
        })
    }

// MOSTRAR TARJETAS DE PRODUCTOS
    const createCards = (products) => {
        $('#cards').text('')
        products.forEach(element => {
            $('#cards').append(`
                <div class="card col-md-3 col-10 mb-5 align-items-center" id="${element.id}">
                    <img class="store-img img-fluid w-75" src="${element.thumbnailUrl}">
                    <h2 class="piece-name">${element.title}</h2>
                    <p class="piece-value">${element.price}</p>
                    <button class="btn ver-mas-btn buy" value=${element.id}>Comprar</button>
                </div>`)
        })
    }

    // Filtrar productos
    $(document).on('click', '#product-filter', function(){
        getData()
    })

    // Buscar productos
    $('#product-search').on('keyup', function(){
        let value = $(this).val().toLowerCase();
        $("#cards div").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        })
    })

// AÑADIR PRODUCTO AL CARRITO
    //  Encontrar Producto
        const productIndex = (productId) => {
            const index = cart.findIndex(element => element.id === productId)
            return index
        }

    //  Añadir Producto al Carrito
        $(document).on('click', '.buy', function(){
            addToCart(this.value);
            $('#discounts').hide()
        })

        const addToCart = (elementId) => {
            $.ajax({
                method: 'GET',
                url: '../api.json',
                success: function(response){
                    const products = response
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
                }
            })
        }

 // CREAR CARRITO - Guardarlo en LocalStorage
    // Abrir y cerrar carrito (modal)
        $('#cart-icon, .cart-tooltip').on('click', function(){
            $('#modal-cart').show()
        })

        $('#modal-cart').on('click', function(event){
            if(event.target === $('#modal-cart')[0]){
                $('#modal-cart').hide()
            } 
        })

    // Crear lista de productos en el carrito
        const createCart = () => {
            $('#items').text('')
            cart.forEach( (element) => {
                $('#items')[0].innerHTML += 
                    `<div>
                        <tr>
                            <th scope="row">${element.id}</th>
                            <td class="prod-td"><img class="cart-img" src="${element.image}" alt="">${element.title}</td>
                            <td>${element.amount}</td>
                            <td id="${element.id}">
                                <button class="add-btn" value="${element.id}">+</button>
                                <button class="rem-btn" value="${element.id}")>-</button>
                            </td>
                            <td><span>$ ${parseFloat(element.amount) * parseFloat(element.price)}</span></td>
                        </tr>
                    </div>`
            })
            createFooter()
            localStorage.setItem('cart', JSON.stringify(cart))
        }
    
    // Mostrar tooltip en el ícono del Carrito
        const showCartLength = () => {
            if(cart.length === 0) {
                $('.cart-tooltip').hide()
            } else {
                $('.cart-tooltip').show()
                $('.cart-tooltip').html(`${cart.reduce((acc, {amount}) => acc + amount, 0)}`)
            }
        }

    // Calcular precio del Carrito
        const createFooter = () => {
            $('#cart-footer').text('')
            if (cart.length === 0) {
                $('#cart-footer').html('<th scope="row" colspan="5">CARRITO VACÍO - Hacé click en comprar para añadir tu producto!</th>')
                $('#discounts').hide()
                $('.text-end').hide()
                return
            } else {
                const nAmount = cart.reduce((acc, {amount}) => acc + amount, 0)
                const nPrice = cart.reduce((acc, {amount, price}) => acc + parseFloat(amount) * parseFloat(price), 0)
                $('#cart-footer').html(`
                    <div id="cart-footer">
                        <th scope="row">PRODUCTOS EN EL CARRITO</th>
                        <td>${nAmount}</td>
                        <td><button class="btn empty-btn btn-sm" id="emptyCart"> vaciar carrito</button></td>
                        <td>$ <span id="cart-prize">${nPrice}</span></td>
                    </div>
                    `)
                $('.text-end').show()
            }
        }
        createFooter()

    // Vaciar Carrito
        $(document).on('click', '#emptyCart', function(){
            emptyCart()
        })

        const emptyCart = () => {
            cart = []
            createCart()
            showCartLength()
        }

    // Agregar o quitar productos desde el carrito (botones +/-)
        $(document).on('click', '.add-btn', function(){
            cartItem = cart[productIndex(parseInt(this.value))]
            cartItem.amount++
            createCart()
            showCartLength()
            $('#discounts').hide()
        })
    
        $(document).on('click', '.rem-btn', function(){
            cartItem = cart[productIndex(parseInt(this.value))]
            cartItem.amount--
            if (cartItem.amount === 0) {
                cart.splice(productIndex(parseInt(this.value)),1)
            }
            createCart()
            showCartLength()
            $('#discounts').hide()
        })

// APLICAR DESCUENTOS
    // Abrir y Cerrar modal para aplicar descuentos
        $('#discModal').on('click', function(){
            $('#discApplier').show()
        })

        $('#discApplier').on('click', function(event){
            if(event.target === $('#discApplier')[0] || event.target === $('#discBtnCancel')[0]){
                $('#discApplier').hide()
            } 
        })

    // Generar descuentos según cupón
        $('#discBtnApply').on('click', function(){
            discGenerator()
        })

        const discGenerator = () => {
            createCart()
            let cartPrice =  parseInt($('#cart-prize').text())
            const checkedDiscount = $('input[name="discount"]:checked').val()
            const discounts = {
                'macro': cartPrice * 0.9,
                'galicia': cartPrice * 0.75,
                'santander': cartPrice * 0.5,
                'none': cartPrice
            }
            $('#cart-prize').addClass('old-prize')
            $('#discounts').show()
            $('#discounts').html(`
                        <div id="cart-footer">
                            <td></td>
                            <td></td>
                            <th scope="row">Total (Cupón Aplicado)</th>
                            <td>$ <span id="new-prize">${discounts[checkedDiscount]}</span></td>
                        </div>
                        `)
            $('#discApplier').hide()
            return ( discounts[checkedDiscount] / cartPrice )
        } 

// MODALES DEL SITIO
    // Modal "Producto Añadido"
        $(document).on('click', '.buy', function(){
            $('#addProduct-modal').show()
        })
        $(document).on('click', '#addProduct-modal', function(){
            $('#addProduct-modal').hide()
        })

    // Modal "Gracias por su Compra"
        $(document).on('click', '#endPurchase', function(){
            $('#thanks-modal').show()
        })
        $(document).on('click', '#thanks-modal', function(){
            $('#thanks-modal').hide()
            $('#modal-cart').hide()
            goToPayment()
        })

// PASARELA MERCADO PAGO
const goToPayment = async () => {

    const cartMercadoPago = cart.map( element => ({
        title: element.title,
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