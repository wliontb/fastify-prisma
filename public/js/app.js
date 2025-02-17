$(document).ready(function () {
    const $navbarLinksContainer = $('#navbar-links'); // jQuery selector for navbar links container

    const checkLoginStatusAndUpdateNavbar = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            // If logged in, update navbar links using jQuery's .html()
            $navbarLinksContainer.html(`
                <a href="/product-form.html" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mr-4">Create Product</a>
                <button id="logout-button" class="px-4 py-2 text-red-600 hover:text-red-800">Logout</button>
            `);

            // Add event listener for Logout button using jQuery's .on('click', ...)
            $('#logout-button').on('click', function () {
                localStorage.removeItem('accessToken');
                alert('Logged out.');
                checkLoginStatusAndUpdateNavbar(); // Update navbar after logout
                window.location.href = '/index.html'; // Could reload page or just update navbar
            });
        } else {
            // If not logged in, display default Login/Register links using jQuery's .html()
            $navbarLinksContainer.html(`
                <a href="/login.html" class="px-4 py-2 text-blue-600 hover:text-blue-800">Login</a>
                <a href="/register.html" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Register</a>
            `);
        }
    };

    checkLoginStatusAndUpdateNavbar(); // Check login status and update navbar on page load

    // Trang Product List (index.html) - Updated to add detail, edit, delete buttons
    if ($('#products-container').length) {
        const $productsContainer = $('#products-container');

        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                const products = await response.json();

                $.each(products, function (index, product) {
                    const $productCard = $('<div>').addClass('bg-white rounded-md shadow-md p-4');
                    $productCard.html(`
                        <h2 class="text-xl font-bold mb-2">${product.title}</h2>
                        <p class="text-gray-700">${product.content ? product.content.substring(0, 50) + '...' : 'No content'}</p>
                        <p class="text-lg font-semibold mt-2">$${product.price}</p>
                        <div class="mt-4 flex space-x-2">
                            <a href="/product-detail.html?id=${product.id}" class="inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 text-sm">View Detail</a>
                            <a href="/product-edit.html?id=${product.id}" class="inline-block px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-700 text-sm">Edit</a>
                            <button class="delete-product-btn inline-block px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 text-sm" data-product-id="${product.id}">Delete</button>
                        </div>
                    `);
                    $productsContainer.append($productCard);
                });

                // Event delegation for delete buttons (since they are dynamically added)
                $productsContainer.on('click', '.delete-product-btn', async function () {
                    const productId = $(this).data('product-id');
                    const accessToken = localStorage.getItem('accessToken');

                    if (!accessToken) {
                        alert('You must be logged in to delete products.');
                        return;
                    }

                    if (confirm('Are you sure you want to delete this product?')) {
                        try {
                            const response = await fetch(`/api/products/${productId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            });

                            if (response.status === 204) {
                                alert('Product deleted successfully.');
                                fetchProducts(); // Reload product list after deletion
                            } else {
                                const errorData = await response.json();
                                alert(`Failed to delete product: ${errorData.message || 'Something went wrong'}`);
                            }
                        } catch (error) {
                            console.error('Delete product error:', error);
                            alert('Failed to delete product. Please try again.');
                        }
                    }
                });


            } catch (error) {
                console.error('Error fetching products:', error);
                $productsContainer.html('<p class="text-red-500">Failed to load products.</p>');
            }
        };

        fetchProducts();
    }

    // Trang Product Detail (product-detail.html)
    if ($('#product-detail-container').length) {
        const $productDetailContainer = $('#product-detail-container');
        const productId = new URLSearchParams(window.location.search).get('id'); // Get product ID from URL

        const fetchProductDetail = async () => {
            try {
                const response = await fetch(`/api/products/${productId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        $productDetailContainer.html('<p class="text-red-500">Product not found.</p>');
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return;
                }
                const product = await response.json();

                $('#product-detail-container').html(`
                    <h2 class="text-2xl font-bold mb-4">${product.title}</h2>
                    <p class="text-gray-700 mb-4">${product.content || 'No content'}</p>
                    <p class="text-lg font-semibold">Price: $${product.price}</p>
                    <p class="text-sm text-gray-500 mt-2">Created At: ${new Date(product.createdAt).toLocaleString()}</p>
                    <p class="text-sm text-gray-500">Updated At: ${new Date(product.updatedAt).toLocaleString()}</p>
                `);

                $('#edit-product-button').attr('href', `/product-edit.html?id=${product.id}`); // Set edit button link
                $('#delete-product-button').on('click', async function() { // Attach delete event to delete button on detail page
                    const accessToken = localStorage.getItem('accessToken');
                    if (!accessToken) {
                        alert('You must be logged in to delete products.');
                        return;
                    }

                    if (confirm('Are you sure you want to delete this product?')) {
                        try {
                            const deleteResponse = await fetch(`/api/products/${productId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            });

                            if (deleteResponse.status === 204) {
                                alert('Product deleted successfully.');
                                window.location.href = '/index.html'; // Redirect to product list after deletion
                            } else {
                                const errorData = await deleteResponse.json();
                                alert(`Failed to delete product: ${errorData.message || 'Something went wrong'}`);
                            }
                        } catch (error) {
                            console.error('Delete product error:', error);
                            alert('Failed to delete product. Please try again.');
                        }
                    }
                });

            } catch (error) {
                console.error('Error fetching product detail:', error);
                $productDetailContainer.html('<p class="text-red-500">Failed to load product details.</p>');
            }
        };

        fetchProductDetail();
    }


    // Trang Edit Product (product-edit.html)
    if ($('#edit-product-form').length) {
        const $editProductForm = $('#edit-product-form');
        const productId = new URLSearchParams(window.location.search).get('id'); // Get product ID from URL

        const loadProductForEdit = async () => {
            try {
                const response = await fetch(`/api/products/${productId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        alert('Product not found for editing.');
                        window.location.href = '/index.html'; // Redirect back to product list
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return;
                }
                const product = await response.json();

                $('#product-id').val(product.id); // Set hidden input value for product ID
                $('#title').val(product.title);
                $('#price').val(product.price);
                $('#content').val(product.content);

            } catch (error) {
                console.error('Error loading product for edit:', error);
                alert('Failed to load product details for editing.');
                window.location.href = '/index.html'; // Redirect back to product list on error
            }
        };

        loadProductForEdit();

        $editProductForm.submit(async function (event) {
            event.preventDefault();
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                alert('You must be logged in to edit products.');
                window.location.href = '/login.html'; // Redirect if not logged in
                return;
            }

            const productIdToUpdate = $('#product-id').val();
            const title = $('#title').val();
            const price = parseFloat($('#price').val());
            const content = $('#content').val();

            try {
                const response = await fetch(`/api/products/${productIdToUpdate}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ title, price, content })
                });

                if (response.ok) {
                    alert('Product updated successfully!');
                    window.location.href = `/product-detail.html?id=${productIdToUpdate}`; // Redirect to detail page after edit
                } else {
                    const errorData = await response.json();
                    alert(`Failed to update product: ${errorData.message || 'Something went wrong'}`);
                }
            } catch (error) {
                console.error('Update product error:', error);
                alert('Failed to update product. Please try again.');
            }
        });

        $('#cancel-edit-button').on('click', function(e) {
            e.preventDefault();
            window.location.href = `/product-detail.html?id=${productId}`; // Redirect to detail page on cancel
        });
    }
    
    // Trang Login (login.html) - jQuery selector and .submit() for form handling
    if ($('#login-form').length) {
        $('#login-form').submit(async function (event) { // jQuery's .submit() for form submission
            event.preventDefault();
            const email = $('#email').val(); // jQuery's .val() to get input value
            const password = $('#password').val();

            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('accessToken', data.accessToken);
                    checkLoginStatusAndUpdateNavbar(); // Update navbar after login success
                    window.location.href = '/index.html'; // Redirect to product page
                } else {
                    const errorData = await response.json();
                    alert(`Login failed: ${errorData.message || 'Invalid credentials'}`);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });
    }

    // Trang Register (register.html) - jQuery selector and .submit() for form handling
    if ($('#register-form').length) {
        $('#register-form').submit(async function (event) { // jQuery's .submit() for form submission
            event.preventDefault();
            const name = $('#name').val(); // jQuery's .val() to get input value
            const email = $('#email').val();
            const password = $('#password').val();

            try {
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                if (response.status === 201) {
                    alert('Registration successful! Please login.');
                    window.location.href = '/login.html'; // Redirect to login page
                } else {
                    const errorData = await response.json();
                    alert(`Registration failed: ${errorData.message || 'Something went wrong'}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }

    // Trang Create Product (product-form.html) - jQuery selector and .submit() for form handling
    if ($('#create-product-form').length) {
        const $createProductForm = $('#create-product-form');
        const accessToken = localStorage.getItem('accessToken'); // Get access token

        if (!accessToken) {
            alert('You must be logged in to create products.');
            window.location.href = '/login.html'; // Redirect if not logged in
            return;
        }

        $createProductForm.submit(async function (event) { // jQuery's .submit() for form submission
            event.preventDefault();
            const title = $('#title').val(); // jQuery's .val() to get input value
            const price = parseFloat($('#price').val());
            const content = $('#content').val();

            try {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}` // Send token in header
                    },
                    body: JSON.stringify({ title, price, content })
                });

                if (response.status === 201) {
                    alert('Product created successfully!');
                    window.location.href = '/index.html'; // Redirect to product list
                } else {
                    const errorData = await response.json();
                    alert(`Failed to create product: ${errorData.message || 'Something went wrong'}`);
                }
            } catch (error) {
                console.error('Create product error:', error);
                alert('Failed to create product. Please try again.');
            }
        });

        // Logout button on product-form.html (example) - jQuery selector and .on('click', ...)
        const $logoutButton = $('#logout-button');
        if ($logoutButton.length) {
            $logoutButton.on('click', function () {
                localStorage.removeItem('accessToken');
                alert('Logged out.');
                window.location.href = '/index.html'; // Go back to product page (public)
            });
        }
    }
});