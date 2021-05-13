// APP TIENDA ONLINE V.4 (con jQuery)

// DECLARAR CARRITO
let cart = []

// CARGAR CONTENIDO
    $(function() {
        fetchData()
        if (localStorage.getItem('cart')) {
            cart = JSON.parse(localStorage.getItem('cart'))
        }
        createCart()
    })

// VINCULAR DATA DE PRODUCTOS
    const fetchData = async () => {
        try {
            const res = await fetch('../api.json')
            const data = await res.json()
            const dataFiltrada = data.filter(el => el.collection === $('#collections').val())
            if (dataFiltrada.length === 0) {
                createCards(data)
            } else {
                createCards(dataFiltrada)
            }
        } catch (error){
            console.log(error);
        }
    }

// CREAR TARJETAS DE PRODUCTOS
    const createCards = (data) => {
        $('#cards').text('')
        data.forEach(element => {
            $('#cards').append(`
            <div class="card col-md-3 col-10 mb-5 align-items-center" id="${element.id}">
            <img class="store-img img-fluid w-75" src="${element.thumbnailUrl}">
            <h2 class="piece-name">${element.title}</h2>
            <p class="piece-value">${element.prize}</p>
            <button class="btn ver-mas-btn buy" data-bs-toggle="modal" data-bs-target="#modal-message" onclick=addToCart(${element.id})>Comprar</button>
            </div>`)
        })
    }

// AÑADIR PRODUCTO AL CARRITO
    //  Encontrar Producto
        const findProduct = (productId) => {
            const index = cart.findIndex(element => element.id === productId)
            return index
        }

    //  Añadir Producto al Carrito
    const addToCart = async (elementId) => {
        try {
            const res = await fetch('../api.json')
            const data = await res.json()
            const cartProduct = {
                id: data[elementId - 1].id,
                title: data[elementId - 1].title,
                image: data[elementId - 1].thumbnailUrl,
                prize: data[elementId - 1].prize,
                amount: 1
            }
            if (findProduct(cartProduct.id) >= 0) {
                cart[findProduct(cartProduct.id)].amount++
            } else {
                cart.push(cartProduct)
            }
            createCart()
        } catch (error){
            console.log(error);
        }
    }

 // CREAR CARRITO - Guardarlo en LocalStorage
    // Abrir y cerrar carrito (modal)
        $('#cart-icon').on('click', function(){
            $('#modal-cart').attr("style", 'display: block;')
        })
        
        $('#cart-exitBtn').on('click', function(){
            $('#modal-cart').attr("style", 'display: none;')
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
                                <button class="add-btn" onclick=addBTN(${element.id})>+</button>
                                <button class="rem-btn" onclick=remBTN(${element.id})>-</button>
                            </td>
                            <td><span>$ ${parseFloat(element.amount) * parseFloat(element.prize)}</span></td>
                        </tr>
                    </div>` 
            })
            createFooter()
            localStorage.setItem('cart', JSON.stringify(cart))
        }

    // Calcular precio del 
        const createFooter = () => {
            $('#cart-footer').text('')
            if (cart.length === 0) {
                $('#cart-footer')[0].innerHTML = '<th scope="row" colspan="5">CARRITO VACÍO - Hacé click en comprar para añadir tu producto!</th>'
                return
            } else {
                const nAmount = cart.reduce((acc, {amount}) => acc + amount, 0)
                const nPrize = cart.reduce((acc, {amount, prize}) => acc + parseFloat(amount) * parseFloat(prize), 0)
                $('#cart-footer')[0].innerHTML = `
                <div id="cart-footer">
                    <th scope="row">PRODUCTOS EN EL CARRITO</th>
                    <td>${nAmount}</td>
                    <td>
                        <button class="btn empty-btn btn-sm" onclick=emptyCart()>
                            vaciar carrito
                        </button>
                    </td>
                    <td>$ <span id="final-prize">${nPrize}</span></td>
                </div>
                `
            }
        }
        createFooter()

    // Vaciar Carrito
    const emptyCart = () => {
        cart = []
        createCart()
    }

    // Agregar o quitar productos desde el carrito (botones +/-)
        const addBTN = (elementId) => {
            cartItem = cart[findProduct(elementId)]
            cartItem.amount++
            createCart()
        }
        const remBTN = (elementId) => {
            cartItem = cart[findProduct(elementId)]
            cartItem.amount--
            if (cartItem.amount === 0) {
                cart.splice(findProduct(elementId),1)
            }
            createCart()
        }

// APLICAR DESCUENTOS
    // Abir y Cerrar modal para aplicar descuentos
    $('#discModal').on('click', function(){
        $('#discApplier').attr("style", 'display: block;')
    })

    $('#discBtnCancel').on('click', function(){
        $('#discApplier').attr('style', 'display: none;')
    })

    // Generar descuentos según cupón
    $('#discBtnApply').on('click', function(){
        createCart()
        let cartValue = $('#final-prize')
        if ($('#disc-macro')[0].checked) {
            cartValue.text(parseInt(cartValue.text()) * 0.9)
        } else if ($('#disc-galicia')[0].checked) {
            cartValue.text(parseInt(cartValue.text()) * 0.75)
        } else if ($('#disc-santander')[0].checked) {
            cartValue.text(parseInt(cartValue.text()) * 0.5)
        } else {
            cartValue.text(cartValue.text())
        }
        $('#discApplier').attr('style', 'display: none;')
    })