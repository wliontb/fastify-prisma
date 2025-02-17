/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./public/**/*.{html,js}", // Đường dẫn tới các file frontend của bạn
        "./src/**/*.{ts,js}",      // Nếu bạn có code JS/TS nào cần Tailwind
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}