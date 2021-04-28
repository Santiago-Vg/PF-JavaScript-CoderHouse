// APP TIENDA ONLINE V.2

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
                <button class="btn ver-mas-btn buy" data-bs-toggle="modal" data-bs-target="#modal-message">Comprar</button> 
                </div>`
        })
    }

// AÑADIR PRODUCTO AL CARRITO
    // Hacer click en "Comprar"
        cards.addEventListener('click', (e) => addCartBTN(e))
        const addCartBTN = (e) => {
            if (e.target.classList.contains('buy')) {   
                addCartAction(e.target.parentElement)
            }
            e.stopPropagation()
        } 

    //  Encontrar Producto
        const findProduct = (productId) => {
            const index = cart.findIndex(element => element.id === productId)
            return index
        }

    // Agregar producto al carrito
        const addCartAction = (object) => {
            const cartProduct = {
                id: object.id,
                title: object.querySelector('h2').textContent,
                prize: object.querySelector('p').textContent,
                amount: 1
            }
            if (findProduct(cartProduct.id) >= 0) {
                cart[findProduct(cartProduct.id)].amount++
            } else {
                cart.push(cartProduct)
            }
            createCart()
        }

 // MOSTRAR CARRITO AL FINAL LA PÁGINA - Guardarlo en LocalStorage
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
                                <button class="add-btn" id="add-btn">+</button>
                                <button class="rem-btn" id="rem-btn">-</button>
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
                        <button class="btn empty-btn btn-sm" id="empty-cart">
                            vaciar carrito
                        </button>
                    </td>
                    <td class="font-weight-bold">$ <span>${nPrize}</span></td>
                </div>`
            }
    
            // Vaciar Carrito
            const btnEmptyCart = document.getElementById('empty-cart')
            btnEmptyCart.addEventListener('click', () => {
                cart = []
                createCart()
            })
        }
        createFooter()

// AGREGAR / QUITAR PRODUCTOS DESDE EL CARRITO
    items.addEventListener('click', (e) => btnAccion(e))
        const btnAccion = (e) => {
            cartItem = cart[findProduct(e.target.parentElement.id)]
            if(e.target.classList.contains('add-btn')) {
                cartItem.amount++
                createCart()
            } else if(e.target.classList.contains('rem-btn')) {
                cartItem.amount--
                if (cartItem.amount === 0) {
                    cart.splice(findProduct(e.target.parentElement.id),1)
                }
                createCart()
            }
            e.stopPropagation()
        }