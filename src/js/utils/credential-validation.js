
class CredentialValidator {
    
    static isValidPublicRequest(creds) {
        var hasContentKey = creds.hasOwnProperty('publicContentKey') && creds.publicContentKey && creds.publicContentKey !== '';
        var hasDomain = creds.hasOwnProperty('sourceDomain') && creds.sourceDomain && creds.sourceDomain !== '';
        return hasContentKey && hasDomain;
    }

    static isValidUsernameAndPasswordRequest(creds) {
        var passwordField = (creds.hasOwnProperty('password') && creds.password) && creds.password !== '';
        var usernameField = (creds.hasOwnProperty('username') && creds.username) && creds.username !== '';
        return passwordField && usernameField;
    }
    
    static isValidPasswordOnlyRequest(creds) {
        var passwordField = creds.hasOwnProperty('password') && creds.password && creds.password !== '';
        var usernameField = (creds.hasOwnProperty('username') && creds.username === '') || !creds.hasOwnProperty('username');
        return passwordField && usernameField;
    }

    static isValidTokenRequest(creds) {
        var tokenField = creds.hasOwnProperty('token') && creds.token && creds.token !== '';
        return tokenField;
    }

}

module.exports = CredentialValidator;

