(function () {
    "use strict";

    var STORAGE_KEY = "rk_consent_1";

    function loadState() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return {};
            var obj = JSON.parse(raw);
            return obj && typeof obj == "object" ? obj : {};
        } catch (e) {
            return {};
        }
    }

    function saveState(state) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state || {}));
        } catch (e) {
            // ignore
        }
    }

    function hasConsent(category) {
        var st = loadState();
        return st[category] === true;
    }

    function grantConsent(category) {
        var st = loadState();
        st[category] = true;
        saveState(st);
    }

    function revokeConsent(category) {

    }
})