$(document).ready(function () {
    const noticeLogginText = 'Bạn phải đăng nhập để xóa sản phẩm.';
    const noticeRemoveText = 'Bạn có chắc muốn xóa sản phẩm này?';
    const $navbarLinksContainer = $('#navbar-links'); // jQuery selector for navbar links container

    const checkLoginStatusAndUpdateNavbar = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            // If logged in, update navbar links
            $navbarLinksContainer.html(`
                <a href="/product-form.html" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mr-4">Thêm sản phẩm</a>
                <button id="logout-button" class="px-4 py-2 text-red-600 hover:text-red-800">Đăng xuất</button>
            `);

            // Add event listener for Logout button
            $('#logout-button').on('click', function () {
                localStorage.removeItem('accessToken');
                alert('Đã đăng xuất.');
                checkLoginStatusAndUpdateNavbar(); // Update navbar after logout
                window.location.href = '/index.html';
            });
        } else {
            // If not logged in
            $navbarLinksContainer.html(`
                <a href="/login.html" class="px-4 py-2 text-blue-600 hover:text-blue-800">Đăng nhập</a>
                <a href="/register.html" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Đăng ký</a>
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
                            <a href="/product-detail.html?id=${product.id}" class="inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 text-sm">Chi tiết</a>
                            <a href="/product-edit.html?id=${product.id}" class="inline-block px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-700 text-sm">Sửa</a>
                            <button class="delete-product-btn inline-block px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 text-sm" data-product-id="${product.id}">Xóa</button>
                        </div>
                    `);
                    $productsContainer.append($productCard);
                });

                // Event delegation for delete buttons
                $productsContainer.on('click', '.delete-product-btn', async function () {
                    const productId = $(this).data('product-id');
                    const accessToken = localStorage.getItem('accessToken');

                    if (!accessToken) {
                        alert(noticeLogginText);
                        return;
                    }

                    if (confirm(noticeRemoveText)) {
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
                                alert(`Xóa sản phẩm thất bại: ${errorData.message || 'Có gì đó không đúng'}`);
                            }
                        } catch (error) {
                            console.error('Xóa sản phẩm thất bại:', error);
                            alert('Xóa sản phẩm thất bại. Vui lòng thử lại');
                        }
                    }
                });


            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
                $productsContainer.html('<p class="text-red-500">Lấy dữ liệu sản phẩm thất bại.</p>');
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
                        $productDetailContainer.html('<p class="text-red-500">Không tìm thấy sản phẩm.</p>');
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return;
                }
                const product = await response.json();

                $('#product-detail-container').html(`
                    <h2 class="text-2xl font-bold mb-4">${product.title}</h2>
                    <p class="text-gray-700 mb-4">${product.content || 'Không có mô tả'}</p>
                    <p class="text-lg font-semibold">Giá: $${product.price}</p>
                    <p class="text-sm text-gray-500 mt-2">Ngày tạo: ${new Date(product.createdAt).toLocaleString()}</p>
                    <p class="text-sm text-gray-500">Ngày sửa: ${new Date(product.updatedAt).toLocaleString()}</p>
                `);

                $('#edit-product-button').attr('href', `/product-edit.html?id=${product.id}`); // Set edit button link
                $('#delete-product-button').on('click', async function() { // Attach delete event to delete button on detail page
                    const accessToken = localStorage.getItem('accessToken');
                    if (!accessToken) {
                        alert(noticeLogginText);
                        return;
                    }

                    if (confirm(noticeRemoveText)) {
                        try {
                            const deleteResponse = await fetch(`/api/products/${productId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            });

                            if (deleteResponse.status === 204) {
                                alert('Xóa sản phẩm thành công.');
                                window.location.href = '/index.html'; // Redirect to product list after deletion
                            } else {
                                const errorData = await deleteResponse.json();
                                alert(`Xóa sản phẩm thất bại: ${errorData.message || 'Có gì đó không đúng'}`);
                            }
                        } catch (error) {
                            console.error('Lỗi xóa sản phẩm:', error);
                            alert('Xóa sản phẩm thất bại. Vui lòng thử lại');
                        }
                    }
                });

            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
                $productDetailContainer.html('<p class="text-red-500">Lấy dữ liệu sản phẩm thất bại.</p>');
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
                        alert('Không tìm thấy sản phẩm để sửa.');
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
                console.error('Lỗi lấy sản phẩm để sửa:', error);
                alert('Lấy thông tin sản phẩm để sửa thất bại.');
                window.location.href = '/index.html'; // Redirect back to product list on error
            }
        };

        loadProductForEdit();

        $editProductForm.submit(async function (event) {
            event.preventDefault();
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                alert('Bạn phải đăng nhập để thực hiện tác vụ này.');
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
                    alert('Sửa sản phẩm thành công!');
                    window.location.href = `/product-detail.html?id=${productIdToUpdate}`; // Redirect to detail page after edit
                } else {
                    const errorData = await response.json();
                    alert(`Sửa sản phẩm thất bại: ${errorData.message || 'Có gì đó không đúng'}`);
                }
            } catch (error) {
                console.error('Lỗi sửa sản phẩm:', error);
                alert('Sửa sản phẩm thất bại. Vui lòng thử lại');
            }
        });

        $('#cancel-edit-button').on('click', function(e) {
            e.preventDefault();
            window.location.href = `/product-detail.html?id=${productId}`; // Redirect to detail page on cancel
        });
    }
    
    // Trang Login (login.html)
    if ($('#login-form').length) {
        $('#login-form').submit(async function (event) {
            event.preventDefault();
            const email = $('#email').val();
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
                    alert(`Đăng nhập thất bại: ${errorData.message || 'Thông tin xác thực không hợp lệ'}`);
                }
            } catch (error) {
                console.error('Lỗi Đăng nhập:', error);
                alert('Đăng nhập thất bại. Vui lòng thử lại.');
            }
        });
    }

    // Trang Register (register.html)
    if ($('#register-form').length) {
        $('#register-form').submit(async function (event) {
            event.preventDefault();
            const name = $('#name').val();
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
                    alert('Đăng ký thành công! Vui lòng đăng nhập.');
                    window.location.href = '/login.html'; // Redirect to login page
                } else {
                    const errorData = await response.json();
                    alert(`Đăng ký thất bại: ${errorData.message || 'Có gì đó không đúng'}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Đăng ký thất bại. Vui lòng thử lại');
            }
        });
    }

    // Trang Create Product (product-form.html)
    if ($('#create-product-form').length) {
        const $createProductForm = $('#create-product-form');
        const accessToken = localStorage.getItem('accessToken'); // Get access token

        if (!accessToken) {
            alert('Bạn phải đăng nhập để thực hiện tác vụ này.');
            window.location.href = '/login.html';
            return;
        }

        $createProductForm.submit(async function (event) {
            event.preventDefault();
            const title = $('#title').val();
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
                    alert('Tạo sản phẩm thành công!');
                    window.location.href = '/index.html'; // Redirect to product list
                } else {
                    const errorData = await response.json();
                    alert(`Tạo sản phẩm thất bại: ${errorData.message || 'Có gì đó không đúng'}`);
                }
            } catch (error) {
                console.error('Lỗi tạo sản phẩm:', error);
                alert('Tạo sản phẩm thất bại. Vui lòng thử lại.');
            }
        });

        // Logout button on product-form.html
        const $logoutButton = $('#logout-button');
        if ($logoutButton.length) {
            $logoutButton.on('click', function () {
                localStorage.removeItem('accessToken');
                alert('Đã đăng xuất.');
                window.location.href = '/index.html';
            });
        }
    }
});