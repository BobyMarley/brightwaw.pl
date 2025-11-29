const cookiePopup = document.querySelector('#cookie-popup');
const acceptButton = document.querySelector('#accept-button');

const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
};

const getCookie = function(cname) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const name = `${cname}=`;
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.startsWith(name)) {
            return cookie.split('=')[1] === "true";
        }
    }
    return false;
};

const checkCookie = () => {
    const cookieName = "cookie_accepted";
    const cookieValue = getCookie(cookieName);
    if (!cookieValue) {
        cookiePopup.style.display = "block";
    } else {
        updateGoogleConsent();
    }
};

const updateGoogleConsent = () => {  
    if (typeof gtag === 'function') {
        gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'granted'
        });
        
        // Добавляем максимальное количество данных для аналитики и рекламы
        gtag('set', {'allow_google_signals': true});
        gtag('set', {'allow_ad_personalization_signals': true});
        gtag('set', {'allow_ad_storage': true});
        gtag('set', {'allow_analytics_storage': true});
    }
};

acceptButton.addEventListener('click', () => {
    const cookieName = "cookie_accepted";
    const cookieValue = "true";
    const cookieExpiryDays = 30;
    setCookie(cookieName, cookieValue, cookieExpiryDays);
    cookiePopup.style.display = "none";
    updateGoogleConsent(); 
});

window.addEventListener('load', checkCookie);