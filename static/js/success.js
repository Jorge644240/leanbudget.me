setTimeout(() => {
    if (window.location.pathname === '/me/delete') window.location.href = '/';
    else if (window.location.pathname === '/signup/success') window.location.href = '/me';
}, 5000);