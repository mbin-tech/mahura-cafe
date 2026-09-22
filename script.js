/* eslint-disable */
// @ts-nocheck

var selectedCategory = null;
var selectedIndex = null;
var tempItem = null;

// اتصال Supabase
if (typeof window.supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

function goToMainPage() {
    document.getElementById('landing-page').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('main-page').style.display = 'block';

    setTimeout(function() {
        var menuSection = document.getElementById('menuSection');
        if (menuSection) {
            menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);

    updateSidebar();
}

// ===== SLIDER =====
var currentSlide = 0;
var sliderWrapper = document.getElementById('sliderWrapper');
var slidesCount = sliderWrapper ? sliderWrapper.children.length : 0;

if (slidesCount > 0) {
    setInterval(function() {
        currentSlide = (currentSlide + 1) % slidesCount;
        sliderWrapper.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    }, 3000);
}

// ===== USER ACCOUNT =====
var currentUser = JSON.parse(localStorage.getItem('mahura_user')) || null;
var userOrders = JSON.parse(localStorage.getItem('mahura_orders')) || [];

function updateSidebar() {
    var historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.style.display = currentUser ? 'block' : 'none';
    }
}

function openUserAccount() {
    var modal = document.getElementById('userModal');
    if (!modal) return;
    modal.style.display = 'flex';

    document.getElementById('errorMsg').style.display = 'none';
    document.getElementById('successMsg').style.display = 'none';

    if (currentUser) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('userPanel').style.display = 'block';
        document.getElementById('loggedUsername').textContent = currentUser.username;
        renderHistory();
    } else {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('userPanel').style.display = 'none';
    }
}

function closeUserAccount() {
    var modal = document.getElementById('userModal');
    if (modal) modal.style.display = 'none';
}

function registerUser() {
    var phone = document.getElementById('phone').value.trim();
    var u = document.getElementById('username').value.trim();
    var p = document.getElementById('password').value.trim();

    if (!phone || !u || !p) {
        document.getElementById('errorMsg').textContent = '❌ لطفاً همه فیلدها را کامل کنید!';
        document.getElementById('errorMsg').style.display = 'block';
        return;
    }

    var users = JSON.parse(localStorage.getItem('mahura_users')) || [];
    var existingUser = null;

    for (var i = 0; i < users.length; i++) {
        if (users[i].phone === phone) {
            existingUser = users[i];
            break;
        }
    }

    if (!existingUser) {
        users.push({ phone: phone, username: u, password: p });
    } else {
        existingUser.username = u;
        existingUser.password = p;
    }

    localStorage.setItem('mahura_users', JSON.stringify(users));
    localStorage.setItem('mahura_user', JSON.stringify({ phone: phone, username: u, password: p }));

    document.getElementById('successMsg').textContent = '✅ ورود با موفقیت انجام شد!';
    document.getElementById('successMsg').style.display = 'block';

    setTimeout(function() { location.reload(); }, 800);
}

function logoutUser() {
    localStorage.removeItem('mahura_user');
    location.reload();
}

function openHistory() {
    if (!currentUser) {
        alert('برای مشاهده تاریخچه، ابتدا باید ثبت‌نام کنید.');
        openUserAccount();
        return;
    }
    document.getElementById('historyModal').style.display = 'flex';
    renderHistory();
}

function closeHistory() {
    document.getElementById('historyModal').style.display = 'none';
}

function renderHistory() {
    var container = document.getElementById('historyList');
    var userHistory = [];

    for (var i = 0; i < userOrders.length; i++) {
        if (userOrders[i].username === (currentUser ? currentUser.username : '')) {
            userHistory.push(userOrders[i]);
        }
    }

    if (userHistory.length === 0) {
        container.innerHTML = 'تاریخچه سفارشات شما خالی است.';
    } else {
        var html = '';
        for (var j = 0; j < userHistory.length; j++) {
            var o = userHistory[j];
            html += '<div style="border-bottom:1px dashed #444; padding:10px 0;">' +
                '<b>' + new Date(o.date).toLocaleDateString('fa-IR') + '</b><br>' + o.items +
                '</div>';
        }
        container.innerHTML = html;
    }

    var histPanel = document.getElementById('userHistory');
    if (histPanel) histPanel.innerHTML = container.innerHTML;
}

// ===== SEARCH =====
function searchMenu() {
    var query = document.getElementById('searchInput').value.toLowerCase();
    var resultsContainer = document.getElementById('searchResults');

    if (query.length === 0) {
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
        return;
    }

    var filteredItems = [];
    for (var i = 0; i < menuData.length; i++) {
        var item = menuData[i];
        if (item.name.toLowerCase().indexOf(query) !== -1 || item.en.toLowerCase().indexOf(query) !== -1) {
            filteredItems.push(item);
        }
    }

    if (filteredItems.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:15px; text-align:center; color:#888;">موردی یافت نشد</div>';
    } else {
        var html = '';
        for (var j = 0; j < filteredItems.length; j++) {
            var item = filteredItems[j];
            var mainIndex = menuData.indexOf(item);
            html += '<div class="search-result-item" onclick="jumpToItem(' + mainIndex + ')">' +
                '<span>' + item.name + '</span>' +
                '<span style="color:#c8a97e;">' + item.price.toLocaleString() + ' تومان</span>' +
                '</div>';
        }
        resultsContainer.innerHTML = html;
    }
    resultsContainer.style.display = 'block';
}

function jumpToItem(menuIndex) {
    var item = menuData[menuIndex];
    var cat = item.category;

    if (document.getElementById('categoryHome').style.display !== 'none') {
        openCategory(cat);
    } else {
        var btns = document.querySelectorAll('.category-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.remove('active');
        }
        var btn = document.querySelector('.category-btn[onclick*="' + cat + '"]');
        if (btn) btn.classList.add('active');
        showCategoryItems(cat);
    }

    var catItems = [];
    for (var j = 0; j < menuData.length; j++) {
        if (menuData[j].category === cat) catItems.push(menuData[j]);
    }

    var idx = -1;
    for (var k = 0; k < catItems.length; k++) {
        if (catItems[k].name === item.name) {
            idx = k;
            break;
        }
    }

    var el = document.getElementById('plus-' + cat + '-' + idx);
    if (el) {
        setTimeout(function() {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.closest('.menu-item').classList.add('highlight');
            setTimeout(function() {
                el.closest('.menu-item').classList.remove('highlight');
            }, 2000);
        }, 100);
    }

    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').style.display = 'none';
}

function showInsta() {
    var msg = '⚠️ برای دیدن پیج اینستاگرام، لطفاً ابتدا وی پی ان (VPN) خود را روشن کنید.';
    if (confirm(msg)) {
        window.location.href = 'https://instagram.com/caffee.mahura';
    }
}

// ===== DISPLAY CATEGORY ITEMS =====
function showCategoryItems(category) {
    var grid = document.getElementById('menuGrid');
    grid.innerHTML = '';

    var items = [];
    for (var i = 0; i < menuData.length; i++) {
        if (menuData[i].category === category) {
            items.push(menuData[i]);
        }
    }

    for (var j = 0; j < items.length; j++) {
        var item = items[j];
        var index = j;

        var div = document.createElement('div');
        div.className = 'menu-item';

        var priceHtml = '';
        if (item.price2) {
            priceHtml =
                '<div class="menu-item-prices">' +
                '<span class="menu-item-price">' + item.size1 + ': ' + item.price.toLocaleString() + '</span>' +
                '<span class="menu-item-price">' + item.size2 + ': ' + item.price2.toLocaleString() + '</span>' +
                '</div>';
        } else {
            priceHtml = '<span class="menu-item-price">' + item.price.toLocaleString() + '</span>';
        }

        var plusButton = '';
        if (item.price2) {
            plusButton = '<button class="qty-btn plus" onclick="openSizeModal(\'' + category + '\', ' + index + ')">+</button>';
        } else {
            plusButton = '<button class="qty-btn plus" id="plus-' + category + '-' + index + '" onclick="addItem(\'' + category + '\', ' + index + ')">+</button>';
        }

        div.innerHTML =
            '<img src="' + (item.img || '') + '" alt="' + item.name + '" class="menu-item-img" onclick="openLightbox(this.src)" onerror="this.style.display=\'none\'">' +
            '<div class="menu-item-info">' +
                '<span class="menu-item-name">' + item.name + '</span>' +
                '<span class="menu-item-en">' + item.en + '</span>' +
                '<div class="menu-item-desc">' + item.desc + '</div>' +
            '</div>' +
            priceHtml +
            '<div class="menu-item-qty">' +
                '<button class="qty-btn minus" id="minus-' + category + '-' + index + '" onclick="removeItem(\'' + category + '\', ' + index + ')" style="display:none;">−</button>' +
                '<span class="qty-count" id="count-' + category + '-' + index + '" style="display:none;">0</span>' +
                plusButton +
            '</div>';

        grid.appendChild(div);
    }

    restoreCartState();
}

// ===== CATEGORY FUNCTIONS =====
function openCategory(category) {
    document.getElementById('categoryHome').style.display = 'none';
    document.getElementById('categoryBar').classList.remove('hidden');
    document.getElementById('menuGrid').style.display = 'grid';

    var btns = document.querySelectorAll('.category-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }

    var activeBtn = document.querySelector('.category-btn[onclick*="' + category + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    showCategoryItems(category);
}

function showCategory(category, button) {
    var btns = document.querySelectorAll('.category-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    button.classList.add('active');
    showCategoryItems(category);
}

// ===== CART FUNCTIONS =====
var cartItems = {};
var cartTotal = 0;
var cartCount = 0;

function addItem(category, index) {
    var items = [];
    for (var i = 0; i < menuData.length; i++) {
        if (menuData[i].category === category) {
            items.push(menuData[i]);
        }
    }

    var item = items[index];
    var key = item.name;

    if (!cartItems[key]) {
        cartItems[key] = { name: item.name, price: item.price, qty: 0 };
    }

    cartItems[key].qty++;
    cartCount++;
    cartTotal += item.price;

    var countEl = document.getElementById('count-' + category + '-' + index);
    var minusEl = document.getElementById('minus-' + category + '-' + index);
    var plusEl = document.getElementById('plus-' + category + '-' + index);

    if (countEl) {
        countEl.style.display = 'inline-block';
        countEl.textContent = cartItems[key].qty;
    }
    if (minusEl) minusEl.style.display = 'flex';
    if (plusEl) plusEl.textContent = '+';

    updateUI();
}

function removeItem(category, index) {
    var items = [];
    for (var i = 0; i < menuData.length; i++) {
        if (menuData[i].category === category) {
            items.push(menuData[i]);
        }
    }
    var item = items[index];
    var key = item.name;

    var lastKey = null;
    var lastPrice = 0;
    for (var k in cartItems) {
        if (k.indexOf(key) === 0) {
            if (!lastKey || cartItems[k].qty > 0) {
                lastKey = k;
                lastPrice = cartItems[k].price;
                break;
            }
        }
    }

    if (!lastKey || cartItems[lastKey].qty === 0) return;

    cartItems[lastKey].qty--;
    cartCount--;
    cartTotal -= lastPrice;

    if (cartItems[lastKey].qty === 0) {
        delete cartItems[lastKey];
    }

    var countEl = document.getElementById('count-' + category + '-' + index);
    var minusEl = document.getElementById('minus-' + category + '-' + index);
    var plusEl = document.getElementById('plus-' + category + '-' + index);

    var totalQty = 0;
    for (var k in cartItems) {
        if (k.indexOf(item.name) === 0) {
            totalQty += cartItems[k].qty;
        }
    }

    if (totalQty === 0) {
        if (countEl) {
            countEl.style.display = 'none';
            countEl.textContent = '0';
        }
        if (minusEl) minusEl.style.display = 'none';
        if (plusEl) plusEl.textContent = '+';
    } else {
        if (countEl) countEl.textContent = totalQty;
    }

    updateUI();
}

function updateUI() {
    var cartCountEl = document.getElementById('cartCount');
    var cartTotalEl = document.getElementById('cartTotal');

    if (cartCountEl) cartCountEl.textContent = '🛒 ' + cartCount;
    if (cartTotalEl) cartTotalEl.textContent = '💰 ' + cartTotal.toLocaleString() + ' تومان';

    var bottom = document.getElementById('cartBottom');
    if (bottom) {
        if (cartCount === 0) {
            bottom.classList.add('hidden-cart');
        } else {
            bottom.classList.remove('hidden-cart');
        }
    }

    saveCart();
}

function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartCount', cartCount);
    localStorage.setItem('cartTotal', cartTotal);
}

function loadCart() {
    var savedItems = localStorage.getItem('cartItems');
    var savedCount = localStorage.getItem('cartCount');
    var savedTotal = localStorage.getItem('cartTotal');

    if (savedItems) {
        cartItems = JSON.parse(savedItems);
        cartCount = Number(savedCount) || 0;
        cartTotal = Number(savedTotal) || 0;
        updateUI();
    }
}

function restoreCartState() {
    var cats = ['coffee', 'cold', 'hot', 'dessert', 'tea', 'iced', 'breakfast', 'snack', 'shake', 'icecream', 'cake', 'fastfood'];

    for (var c = 0; c < cats.length; c++) {
        var cat = cats[c];
        var items = [];
        for (var i = 0; i < menuData.length; i++) {
            if (menuData[i].category === cat) {
                items.push(menuData[i]);
            }
        }
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var key = item.name;
            var countEl = document.getElementById('count-' + cat + '-' + j);
            var minusEl = document.getElementById('minus-' + cat + '-' + j);
            var plusEl = document.getElementById('plus-' + cat + '-' + j);

            if (cartItems[key]) {
                if (countEl) {
                    countEl.style.display = 'inline-block';
                    countEl.textContent = cartItems[key].qty;
                }
                if (minusEl) minusEl.style.display = 'flex';
                if (plusEl) plusEl.textContent = '+';
            }
        }
    }
}

function clearCart() {
    cartItems = {};
    cartCount = 0;
    cartTotal = 0;

    var counts = document.querySelectorAll('.qty-count');
    for (var i = 0; i < counts.length; i++) {
        if (counts[i]) {
            counts[i].style.display = 'none';
            counts[i].textContent = '0';
        }
    }

    var minusBtns = document.querySelectorAll('.qty-btn.minus');
    for (var j = 0; j < minusBtns.length; j++) {
        if (minusBtns[j]) minusBtns[j].style.display = 'none';
    }

    var plusBtns = document.querySelectorAll('.qty-btn.plus');
    for (var k = 0; k < plusBtns.length; k++) {
        if (plusBtns[k]) plusBtns[k].textContent = '+';
    }

    updateUI();
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartCount');
    localStorage.removeItem('cartTotal');
}

function checkout() {
    if (cartCount === 0) {
        alert('❌ سبد خرید خالی است.');
        return;
    }

    if (!currentUser) {
        document.getElementById('loginRequiredModal').style.display = 'flex';
        return;
    }

    var html = '';
    for (var key in cartItems) {
        var item = cartItems[key];
        html += '☕ ' + item.name + ' × ' + item.qty + '<br>';
    }

    document.getElementById('invoiceItems').innerHTML = html;
    document.getElementById('invoiceTotal').innerHTML = '💰 جمع کل: <span style="color:#c8a97e;">' + cartTotal.toLocaleString() + ' تومان</span>';
    document.getElementById('paymentModal').style.display = 'flex';
}

function pay() {
    var itemsString = '';
    for (var key in cartItems) {
        itemsString += cartItems[key].name + ' × ' + cartItems[key].qty + ', ';
    }

    // 🆕 اضافه کردن شماره تماس به سفارش
    var newOrder = {
        username: currentUser.username,
        phone: currentUser.phone || 'نامشخص',
        items: itemsString,
        date: new Date().toISOString()
    };

    var allOrders = JSON.parse(localStorage.getItem('mahura_orders')) || [];
    allOrders.push(newOrder);
    localStorage.setItem('mahura_orders', JSON.stringify(allOrders));

    // ارسال پیام به گروه تلگرام
    sendTelegramNotification(newOrder, cartTotal);

    document.getElementById('paymentModal').style.display = 'none';
    var orderNum = 'MAH-' + Math.floor(Math.random() * 90000 + 10000);
    document.getElementById('orderNumber').textContent = orderNum;
    document.getElementById('successModal').style.display = 'flex';
    clearCart();
}

function closePayment() {
    document.getElementById('paymentModal').style.display = 'none';
}

function closeSuccess() {
    document.getElementById('successModal').style.display = 'none';
}

function payOnline() {
    alert('💳 درگاه پرداخت آنلاین به زودی اضافه می‌شود!');
}

// ===== SIDEBAR TOGGLE =====
function toggleMenu() {
    document.getElementById('topMenu').classList.toggle('show');
    document.getElementById('menuOverlay').classList.toggle('show');
}

// ===== LIGHTBOX =====
function openLightbox(src) {
    if (!src) return;
    document.getElementById('lightbox').style.display = 'flex';
    document.getElementById('lightboxImg').src = src;
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}

// ===== ON LOAD =====
window.onload = async function() {
    await loadMenuFromSupabase();

    loadCart();
    updateSidebar();

    document.getElementById('categoryHome').style.display = 'grid';
    document.getElementById('categoryBar').classList.add('hidden');
    document.getElementById('menuGrid').style.display = 'none';

    if (sessionStorage.getItem('mahura_in_menu') === 'true') {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('main-page').style.display = 'block';
    }
};

// ===== خواندن منو از Supabase =====
async function loadMenuFromSupabase() {
    if (!supabaseClient) {
        console.log('Supabase connected: NO');
        return;
    }
    console.log('Supabase connected: YES');
    try {
        var result = await supabaseClient
            .from('menu_items')
            .select('*')
            .order('id', { ascending: true });

        if (result.error) throw result.error;

        if (result.data && result.data.length > 0) {
            menuData = result.data.map(function(item) {
                return {
                    name: item.name,
                    price: item.price,
                    price2: item.price2,
                    size1: item.size1,
                    size2: item.size2,
                    desc: item.description,
                    en: item.en,
                    category: item.category,
                    img: item.img
                };
            });
            console.log('منو از Supabase خوانده شد: ' + menuData.length + ' آیتم');
        } else {
            console.log('جدول Supabase خالیه، از فایل محلی استفاده می‌شود');
        }
    } catch (err) {
        console.log('خطا در خواندن منو از Supabase:', err);
    }
}

// ===== SIZE MODAL FUNCTIONS =====
function openSizeModal(category, index) {
    var items = [];
    for (var i = 0; i < menuData.length; i++) {
        if (menuData[i].category === category) {
            items.push(menuData[i]);
        }
    }
    var item = items[index];

    selectedCategory = category;
    selectedIndex = index;
    tempItem = item;

    document.getElementById('sizeItemName').textContent = item.name;
    document.getElementById('sizeSmallPrice').textContent = item.price.toLocaleString() + ' تومان';
    document.getElementById('sizeLargePrice').textContent = item.price2.toLocaleString() + ' تومان';
    document.getElementById('sizeModal').style.display = 'flex';
}

function closeSizeModal() {
    document.getElementById('sizeModal').style.display = 'none';
    selectedCategory = null;
    selectedIndex = null;
    tempItem = null;
}

function selectSize(size) {
    if (!tempItem) return;

    var price = (size === 'small') ? tempItem.price : tempItem.price2;
    var key = tempItem.name + ' (' + (size === 'small' ? 'کوچک' : 'بزرگ') + ')';

    if (!cartItems[key]) {
        cartItems[key] = { name: key, price: price, qty: 0 };
    }
    cartItems[key].qty++;
    cartCount++;
    cartTotal += price;

    var countEl = document.getElementById('count-' + selectedCategory + '-' + selectedIndex);
    var minusEl = document.getElementById('minus-' + selectedCategory + '-' + selectedIndex);
    var plusEl = document.getElementById('plus-' + selectedCategory + '-' + selectedIndex);

    if (countEl) {
        var totalQty = 0;
        for (var k in cartItems) {
            if (k.indexOf(tempItem.name) === 0) {
                totalQty += cartItems[k].qty;
            }
        }
        if (totalQty > 0) {
            countEl.style.display = 'inline-block';
            countEl.textContent = totalQty;
        }
        if (minusEl) minusEl.style.display = 'flex';
        if (plusEl) plusEl.textContent = '+';
    }

    closeSizeModal();
    updateUI();
}

function closeLoginRequired() {
    document.getElementById('loginRequiredModal').style.display = 'none';
}

// ===== ارسال پیام به گروه تلگرام =====
async function sendTelegramNotification(order, total) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram config missing');
        return;
    }

    var now = new Date();
    var timeStr = now.toLocaleString('fa-IR');

    // 🆕 اضافه کردن شماره تماس به پیام
    var message = '🔔 سفارش جدید!\n\n' +
                  '👤 مشتری: ' + order.username + '\n' +
                  '📱 شماره تماس: ' + (order.phone || 'نامشخص') + '\n' +
                  '🕐 زمان: ' + timeStr + '\n\n' +
                  '📋 آیتم‌ها:\n' + order.items + '\n' +
                  '💰 جمع کل: ' + total.toLocaleString() + ' تومان';

    var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';

    try {
        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });
        var result = await response.json();
        if (result.ok) {
            console.log('✅ پیام تلگرام ارسال شد');
        } else {
            console.log('❌ خطا در ارسال:', result.description);
        }
    } catch (err) {
        console.log('❌ خطای شبکه:', err.message);
    }
}