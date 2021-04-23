// APP TIENDA ONLINE V.1

// CONSTANTES - Obtenidas del DOM
    const cards = document.getElementById('cards')
    const productCard = document.getElementById('base-card')
    const items = document.getElementById('items')
    const noProducts = document.getElementById('no-products-msg')
    const cartFooter = document.getElementById('cart-footer').content
    const buyCart = document.getElementById('buy-cart').content
    const fragment = document.createDocumentFragment()

// CARRITO
    let cart = {}

// EVENTOS
    // Cargar Contenido
    document.addEventListener('DOMContentLoaded', () => {
        fetchData()
        if (localStorage.getItem('cart')) {
            cart = JSON.parse(localStorage.getItem('cart'))
        }
        createCart()
    })

    // Añadir element al Carrito
    cards.addEventListener('click', (e) => addCart(e))

    // Botones Agregar/Quitar element al Carrito 
    items.addEventListener('click', (e) => {
        btnAccion(e)
    })

// VINCULAR DATA DE elementS
    const fetchData = async () => {
        try {
            const res = await fetch('../api.json')
            const data = await res.json()
            createCards(data)
        } catch (error){
            console.log(error);
        }
    }

// FUNCIONES
    // Crear Tarjetas de Productos
    const createCards = (data) => {
        data.forEach(element => {
            productCard.querySelector('h2').textContent = element.title
            productCard.querySelector('p').textContent = element.prize
            productCard.querySelector('img').setAttribute("src", element.thumbnailUrl)
            productCard.querySelector('.buy').dataset.id = element.id

            const clone = productCard.cloneNode(true)
            fragment.appendChild(clone)
        })
        cards.appendChild(fragment)
    }

    // Añadir Producto al carrito
    const addCart = (e) => {
        if (e.target.classList.contains('buy')) {   
            setCart(e.target.parentElement)
        }
        e.stopPropagation()
    } 

    // Mostrar Producto en el carrito
    const setCart = (object) => {
        const element = {
            id: object.querySelector('.buy').dataset.id,
            title: object.querySelector('h2').textContent,
            prize: object.querySelector('p').textContent,
            amount: 1
        }
        if (cart.hasOwnProperty(element.id)) {
            element.amount = cart[element.id].amount + 1
        }
        cart[element.id] = {...element}
        createCart();
    }

    // Crear Carrito - Guardarlo en LocalStorage
    const createCart = () => {
        console.log(cart);
        items.innerHTML = ''
        Object.values(cart).forEach( (element) => {
            buyCart.querySelector('th').textContent = element.id
            buyCart.querySelectorAll('td')[0].textContent = element.title
            buyCart.querySelectorAll('td')[1].textContent = element.amount
            buyCart.querySelector('.add-btn').dataset.id = element.id
            buyCart.querySelector('.rem-btn').dataset.id = element.id
            buyCart.querySelector('span').textContent = parseFloat(element.amount) * parseFloat(element.prize)

            const clone = buyCart.cloneNode(true)
            fragment.appendChild(clone)
        })
        items.appendChild(fragment)
        createFooter()

        localStorage.setItem('cart', JSON.stringify(cart))
    }

    // Calcular prize Final del Carrito
    const createFooter = () => {
        noProducts.innerHTML = ''
        if (Object.keys(cart).length === 0) {
            noProducts.innerHTML = '<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>'
            return
        }
        const nAmount = Object.values(cart).reduce((acc, {amount}) => acc + amount, 0)
        const nPrize = Object.values(cart).reduce((acc, {amount, prize}) => acc + parseFloat(amount) * parseFloat(prize), 0)
        
        cartFooter.querySelectorAll('td')[0].textContent = nAmount
        cartFooter.querySelector('span').textContent = nPrize

        const clone = cartFooter.cloneNode(true)
        fragment.appendChild(clone)
        noProducts.appendChild(fragment)

        const btnEmptyCart = document.getElementById('empty-cart')
        btnEmptyCart.addEventListener('click', () => {
            cart = {}
            createCart()
        })
    }

    // Botones +/- del Carrito
    const btnAccion = (e) => {
        if(e.target.classList.contains('add-btn')) {
            const element = cart[e.target.dataset.id]
            element.amount++
            cart[e.target.dataset.id] = {...element}
            createCart()
        } else if(e.target.classList.contains('rem-btn')) {
            const element = cart[e.target.dataset.id]
            element.amount--
            if (element.amount === 0) {
                delete cart[e.target.dataset.id]
            }
            createCart()
        }

        e.stopPropagation()
    }