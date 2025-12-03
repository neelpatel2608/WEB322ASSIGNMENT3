/**************************************************************
* File Name: middleware/auth.js
* Author: Neel S Patel
* Course: WEB322
* Seneca Email: nspatel55@myseneca.ca
* Date: December 2, 2025
*
* Description:
*   Middleware that protects routes from unauthorized access.
*   If a user does not have an active session, they are
*   redirected to the login page.
**************************************************************/

module.exports = function auth(req, res, next) {
    // If no session exists → redirect the user to login
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // The user is authenticated → allow access
    next();
};
