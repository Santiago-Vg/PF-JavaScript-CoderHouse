// APP TIENDA ONLINE V.3

// DECLARAR CARRITO
let cart = []

// CARGAR CONTENIDO
    document.addEventListener('DOMContentLoaded', () => {
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
            const collections = document.getElementById('collections')
            const dataFiltrada = data.filter(el => el.collection === collections.value)
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
    const cards = document.getElementById('cards')
    const createCards = (data) => {
        cards.innerHTML = ''
        data.forEach(element => {
            cards.innerHTML += `
                <div class="card col-md-3 col-10 mb-5 align-items-center" id="${element.id}">
                <img class="store-img img-fluid w-75" src="${element.thumbnailUrl}">
                <h2 class="piece-name">${element.title}</h2>
                <p class="piece-value">${element.prize}</p>
                <button class="btn ver-mas-btn buy" data-bs-toggle="modal" data-bs-target="#modal-message" onclick=addToCart(${element.id})>Comprar</button>
                </div>`
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
        const cartModal = document.getElementById('modal-cart')
        const openCartModal = () => {
            cartModal.setAttribute("style", 'display: block;')
        }
        const closeCartModal = () => {
            cartModal.removeAttribute("style")
        }

    // Crear lista de productos en el carrito
        const items = document.getElementById('items')
        const createCart = () => {
            items.innerHTML = ''
            cart.forEach( (element) => {
                items.innerHTML += `
                    <div>
                        <tr>
                            <th scope="row">${element.id}</th>
                            <td>${element.title}</td>
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

    // Calcular precio del carrito
        const cartFooter = document.getElementById('cart-footer')
        const createFooter = () => {
            cartFooter.innerHTML = ''
            if (cart.length === 0) {
                cartFooter.innerHTML = '<th scope="row" colspan="5">CARRITO VACÍO - Hacé click en comprar para añadir tu producto!</th>'
                return
            } else {
                const nAmount = cart.reduce((acc, {amount}) => acc + amount, 0)
                const nPrize = cart.reduce((acc, {amount, prize}) => acc + parseFloat(amount) * parseFloat(prize), 0)
                cartFooter.innerHTML = `
                <div id="cart-footer">
                    <th scope="row">PRODUCTOS EN EL CARRITO</th>
                    <td>${nAmount}</td>
                    <td>
                        <button class="btn empty-btn btn-sm" onclick=emptyCart()>
                            vaciar carrito
                        </button>
                    </td>
                    <td class="font-weight-bold">$ <span>${nPrize}</span></td>
                </div>`
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