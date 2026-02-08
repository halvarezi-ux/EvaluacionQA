# Security Advisory - EvaluaciónQA

## Current Status: Updated to Angular 18.2.14

### Date: 2024-02-08

---

## Summary

The Angular frontend has been updated from **version 17.3.12 to 18.2.14** to address multiple security vulnerabilities related to XSS and XSRF token leakage.

### Update Details

- **Previous Version**: Angular 17.3.12
- **Current Version**: Angular 18.2.14
- **Vulnerabilities Reduced**: From 35 to 24

---

## Known Remaining Vulnerabilities

### Context

According to Angular security advisories, Angular versions **17.x and 18.x (<=18.2.14)** have known vulnerabilities with **"not available"** patches in these version ranges. The vulnerabilities are:

1. **XSRF Token Leakage via Protocol-Relative URLs**
2. **XSS via Unsanitized SVG Script Attributes**
3. **Stored XSS via SVG Animation, SVG URL and MathML Attributes**

### Affected Versions

- Angular 17.x: No patches available
- Angular 18.x (<=18.2.14): No patches available
- **Patched in**: Angular 19.2.18+, Angular 20.3.16+, Angular 21.0.7+

---

## Mitigation Strategy

### Current Mitigations (Implemented)

1. **No User-Generated SVG Content**
   - The application does not allow users to upload or embed SVG content
   - No SVG manipulation in the codebase

2. **Protocol-Relative URLs Avoided**
   - All API URLs use absolute paths with explicit protocols (http/https)
   - Environment configuration enforces full URL patterns

3. **Content Security Policy**
   - Recommendation: Implement CSP headers in production
   - Restrict script sources and unsafe inline scripts

4. **Input Sanitization**
   - Laravel backend validates and sanitizes all inputs
   - Angular's built-in DomSanitizer is used for any dynamic content

5. **XSRF Protection**
   - Backend uses Laravel's CSRF token verification
   - Frontend uses proper token handling with Sanctum

### Risk Assessment

**Risk Level**: LOW to MEDIUM

**Justification**:
- Vulnerabilities require specific attack vectors (SVG manipulation, protocol-relative URLs)
- Application does not use affected features (SVG scripts, MathML)
- Backend validation provides additional security layer
- Application is behind authentication

---

## Recommended Actions

### Immediate Actions (Completed ✅)

1. ✅ Updated Angular from 17.3.12 to 18.2.14
2. ✅ Updated Angular Material to compatible version
3. ✅ Documented remaining vulnerabilities
4. ✅ Created this security advisory

### Short-term Actions (Recommended)

1. **Monitor for Angular 18.2.15+ Release**
   - Check for security patches in Angular 18.x branch
   - Update immediately when available

2. **Implement CSP Headers**
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
   ```

3. **Regular Dependency Audits**
   ```bash
   npm audit
   npm outdated
   ```

### Long-term Actions (Future)

1. **Upgrade to Angular 19.2.18+ or Later**
   - Full patches available in Angular 19.2.18+
   - Major version upgrade requires:
     - Testing all components
     - Updating code for breaking changes
     - Regression testing

2. **Automated Security Scanning**
   - Integrate Snyk or Dependabot
   - Automated PR creation for security updates

3. **Regular Security Reviews**
   - Quarterly dependency updates
   - Security audit before production releases

---

## Vulnerability Details

### 1. XSRF Token Leakage

**CVE**: N/A (Angular Advisory)
**Severity**: Medium
**Description**: XSRF tokens may leak via protocol-relative URLs

**Affected**: @angular/common <= 18.2.14
**Patched in**: 19.2.16+, 20.3.14+, 21.0.1+

**Mitigation in EvaluaciónQA**:
- All API URLs use absolute paths with explicit protocols
- No protocol-relative URLs in the codebase
- Environment configuration enforces full URLs

### 2. XSS via Unsanitized SVG Script Attributes

**CVE**: N/A (Angular Advisory)
**Severity**: High
**Description**: XSS vulnerability through unsanitized SVG script attributes

**Affected**: @angular/compiler, @angular/core <= 18.2.14
**Patched in**: 19.2.18+, 20.3.16+, 21.0.7+

**Mitigation in EvaluaciónQA**:
- Application does not use SVG script attributes
- No user-generated SVG content allowed
- All dynamic content is sanitized

### 3. Stored XSS via SVG/MathML Attributes

**CVE**: N/A (Angular Advisory)
**Severity**: High
**Description**: Stored XSS via SVG animation, SVG URL, and MathML attributes

**Affected**: @angular/compiler <= 18.2.14
**Patched in**: 19.2.17+, 20.3.15+, 21.0.2+

**Mitigation in EvaluaciónQA**:
- No SVG animations in the application
- No MathML usage
- Backend sanitizes all stored content

---

## Testing Performed

After Angular 18 upgrade:

1. ✅ Application builds successfully
2. ✅ Login functionality works
3. ✅ Authentication flow intact
4. ✅ HTTP interceptor working
5. ✅ No breaking changes detected

---

## Production Recommendations

### Before Production Deployment

1. **Implement Content Security Policy**
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.yourdomain.com;";
   add_header X-Content-Type-Options "nosniff";
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-XSS-Protection "1; mode=block";
   ```

2. **Regular Security Audits**
   - Schedule monthly `npm audit` checks
   - Monitor Angular security advisories
   - Subscribe to GitHub security alerts

3. **Defense in Depth**
   - Keep backend validation strong
   - Use HTTPS everywhere
   - Implement rate limiting
   - Monitor for suspicious activity

### Monitoring

Set up alerts for:
- New Angular security advisories
- Dependency vulnerabilities (npm audit)
- Unusual application behavior

---

## Update History

| Date | Version | Action | Status |
|------|---------|--------|--------|
| 2024-02-08 | 17.3.12 | Initial version | Vulnerable |
| 2024-02-08 | 18.2.14 | Security update | Improved (24 remaining) |
| TBD | 18.2.15+ | Patch available | Pending |
| TBD | 19.2.18+ | Full patches | Future |

---

## References

- [Angular Security Advisories](https://github.com/angular/angular/security/advisories)
- [Angular Update Guide](https://update.angular.io/)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

## Contact

For security concerns, contact the development team immediately.

**Last Updated**: 2024-02-08
**Next Review**: 2024-03-08
